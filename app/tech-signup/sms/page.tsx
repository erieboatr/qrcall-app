async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError('')

  if (!consent) {
    setError('You must agree to receive messages.')
    return
  }

  setLoading(true)

  const { error: insertError } = await supabase.from('technicians').insert({
    name,
    phone,
    language,
    plant_id: plantId,
    active: true,
    sms_consent: true,
  })

  if (insertError) {
    setLoading(false)
    setError(insertError.message)
    return
  }

  // Send confirmation SMS
  try {
    await fetch("https://slrxmogriwsnbondquwq.supabase.co/functions/v1/send-signup-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    })
  } catch (err) {
    console.error("Confirmation SMS failed:", err)
    // Don't block signup if SMS fails
  }

  setLoading(false)
  setDone(true)
}