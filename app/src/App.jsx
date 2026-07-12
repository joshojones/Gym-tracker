import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import BottomNav from './components/BottomNav'
import TodayView from './views/TodayView'
import HistoryView from './views/HistoryView'
import ProgressView from './views/ProgressView'
import SettingsView from './views/SettingsView'
import LoginView from './views/LoginView'

const VIEW_TITLES = {
  today: 'Today',
  history: 'History',
  progress: 'Progress',
  settings: 'Settings',
}

function App() {
  const [view, setView] = useState('today')
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check once on load whether a session is already stored from a previous visit.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    // Keep listening for login/logout events after that (e.g. when the login
    // form below succeeds). This returns a subscription we must clean up
    // when App unmounts, so we don't leak a duplicate listener.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (checkingSession) return null

  if (!session) return <LoginView />

  return (
    <>
      <div className="header">
        <h1>{VIEW_TITLES[view]}</h1>
      </div>
      <div className="content">
        {view === 'today' && <TodayView userId={session.user.id} />}
        {view === 'history' && <HistoryView />}
        {view === 'progress' && <ProgressView />}
        {view === 'settings' && <SettingsView userId={session.user.id} />}
      </div>
      <BottomNav view={view} onNavigate={setView} />
    </>
  )
}

export default App
