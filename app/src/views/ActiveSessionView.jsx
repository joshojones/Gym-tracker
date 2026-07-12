import { useState } from 'react'
import { supabase } from '../supabaseClient'
import ExerciseCard from '../components/ExerciseCard'
import ExercisePicker from '../components/ExercisePicker'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function ActiveSessionView({ session, sessionExercises, onExercisesAdded, onComplete, onAbandon }) {
  const [addingMore, setAddingMore] = useState(false)

  async function handleAddMore(selected) {
    const rows = selected.map((ex, i) => ({
      session_id: session.id,
      exercise_id: ex.id,
      order_index: sessionExercises.length + i,
      target_sets: ex.default_sets,
      target_reps: ex.default_reps,
    }))
    const { error } = await supabase.from('session_exercises').insert(rows)
    if (error) {
      alert(error.message)
      return
    }
    setAddingMore(false)
    onExercisesAdded()
  }

  if (addingMore) {
    return (
      <ExercisePicker
        dayType={session.day_type}
        excludeIds={sessionExercises.map((se) => se.exercise_id)}
        onConfirm={handleAddMore}
        onCancel={() => setAddingMore(false)}
      />
    )
  }

  return (
    <>
      <div className="mb-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={`badge badge-${session.day_type}`}>{capitalize(session.day_type)} Day</div>
        <button className="btn btn-secondary btn-sm" onClick={onAbandon}>Quit</button>
      </div>

      {sessionExercises.map((se) => (
        <ExerciseCard key={se.id} sessionExercise={se} />
      ))}

      <button className="btn btn-secondary w-full mb-12" onClick={() => setAddingMore(true)}>
        + Add Exercise
      </button>
      <button className="btn btn-success w-full" onClick={onComplete}>
        Complete Workout
      </button>
    </>
  )
}

export default ActiveSessionView
