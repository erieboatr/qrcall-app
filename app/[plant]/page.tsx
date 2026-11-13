{/* Month Calendar - printable */}
<div className="print-area border rounded-lg p-4 overflow-x-auto">
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

  <div className="hidden print:block text-center mb-4">
    <h1 className="text-2xl font-bold">{plantName} — {monthName}</h1>
  </div>

  <table className="w-full border-collapse text-sm">
    <thead>
      <tr>
        <th className="border p-2 bg-gray-100 text-left sticky left-0 bg-white min-w-[120px]">Name</th>
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const dayName = DAYS[date.getDay()].slice(0, 3)
          return (
            <th key={day} className="border p-1 bg-gray-100 text-center min-w-[70px]">
              <div className="font-semibold">{day}</div>
              <div className="text-xs text-gray-500">{dayName}</div>
            </th>
          )
        })}
      </tr>
    </thead>
    <tbody>
      {techs.filter(t => t.active).map((tech) => (
        <tr key={tech.id}>
          <td className="border p-2 font-medium sticky left-0 bg-white">{tech.name}</td>
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = formatDate(year, month, day)
            const shifts = getScheduleForDate(dateStr).filter(s => s.techId === tech.id)
            const shift = shifts[0]
            const isOverride = shift?.isOverride
            const isEditing = editingDay === `${dateStr}-${tech.id}`

            return (
              <td
                key={day}
                className={`border p-1 text-center cursor-pointer ${
                  isOverride ? "bg-yellow-100" : ""
                }`}
                onClick={() => setEditingDay(isEditing ? null : `${dateStr}-${tech.id}`)}
              >
                {shift ? (
                  <div className="text-xs">
                    {shift.start}<br />{shift.end}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">OFF</span>
                )}

                {isEditing && (
                  <div className="absolute z-10 mt-1 bg-white border shadow-lg p-3 rounded no-print" style={{ minWidth: "200px" }}>
                    <div className="text-xs font-semibold mb-2">{tech.name} — {dateStr}</div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="time"
                        defaultValue={shift?.start || "08:00"}
                        className="border rounded px-1 text-xs"
                        id={`edit-start-${tech.id}`}
                      />
                      <input
                        type="time"
                        defaultValue={shift?.end || "16:00"}
                        className="border rounded px-1 text-xs"
                        id={`edit-end-${tech.id}`}
                      />
                      <button
                        className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          const start = (document.getElementById(`edit-start-${tech.id}`) as HTMLInputElement)?.value
                          const end = (document.getElementById(`edit-end-${tech.id}`) as HTMLInputElement)?.value
                          if (start && end) {
                            saveOverride(dateStr, tech.id, start, end)
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
                          removeOverride(dateStr, tech.id)
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