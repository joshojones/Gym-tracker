import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const EQUIPMENT_FILTERS = ['all', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight']

function ExercisePicker({ dayType, excludeIds = [], onConfirm, onCancel }) {
  const [exercises, setExercises] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .eq('muscle_group', dayType)
        .order('name')
      setExercises(data ?? [])
    }
    load()
  }, [dayType])

  // Filtering to "bodyweight" here is the entire replacement for the old
  // app's separate "Travel Mode" — no special-case code needed.
  const visible = exercises
    .filter((ex) => !excludeIds.includes(ex.id))
    .filter((ex) => filter === 'all' || ex.equipment === filter)

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleConfirm() {
    onConfirm(exercises.filter((ex) => selectedIds.includes(ex.id)))
  }

  return (
    <>
      <div className="mb-12" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EQUIPMENT_FILTERS.map((eq) => (
          <button
            key={eq}
            className={`btn btn-sm ${filter === eq ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(eq)}
          >
            {eq === 'all' ? 'All' : eq}
          </button>
        ))}
      </div>
      <div className="card mb-12">
        {visible.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            No {dayType} exercises match this filter.
          </div>
        )}
        {visible.map((ex) => (
          <label className="day-overview-row" key={ex.id} style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(ex.id)}
              onChange={() => toggle(ex.id)}
              style={{ marginRight: 10 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ex.equipment}</div>
            </div>
          </label>
        ))}
      </div>
      <button
        className="btn btn-primary w-full mb-12"
        disabled={!selectedIds.length}
        onClick={handleConfirm}
      >
        Add {selectedIds.length || ''} Exercise{selectedIds.length === 1 ? '' : 's'}
      </button>
      {onCancel && (
        <button className="btn btn-secondary w-full" onClick={onCancel}>
          Cancel
        </button>
      )}
    </>
  )
}

export default ExercisePicker
