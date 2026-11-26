"use client"

import { useEffect, useState } from "react"

type OpenCall = {
  id?: string | null
  equipment_name?: string | null
  location?: string | null
  priority?: string | null
  status?: string | null
  description?: string | null
  work_notes?: string | null
  submitter_name?: string | null
  photo_url?: string | null
}

const copy = {
  en: {
    title: "Current Call",
    operator: "Call submitted. A technician has been notified.",
    heading: "Technician",
    help: "Enter the mobile number you signed up with and your PIN. This phone will remember you.",
    phone: "Mobile number",
    pin: "PIN",
    continue: "Continue",
    working: "Saving...",
    signedIn: "Signed in as",
    notYou: "Not you?",
    arrived: "Arrived",
    needsMore: "Needs More Work",
    note: "What additional work is needed?",
    saveNote: "Save Additional Work Note",
    completed: "Completed",
  },
  es: {
    title: "Llamada Actual",
    operator: "Llamada enviada. Se ha notificado a un técnico.",
    heading: "Técnico",
    help: "Ingrese el número con el que se registró y su PIN. Este teléfono lo recordará.",
    phone: "Número de móvil",
    pin: "PIN",
    continue: "Continuar",
    working: "Guardando...",
    signedIn: "Sesión de",
    notYou: "¿No es usted?",
    arrived: "Llegué",
    needsMore: "Necesita Más Trabajo",
    note: "¿Qué trabajo adicional se necesita?",
    saveNote: "Guardar Nota de Trabajo",
    completed: "Completado",
  },
}

export function TechOnCall({
  plantId,
  call,
  lang,
}: {
  plantId: string
  call: OpenCall
  lang: "en" | "es"
}) {
  const t = copy[lang]
  const [techName, setTechName] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(call.status || "")
  const [workNotes, setWorkNotes] = useState(call.work_notes || "")
  const [askingNote, setAskingNote] = useState(call.status === "Needs More Work")
  const [note, setNote] = useState("")

  useEffect(() => {
    let ignore = false
    fetch(`/api/tech/session?plant=${encodeURIComponent(plantId)}`)
      .then((response) => response.json())
      .then((body: { signedIn?: boolean; name?: string }) => {
        if (ignore) return
        setTechName(body.signedIn && body.name ? body.name : null)
        setChecking(false)
      })
      .catch(() => {
        if (ignore) return
        setTechName(null)
        setChecking(false)
      })
    return () => {
      ignore = true
    }
  }, [plantId])

  async function signIn(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/tech/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin, plantId }),
      })
      const body = (await response.json()) as { name?: string; error?: string }
      if (!response.ok || !body.name) {
        setError(body.error || "Could not sign in.")
        return
      }
      setTechName(body.name)
      setPin("")
    } catch {
      setError("Could not sign in.")
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await fetch("/api/tech/logout", { method: "POST" })
    setTechName(null)
  }

  async function act(action: "arrived" | "needs_more" | "complete", extra?: string) {
    if (!call.id) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/tech/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: call.id, action, note: extra }),
      })
      const body = (await response.json()) as { status?: string; error?: string }
      if (!response.ok || !body.status) {
        setError(body.error || "Update failed.")
        return
      }
      setStatus(body.status)
      if (action === "needs_more" && extra) {
        setWorkNotes((current) => (current ? `${current}\n\n${extra}` : extra))
        setNote("")
      }
    } catch {
      setError("Update failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <div className="bg-white border rounded p-4 space-y-2">
        <div>
          <strong>{call.equipment_name}</strong>
          {call.location ? ` — ${call.location}` : ""}
        </div>
        <div>
          {call.priority} • {status}
        </div>
        {call.description ? <div>{call.description}</div> : null}
        {workNotes ? (
          <div className="text-sm whitespace-pre-wrap border-l-4 border-orange-500 pl-2">{workNotes}</div>
        ) : null}
        {call.submitter_name ? <div className="text-sm">Submitted by: {call.submitter_name}</div> : null}
        {call.photo_url ? <img src={call.photo_url} alt="issue" className="mt-2 max-h-40 rounded" /> : null}

        {techName ? (
          <div className="space-y-3 pt-3">
            <p className="text-sm text-gray-700">
              {t.signedIn} {techName}
            </p>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {(status === "Waiting" || status === "Open") && (
              <button
                type="button"
                disabled={busy}
                onClick={() => act("arrived")}
                className="w-full bg-blue-600 text-white py-3 rounded font-medium disabled:opacity-50"
              >
                {busy ? t.working : t.arrived}
              </button>
            )}
            {(status === "Arrived" || status === "Needs More Work") && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAskingNote(true)}
                  className="w-full bg-orange-600 text-white py-3 rounded font-medium disabled:opacity-50"
                >
                  {t.needsMore}
                </button>
                {askingNote ? (
                  <>
                    <textarea
                      placeholder={t.note}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="w-full border rounded p-2"
                      rows={3}
                    />
                    <button
                      type="button"
                      disabled={busy || !note.trim()}
                      onClick={() => act("needs_more", note.trim())}
                      className="w-full bg-orange-700 text-white py-3 rounded font-medium disabled:opacity-50"
                    >
                      {t.saveNote}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act("complete")}
                  className="w-full bg-green-600 text-white py-3 rounded font-medium disabled:opacity-50"
                >
                  {busy ? t.working : t.completed}
                </button>
              </>
            )}
            <button type="button" onClick={signOut} className="text-sm text-gray-600 underline">
              {t.notYou}
            </button>
          </div>
        ) : (
          <div className="pt-3 space-y-3">
            <p className="text-sm text-gray-700">{t.operator}</p>
            {!checking && (
              <form onSubmit={signIn} className="border-t pt-3 space-y-2">
                <h2 className="font-semibold">{t.heading}</h2>
                <p className="text-sm text-gray-600">{t.help}</p>
                {error ? <p className="text-sm text-red-700">{error}</p> : null}
                <label className="block text-sm font-medium">
                  {t.phone}
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full border rounded p-2"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label className="block text-sm font-medium">
                  {t.pin}
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="mt-1 w-full border rounded p-2"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-gray-800 text-white py-3 rounded font-medium disabled:opacity-50"
                >
                  {busy ? t.working : t.continue}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
