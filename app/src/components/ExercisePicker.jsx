import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const MUSCLE_GROUP_FILTERS = ['all', 'push', 'pull', 'legs']
const EQUIPMENT_FILTERS = ['all', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight']

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// `dayType` is only used as the starting suggestion — the muscle group
// filter defaults to it, but tapping "All" or another group lifts the
// restriction so a session isn't locked to a single muscle group (e.g. a
// full-body split mixing bench press and leg press in one session).
function ExercisePicker({ dayType, excludeIds = [], onConfirm, onCancel }) {
  const [exercises, setExercises] = useState([])
  const [muscleFilter, setMuscleFilter] = useState(dayType && dayType !== 'rest' ? dayType : 'all')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('exercises').select('*').order('muscle_group').order('name')
      setExercises(data ?? [])
    }
    load()
  }, [])

  // Filtering equipment to "bodyweight" here is the entire replacement for
  // the old app's separate "Travel Mode" — no special-case code needed.
  const visible = exercises
    .filter((ex) => !excludeIds.includes(ex.id))
    .filter((ex) => muscleFilter === 'all' || ex.muscle_group === muscleFilter)
    .filter((ex) => equipmentFilter === 'all' || ex.equipment === equipmentFilter)

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleConfirm() {
    onConfirm(exercises.filter((ex) => selectedIds.includes(ex.id)))
  }

  return (
    <>
      <div className="mb-12" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MUSCLE_GROUP_FILTERS.map((mg) => (
          <button
            key={mg}
            className={`btn btn-sm ${muscleFilter === mg ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMuscleFilter(mg)}
          >
            {mg === 'all' ? 'All Muscles' : capitalize(mg)}
          </button>
        ))}
      </div>
      <div className="mb-12" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EQUIPMENT_FILTERS.map((eq) => (
          <button
            key={eq}
            className={`btn btn-sm ${equipmentFilter === eq ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setEquipmentFilter(eq)}
          >
            {eq === 'all' ? 'All Equipment' : eq}
          </button>
        ))}
      </div>
      <div className="card mb-12">
        {visible.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No exercises match this filter.</div>
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <span className={`badge badge-${ex.muscle_group}`} style={{ marginRight: 6, fontSize: 10, padding: '1px 6px' }}>
                  {capitalize(ex.muscle_group)}
                </span>
                {ex.equipment}
              </div>
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
