import crypto from "crypto"

export const TECH_ACTIONS = ["arrived", "needs_more", "complete"] as const
export type TechActionName = (typeof TECH_ACTIONS)[number]

export type TechSession = {
  v: 1
  tid: string
  pid: string
  exp: number
}

export type PinRecord = {
  hash: string
  salt: string
  failedAttempts: number
  lockedUntil: string | null
}

export const TECH_COOKIE = "qrcall_tech"
export const SESSION_MS = 90 * 24 * 60 * 60 * 1000
export const PIN_LOCK_MS = 15 * 60 * 1000
export const PIN_ATTEMPT_LIMIT = 5
const PIN_RE = /^\d{4,6}$/

export type TechnicianRecord = {
  id: string
  name: string
  plant_id: string | null
  active: boolean | null
  language?: string | null
  phone?: string | null
}

export type ServiceCallRecord = {
  id: string
  plant_id: string | null
  status: string | null
  equipment_name?: string | null
  location?: string | null
  priority?: string | null
  description?: string | null
  work_notes?: string | null
  submitted_at?: string | null
  arrived_at?: string | null
  submitter_name?: string | null
  photo_url?: string | null
}

export type AuthFailure = {
  ok: false
  status: number
  error: string
}

export type AuthSuccess = {
  ok: true
  technician: TechnicianRecord
  call: ServiceCallRecord
  action: TechActionName
  note: string | null
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PLANT_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/
const ARRIVAL_STATUSES = new Set(["Open", "Waiting"])
const WORK_STATUSES = new Set(["Arrived", "Needs More Work"])
const MAX_NOTE = 2000

export class SetupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SetupError"
  }
}

function b64url(bytes: Buffer): string {
  return bytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function b64urlDecode(value: string): Buffer {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4))
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function isServiceRoleCredential(key: string): boolean {
  if (!key) return false
  if (key.startsWith("sb_publishable_") || key.startsWith("sb_anon")) return false
  if (key.startsWith("sb_secret_")) return true
  const parts = key.split(".")
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(b64urlDecode(parts[1]).toString("utf8")) as {
      role?: string
    }
    return payload.role === "service_role"
  } catch {
    return false
  }
}

export function phoneKey(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10) return null
  return digits.slice(-10)
}

export function isPin(pin: string): boolean {
  return PIN_RE.test(pin)
}

export function hashPin(pin: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(pin, salt, 32).toString("hex")
  return { hash, salt }
}

export function pinMatches(pin: string, hash: string, salt: string): boolean {
  const next = crypto.scryptSync(pin, salt, 32)
  const prev = Buffer.from(hash, "hex")
  if (next.length !== prev.length) return false
  return crypto.timingSafeEqual(next, prev)
}

export function signSession(
  technicianId: string,
  plantId: string,
  secret: string,
  expiresAtMs: number
): string {
  if (!secret) throw new SetupError("TECH_SESSION_SECRET is not set")
  if (!UUID_RE.test(technicianId)) throw new Error("Invalid technician id")
  if (!PLANT_RE.test(plantId)) throw new Error("Invalid plant id")
  const body = b64url(
    Buffer.from(
      JSON.stringify({ v: 1, tid: technicianId, pid: plantId, exp: expiresAtMs }),
      "utf8"
    )
  )
  const sig = b64url(crypto.createHmac("sha256", secret).update(body).digest())
  return `${body}.${sig}`
}

export function verifySession(
  token: string | null | undefined,
  secret: string | null | undefined,
  now = Date.now()
): TechSession | null {
  if (!token || !secret) return null
  if (token.length > 2000) return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null
  const expected = b64url(crypto.createHmac("sha256", secret).update(body).digest())
  if (!safeEqual(sig, expected)) return null
  try {
    const parsed = JSON.parse(b64urlDecode(body).toString("utf8")) as Partial<TechSession>
    if (parsed.v !== 1) return null
    if (typeof parsed.tid !== "string" || !UUID_RE.test(parsed.tid)) return null
    if (typeof parsed.pid !== "string" || !PLANT_RE.test(parsed.pid)) return null
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp) || parsed.exp <= now) return null
    return { v: 1, tid: parsed.tid, pid: parsed.pid, exp: parsed.exp }
  } catch {
    return null
  }
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(";")) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    if (trimmed.slice(0, eq) !== name) continue
    try {
      return decodeURIComponent(trimmed.slice(eq + 1))
    } catch {
      return null
    }
  }
  return null
}

export function sessionCookie(token: string, secure: boolean): string {
  const maxAge = Math.floor(SESSION_MS / 1000)
  const secureAttr = secure ? "; Secure" : ""
  return `${TECH_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secureAttr}`
}

export function clearSessionCookie(secure: boolean): string {
  const secureAttr = secure ? "; Secure" : ""
  return `${TECH_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureAttr}`
}

export function adminSecretMatches(provided: string, expected: string): boolean {
  if (!provided || !expected) return false
  const left = crypto.createHash("sha256").update(provided).digest()
  const right = crypto.createHash("sha256").update(expected).digest()
  return crypto.timingSafeEqual(left, right)
}

export function authorizeTechAction(input: {
  session: TechSession | null
  secret: string | null | undefined
  action: string | null | undefined
  note?: string | null
  technician: TechnicianRecord | null
  call: ServiceCallRecord | null
}): AuthSuccess | AuthFailure {
  if (!input.secret) {
    return {
      ok: false,
      status: 503,
      error: "Technician actions are not set up yet. Set TECH_SESSION_SECRET on the server.",
    }
  }

  const session = input.session
  if (!session) {
    return {
      ok: false,
      status: 401,
      error: "Sign in with your mobile number and PIN.",
    }
  }

  const technician = input.technician
  if (!technician || technician.id !== session.tid) {
    return {
      ok: false,
      status: 403,
      error: "This sign-in is no longer valid.",
    }
  }

  if (technician.active !== true || technician.plant_id !== session.pid) {
    return {
      ok: false,
      status: 403,
      error: "This technician is not active for that plant.",
    }
  }

  if (!TECH_ACTIONS.includes(input.action as TechActionName)) {
    return { ok: false, status: 400, error: "Unknown action." }
  }
  const action = input.action as TechActionName

  const call = input.call
  if (!call) {
    return { ok: false, status: 404, error: "That service call was not found." }
  }
  if (!call.plant_id || call.plant_id !== technician.plant_id) {
    return {
      ok: false,
      status: 403,
      error: "That service call belongs to a different plant.",
    }
  }

  const note = typeof input.note === "string" ? input.note.trim() : ""
  if (note.length > MAX_NOTE) {
    return { ok: false, status: 400, error: "That note is too long." }
  }

  const status = call.status || ""
  if (action === "arrived" && !ARRIVAL_STATUSES.has(status)) {
    return {
      ok: false,
      status: 409,
      error: "This call can no longer be marked arrived. Refresh and try again.",
    }
  }
  if ((action === "needs_more" || action === "complete") && !WORK_STATUSES.has(status)) {
    return {
      ok: false,
      status: 409,
      error: "This call is not ready for that update. Refresh and try again.",
    }
  }
  if (action === "needs_more" && !note) {
    return { ok: false, status: 400, error: "Describe the additional work before saving." }
  }

  return {
    ok: true,
    technician,
    call,
    action,
    note: note || null,
  }
}
