import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatSet } from '../lib/scoring'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.round((new Date().setHours(0, 0, 0, 0) - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: diffDays > 300 ? 'numeric' : undefined })
}

function HistoryView() {
  const [sessions, setSessions] = useState(null) // null = loading
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    const { data } = await supabase
      .from('sessions')
      .select('*, session_exercises(*, exercise:exercises(name), sets(*))')
      .not('completed_at', 'is', null)
      .order('session_date', { ascending: false })
      .order('started_at', { ascending: false })
    setSessions(data ?? [])
  }

  if (sessions === null) return null

  if (!sessions.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-title">No workouts yet</div>
        Complete your first workout to see history here
      </div>
    )
  }

  if (selected) {
    return (
      <>
        <button className="btn btn-secondary btn-sm mb-12" onClick={() => setSelected(null)}>
          ← Back
        </button>
        <div className="mb-12">
          <div className={`badge badge-${selected.day_type}`}>{capitalize(selected.day_type)} Day</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {fmtDate(selected.session_date)} · {selected.duration_minutes ?? '?'} min
          </div>
        </div>
        {selected.session_exercises
          .filter((se) => se.sets.length)
          .map((se) => (
            <div className="card" key={se.id}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{se.exercise.name}</div>
              {se.sets.map((s, i) => (
                <div className="set-row" key={s.id}>
                  <span className="set-num">Set {i + 1}</span>
                  <span>{formatSet(s)}</span>
                </div>
              ))}
            </div>
          ))}
      </>
    )
  }

  return (
    <>
      {sessions.map((s) => {
        const totalSets = s.session_exercises.reduce((a, se) => a + se.sets.length, 0)
        return (
          <div className="history-item" key={s.id} onClick={() => setSelected(s)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{fmtDate(s.session_date)}</div>
                <span className={`badge badge-${s.day_type}`} style={{ fontSize: 11 }}>{capitalize(s.day_type)}</span>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {totalSets} sets · {s.duration_minutes ?? '?'} min
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default HistoryView
