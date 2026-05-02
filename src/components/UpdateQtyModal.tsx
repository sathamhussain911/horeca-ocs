import { useState } from 'react'
import { Modal } from './Modal'
import { Order } from '../types'
import { ProgressBar } from './ProgressBar'
import { productivity } from '../lib/utils'

interface Props {
  order: Order
  onClose: () => void
  onSubmit: (orderId: string, qty: number) => Promise<boolean>
}

export function UpdateQtyModal({ order, onClose, onSubmit }: Props) {
  const [qty, setQty] = useState(order.qty_done)
  const [loading, setLoading] = useState(false)

  const pct = productivity(qty, order.qty_ordered)

  const handleSubmit = async () => {
    setLoading(true)
    const ok = await onSubmit(order.id, qty)
    setLoading(false)
    if (ok) onClose()
  }

  return (
    <Modal title={`Update Progress · ${order.order_ref}`} onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{order.customer}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{order.category} · {order.packaging}</div>
      </div>

      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Units packed</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>
            {qty} <span style={{ fontSize: 13, color: 'var(--text3)' }}>/ {order.qty_ordered}</span>
          </span>
        </div>
        <ProgressBar value={pct} showLabel />
      </div>

      <div className="form-row">
        <label>Quantity Done</label>
        <input
          type="number"
          min={0}
          max={order.qty_ordered}
          value={qty}
          onChange={(e) => setQty(Math.min(order.qty_ordered, parseInt(e.target.value) || 0))}
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => setQty(Math.round(order.qty_ordered * pct / 100))}
          >
            {pct}%
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Progress'}
        </button>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}
