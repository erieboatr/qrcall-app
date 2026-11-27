import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { isServiceRoleCredential, SetupError, phoneKey, type PinRecord } from "./tech-auth"
import type { ApplyResult, TechDeps } from "./tech-handlers"
import type { ServiceCallRecord, TechnicianRecord } from "./tech-auth"

export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !isServiceRoleCredential(key)) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function requireDb(client: SupabaseClient | null): SupabaseClient {
  if (!client) {
    throw new SetupError(
      "SUPABASE_SERVICE_ROLE_KEY is missing or is not a service-role key. Technician actions are refused."
    )
  }
  return client
}

function asTechnician(row: Record<string, unknown> | null): TechnicianRecord | null {
  if (!row || typeof row.id !== "string") return null
  return {
    id: row.id,
    name: typeof row.name === "string" ? row.name : "Technician",
    plant_id: typeof row.plant_id === "string" ? row.plant_id : null,
    active: typeof row.active === "boolean" ? row.active : null,
    language: typeof row.language === "string" ? row.language : null,
  }
}

function asCall(row: Record<string, unknown> | null): ServiceCallRecord | null {
  if (!row || typeof row.id !== "string") return null
  return {
    id: row.id,
    plant_id: typeof row.plant_id === "string" ? row.plant_id : null,
    status: typeof row.status === "string" ? row.status : null,
    equipment_name: typeof row.equipment_name === "string" ? row.equipment_name : null,
    location: typeof row.location === "string" ? row.location : null,
    priority: typeof row.priority === "string" ? row.priority : null,
    description: typeof row.description === "string" ? row.description : null,
    work_notes: typeof row.work_notes === "string" ? row.work_notes : null,
    submitted_at: typeof row.submitted_at === "string" ? row.submitted_at : null,
    arrived_at: typeof row.arrived_at === "string" ? row.arrived_at : null,
    submitter_name: typeof row.submitter_name === "string" ? row.submitter_name : null,
    photo_url: typeof row.photo_url === "string" ? row.photo_url : null,
  }
}

function mapWriteError(message: string): ApplyResult {
  const text = message.toLowerCase()
  if (text.includes("technician_not_allowed")) {
    return { ok: false, status: 403, error: "This technician cannot update that call." }
  }
  if (text.includes("invalid_transition")) {
    return {
      ok: false,
      status: 409,
      error: "This call changed before the update was saved. Refresh and try again.",
    }
  }
  if (text.includes("note_required")) {
    return { ok: false, status: 400, error: "Describe the additional work before saving." }
  }
  if (text.includes("call_not_found")) {
    return { ok: false, status: 404, error: "That service call was not found." }
  }
  if (
    text.includes("perform_tech_action") ||
    text.includes("schema cache") ||
    text.includes("work_notes") ||
    text.includes("service_call_actions") ||
    text.includes("technician_pins") ||
    text.includes("permission denied") ||
    text.includes("42501")
  ) {
    return {
      ok: false,
      status: 503,
      error:
        "The technician authorization migration has not been applied. Run it in the Supabase SQL editor, then try again.",
    }
  }
  return { ok: false, status: 500, error: "Could not update that service call." }
}

export function productionTechDeps(): TechDeps {
  const client = createAdminClient()
  return {
    secret: process.env.TECH_SESSION_SECRET ?? null,
    secureCookies: process.env.NODE_ENV === "production",
    async getTechnician(id) {
      const db = requireDb(client)
      const { data, error } = await db
        .from("technicians")
        .select("id, name, plant_id, active, language")
        .eq("id", id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return asTechnician(data as Record<string, unknown> | null)
    },
    async findTechnicianByPhone(plantId, key) {
      const db = requireDb(client)
      const { data, error } = await db
        .from("technicians")
        .select("id, name, phone, plant_id, active, language")
        .eq("plant_id", plantId)
        .eq("active", true)
      if (error) throw new Error(error.message)
      const match = (data ?? []).find((row) => {
        const record = row as Record<string, unknown>
        return typeof record.phone === "string" && phoneKey(record.phone) === key
      }) as Record<string, unknown> | undefined
      return asTechnician(match ?? null)
    },
    async getPin(technicianId) {
      const db = requireDb(client)
      const { data, error } = await db
        .from("technician_pins")
        .select("pin_hash, pin_salt, failed_attempts, locked_until")
        .eq("technician_id", technicianId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) return null
      const row = data as Record<string, unknown>
      return {
        hash: String(row.pin_hash ?? ""),
        salt: String(row.pin_salt ?? ""),
        failedAttempts: typeof row.failed_attempts === "number" ? row.failed_attempts : 0,
        lockedUntil: typeof row.locked_until === "string" ? row.locked_until : null,
      } satisfies PinRecord
    },
    async savePinFailure(technicianId, failedAttempts, lockedUntil) {
      const db = requireDb(client)
      const { error } = await db
        .from("technician_pins")
        .update({
          failed_attempts: failedAttempts,
          locked_until: lockedUntil,
          updated_at: new Date().toISOString(),
        })
        .eq("technician_id", technicianId)
      if (error) throw new Error(error.message)
    },
    async clearPinFailure(technicianId) {
      const db = requireDb(client)
      const { error } = await db
        .from("technician_pins")
        .update({
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("technician_id", technicianId)
      if (error) throw new Error(error.message)
    },
    async savePin(technicianId, hash, salt) {
      const db = requireDb(client)
      const { error } = await db.from("technician_pins").upsert({
        technician_id: technicianId,
        pin_hash: hash,
        pin_salt: salt,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
    },
    async getCall(id) {
      const db = requireDb(client)
      const { data, error } = await db.from("service_calls").select("*").eq("id", id).maybeSingle()
      if (error) throw new Error(error.message)
      return asCall(data as Record<string, unknown> | null)
    },
    async applyAction(input): Promise<ApplyResult> {
      const db = requireDb(client)
      const { data, error } = await db.rpc("perform_tech_action", {
        p_call_id: input.callId,
        p_technician_id: input.technicianId,
        p_action: input.action,
        p_note: input.note,
      })
      if (error) {
        console.error("perform_tech_action error", error.code, error.message)
        return mapWriteError(error.message || "")
      }
      const status =
        data && typeof data === "object" && "status" in data && typeof data.status === "string"
          ? data.status
          : input.action
      return { ok: true, status }
    },
  }
}
