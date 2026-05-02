import { useState } from 'react'
import { Modal } from './Modal'
import { Team, AssignFormData } from '../types'

interface Props {
  orderId: string
  orderRef: string
  customer: string
  teams: Team[]
  onClose: () => void
  onSubmit: (orderId: string, data: AssignFormData) => Promise<boolean>
}

export function AssignModal({ orderId, orderRef, customer, teams, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<AssignFormData>({ team_id: '', start_time: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const teamColorClass = (name: string) => {
    const map: Record<string, string> = { 'Team A': 'team-a', 'Team B': 'team-b', 'Team C': 'team-c', 'Team D': 'team-d' }
    return map[name] || 'team-a'
  }

  const handleSubmit = async () => {
    if (!form.team_id) return
    setLoading(true)
    const ok = await onSubmit(orderId, form)
    setLoading(false)
    if (ok) onClose()
  }

  return (
    <Modal title={`Assign Order · ${orderRef}`} onClose={onClose}>
      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
        <span style={{ color: 'var(--text3)' }}>Customer: </span>{customer}
      </div>

      <div className="form-row">
        <label>Assign to Team *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {teams.map((t) => (
            <div
              key={t.id}
              onClick={() => setForm((f) => ({ ...f, team_id: t.id }))}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                border: form.team_id === t.id ? '2px solid var(--green3)' : '1px solid var(--border)',
                background: form.team_id === t.id ? '#1A3D2A' : 'var(--bg3)',
                transition: 'all 0.15s',
              }}
            >
              <span className={`team-pill ${teamColorClass(t.name)}`}>{t.name}</span>
            </div>
          ))}
        </div>
        {!form.team_id && <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 6 }}>Select a team to continue</div>}
      </div>

      <div className="form-row">
        <label>Start Time (leave blank for now)</label>
        <input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
      </div>

      <div className="form-row">
        <label>Notes for Team</label>
        <textarea
          rows={2}
          placeholder="Packing instructions, special handling..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading || !form.team_id}>
          {loading ? 'Assigning...' : 'Confirm Assignment'}
        </button>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </Modal>
  )
}
