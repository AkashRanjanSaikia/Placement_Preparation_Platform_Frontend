import {
  addHoursToLocalStart,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../utils/contestDateTime.js'

export default function ScheduleFields({
  startLocal,
  endLocal,
  onStartChange,
  onEndChange,
  maxParticipants,
  onMaxParticipantsChange,
}) {
  function applyDuration(hours) {
    if (!startLocal) return
    onEndChange(addHoursToLocalStart(startLocal, hours))
  }

  const startIso = fromDatetimeLocalValue(startLocal)
  const endIso = fromDatetimeLocalValue(endLocal)
  const invalidRange =
    startIso && endIso && new Date(endIso) <= new Date(startIso)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink/50 text-xs font-medium uppercase tracking-wide">
            Start (your local time)
          </span>
          <input
            type="datetime-local"
            value={startLocal}
            onChange={(e) => onStartChange(e.target.value)}
            className="border-ink/15 mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/50 text-xs font-medium uppercase tracking-wide">
            End (your local time)
          </span>
          <input
            type="datetime-local"
            value={endLocal}
            onChange={(e) => onEndChange(e.target.value)}
            className="border-ink/15 mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-ink/50 text-xs">Quick duration from start:</span>
        {[1, 2, 3].map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => applyDuration(h)}
            className="border-ink/15 rounded-full border px-3 py-1 text-xs hover:bg-ink/5"
          >
            {h}h
          </button>
        ))}
      </div>

      {invalidRange ? (
        <p className="text-sm text-rose-600">End time must be after start time.</p>
      ) : null}

      <label className="block text-sm">
        <span className="text-ink/50 text-xs font-medium uppercase tracking-wide">
          Max participants (optional)
        </span>
        <input
          type="number"
          min={1}
          value={maxParticipants ?? ''}
          onChange={(e) =>
            onMaxParticipantsChange(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="No limit"
          className="border-ink/15 mt-1.5 w-full max-w-xs rounded-xl border px-3 py-2.5 text-sm"
        />
      </label>

      {startIso && endIso && !invalidRange ? (
        <p className="text-ink/45 font-mono text-[11px]">
          Stored as UTC: {new Date(startIso).toISOString()} →{' '}
          {new Date(endIso).toISOString()}
        </p>
      ) : null}
    </div>
  )
}

export { toDatetimeLocalValue, fromDatetimeLocalValue }
