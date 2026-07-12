const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'history', label: 'History' },
  { key: 'progress', label: 'Progress' },
  { key: 'settings', label: 'Settings' },
]

function BottomNav({ view, onNavigate }) {
  return (
    <div className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`nav-btn ${view === tab.key ? 'active' : ''}`}
          onClick={() => onNavigate(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default BottomNav
