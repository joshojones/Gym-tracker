// The fixed PPLPPLR cycle. Position 6 ("rest") is a day with no session.
export const ROTATION = ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest']

// Rotation only advances when you actually complete a session — resting for
// extra days doesn't skip you ahead, it just means "whenever you next train,
// pick up where you left off."
export function getNextRotationIndex(lastCompletedSession) {
  if (!lastCompletedSession) return 0
  return (lastCompletedSession.rotation_index + 1) % ROTATION.length
}

export function getDayType(rotationIndex) {
  return ROTATION[rotationIndex % ROTATION.length]
}
