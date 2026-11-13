{/* Month Calendar - printable */}
<div className="print-area">
  <div className="flex items-center justify-between mb-4 no-print">
    <h2 className="font-semibold text-xl">{monthName}</h2>
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
        className="px-3 py-1 border rounded"
      >
        ← Prev
      </button>
      <button
        onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
        className="px-3 py-1 border rounded"
      >
        Next →
      </button>
      <button onClick={printSchedule} className="px-3 py-1 bg-gray-800 text-white rounded">
        Print
      </button>
    </div>
  </div>

  <div className="hidden print:block text-center mb-6">
    <h1 className="text-2xl font-bold">{plantName} — {monthName}</h1>
  </div>

  {(() => {
    const weeks: { day: number; dateStr: string; dayName: string }[][] = []
    let currentWeek: { day: number; dateStr: string; dayName: string }[] = []

    // Pad the first week
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push({ day: 0, dateStr: "", dayName: DAYS[i].slice(0, 3) })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = formatDate(year, month, day)
      currentWeek.push({
        day,
        dateStr,
        dayName: DAYS[date.getDay()].slice(0, 3),
      })

      if (currentWeek.length === 7 || day === daysInMonth) {
        // Pad the last week if needed
        while (currentWeek.length < 7) {
          currentWeek.push({ day: 0, dateStr: "", dayName: "" })
        }
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="mb-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 text-left min-w-[140px] sticky left-0 bg-white">Name</th>
              {week.map((d, i) => (
                <th key={i} className="border p-2 bg-gray-100 text-center min-w-[80px]">
                  {d.day > 0 ? (
                    <>
                      <div className="font-semibold">{d.day}</div>
                      <div className="text-xs text-gray-500">{d.dayName}</div>
                    </>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {techs.filter(t => t.active).map((tech) => (
              <tr key={tech.id}>
                <td className="border p-2 font-medium sticky left-0 bg-white">{tech.name}</td>
                {week.map((d, i) => {
                  if (d.day === 0) {
                    return <td key={i} className="border bg-gray-50" />
                  }

                  const shifts = getScheduleForDate(d.dateStr).filter(s => s.techId === tech.id)
                  const shift = shifts[0]
                  const isOverride = shift?.isOverride
                  const isEditing = editingDay === `${d.dateStr}-${tech.id}`

                  return (
                    <td
                      key={i}
                      className={`border p-1 text-center cursor-pointer relative ${
                        isOverride ? "bg-yellow-100" : ""
                      }`}
                      onClick={() => setEditingDay(isEditing ? null : `${d.dateStr}-${tech.id}`)}
                    >
                      {shift ? (
                        <div className="text-xs leading-tight">
                          {shift.start}<br />{shift.end}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">OFF</span>
                      )}

                      {isEditing && (
                        <div className="absolute z-20 mt-1 left-0 bg-white border shadow-lg p-3 rounded no-print" style={{ minWidth: "180px" }}>
                          <div className="text-xs font-semibold mb-2">
                            {tech.name}<br />{d.dateStr}
                          </div>
                          <div className="flex flex-col gap-2">
                            <input
                              type="time"
                              defaultValue={shift?.start || "08:00"}
                              className="border rounded px-1 text-xs"
                              id={`edit-start-${tech.id}-${d.day}`}
                            />
                            <input
                              type="time"
                              defaultValue={shift?.end || "16:00"}
                              className="border rounded px-1 text-xs"
                              id={`edit-end-${tech.id}-${d.day}`}
                            />
                            <button
                              className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                              onClick={(e) => {
                                e.stopPropagation()
                                const start = (document.getElementById(`edit-start-${tech.id}-${d.day}`) as HTMLInputElement)?.value
                                const end = (document.getElementById(`edit-end-${tech.id}-${d.day}`) as HTMLInputElement)?.value
                                if (start && end) {
                                  saveOverride(d.dateStr, tech.id, start, end)
                                  setEditingDay(null)
                                }
                              }}
                            >
                              Save Override
                            </button>
                            <button
                              className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeOverride(d.dateStr, tech.id)
                                setEditingDay(null)
                              }}
                            >
                              Mark OFF
                            </button>
                            <button
                              className="text-xs text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingDay(null)
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))
  })()}
</div>