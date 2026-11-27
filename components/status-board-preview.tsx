const calls = [
  {
    equipment: 'Case packer 3',
    location: 'Line B',
    priority: 'Critical',
    status: 'Waiting',
    time: '2 min ago',
    bar: 'bg-red-600',
  },
  {
    equipment: 'Air compressor',
    location: 'Utilities',
    priority: 'High',
    status: 'Arrived',
    time: '14 min ago',
    bar: 'bg-orange-500',
  },
  {
    equipment: 'Stretch wrapper',
    location: 'Shipping dock',
    priority: 'Medium',
    status: 'Waiting',
    time: '26 min ago',
    bar: 'bg-yellow-500',
  },
  {
    equipment: 'Break room HVAC',
    location: 'Admin wing',
    priority: 'Low',
    status: 'Waiting',
    time: '1 hr ago',
    bar: 'bg-green-600',
  },
]

export function StatusBoardPreview() {
  return (
    <figure className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl ring-1 ring-black/10">
      <figcaption className="sr-only">
        Example shop board. Priorities are color-coded from Critical to Low.
      </figcaption>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Example</p>
          <p className="text-lg font-bold">Live status board</p>
        </div>
        <p className="text-right text-sm text-gray-300">
          On duty
          <span className="mt-1 block text-white">Day shift</span>
        </p>
      </div>
      <ul className="space-y-3 p-4">
        {calls.map((call) => (
          <li key={call.equipment} className="flex items-stretch gap-3 rounded-xl bg-gray-800 p-3">
            <span className={`w-1.5 shrink-0 rounded ${call.bar}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{call.equipment}</p>
              <p className="text-sm text-gray-300">{call.location}</p>
              <p className="mt-1 text-sm font-medium">
                {call.priority}
                <span className="text-gray-400"> · </span>
                {call.status}
              </p>
            </div>
            <p className="shrink-0 text-right text-xs text-gray-400">{call.time}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 px-5 pb-4 text-xs text-gray-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />
          Critical
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
          High
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" aria-hidden="true" />
          Medium
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" aria-hidden="true" />
          Low
        </span>
      </div>
    </figure>
  )
}
