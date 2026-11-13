async function saveOverride(dateStr: string, techId: string, start: string, end: string) {
  const existing = overrides.find(
    (o) => o.override_date === dateStr && o.technician_id === techId
  )

  if (existing?.id) {
    await supabase
      .from("schedule_overrides")
      .update({ start_time: start || null, end_time: end || null })
      .eq("id", existing.id)
  } else {
    await supabase.from("schedule_overrides").insert({
      plant_id: plantId,
      override_date: dateStr,
      technician_id: techId,
      start_time: start || null,
      end_time: end || null,
    })
  }
  load()
}

async function removeOverride(dateStr: string, techId: string) {
  // Mark as explicitly OFF by saving null times
  await saveOverride(dateStr, techId, "", "")
}

function getScheduleForDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  const dayOfWeek = date.getDay()

  // Check for any override for this tech on this date
  const overrideMap = new Map<string, Override>()
  overrides
    .filter((o) => o.override_date === dateStr)
    .forEach((o) => overrideMap.set(o.technician_id, o))

  const result: { techId: string; start: string; end: string; isOverride: boolean }[] = []

  // First, add everyone who has a weekly rule
  Object.entries(techSchedules).forEach(([techId, conf]) => {
    if (conf.days.includes(dayOfWeek)) {
      const override = overrideMap.get(techId)
      if (override) {
        // Explicit override exists
        if (override.start_time && override.end_time) {
          result.push({
            techId,
            start: override.start_time.slice(0, 5),
            end: override.end_time.slice(0, 5),
            isOverride: true,
          })
        }
        // else: explicitly OFF — don’t add them
      } else {
        // No override — use weekly rule
        result.push({
          techId,
          start: conf.start,
          end: conf.end,
          isOverride: false,
        })
      }
    }
  })

  // Also add anyone who was added via override but wasn’t in the weekly rule
  overrideMap.forEach((override, techId) => {
    if (!result.find((r) => r.techId === techId) && override.start_time && override.end_time) {
      result.push({
        techId,
        start: override.start_time.slice(0, 5),
        end: override.end_time.slice(0, 5),
        isOverride: true,
      })
    }
  })

  return result
}