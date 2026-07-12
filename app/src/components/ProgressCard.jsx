import { score, formatSet } from '../lib/scoring'

function miniChartPoints(points) {
  const vals = points.map(score)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 300
  const H = 60
  return vals.map((v, i) => {
    const x = vals.length > 1 ? (i / (vals.length - 1)) * W : W / 2
    const y = H - ((v - min) / range) * (H - 12) - 6
    return { x, y }
  })
}

function ProgressCard({ name, points }) {
  const first = points[0]
  const best = points.reduce((b, p) => (score(p) > score(b) ? p : b), points[0])
  const chartPoints = miniChartPoints(points)
  const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="card">
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
        {points.length} session{points.length > 1 ? 's' : ''} logged
      </div>
      {points.length > 1 && (
        <svg viewBox="0 0 300 60" className="chart-svg">
          <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
          {chartPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent)" />
          ))}
        </svg>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>First</div>
          <div style={{ fontSize: 14 }}>{formatSet(first)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Best</div>
          <div style={{ fontSize: 14, color: 'var(--success)' }}>{formatSet(best)}</div>
        </div>
      </div>
    </div>
  )
}

export default ProgressCard
