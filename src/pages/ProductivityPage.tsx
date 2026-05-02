import { useState } from 'react'
import { Order, Team } from '../types'
import { OrderModal } from '../components/OrderModal'
import { AssignModal } from '../components/AssignModal'
import { UpdateQtyModal } from '../components/UpdateQtyModal'
import { ProgressBar } from '../components/ProgressBar'
import { useOrders } from '../hooks/useOrders'
import { PRIORITY_COLORS, STATUS_COLORS } from '../lib/constants'
import { formatTime, productivity } from '../lib/utils'

interface Props {
  teams: Team[]
}

type Tab = 'orders' | 'teams'

function teamColorClass(teamName: string) {
  const map: Record<string, string> = { 'Team A': 'team-a', 'Team B': 'team-b', 'Team C': 'team-c', 'Team D': 'team-d' }
  return map[teamName] || 'team-a'
}

export function ProductivityPage({ teams }: Props) {
  const { orders, loading, addOrder, assignOrder, updateQtyDone, markDone } = useOrders()
  const [tab, setTab] = useState<Tab>('orders')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
  const [updateOrder, setUpdateOrder] = useState<Order | null>(null)

  const pending = orders.filter((o) => o.status === 'Pending')
  const active = orders.filter((o) => o.status === 'Active')
  const done = orders.filter((o) => o.status === 'Done')
  const totalQty = orders.reduce((s, o) => s + o.qty_ordered, 0)
  const doneQty = orders.reduce((s, o) => s + o.qty_done, 0)
  const prod = productivity(doneQty, totalQty)

  const assigningOrder = orders.find((o) => o.id === assignOrderId)

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>
  }

  return (
    <>
      {pending.length > 0 && (
        <div className="alert-bar">
          ⚠ {pending.length} order{pending.length > 1 ? 's' : ''} pending team assignment
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Total Orders</div>
          <div className="metric-value">{orders.filter(o => o.status !== 'Cancelled').length}</div>
          <div className="metric-sub">Today's queue</div>
        </div>
        <div className="metric">
          <div className="metric-label">Active</div>
          <div className="metric-value amber">{active.length}</div>
          <div className="metric-sub">In progress</div>
        </div>
        <div className="metric">
          <div className="metric-label">Completed</div>
          <div className="metric-value green">{done.length}</div>
          <div className="metric-sub">Orders done</div>
        </div>
        <div className="metric">
          <div className="metric-label">Productivity</div>
          <div className="metric-value green">{prod}<span style={{ fontSize: 16 }}>%</span></div>
          <ProgressBar value={prod} />
          <div className="metric-sub">{doneQty.toLocaleString()} / {totalQty.toLocaleString()} units</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>Order Queue</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Upload orders and assign to packing teams</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>+ Upload Order</button>
        </div>

        <div className="tab-bar">
          <div className={`tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>All Orders</div>
          <div className={`tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>Team View</div>
        </div>

        {tab === 'orders' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Packaging</th>
                  <th>Qty</th>
                  <th>Priority</th>
                  <th>Team</th>
                  <th>Start</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pct = productivity(o.qty_done, o.qty_ordered)
                  return (
                    <tr key={o.id}>
                      <td><span className="mono" style={{ fontSize: 11, color: 'var(--green)' }}>{o.order_ref}</span></td>
                      <td style={{ fontWeight: 500, color: 'var(--text)' }}>{o.customer}</td>
                      <td>{o.category}</td>
                      <td style={{ fontSize: 11 }}>{o.packaging}</td>
                      <td><span className="mono">{o.qty_ordered}</span></td>
                      <td><span className={`badge ${PRIORITY_COLORS[o.priority]}`}>{o.priority}</span></td>
                      <td>
                        {o.teams
                          ? <span className={`team-pill ${teamColorClass(o.teams.name)}`}>{o.teams.name}</span>
                          : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                        }
                      </td>
                      <td><span className="mono" style={{ fontSize: 11 }}>{formatTime(o.start_time)}</span></td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ProgressBar value={pct} height={4} />
                          <span className="mono" style={{ fontSize: 11, minWidth: 30, color: 'var(--text3)' }}>{pct}%</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{o.qty_done}/{o.qty_ordered}</div>
                      </td>
                      <td><span className={`status-pill ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {o.status === 'Pending' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setAssignOrderId(o.id)}>Assign</button>
                          )}
                          {o.status === 'Active' && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => setUpdateOrder(o)}>Update</button>
                              <button className="btn btn-primary btn-sm" onClick={() => markDone(o.id)}>✓ Done</button>
                            </>
                          )}
                          {o.status === 'Done' && (
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>↵ {formatTime(o.end_time)}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={11}><div className="empty-state">No orders today. Upload your first order.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'teams' && (
          <div className="grid-2" style={{ marginTop: 4 }}>
            {teams.map((team) => {
              const teamOrders = orders.filter((o) => o.team_id === team.id)
              const tDoneQty = teamOrders.reduce((s, o) => s + o.qty_done, 0)
              const tTotalQty = teamOrders.reduce((s, o) => s + o.qty_ordered, 0)
              const tProd = productivity(tDoneQty, tTotalQty)
              const tActive = teamOrders.filter((o) => o.status === 'Active').length
              const tDone = teamOrders.filter((o) => o.status === 'Done').length

              return (
                <div key={team.id} className="card-sm">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className={`team-pill ${teamColorClass(team.name)}`} style={{ fontSize: 13, padding: '4px 12px' }}>
                      {team.name}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: 'var(--green)' }}>{tProd}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>productivity</div>
                    </div>
                  </div>
                  <ProgressBar value={tProd} />
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
                    <span>Orders: <b style={{ color: 'var(--text)' }}>{teamOrders.length}</b></span>
                    <span>Active: <b style={{ color: 'var(--amber)' }}>{tActive}</b></span>
                    <span>Done: <b style={{ color: 'var(--green)' }}>{tDone}</b></span>
                    <span>Units: <b style={{ color: 'var(--text)' }}>{tDoneQty}/{tTotalQty}</b></span>
                  </div>
                  {teamOrders.length > 0 && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      {teamOrders.map((o) => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6, color: 'var(--text2)' }}>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{o.order_ref}</span>
                          <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer}</span>
                          <span className={`status-pill ${STATUS_COLORS[o.status]}`} style={{ fontSize: 10 }}>{o.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {teamOrders.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10, fontStyle: 'italic' }}>No orders assigned</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showOrderModal && (
        <OrderModal onClose={() => setShowOrderModal(false)} onSubmit={addOrder} />
      )}
      {assigningOrder && (
        <AssignModal
          orderId={assigningOrder.id}
          orderRef={assigningOrder.order_ref}
          customer={assigningOrder.customer}
          teams={teams}
          onClose={() => setAssignOrderId(null)}
          onSubmit={assignOrder}
        />
      )}
      {updateOrder && (
        <UpdateQtyModal
          order={updateOrder}
          onClose={() => setUpdateOrder(null)}
          onSubmit={updateQtyDone}
        />
      )}
    </>
  )
}
