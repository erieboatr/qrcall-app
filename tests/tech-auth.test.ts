import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { renderToStaticMarkup } from "react-dom/server"
import React from "react"
import { TechOnCall } from "../components/tech-on-call"
import {
  TECH_COOKIE,
  adminSecretMatches,
  authorizeTechAction,
  hashPin,
  isServiceRoleCredential,
  phoneKey,
  pinMatches,
  readCookie,
  signSession,
  verifySession,
  type PinRecord,
  type ServiceCallRecord,
  type TechnicianRecord,
} from "../lib/tech-auth"
import {
  handleSetPin,
  handleTechAction,
  handleTechLogin,
  handleTechSession,
  type TechDeps,
} from "../lib/tech-handlers"

const SECRET = "test-session-secret"
const TECH_ID = "11111111-1111-4111-8111-111111111111"
const CALL_ID = "33333333-3333-4333-8333-333333333333"
const PIN = "2468"
const PHONE = "(216) 555-0142"

function tech(overrides: Partial<TechnicianRecord> = {}): TechnicianRecord {
  return {
    id: TECH_ID,
    name: "Ada",
    plant_id: "ppi",
    active: true,
    language: "en",
    phone: PHONE,
    ...overrides,
  }
}

function call(overrides: Partial<ServiceCallRecord> = {}): ServiceCallRecord {
  return {
    id: CALL_ID,
    plant_id: "ppi",
    status: "Waiting",
    equipment_name: "Filler 2",
    location: "Line 1",
    description: "Original leak report",
    ...overrides,
  }
}

function pinRecord(overrides: Partial<PinRecord> = {}): PinRecord {
  const hashed = hashPin(PIN)
  return {
    hash: hashed.hash,
    salt: hashed.salt,
    failedAttempts: 0,
    lockedUntil: null,
    ...overrides,
  }
}

function deps(overrides: Partial<TechDeps> = {}): TechDeps & { applied: unknown[]; failures: number } {
  const applied: unknown[] = []
  const store = {
    secret: SECRET,
    secureCookies: false,
    applied,
    failures: 0,
    async getTechnician(id: string) {
      return id === TECH_ID ? tech() : null
    },
    async findTechnicianByPhone(plantId: string, key: string) {
      const person = tech()
      if (plantId === person.plant_id && phoneKey(person.phone || "") === key) return person
      return null
    },
    async getCall(id: string) {
      return id === CALL_ID ? call() : null
    },
    async getPin() {
      return pinRecord()
    },
    async savePinFailure(_id: string, attempts: number) {
      store.failures = attempts
    },
    async clearPinFailure() {
      store.failures = 0
    },
    async savePin() {},
    async applyAction(input: unknown) {
      applied.push(input)
      return { ok: true as const, status: "Arrived" }
    },
    ...overrides,
  }
  return store
}

function cookieHeader(response: Response): string {
  const setCookie = response.headers.get("set-cookie") || ""
  const pair = setCookie.split(";")[0]
  return pair
}

describe("technician session", () => {
  it("matches the last 10 digits of a registered phone and checks a PIN", () => {
    assert.equal(phoneKey("+1 (216) 555-0142"), "2165550142")
    assert.equal(phoneKey("555-0142"), null)
    const hashed = hashPin(PIN)
    assert.equal(pinMatches(PIN, hashed.hash, hashed.salt), true)
    assert.equal(pinMatches("0000", hashed.hash, hashed.salt), false)
    assert.equal(adminSecretMatches(SECRET, SECRET), true)
    assert.equal(adminSecretMatches("", SECRET), false)
  })

  it("rejects a tampered or expired session cookie", () => {
    const token = signSession(TECH_ID, "ppi", SECRET, Date.now() + 60_000)
    assert.equal(verifySession(token, SECRET)?.tid, TECH_ID)
    assert.equal(verifySession(token, "other"), null)
    assert.equal(verifySession(token, SECRET, Date.now() + 120_000), null)
    assert.equal(isServiceRoleCredential("sb_publishable_example"), false)
    assert.equal(isServiceRoleCredential(fakeJwt({ role: "service_role" })), true)
  })
})

