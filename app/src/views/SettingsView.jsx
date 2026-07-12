import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const MUSCLE_GROUPS = ['push', 'pull', 'legs']
const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight']
const KINDS = ['weighted', 'bodyweight', 'timed']

const EMPTY_FORM = {
  name: '',
  muscle_group: 'push',
  equipment: 'barbell',
  kind: 'weighted',
  default_sets: 3,
  default_reps: '10',
  default_weight: 20,
  default_duration: 60,
  note: '',
}

function SettingsView({ userId }) {
  const [exercises, setExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadExercises()
  }, [])

  async function loadExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name')
    if (error) console.error(error)
    setExercises(data ?? [])
  }

  // Updates one field in the form state, leaving the rest untouched —
  // the standard React pattern for a "controlled" input, where the input's
  // value always comes from state rather than being read from the DOM later.
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAddExercise(e) {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      equipment: form.equipment,
      kind: form.kind,
      default_sets: Number(form.default_sets) || 3,
      default_reps: form.default_reps.trim() || '10',
      default_weight: form.kind === 'weighted' ? Number(form.default_weight) || 0 : null,
      default_duration: form.kind === 'timed' ? Number(form.default_duration) || 60 : null,
      note: form.note.trim() || null,
    }

    const { error } = await supabase.from('exercises').insert(payload)
    setSaving(false)
    if (error) {
      console.error(error)
      alert('Could not save exercise: ' + error.message)
      return
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
    loadExercises()
  }

  async function handleDelete(ex) {
    if (!confirm(`Remove "${ex.name}" from your library?`)) return
    const { error } = await supabase.from('exercises').delete().eq('id', ex.id)
    if (error) {
      console.error(error)
      alert('Could not delete: ' + error.message)
      return
    }
    loadExercises()
  }

  return (
    <>
      <div className="card mb-12">
        <div className="section-label" style={{ marginTop: 0 }}>Exercise Library</div>
        {exercises.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No exercises yet.</div>
        )}
        {exercises.map((ex) => (
          <div className="edit-ex-row" key={ex.id}>
            <div className="edit-ex-info">
              <div className="edit-ex-name">{ex.name}</div>
              <div className="edit-ex-meta">
                {ex.muscle_group} &middot; {ex.equipment} &middot; {ex.default_sets}&times;{ex.default_reps}
                {ex.default_weight ? ` · ${ex.default_weight}kg` : ''}
              </div>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(ex)}>&times;</button>
          </div>
        ))}
      </div>

      {!showForm && (
        <button className="btn btn-secondary w-full" onClick={() => setShowForm(true)}>
          + Add Exercise
        </button>
      )}

      {showForm && (
        <form className="card" onSubmit={handleAddExercise}>
          <div className="section-label" style={{ marginTop: 0 }}>New Exercise</div>

          <div style={{ marginBottom: 8 }}>
            <label className="form-label">Name</label>
            <input
              className="form-input"
              style={{ textAlign: 'left' }}
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Dumbbell Curl"
            />
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Muscle Group</label>
              <select
                className="form-select"
                value={form.muscle_group}
                onChange={(e) => updateField('muscle_group', e.target.value)}
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>{mg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Equipment</label>
              <select
                className="form-select"
                value={form.equipment}
                onChange={(e) => updateField('equipment', e.target.value)}
              >
                {EQUIPMENT_TYPES.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.kind} onChange={(e) => updateField('kind', e.target.value)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Sets</label>
              <input
                type="number" className="form-input" min="1"
                value={form.default_sets}
                onChange={(e) => updateField('default_sets', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Reps</label>
              <input
                className="form-input"
                value={form.default_reps}
                onChange={(e) => updateField('default_reps', e.target.value)}
                placeholder="10 or max or 60s"
              />
            </div>
          </div>

          {form.kind === 'weighted' && (
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Default Weight (kg)</label>
              <input
                type="number" className="form-input" min="0"
                value={form.default_weight}
                onChange={(e) => updateField('default_weight', e.target.value)}
              />
            </div>
          )}

          {form.kind === 'timed' && (
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Default Duration (sec)</label>
              <input
                type="number" className="form-input" min="1"
                value={form.default_duration}
                onChange={(e) => updateField('default_duration', e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <button className="btn btn-secondary w-full mb-12" onClick={() => supabase.auth.signOut()} style={{ marginTop: 16 }}>
        Log Out
      </button>
    </>
  )
}

export default SettingsView
