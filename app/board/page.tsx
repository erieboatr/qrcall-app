{calls.map((call) => (
  <div
    key={call.id}
    className="flex items-stretch gap-6 bg-gray-800 rounded-xl p-5 shadow-lg"
  >
    <div className={`w-3 rounded ${priorityColor(call.priority)}`} />

    {/* Left side – main info */}
    <div className="flex-1">
      <div className="text-3xl font-bold">{call.equipment_name}</div>
      <div className="text-xl text-gray-300">{call.location}</div>
      <div className="text-lg mt-1 font-semibold">
        {call.priority} • {call.status}
      </div>
      {call.description && (
        <div className="mt-2 text-gray-300">{call.description}</div>
      )}
      {call.submitter_name && (
        <div className="text-sm mt-2 text-gray-400">
          Submitted by: {call.submitter_name}
        </div>
      )}
    </div>

    {/* Right side – timestamps */}
    <div className="text-right text-base text-gray-300 min-w-[220px]">
      <div>
        <span className="text-gray-400">Submitted:</span><br />
        {call.submitted_at ? new Date(call.submitted_at).toLocaleString() : "—"}
      </div>
      {call.arrived_at && (
        <div className="mt-2">
          <span className="text-gray-400">Arrived:</span><br />
          {new Date(call.arrived_at).toLocaleString()}
        </div>
      )}
      {call.status === "Needs More Work" && call.updated_at && (
        <div className="mt-2">
          <span className="text-gray-400">More Work:</span><br />
          {new Date(call.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  </div>
))}