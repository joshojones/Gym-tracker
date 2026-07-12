import { useEffect, useState } from 'react'

// `trigger` is a counter passed in by the parent that increments every time
// a set is logged. Watching it in useEffect is how we "restart" the
// countdown each time, without the parent needing to know anything about
// timer internals.
function RestTimer({ trigger, duration = 180 }) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trigger === 0) return
    setSecondsLeft(duration)
    setVisible(true)
  }, [trigger])

  useEffect(() => {
    if (!visible || secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [visible, secondsLeft])

  if (!visible) return null

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  return (
    <div className="rest-timer">
      <div>
        <div className="timer-label">Rest</div>
        <div className="timer-display" style={{ color: secondsLeft <= 10 ? 'var(--danger)' : 'var(--accent)' }}>
          {m}:{String(s).padStart(2, '0')}
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => setVisible(false)}>Done</button>
    </div>
  )
}

export default RestTimer
