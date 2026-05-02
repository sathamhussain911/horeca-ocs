import { useState } from 'react'
import { Team } from '../types'
import { BreakModal } from '../components/BreakModal'
import { LiveTimer } from '../components/LiveTimer'
import { useBreaks } from '../hooks/useBreaks'
import { BREAK_REASONS } from '../lib/constants'
import { formatTime, durationLabel, initials } from '../lib/utils'

interface Props {
  teams: Team[]
}

type Tab = 'active' | 'history' | 'summary'

function teamColorClass(teamName: string) {
  const map: Record<string, string> = { 'Team A': 'team-a', 'Team B': 'team-b', 'Team C': 'team-c', 'Team D': 'team-d' }
  return map[teamName] || 'team-a'
}

const REASON_ICONS: Record<string, string> = {
  'Rest Room': '🚻', 'Prayer': '🕌', 'Food Break': '🍽',
  'Personal': '👤', 'Medical': '🏥', 'Emergency': '🚨',
}

export function BreaksPage({ teams }: Props) {
  const { breaks, activeBreaks, completedBreaks, avgDuration, loading, checkOut, checkIn } = useBreaks()
  const [tab, setTab] = useState<Tab>('active')
  const [showModal, setShowModal] = useState(false)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  const handleCheckIn = async (id: string) => {
    setCheckingIn(id)
    await checkIn(id)
    setCheckingIn(null)
  }

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>
  }

  const reasonCounts = BREAK_REASONS.reduce((acc, r) => {
    acc[r] = breaks.filter((b) => b.reason === r).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      {activeBreaks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'spin 2s linear infinite' }} />
            Currently Out ({activeBreaks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeBreaks.map((b) => (
              <div key={b.id} className="break-card">
                <div className="avatar" style={{ background: '#3D1A1A', color: 'var(--red)', fontSize: 12 }}>
                  {initials(b.employee_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    {b.employee_name}
                    {b.employee_ref && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>{b.employee_ref}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`team-pill ${teamColorClass(b.team_name)}`} style={{ fontSize: 10 }}>{b.team_name || '—'}</span>
                    <span>{REASON_ICONS[b.reason]} {b.reason}</span>
                    <span>· Out since {formatTime(b.check_out)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <LiveTimer checkOut={b.check_out} />
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCheckIn(b.id)}
                      disabled={checkingIn === b.id}
                    >
                      {checkingIn === b.id ? '...' : '↩ Check In'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Currently Out</div>
          <div className={`metric-value ${activeBreaks.length > 0 ? 'red' : 'green'}`}>{activeBreaks.length}</div>
          <div className="metric-sub">Employees</div>
        </div>
        <div className="metric">
          <div className="metric-label">Returned</div>
          <div className="metric-value green">{completedBreaks.length}</div>
          <div className="metric-sub">Today</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Breaks</div>
          <div className="metric-value">{breaks.length}</div>
          <div className="metric-sub">Today</div>
        </div>
        <div className="metric">
          <div className="metric-label">Avg Duration</div>
          <div className="metric-value amber">{avgDuration}<span style={{ fontSize: 16 }}>m</span></div>
          <div className="metric-sub">Per break</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>Break Log</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Track employee breaks in real time</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Check Out Employee</button>
        </div>

        <div className="tab-bar">
          {(['active', 'history', 'summary'] as Tab[]).map((t) => (
            <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</div>
          ))}
        </div>

        {tab === 'active' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Team</th><th>Reason</th><th>Check Out</th><th>Duration</th><th>Action</th></tr></thead>
              <tbody>
                {activeBreaks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b style={{ color: 'var(--text)' }}>{b.employee_name}</b>
                      {b.employee_ref && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.employee_ref}</div>}
                    </td>
                    <td>{b.team_name ? <span className={`team-pill ${teamColorClass(b.team_name)}`}>{b.team_name}</span> : '—'}</td>
                    <td>{REASON_ICONS[b.reason]} {b.reason}</td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{formatTime(b.check_out)}</span></td>
                    <td><LiveTimer checkOut={b.check_out} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleCheckIn(b.id)} disabled={checkingIn === b.id}>
                        ↩ Check In
                      </button>
                    </td>
                  </tr>
                ))}
                {activeBreaks.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state">✓ All employees are at their stations</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Team</th><th>Reason</th><th>Out</th><th>In</th><th>Duration</th><th>Status</th></tr></thead>
              <tbody>
                {breaks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b style={{ color: 'var(--text)' }}>{b.employee_name}</b>
                      {b.employee_ref && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.employee_ref}</div>}
                    </td>
                    <td>{b.team_name ? <span className={`team-pill ${teamColorClass(b.team_name)}`}>{b.team_name}</span> : '—'}</td>
                    <td>{REASON_ICONS[b.reason]} {b.reason}</td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{formatTime(b.check_out)}</span></td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{b.check_in ? formatTime(b.check_in) : <LiveTimer checkOut={b.check_out} />}</span></td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{durationLabel(b.duration_minutes)}</span></td>
                    <td><span className={`status-pill ${b.check_in ? 's-done' : 's-break'}`}>{b.check_in ? 'Returned' : 'Out'}</span></td>
                  </tr>
                ))}
                {breaks.length === 0 && (
                  <tr><td colSpan={7}><div className="empty-state">No breaks logged today</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'summary' && (
          <div className="grid-2" style={{ marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text2)' }}>By Reason</div>
              {BREAK_REASONS.filter((r) => reasonCounts[r] > 0).map((r) => (
                <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{REASON_ICONS[r]} {r}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 100, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(reasonCounts[r] / breaks.length) * 100}%`, height: '100%', background: 'var(--green3)', borderRadius: 3 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 12, minWidth: 20 }}>{reasonCounts[r]}</span>
                  </div>
                </div>
              ))}
              {BREAK_REASONS.every((r) => !reasonCounts[r]) && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No breaks yet</div>}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text2)' }}>By Team</div>
              {teams.map((t) => {
                const count = breaks.filter((b) => b.team_id === t.id).length
                return count > 0 ? (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className={`team-pill ${teamColorClass(t.name)}`}>{t.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 100, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(count / breaks.length) * 100}%`, height: '100%', background: 'var(--green3)', borderRadius: 3 }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12, minWidth: 20 }}>{count}</span>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && <BreakModal teams={teams} onClose={() => setShowModal(false)} onSubmit={checkOut} />}
    </>
  )
}
