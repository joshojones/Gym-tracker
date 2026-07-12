// The PPLPPLR cycle has exactly one rest day for every 6 training days, so a
// gap of up to 2 calendar days between sessions (one rest day) still counts
// as "on schedule." Anything longer means a scheduled training day got missed.
const ON_SCHEDULE_GAP_DAYS = 2

function daysBetween(earlierDateStr, laterDateStr) {
  const earlier = new Date(earlierDateStr + 'T00:00:00')
  const later = new Date(laterDateStr + 'T00:00:00')
  return Math.round((later.getTime() - earlier.getTime()) / 86400000)
}

// `sessions` must be completed sessions sorted most-recent-first (by session_date).
export function computeStreak(sessions) {
  if (!sessions.length) return 0

  let streak = 1
  for (let i = 0; i < sessions.length - 1; i++) {
    const gap = daysBetween(sessions[i + 1].session_date, sessions[i].session_date)
    if (gap <= ON_SCHEDULE_GAP_DAYS) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// Returns a nudge message if it's been unusually long since the last
// session, or null if everything's on schedule (or there's no history yet).
export function getNudgeMessage(sessions, today = new Date()) {
  if (!sessions.length) return null

  const lastDate = new Date(sessions[0].session_date + 'T00:00:00')
  const daysSince = Math.round((today.setHours(0, 0, 0, 0) - lastDate.getTime()) / 86400000)

  if (daysSince > ON_SCHEDULE_GAP_DAYS) {
    return `It's been ${daysSince} days since your last workout.`
  }
  return null
}
