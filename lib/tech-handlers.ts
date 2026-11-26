import {
  PIN_ATTEMPT_LIMIT,
  PIN_LOCK_MS,
  SESSION_MS,
  TECH_COOKIE,
  adminSecretMatches,
  authorizeTechAction,
  clearSessionCookie,
  hashPin,
  isPin,
  phoneKey,
  pinMatches,
  readCookie,
  sessionCookie,
  signSession,
  verifySession,
  type PinRecord,
  type ServiceCallRecord,
  type TechActionName,
  type TechnicianRecord,
  SetupError,
} from "./tech-auth"

export type ApplyResult =
  | { ok: true; status: string }
  | { ok: false; status: number; error: string }

export type TechDeps = {
  secret: string | null
  secureCookies: boolean
  now?: () => number
  getTechnician: (id: string) => Promise<TechnicianRecord | null>
  findTechnicianByPhone: (plantId: string, phoneKey: string) => Promise<TechnicianRecord | null>
  getCall: (id: string) => Promise<ServiceCallRecord | null>
  getPin: (technicianId: string) => Promise<PinRecord | null>
  savePinFailure: (
    technicianId: string,
    failedAttempts: number,
    lockedUntil: string | null
  ) => Promise<void>
  clearPinFailure: (technicianId: string) => Promise<void>
  savePin: (technicianId: string, hash: string, salt: string) => Promise<void>
  applyAction: (input: {
    callId: string
    technicianId: string
    action: TechActionName
    note: string | null
  }) => Promise<ApplyResult>
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PLANT_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/
const INVALID_LOGIN = "That mobile number or PIN is not valid."

const SETUP_MESSAGE =
  "Technician sign-in is not set up yet. Set TECH_SESSION_SECRET and SUPABASE_SERVICE_ROLE_KEY, and run the technician authorization SQL."

export function json(body: unknown, status = 200, setCookie?: string): Response {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  }
  if (setCookie) headers["Set-Cookie"] = setCookie
  return new Response(JSON.stringify(body), { status, headers })
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = (await request.json()) as unknown
    if (!value || typeof value !== "object" || Array.isArray(value)) return null
    return value as Record<string, unknown>
  } catch {
    return null
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function setupResponse(error: unknown): Response | null {
  if (error instanceof SetupError) {
    return json({ error: error.message || SETUP_MESSAGE }, 503)
  }
  return null
}

function sessionFrom(request: Request, deps: TechDeps) {
  return verifySession(
    readCookie(request.headers.get("cookie"), TECH_COOKIE),
    deps.secret,
    deps.now ? deps.now() : Date.now()
  )
}

export async function handleTechLogin(request: Request, deps: TechDeps): Promise<Response> {
  const body = await readJson(request)
  if (!body) return json({ error: "Expected a JSON body." }, 400)
  if (!deps.secret) return json({ error: SETUP_MESSAGE }, 503)

  const plantId = asString(body.plantId) ?? ""
  const phone = phoneKey(asString(body.phone) ?? "")
  const pin = (asString(body.pin) ?? "").trim()
  if (!PLANT_RE.test(plantId) || !phone || !isPin(pin)) {
    return json({ error: "Enter the mobile number and PIN you were given." }, 400)
  }

  try {
    const technician = await deps.findTechnicianByPhone(plantId, phone)
    if (!technician || technician.active !== true || technician.plant_id !== plantId) {
      return json({ error: INVALID_LOGIN }, 401)
    }
    const record = await deps.getPin(technician.id)
    if (!record) return json({ error: INVALID_LOGIN }, 401)

    const now = deps.now ? deps.now() : Date.now()
    if (record.lockedUntil && Date.parse(record.lockedUntil) > now) {
      return json({ error: "Too many attempts. Try again in a few minutes." }, 429)
    }

    if (!pinMatches(pin, record.hash, record.salt)) {
      const previous = record.lockedUntil && Date.parse(record.lockedUntil) <= now ? 0 : record.failedAttempts
      const attempts = previous + 1
      const lockedUntil =
        attempts >= PIN_ATTEMPT_LIMIT ? new Date(now + PIN_LOCK_MS).toISOString() : null
      await deps.savePinFailure(technician.id, lockedUntil ? 0 : attempts, lockedUntil)
      return json({ error: INVALID_LOGIN }, 401)
    }

    await deps.clearPinFailure(technician.id)
    const token = signSession(technician.id, plantId, deps.secret, now + SESSION_MS)
    return json(
      { name: technician.name, language: technician.language ?? "en" },
      200,
      sessionCookie(token, deps.secureCookies)
    )
  } catch (error) {
    const setup = setupResponse(error)
    if (setup) return setup
    console.error("tech login failed")
    return json({ error: "Could not sign in." }, 500)
  }
}

export async function handleTechLogout(_request: Request, deps: TechDeps): Promise<Response> {
  return json({ ok: true }, 200, clearSessionCookie(deps.secureCookies))
}

export async function handleTechSession(request: Request, deps: TechDeps): Promise<Response> {
  if (!deps.secret) return json({ signedIn: false }, 200)
  const session = sessionFrom(request, deps)
  if (!session) return json({ signedIn: false }, 200)
  const plantId = new URL(request.url).searchParams.get("plant") || ""
  if (plantId && session.pid !== plantId) return json({ signedIn: false }, 200)

  try {
    const technician = await deps.getTechnician(session.tid)
    if (!technician || technician.active !== true || technician.plant_id !== session.pid) {
      return json({ signedIn: false }, 200)
    }
    return json({
      signedIn: true,
      name: technician.name,
      language: technician.language ?? "en",
      plantId: technician.plant_id,
    })
  } catch (error) {
    const setup = setupResponse(error)
    if (setup) return setup
    console.error("tech session failed")
    return json({ signedIn: false }, 200)
  }
}

export async function handleTechAction(request: Request, deps: TechDeps): Promise<Response> {
  const body = await readJson(request)
  if (!body) return json({ error: "Expected a JSON body." }, 400)
  if (!deps.secret) return json({ error: SETUP_MESSAGE }, 503)

  const session = sessionFrom(request, deps)
  if (!session) return json({ error: "Sign in with your mobile number and PIN." }, 401)

  const callId = asString(body.callId)
  const action = asString(body.action)
  const note = asString(body.note)
  if (!callId || !UUID_RE.test(callId)) {
    return json({ error: "Missing service call." }, 400)
  }

  let technician: TechnicianRecord | null = null
  let call: ServiceCallRecord | null = null
  try {
    technician = await deps.getTechnician(session.tid)
    call = await deps.getCall(callId)
  } catch (error) {
    const setup = setupResponse(error)
    if (setup) return setup
    console.error("tech action lookup failed")
    return json({ error: "Could not update that service call." }, 500)
  }

  const decision = authorizeTechAction({
    session,
    secret: deps.secret,
    action,
    note,
    technician,
    call,
  })
  if (!decision.ok) return json({ error: decision.error }, decision.status)

  try {
    const applied = await deps.applyAction({
      callId: decision.call.id,
      technicianId: decision.technician.id,
      action: decision.action,
      note: decision.note,
    })
    if (!applied.ok) return json({ error: applied.error }, applied.status)
    console.info(
      JSON.stringify({
        event: "tech_action",
        callId: decision.call.id,
        technicianId: decision.technician.id,
        action: decision.action,
        toStatus: applied.status,
      })
    )
    return json({
      ok: true,
      status: applied.status,
      technicianName: decision.technician.name,
    })
  } catch (error) {
    const setup = setupResponse(error)
    if (setup) return setup
    console.error("tech action failed")
    return json({ error: "Could not update that service call." }, 500)
  }
}

export async function handleSetPin(request: Request, deps: TechDeps): Promise<Response> {
  const body = await readJson(request)
  if (!body) return json({ error: "Expected a JSON body." }, 400)
  if (!deps.secret) return json({ error: SETUP_MESSAGE }, 503)

  const adminSecret = asString(body.adminSecret) ?? ""
  if (!adminSecretMatches(adminSecret, deps.secret)) {
    return json({ error: "That session secret is not valid." }, 401)
  }

  const plantId = asString(body.plantId) ?? ""
  const technicianId = asString(body.technicianId) ?? ""
  const pin = (asString(body.pin) ?? "").trim()
  if (!PLANT_RE.test(plantId) || !UUID_RE.test(technicianId) || !isPin(pin)) {
    return json({ error: "Choose a 4 to 6 digit PIN for a technician at this plant." }, 400)
  }

  try {
    const technician = await deps.getTechnician(technicianId)
    if (!technician || technician.plant_id !== plantId) {
      return json({ error: "That technician is not at this plant." }, 404)
    }
    const hashed = hashPin(pin)
    await deps.savePin(technician.id, hashed.hash, hashed.salt)
    return json({
      ok: true,
      message: `PIN saved for ${technician.name}. Tell them in person. Their phone remembers it after the first sign-in on a machine QR.`,
    })
  } catch (error) {
    const setup = setupResponse(error)
    if (setup) return setup
    console.error("tech pin save failed")
    return json({ error: "Could not save that PIN." }, 500)
  }
}
