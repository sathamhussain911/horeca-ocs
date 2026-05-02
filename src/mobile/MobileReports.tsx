import { Order, BreakLog, Team } from '../types'
import { productivity } from '../lib/utils'
import { BREAK_REASONS } from '../lib/constants'

const REASON_ICONS: Record<string, string> = {
  'Rest Room': '🚻', 'Prayer': '🕌', 'Food Break': '🍽',
  'Personal': '👤', 'Medical': '🏥', 'Emergency': '🚨',
}

interface Props {
  orders: Order[]
  breaks: BreakLog[]
  teams: Team[]
}

function teamColorClass(name: string) {
  const map: Record<string, string> = {
    'Team A': 'm-team-a', 'Team B': 'm-team-b',
    'Team C': 'm-team-c', 'Team D': 'm-team-d',
  }
  return map[name] || 'm-team-a'
}

export function MobileReports({ orders, breaks, teams }: Props) {
  const totalQty = orders.reduce((s, o) => s + o.qty_ordered, 0)
  const doneQty = orders.reduce((s, o) => s + o.qty_done, 0)
  const prod = productivity(doneQty, totalQty)
  const completedBreaks = breaks.filter((b) => b.check_in)
  const avgBreak = completedBreaks.length > 0
    ? Math.round(completedBreaks.reduce((s, b) => s + (b.duration_minutes || 0), 0) / completedBreaks.length)
    : 0

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
        Daily Summary
      </div>
      <div style={{ fontSize: 12, color: 'var(--m-text3)', marginBottom: 20 }}>{today}</div>

      {/* Overall stats */}
      <div className="m-hero" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="m-hero-value" style={{ fontSize: 40 }}>{prod}%</div>
            <div className="m-hero-label">Productivity</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="m-hero-value" style={{ fontSize: 40 }}>{orders.filter(o => o.status === 'Done').length}</div>
            <div className="m-hero-label">Orders Done</div>
          </div>
        </div>
        <div className="m-progress-bar" style={{ marginTop: 16, height: 8 }}>
          <div className="m-progress-fill" style={{ width: `${prod}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--m-text3)' }}>
          <span>{doneQty.toLocaleString()} packed</span>
          <span>{totalQty.toLocaleString()} ordered</span>
        </div>
      </div>

      {/* Team breakdown */}
      <div className="m-section-title">Team Performance</div>
      {teams.map((team) => {
        const to = orders.filter((o) => o.team_id === team.id)
        if (to.length === 0) return null
        const q = to.reduce((s, o) => s + o.qty_ordered, 0)
        const d = to.reduce((s, o) => s + o.qty_done, 0)
        const p = productivity(d, q)
        const done = to.filter((o) => o.status === 'Done').length
        const active = to.filter((o) => o.status === 'Active').length
        return (
          <div key={team.id} className="m-card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className={`m-team ${teamColorClass(team.name)}`}>{team.name}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--m-green)', fontWeight: 700, fontSize: 18 }}>{p}%</span>
            </div>
            <div className="m-progress-bar" style={{ height: 8, marginBottom: 10 }}>
              <div className="m-progress-fill" style={{ width: `${p}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--m-text2)' }}>
              <span>Orders: <b style={{ color: 'var(--m-text)' }}>{to.length}</b></span>
              <span>Done: <b style={{ color: 'var(--m-green)' }}>{done}</b></span>
              <span>Active: <b style={{ color: 'var(--m-amber)' }}>{active}</b></span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--m-text3)' }}>
              {d.toLocaleString()} / {q.toLocaleString()} units
            </div>
          </div>
        )
      })}

      {/* Break summary */}
      <div className="m-section-title" style={{ marginTop: 8 }}>Break Summary</div>
      <div className="m-metrics" style={{ marginBottom: 16 }}>
        <div className="m-metric">
          <div className="m-metric-val">{breaks.length}</div>
          <div className="m-metric-label">Total Breaks</div>
        </div>
        <div className="m-metric">
          <div className="m-metric-val amber">{avgBreak}<span style={{ fontSize: 16 }}>m</span></div>
          <div className="m-metric-label">Avg Duration</div>
        </div>
      </div>

      {BREAK_REASONS.map((r) => {
        const count = breaks.filter((b) => b.reason === r).length
        if (!count) return null
        const avgMin = breaks.filter(b => b.reason === r && b.duration_minutes).length > 0
          ? Math.round(breaks.filter(b => b.reason === r && b.duration_minutes).reduce((s, b) => s + (b.duration_minutes || 0), 0) / breaks.filter(b => b.reason === r && b.duration_minutes).length)
          : null

        return (
          <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--m-border)' }}>
            <span style={{ fontSize: 14, color: 'var(--m-text2)' }}>{REASON_ICONS[r]} {r}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14 }}>{count}×</span>
              {avgMin && <span style={{ fontSize: 11, color: 'var(--m-text3)', marginLeft: 8 }}>avg {avgMin}m</span>}
            </div>
          </div>
        )
      })}

      {breaks.length === 0 && (
        <div className="m-empty">
          <div className="m-empty-icon">📊</div>
          <div className="m-empty-text">No data yet today</div>
        </div>
      )}
    </div>
  )
}