describe("authorizeTechAction", () => {
  const session = signSession(TECH_ID, "ppi", SECRET, Date.now() + 60_000)
  const parsed = verifySession(session, SECRET)

  it("refuses an operator with no session", () => {
    const decision = authorizeTechAction({
      session: null,
      secret: SECRET,
      action: "complete",
      technician: null,
      call: call({ status: "Arrived" }),
    })
    assert.equal(decision.ok, false)
    if (!decision.ok) assert.equal(decision.status, 401)
  })

  it("refuses another plant, an inactive technician, and an illegal transition", () => {
    const other = authorizeTechAction({
      session: parsed,
      secret: SECRET,
      action: "arrived",
      technician: tech({ plant_id: "other" }),
      call: call(),
    })
    assert.equal(other.ok, false)
    if (!other.ok) assert.equal(other.status, 403)

    const inactive = authorizeTechAction({
      session: parsed,
      secret: SECRET,
      action: "arrived",
      technician: tech({ active: false }),
      call: call(),
    })
    assert.equal(inactive.ok, false)

    const tooSoon = authorizeTechAction({
      session: parsed,
      secret: SECRET,
      action: "complete",
      technician: tech(),
      call: call({ status: "Waiting" }),
    })
    assert.equal(tooSoon.ok, false)
    if (!tooSoon.ok) assert.equal(tooSoon.status, 409)

    const noted = authorizeTechAction({
      session: parsed,
      secret: SECRET,
      action: "needs_more",
      note: "Needs a new belt",
      technician: tech(),
      call: call({ status: "Arrived", description: "Original leak report" }),
    })
    assert.equal(noted.ok, true)
    if (noted.ok) assert.equal(noted.call.description, "Original leak report")
  })
})

describe("phone and PIN http handlers", () => {
  it("does not apply an action without a session cookie", async () => {
    const store = deps()
    const response = await handleTechAction(
      jsonRequest({ callId: CALL_ID, action: "complete" }),
      store
    )
    assert.equal(response.status, 401)
    assert.equal(store.applied.length, 0)
  })

  it("signs in a technician and then lets that cookie update the call", async () => {
    const store = deps()
    const login = await handleTechLogin(
      jsonRequest({ phone: PHONE, pin: PIN, plantId: "ppi" }),
      store
    )
    assert.equal(login.status, 200)
    const cookie = cookieHeader(login)
    assert.match(cookie, new RegExp(`^${TECH_COOKIE}=`))
    assert.match(login.headers.get("set-cookie") || "", /HttpOnly/i)
    const token = readCookie(cookie, TECH_COOKIE)
    assert.equal(verifySession(token, SECRET)?.tid, TECH_ID)

    const session = await handleTechSession(
      new Request("https://www.qrcall.app/api/tech/session?plant=ppi", {
        headers: { cookie },
      }),
      store
    )
    const sessionBody = (await session.json()) as { signedIn: boolean; name: string }
    assert.equal(sessionBody.signedIn, true)
    assert.equal(sessionBody.name, "Ada")

    const action = await handleTechAction(
      jsonRequest({ callId: CALL_ID, action: "arrived" }, { cookie }),
      store
    )
    assert.equal(action.status, 200)
    assert.deepEqual(store.applied[0], {
      callId: CALL_ID,
      technicianId: TECH_ID,
      action: "arrived",
      note: null,
    })
  })

  it("rejects a wrong PIN and does not accept a body token in place of the cookie", async () => {
    const store = deps()
    const denied = await handleTechLogin(
      jsonRequest({ phone: PHONE, pin: "0000", plantId: "ppi" }),
      store
    )
    assert.equal(denied.status, 401)
    assert.equal(store.failures, 1)

    const forged = await handleTechAction(
      jsonRequest({
        token: signSession(TECH_ID, "ppi", SECRET, Date.now() + 60_000),
        callId: CALL_ID,
        action: "arrived",
      }),
      store
    )
    assert.equal(forged.status, 401)
    assert.equal(store.applied.length, 0)
  })

  it("locks the PIN after repeated failures and refuses a call at another plant", async () => {
    let record = pinRecord({ failedAttempts: 4 })
    const store = deps({
      async getPin() {
        return record
      },
      async savePinFailure(_id, attempts, lockedUntil) {
        record = { ...record, failedAttempts: attempts, lockedUntil }
      },
      async getCall() {
        return call({ plant_id: "other", status: "Arrived" })
      },
    })
    const locked = await handleTechLogin(
      jsonRequest({ phone: PHONE, pin: "0000", plantId: "ppi" }),
      store
    )
    assert.equal(locked.status, 401)
    assert.ok(record.lockedUntil)

    const again = await handleTechLogin(
      jsonRequest({ phone: PHONE, pin: PIN, plantId: "ppi" }),
      store
    )
    assert.equal(again.status, 429)

    const cookie = cookieHeader(
      await handleTechLogin(jsonRequest({ phone: PHONE, pin: PIN, plantId: "ppi" }), deps())
    )
    const crossPlant = await handleTechAction(
      jsonRequest({ callId: CALL_ID, action: "complete" }, { cookie }),
      store
    )
    assert.equal(crossPlant.status, 403)
    assert.equal(store.applied.length, 0)
  })

  it("lets the plant admin set a PIN only with the server secret", async () => {
    let saved = ""
    const store = deps({
      async savePin(_id, hash) {
        saved = hash
      },
    })
    const denied = await handleSetPin(
      jsonRequest({ plantId: "ppi", technicianId: TECH_ID, pin: "1357", adminSecret: "nope" }),
      store
    )
    assert.equal(denied.status, 401)
    assert.equal(saved, "")

    const allowed = await handleSetPin(
      jsonRequest({ plantId: "ppi", technicianId: TECH_ID, pin: "1357", adminSecret: SECRET }),
      store
    )
    assert.equal(allowed.status, 200)
    assert.ok(saved)
  })
})

