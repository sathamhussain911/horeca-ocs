import { useState } from 'react'
import { Modal } from './Modal'
import { OrderFormData } from '../types'
import { CATEGORIES, PACKAGING } from '../lib/constants'

interface Props {
  onClose: () => void
  onSubmit: (data: OrderFormData) => Promise<boolean>
}

const defaultForm: OrderFormData = {
  customer: '',
  category: '',
  packaging: 'Standard Box',
  qty_ordered: 0,
  priority: 'Normal',
  notes: '',
  shift: 'Day',
}

export function OrderModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<OrderFormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!form.customer.trim()) e.customer = 'Required'
    if (!form.category) e.category = 'Required'
    if (!form.qty_ordered || form.qty_ordered <= 0) e.qty_ordered = 'Must be > 0'
    return e
  }

  const set = (key: keyof OrderFormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    const ok = await onSubmit(form)
    setLoading(false)
    if (ok) onClose()
  }

  return (
    <Modal title="Upload New Order" onClose={onClose}>
      <div className="form-row">
        <label>Customer / Hotel Name *</label>
        <input
          placeholder="e.g. Grand Hyatt Dubai"
          value={form.customer}
          onChange={(e) => set('customer', e.target.value)}
          autoFocus
        />
        {errors.customer && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.customer}</div>}
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Category *</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.category}</div>}
        </div>
        <div className="form-row">
          <label>Quantity (units) *</label>
          <input
            type="number"
            min={1}
            placeholder="0"
            value={form.qty_ordered || ''}
            onChange={(e) => set('qty_ordered', parseInt(e.target.value) || 0)}
          />
          {errors.qty_ordered && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.qty_ordered}</div>}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Packaging Type</label>
          <select value={form.packaging} onChange={(e) => set('packaging', e.target.value)}>
            {PACKAGING.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value as OrderFormData['priority'])}>
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Shift</label>
          <select value={form.shift} onChange={(e) => set('shift', e.target.value as 'Day' | 'Night')}>
            <option>Day</option>
            <option>Night</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <label>Notes / Special Instructions</label>
        <textarea
          rows={2}
          placeholder="e.g. Fragile items, keep refrigerated..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : '+ Add Order'}
        </button>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </Modal>
  )
}
