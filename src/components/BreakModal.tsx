import { useState } from 'react'
import { Modal } from './Modal'
import { Team, BreakFormData } from '../types'
import { BREAK_REASONS } from '../lib/constants'

interface Props {
  teams: Team[]
  onClose: () => void
  onSubmit: (data: BreakFormData) => Promise<boolean>
}

const defaultForm: BreakFormData = {
  employee_name: '',
  employee_ref: '',
  team_id: '',
  reason: 'Rest Room',
  notes: '',
}

export function BreakModal({ teams, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<BreakFormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BreakFormData, string>>>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!form.employee_name.trim()) e.employee_name = 'Required'
    if (!form.reason) e.reason = 'Required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    const ok = await onSubmit(form)
    setLoading(false)
    if (ok) onClose()
  }

  const REASON_ICONS: Record<string, string> = {
    'Rest Room': '🚻',
    'Prayer': '🕌',
    'Food Break': '🍽',
    'Personal': '👤',
    'Medical': '🏥',
    'Emergency': '🚨',
  }

  return (
    <Modal title="Employee Check-Out" onClose={onClose}>
      <div className="form-grid">
        <div className="form-row">
          <label>Employee Name *</label>
          <input
            placeholder="Full name"
            value={form.employee_name}
            onChange={(e) => setForm((f) => ({ ...f, employee_name: e.target.value }))}
            autoFocus
          />
          {errors.employee_name && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.employee_name}</div>}
        </div>
        <div className="form-row">
          <label>Employee ID</label>
          <input
            placeholder="FFC-000"
            value={form.employee_ref}
            onChange={(e) => setForm((f) => ({ ...f, employee_ref: e.target.value }))}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Team</label>
        <select value={form.team_id} onChange={(e) => setForm((f) => ({ ...f, team_id: e.target.value }))}>
          <option value="">Select team...</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="form-row">
        <label>Reason for Leaving *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {BREAK_REASONS.map((r) => (
            <div
              key={r}
              onClick={() => setForm((f) => ({ ...f, reason: r }))}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                border: form.reason === r ? '2px solid var(--green3)' : '1px solid var(--border)',
                background: form.reason === r ? '#1A3D2A' : 'var(--bg3)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: form.reason === r ? 'var(--green)' : 'var(--text2)',
              }}
            >
              <span style={{ fontSize: 16 }}>{REASON_ICONS[r]}</span>
              {r}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12,
        color: 'var(--text3)', marginBottom: 16,
      }}>
        ⏱ Check-out time will be recorded automatically as the current time.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Recording...' : 'Check Out →'}
        </button>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </Modal>
  )
}
