import { useState } from 'react'
import { Team, BreakLog, BreakFormData } from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { MobileBreakTimer } from '../components/MobileBreakTimer'
import { BREAK_REASONS } from '../lib/constants'
import { formatTime, durationLabel } from '../lib/utils'

interface Props {
  teams: Team[]
  breaks: BreakLog[]
  activeBreaks: BreakLog[]
  onCheckOut: (data: BreakFormData) => Promise<boolean>
  onCheckIn: (id: string) => Promise<boolean>
}

const REASON_ICONS: Record<string, string> = {
  'Rest Room': '🚻', 'Prayer': '🕌', 'Food Break': '🍽',
  'Personal': '👤', 'Medical': '🏥', 'Emergency': '🚨',
}

function teamColorClass(name: string) {
  const map: Record<string, string> = {
    'Team A': 'm-team-a', 'Team B': 'm-team-b',
    'Team C': 'm-team-c', 'Team D': 'm-team-d',
  }
  return map[name] || 'm-team-a'
}

export function MobileBreaks({ teams, breaks, activeBreaks, onCheckOut, onCheckIn }: Props) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkingInId, setCheckingInId] = useState<string | null>(null)

  // Checkout form state
  const [empName, setEmpName] = useState('')
  const [empId, setEmpId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [reason, setReason] = useState<import('../types').BreakReason | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const handleCheckout = async () => {
    if (!empName || !reason) return
    setSubmitting(true)
    const ok = await onCheckOut({
      employee_name: empName,
      employee_ref: empId,
      team_id: teamId,
      reason: reason as import('../types').BreakReason,
      notes: '',
    })
    setSubmitting(false)
    if (ok) {
      setShowCheckout(false)
      setEmpName('')
      setEmpId('')
      setTeamId('')
      setReason('')
    }
  }

  const handleCheckIn = async (id: string) => {
    setCheckingInId(id)
    await onCheckIn(id)
    setCheckingInId(null)
  }

  const todayHistory = breaks.filter((b) => b.check_in)
  const avgDur = todayHistory.length > 0
    ? Math.round(todayHistory.reduce((s, b) => s + (b.duration_minutes || 0), 0) / todayHistory.length)
    : 0

  return (
    <div>
      {/* Currently out */}
      {activeBreaks.length > 0 && (
        <>
          <div className="m-section-title" style={{ color: 'var(--m-red)' }}>
            <span className="m-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--m-red)', display: 'inline-block', marginRight: 8 }} />
            Currently Out ({activeBreaks.length})
          </div>

          {activeBreaks.map((b) => (
            <div key={b.id} className="m-card" style={{ borderColor: '#5C2A2A', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{b.employee_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--m-text3)', marginTop: 2 }}>
                    {b.employee_ref && <span>{b.employee_ref} · </span>}
                    {b.team_name && <span className={`m-team ${teamColorClass(b.team_name)}`}>{b.team_name}</span>}
                  </div>
                </div>
                <MobileBreakTimer checkOut={b.check_out} className="m-break-timer" style={{ fontSize: 28 }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{REASON_ICONS[b.reason]}</span>
                <span style={{ fontSize: 14, color: 'var(--m-text2)' }}>{b.reason}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--m-text3)' }}>Out {formatTime(b.check_out)}</span>
              </div>

              <button
                className="m-btn m-btn-primary m-btn-lg"
                onClick={() => handleCheckIn(b.id)}
                disabled={checkingInId === b.id}
              >
                {checkingInId === b.id ? 'Recording...' : '↩ Check Back In'}
              </button>
            </div>
          ))}
        </>
      )}

      {/* Metrics */}
      <div className="m-metrics" style={{ marginTop: activeBreaks.length > 0 ? 16 : 0 }}>
        <div className="m-metric">
          <div className="m-metric-val">{breaks.length}</div>
          <div className="m-metric-label">Total Today</div>
        </div>
        <div className="m-metric">
          <div className="m-metric-val amber">{avgDur}<span style={{ fontSize: 16 }}>m</span></div>
          <div className="m-metric-label">Avg Duration</div>
        </div>
      </div>

      {/* New checkout button */}
      <button className="m-btn m-btn-danger m-btn-lg" style={{ marginBottom: 20 }} onClick={() => setShowCheckout(true)}>
        ⏸ Employee Check-Out
      </button>

      {/* Today's history */}
      {todayHistory.length > 0 && (
        <>
          <div className="m-section-title">Today's History</div>
          {todayHistory.map((b) => (
            <div key={b.id} className="m-card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{b.employee_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--m-text3)', marginTop: 2 }}>
                    {REASON_ICONS[b.reason]} {b.reason}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: 'var(--m-green)' }}>
                    {durationLabel(b.duration_minutes)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--m-text3)', marginTop: 2 }}>
                    {formatTime(b.check_out)} → {formatTime(b.check_in)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {breaks.length === 0 && (
        <div className="m-empty">
          <div className="m-empty-icon">✅</div>
          <div className="m-empty-text">No breaks logged today</div>
        </div>
      )}

      {/* Checkout sheet */}
      {showCheckout && (
        <BottomSheet title="Employee Check-Out" onClose={() => setShowCheckout(false)}>
          <div className="m-form-row">
            <label className="m-label">Employee Name *</label>
            <input
              className="m-input"
              placeholder="Full name"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="m-form-row">
            <label className="m-label">Employee ID</label>
            <input
              className="m-input"
              placeholder="FFC-000"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
            />
          </div>

          <div className="m-form-row">
            <label className="m-label">Team</label>
            <select
              className="m-input"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              style={{ background: 'var(--m-bg3)' }}
            >
              <option value="">Select team...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="m-form-row">
            <label className="m-label">Reason *</label>
            <div className="m-reason-grid">
              {BREAK_REASONS.map((r) => (
                <div
                  key={r}
                  className={`m-reason-btn${reason === r ? ' selected' : ''}`}
                  onClick={() => setReason(r)}
                >
                  <span className="m-reason-icon">{REASON_ICONS[r]}</span>
                  <span className="m-reason-label">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--m-bg3)', borderRadius: 12, padding: 12,
            fontSize: 12, color: 'var(--m-text3)', marginBottom: 16,
          }}>
            ⏱ Checkout time recorded automatically
          </div>

          <button
            className="m-btn m-btn-primary m-btn-lg"
            onClick={handleCheckout}
            disabled={submitting || !empName || !reason}
          >
            {submitting ? 'Recording...' : 'Check Out Now'}
          </button>
        </BottomSheet>
      )}
    </div>
  )
}
