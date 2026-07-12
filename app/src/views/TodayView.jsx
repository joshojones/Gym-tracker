import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ExercisePicker from '../components/ExercisePicker'
import ActiveSessionView from './ActiveSessionView'
import StreakBadge from '../components/StreakBadge'
import { getNextRotationIndex, getDayType } from '../lib/rotation'
import { computeStreak, getNudgeMessage } from '../lib/streak'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function TodayView({ userId }) {
  const [phase, setPhase] = useState('loading') // loading | idle | picking | active
  const [session, setSession] = useState(null)
  const [sessionExercises, setSessionExercises] = useState([])
  const [rotationIndex, setRotationIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [nudge, setNudge] = useState(null)

  useEffect(() => {
    checkForActiveSession()
  }, [])

  async function checkForActiveSession() {
    const { data: active } = await supabase
      .from('sessions')
      .select('*')
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)

    if (active && active.length) {
      setSession(active[0])
      const exercises = await loadSessionExercises(active[0].id)
      // If the app closed before any exercises were picked, resume the
      // picker instead of showing an empty active session.
      setPhase(exercises.length ? 'active' : 'picking')
      return
    }

    // No workout in progress — figure out where we are in the PPLPPLR cycle,
    // and how consistent recent training has been.
    const { data: completed } = await supabase
      .from('sessions')
      .select('rotation_index, session_date')
      .not('completed_at', 'is', null)
      .order('session_date', { ascending: false })
      .order('started_at', { ascending: false })

    const sessions = completed ?? []
    setRotationIndex(getNextRotationIndex(sessions[0] ?? null))
    setStreak(computeStreak(sessions))
    setNudge(getNudgeMessage(sessions))
    setPhase('idle')
  }

  async function loadSessionExercises(sessionId) {
    const { data } = await supabase
      .from('session_exercises')
      .select('*, exercise:exercises(*)')
      .eq('session_id', sessionId)
      .order('order_index')
    setSessionExercises(data ?? [])
    return data ?? []
  }

  async function handleStartWorkout(dayType, effectiveRotationIndex) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: userId, day_type: dayType, rotation_index: effectiveRotationIndex })
      .select()
      .single()
    if (error) {
      alert(error.message)
      return
    }
    setSession(data)
    setSessionExercises([])
    setPhase('picking')
  }

  async function handlePickerConfirm(selected) {
    const rows = selected.map((ex, i) => ({
      session_id: session.id,
      exercise_id: ex.id,
      order_index: i,
      target_sets: ex.default_sets,
      target_reps: ex.default_reps,
    }))
    const { error } = await supabase.from('session_exercises').insert(rows)
    if (error) {
      alert(error.message)
      return
    }
    await loadSessionExercises(session.id)
    setPhase('active')
  }

  async function handleAbandon() {
    if (!confirm('Abandon this workout? Progress will be lost.')) return
    await supabase.from('sessions').delete().eq('id', session.id)
    setSession(null)
    setSessionExercises([])
    setPhase('idle')
  }

  async function handleComplete() {
    const durationMinutes = Math.round((Date.now() - new Date(session.started_at).getTime()) / 60000)
    const { error } = await supabase
      .from('sessions')
      .update({ completed_at: new Date().toISOString(), duration_minutes: durationMinutes })
      .eq('id', session.id)
    if (error) {
      alert(error.message)
      return
    }
    setSession(null)
    setSessionExercises([])
    setPhase('idle')
  }

  if (phase === 'loading') return null

  if (phase === 'picking') {
    return <ExercisePicker dayType={session.day_type} onConfirm={handlePickerConfirm} />
  }

  if (phase === 'active') {
    return (
      <ActiveSessionView
        session={session}
        sessionExercises={sessionExercises}
        onExercisesAdded={() => loadSessionExercises(session.id)}
        onComplete={handleComplete}
        onAbandon={handleAbandon}
      />
    )
  }

  const suggestedDayType = getDayType(rotationIndex)

  return (
    <>
      <StreakBadge streak={streak} />
      {nudge && <div className="card mb-12" style={{ color: 'var(--danger)', fontSize: 14 }}>{nudge}</div>}
      <div className="mb-12">
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Choose today's session</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {suggestedDayType === 'rest'
            ? 'Rest day suggested — train anyway if you want to.'
            : `Suggested: ${capitalize(suggestedDayType)} Day`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['push', 'pull', 'legs'].map((t) => (
          <button
            key={t}
            className={`btn ${t === suggestedDayType ? 'btn-primary' : 'btn-secondary'} w-full`}
            onClick={() => handleStartWorkout(t, rotationIndex)}
          >
            {capitalize(t)} Day{t === suggestedDayType ? ' (suggested)' : ''}
          </button>
        ))}
      </div>
    </>
  )
}

export default TodayView
