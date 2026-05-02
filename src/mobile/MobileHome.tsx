import { Order, BreakLog, Team } from '../types'
import { productivity } from '../lib/utils'

interface Props {
  orders: Order[]
  activeBreaks: BreakLog[]
  teams: Team[]
  onGoToOrders: () => void
  onGoToBreak: () => void
}

function teamColorClass(name: string) {
  const map: Record<string, string> = {
    'Team A': 'm-team-a', 'Team B': 'm-team-b',
    'Team C': 'm-team-c', 'Team D': 'm-team-d',
  }
  return map[name] || 'm-team-a'
}

export function MobileHome({ orders, activeBreaks, teams, onGoToOrders, onGoToBreak }: Props) {
  const active = orders.filter((o) => o.status === 'Active')
  const done = orders.filter((o) => o.status === 'Done')
  const totalQty = orders.reduce((s, o) => s + o.qty_ordered, 0)
  const doneQty = orders.reduce((s, o) => s + o.qty_done, 0)
  const prod = productivity(doneQty, totalQty)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div>
      {/* Hero productivity */}
      <div className="m-hero">
        <div style={{ fontSize: 11, color: 'var(--m-text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          {today}
        </div>
        <div className="m-hero-value">{prod}%</div>
        <div className="m-hero-label">Overall Productivity</div>

        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${prod}%`, height: '100%', background: 'var(--m-green3)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--m-text3)' }}>
          <span>{doneQty.toLocaleString()} packed</span>
          <span>{totalQty.toLocaleString()} total</span>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="m-metrics">
        <div className="m-metric">
          <div className="m-metric-val amber">{active.length}</div>
          <div className="m-metric-label">Active Orders</div>
        </div>
        <div className="m-metric">
          <div className="m-metric-val green">{done.length}</div>
          <div className="m-metric-label">Completed</div>
        </div>
        <div className="m-metric">
          <div className={`m-metric-val ${activeBreaks.length > 0 ? 'red' : 'green'}`}>{activeBreaks.length}</div>
          <div className="m-metric-label">Staff Out</div>
        </div>
        <div className="m-metric">
          <div className="m-metric-val">{orders.filter(o => o.status === 'Pending').length}</div>
          <div className="m-metric-label">Pending</div>
        </div>
      </div>

      {/* Active breaks alert */}
      {activeBreaks.length > 0 && (
        <div
          className="m-card"
          style={{ borderColor: '#5C2A2A', background: '#1A0A0A', marginBottom: 12, cursor: 'pointer' }}
          onClick={onGoToBreak}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="m-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--m-red)', display: 'inline-block', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--m-red)' }}>{activeBreaks.length} employee{activeBreaks.length > 1 ? 's' : ''} currently out</div>
              <div style={{ fontSize: 12, color: '#E88080', marginTop: 2 }}>
                {activeBreaks.map(b => b.employee_name).join(', ')}
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--m-text3)', fontSize: 18 }}>›</span>
          </div>
        </div>
      )}

      {/* Team summary */}
      <div className="m-section-title">Team Status</div>
      {teams.map((team) => {
        const to = orders.filter((o) => o.team_id === team.id)
        const q = to.reduce((s, o) => s + o.qty_ordered, 0)
        const d = to.reduce((s, o) => s + o.qty_done, 0)
        const p = productivity(d, q)
        if (to.length === 0) return null
        return (
          <div key={team.id} className="m-card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className={`m-team ${teamColorClass(team.name)}`}>{team.name}</span>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--m-text2)' }}>
                <span>{to.length} orders</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--m-green)', fontWeight: 700 }}>{p}%</span>
              </div>
            </div>
            <div className="m-progress-bar" style={{ height: 6, marginBottom: 6 }}>
              <div className="m-progress-fill" style={{ width: `${p}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--m-text3)' }}>{d} / {q} units packed</div>
          </div>
        )
      })}

      {/* Quick actions */}
      <div className="m-section-title" style={{ marginTop: 8 }}>Quick Actions</div>
      <button className="m-btn m-btn-primary" style={{ marginBottom: 10 }} onClick={onGoToOrders}>
        📦 View My Orders
      </button>
      <button className="m-btn m-btn-danger" onClick={onGoToBreak}>
        ⏸ Take a Break
      </button>
    </div>
  )
}
