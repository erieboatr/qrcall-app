async function loadOnDuty() {
  const now = new Date()
  const today = now.toISOString().slice(0, 10) // YYYY-MM-DD
  const dayOfWeek = now.getUTCDay()
  const currentTime = now.toISOString().slice(11, 16)

  // Check overrides first
  const { data: overrideData } = await supabase
    .from("schedule_overrides")
    .select("technicians(name), start_time, end_time")
    .eq("plant_id", plant)
    .eq("override_date", today)
    .lte("start_time", currentTime)
    .gte("end_time", currentTime)

  if (overrideData && overrideData.length > 0) {
    const names = overrideData.map((row: any) => row.technicians?.name).filter(Boolean)
    setOnDuty(names)
    return
  }

  // Fall back to weekly rules
  const { data } = await supabase
    .from("schedules")
    .select("technicians(name)")
    .eq("plant_id", plant)
    .eq("day_of_week", dayOfWeek)
    .lte("start_time", currentTime)
    .gte("end_time", currentTime)

  if (data) {
    const names = data.map((row: any) => row.technicians?.name).filter(Boolean)
    setOnDuty(names)
  } else {
    setOnDuty([])
  }
}