describe("shared machine page", () => {
  it("shows the operator status and no technician buttons before sign-in", () => {
    const html = renderToStaticMarkup(
      React.createElement(TechOnCall, {
        plantId: "ppi",
        lang: "en",
        call: {
          id: CALL_ID,
          equipment_name: "Filler 2",
          location: "Line 1",
          priority: "Medium",
          status: "Waiting",
          description: "Original leak report",
          submitter_name: "Sam",
        },
      })
    )
    assert.match(html, /Call submitted. A technician has been notified./)
    assert.equal(html.includes(">Arrived<"), false)
    assert.equal(html.includes(">Completed<"), false)
    assert.match(html, /Original leak report/)
  })

  it("keeps Back to this machine on the public call URL", () => {
    const source = readFileSync(new URL("../app/call/page.tsx", import.meta.url), "utf8")
    assert.match(source, /Back to this machine/)
    assert.match(source, /\/call\?plant=\$\{backPlant\}&equip=/)
    assert.match(source, /TechOnCall/)
    assert.doesNotMatch(source, /updateStatus/)
    assert.doesNotMatch(source, /\.from\(['"]service_calls['"]\)[\s\S]{0,80}\.update/)
  })
})

describe("authorization migration", () => {
  const sql = readFileSync(
    new URL("../supabase/migrations/20261126120000_tech_action_authorization.sql", import.meta.url),
    "utf8"
  )

  it("revokes anonymous updates, hides PINs, and records who acted", () => {
    assert.match(sql, /revoke update, delete on table public\.service_calls from anon, authenticated/i)
    assert.match(sql, /technician_pins/)
    assert.match(sql, /revoke all on table public\.technician_pins from public, anon, authenticated/i)
    assert.match(sql, /service_call_actions/)
    assert.match(sql, /grant execute on function public\.perform_tech_action/i)
    assert.doesNotMatch(sql, /create policy[\s\S]{0,120}for update/i)
    assert.doesNotMatch(sql, /respond\?token/)
  })

  it("appends extra-work notes and does not overwrite the original description", () => {
    assert.match(sql, /work_notes = concat_ws/)
    assert.doesNotMatch(sql, /description\s*=/)
  })
})

function jsonRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://www.qrcall.app/api/tech/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })
}

function fakeJwt(payload: Record<string, string>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url")
  return `${encode({ alg: "none" })}.${encode(payload)}.sig`
}
