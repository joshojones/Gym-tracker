function StreakBadge({ streak }) {
  if (!streak) return null
  return (
    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
      🔥 {streak} session{streak === 1 ? '' : 's'} streak
    </div>
  )
}

export default StreakBadge
