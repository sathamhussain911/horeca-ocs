import { useOrders } from '../hooks/useOrders'
import { useBreaks } from '../hooks/useBreaks'
import { Team } from '../types'
import { ProgressBar } from '../components/ProgressBar'
import { BREAK_REASONS } from '../lib/constants'
import { formatTime, productivity, durationLabel } from '../lib/utils'
import { STATUS_COLORS } from '../lib/constants'

interface Props { teams: Team[] }

function teamColorClass(name: string) {
  const map: Record<string, string> = { 'Team A': 'team-a', 'Team B': 'team-b', 'Team C': 'team-c', 'Team D': 'team-d' }
  return map[name] || 'team-a'
}

export function ReportsPage({ teams }: Props) {
  const { orders, loading: oLoad } = useOrders()
  const { breaks, loading: bLoad } = useBreaks()

  if (oLoad || bLoad) return <div className="loading-center"><div className="spinner" /></div>

  const totalQty = orders.reduce((s, o) => s + o.qty_ordered, 0)
  const doneQty = orders.reduce((s, o) => s + o.qty_done, 0)
  const prod = productivity(doneQty, totalQty)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20 }}>Daily Summary Report</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>↓ Export</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Overall Productivity</div>
          <div className="metric-value green">{prod}%</div>
          <ProgressBar value={prod} />
        </div>
        <div className="metric">
          <div className="metric-label">Units Packed</div>
          <div className="metric-value">{doneQty.toLocaleString()}</div>
          <div className="metric-sub">of {totalQty.toLocaleString()} ordered</div>
        </div>
        <div className="metric">
          <div className="metric-label">Orders Done</div>
          <div className="metric-value green">{orders.filter(o => o.status === 'Done').length}</div>
          <div className="metric-sub">of {orders.length} total</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Breaks</div>
          <div className="metric-value amber">{breaks.length}</div>
          <div className="metric-sub">Today</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Team Productivity</div>
          {teams.map((team) => {
            const to = orders.filter((o) => o.team_id === team.id)
            const q = to.reduce((s, o) => s + o.qty_ordered, 0)
            const d = to.reduce((s, o) => s + o.qty_done, 0)
            const p = productivity(d, q)
            return to.length > 0 ? (
              <div key={team.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className={`team-pill ${teamColorClass(team.name)}`}>{team.name}</span>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                    <span>{to.length} orders</span>
                    <span className="mono" style={{ color: 'var(--green)' }}>{p}%</span>
                  </div>
                </div>
                <ProgressBar value={p} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{d}/{q} units</div>
              </div>
            ) : null
          })}
          {teams.every((t) => !orders.find((o) => o.team_id === t.id)) && (
            <div className="empty-state">No team assignments yet</div>
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Break Summary</div>
          {BREAK_REASONS.map((r) => {
            const c = breaks.filter((b) => b.reason === r).length
            const avg = breaks.filter((b) => b.reason === r && b.duration_minutes).length > 0
              ? Math.round(breaks.filter((b) => b.reason === r && b.duration_minutes).reduce((s, b) => s + (b.duration_minutes || 0), 0) / breaks.filter((b) => b.reason === r && b.duration_minutes).length)
              : null
            return c > 0 ? (
              <div key={r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--text2)', alignItems: 'center' }}>
                <span>{r}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {avg && <span style={{ fontSize: 11, color: 'var(--text3)' }}>avg {avg}m</span>}
                  <span className="mono" style={{ fontSize: 12 }}>{c}x</span>
                </div>
              </div>
            ) : null
          })}
          {breaks.length === 0 && <div className="empty-state">No breaks logged</div>}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Order Details</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th><th>Customer</th><th>Team</th>
                <th>Qty</th><th>Done</th><th>%</th>
                <th>Start</th><th>End</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const p = productivity(o.qty_done, o.qty_ordered)
                return (
                  <tr key={o.id}>
                    <td><span className="mono" style={{ fontSize: 11, color: 'var(--green)' }}>{o.order_ref}</span></td>
                    <td style={{ color: 'var(--text)' }}>{o.customer}</td>
                    <td>{o.teams ? <span className={`team-pill ${teamColorClass(o.teams.name)}`}>{o.teams.name}</span> : '—'}</td>
                    <td><span className="mono">{o.qty_ordered}</span></td>
                    <td><span className="mono">{o.qty_done}</span></td>
                    <td><span className="mono" style={{ color: p === 100 ? 'var(--green)' : p > 50 ? 'var(--amber)' : 'var(--text3)', fontWeight: 600 }}>{p}%</span></td>
                    <td><span className="mono" style={{ fontSize: 11 }}>{formatTime(o.start_time)}</span></td>
                    <td><span className="mono" style={{ fontSize: 11 }}>{formatTime(o.end_time)}</span></td>
                    <td><span className={`status-pill ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                  </tr>
                )
              })}
              {orders.length === 0 && <tr><td colSpan={9}><div className="empty-state">No orders today</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
