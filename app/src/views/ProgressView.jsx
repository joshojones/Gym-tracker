import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { score } from '../lib/scoring'
import ProgressCard from '../components/ProgressCard'

function ProgressView() {
  const [exerciseStats, setExerciseStats] = useState(null) // null = loading

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    const { data } = await supabase
      .from('sessions')
      .select('session_date, session_exercises(exercise:exercises(name), sets(*))')
      .not('completed_at', 'is', null)
      .order('session_date')

    // Group every logged set by exercise name, in chronological order, so
    // each exercise ends up with a "first" and "best" point to compare.
    const byExercise = {}
    for (const sess of data ?? []) {
      for (const se of sess.session_exercises) {
        if (!se.sets.length) continue
        const name = se.exercise.name
        const best = se.sets.reduce((b, s) => (score(s) > score(b) ? s : b), se.sets[0])
        if (!byExercise[name]) byExercise[name] = []
        byExercise[name].push({ date: sess.session_date, ...best })
      }
    }

    setExerciseStats(Object.entries(byExercise).map(([name, points]) => ({ name, points })))
  }

  if (exerciseStats === null) return null

  if (!exerciseStats.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📈</div>
        <div className="empty-title">No data yet</div>
        Log workouts to track your progress
      </div>
    )
  }

  return (
    <>
      {exerciseStats.map(({ name, points }) => (
        <ProgressCard key={name} name={name} points={points} />
      ))}
    </>
  )
}

export default ProgressView
