import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { score, formatSet } from '../lib/scoring'

function defaultRepsGuess(targetReps) {
  const n = parseInt(targetReps, 10)
  return Number.isNaN(n) ? 8 : n
}

function ExerciseCard({ sessionExercise }) {
  const ex = sessionExercise.exercise
  const [expanded, setExpanded] = useState(false)
  const [loggedSets, setLoggedSets] = useState([])
  const [previousSets, setPreviousSets] = useState([])
  const [weight, setWeight] = useState(ex.default_weight ?? 20)
  const [reps, setReps] = useState(defaultRepsGuess(sessionExercise.target_reps))
  const [duration, setDuration] = useState(ex.default_duration ?? 60)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLoggedSets()
    loadPreviousPerformance()
  }, [])

  async function loadLoggedSets() {
    const { data } = await supabase
      .from('sets')
      .select('*')
      .eq('session_exercise_id', sessionExercise.id)
      .order('set_number')
    setLoggedSets(data ?? [])
  }

  // Progressive overload: find the most recent COMPLETED session that
  // included this same exercise, and pull its logged sets, so we can show
  // "last time" on the card and default the weight input to what you used
  // then — bumping it up is a one-tap edit instead of retyping from scratch.
  async function loadPreviousPerformance() {
    const { data } = await supabase
      .from('session_exercises')
      .select('sets(*), sessions!inner(started_at, completed_at)')
      .eq('exercise_id', ex.id)
      .not('sessions.completed_at', 'is', null)
      .order('started_at', { foreignTable: 'sessions', ascending: false })
      .limit(1)

    const prevSets = data?.[0]?.sets ?? []
    setPreviousSets(prevSets)
    if (prevSets.length) {
      const last = prevSets[prevSets.length - 1]
      if (last.weight != null) setWeight(last.weight)
    }
  }

  const done = loggedSets.length >= sessionExercise.target_sets
  const bestPrevious = previousSets.length
    ? previousSets.reduce((best, s) => (score(s) > score(best) ? s : best), previousSets[0])
    : null

  async function handleLogSet() {
    setSaving(true)
    const setData = { session_exercise_id: sessionExercise.id, set_number: loggedSets.length + 1 }
    if (ex.kind === 'weighted') {
      setData.weight = Number(weight)
      setData.reps = Number(reps)
    } else if (ex.kind === 'bodyweight') {
      setData.reps = Number(reps)
    } else {
      setData.duration_seconds = Number(duration)
    }

    const { error } = await supabase.from('sets').insert(setData)
    setSaving(false)
    if (error) {
      alert('Could not log set: ' + error.message)
      return
    }
    await loadLoggedSets()
  }

  return (
    <div className={`exercise-card ${expanded ? 'expanded' : ''}`}>
      <div className="exercise-header" onClick={() => setExpanded((v) => !v)}>
        <div>
          <div className="exercise-name">{done ? '✓ ' : ''}{ex.name}</div>
          <div className="exercise-target">{sessionExercise.target_sets} sets × {sessionExercise.target_reps}</div>
          <div className="set-dots">
            {Array.from({ length: sessionExercise.target_sets }, (_, i) => (
              <div key={i} className={`set-dot ${i < loggedSets.length ? 'done' : ''}`} />
            ))}
          </div>
        </div>
        <div className="prev-best">{bestPrevious ? `Last: ${formatSet(bestPrevious)}` : 'No prev data'}</div>
      </div>

      {expanded && (
        <div className="exercise-body">
          {loggedSets.length > 0 && (
            <div className="sets-list">
              {loggedSets.map((s, i) => (
                <div className="set-row" key={s.id}>
                  <span className="set-num">Set {i + 1}</span>
                  <span className="set-val">{formatSet(s)}</span>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div style={{ textAlign: 'center', color: 'var(--success)', padding: '8px 0', fontWeight: 600 }}>
              ✓ All {sessionExercise.target_sets} sets done
            </div>
          ) : (
            <div className="log-form">
              {ex.kind === 'weighted' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input type="number" className="form-input" value={weight} step="2.5" onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reps</label>
                    <input type="number" className="form-input" value={reps} onChange={(e) => setReps(e.target.value)} />
                  </div>
                </>
              )}
              {ex.kind === 'bodyweight' && (
                <div className="form-group">
                  <label className="form-label">Reps</label>
                  <input type="number" className="form-input" value={reps} onChange={(e) => setReps(e.target.value)} />
                </div>
              )}
              {ex.kind === 'timed' && (
                <div className="form-group">
                  <label className="form-label">Duration (sec)</label>
                  <input type="number" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleLogSet}
                disabled={saving}
                style={{ alignSelf: 'flex-end', width: 'auto', flexShrink: 0 }}
              >
                +
              </button>
            </div>
          )}

          {ex.note && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
              💡 {ex.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExerciseCard
