import { useState } from 'react'
import { supabase } from '../supabaseClient'

function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="content" style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>Gym Tracker</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
        Log in to continue
      </div>
      <form className="card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="form-label">Email</label>
          <input
            type="email" className="form-input" style={{ textAlign: 'left' }}
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Password</label>
          <input
            type="password" className="form-input" style={{ textAlign: 'left' }}
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  )
}

export default LoginView
