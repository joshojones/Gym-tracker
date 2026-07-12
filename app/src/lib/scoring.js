// A rough "how good was this set" number, so we can find someone's best set
// in a session even when weight/reps/duration aren't directly comparable.
export function score(set) {
  if (set.weight) return set.weight * (1 + (set.reps || 0) / 30)
  return set.reps || set.duration_seconds || 0
}

export function formatSet(set) {
  if (set.weight != null) return `${set.weight}kg × ${set.reps} reps`
  if (set.duration_seconds != null) return `${set.duration_seconds}s`
  return `${set.reps || 0} reps`
}
