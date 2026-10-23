import { memo, useEffect } from 'react'
import { useServerCountdown } from '../hooks/useServerCountdown.js'

function ContestRoomCountdown({
  endTime,
  serverTime,
  examFinalized,
  onTimeExpiredChange,
}) {
  const countdown = useServerCountdown(endTime, serverTime)
  const expired = Boolean(endTime) && countdown.ms <= 0

  useEffect(() => {
    onTimeExpiredChange?.(expired)
  }, [expired, onTimeExpiredChange])

  return (
    <>
      {countdown.urgent && !examFinalized && countdown.ms > 0 ? (
        <div className="border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 mt-2 rounded-xl border px-4 py-2 text-center text-sm font-medium">
          Less than 5 minutes left — submit your exam from the last question.
        </div>
      ) : null}
      <p
        className={
          countdown.urgent
            ? 'mt-1 font-mono text-xs text-rose-600'
            : 'text-ink/50 mt-1 font-mono text-xs'
        }
      >
        Time left: {countdown.label}
      </p>
    </>
  )
}

export default memo(ContestRoomCountdown)
