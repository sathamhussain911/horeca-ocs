import { useStaff } from '../hooks/useStaff'
import { initials } from '../lib/utils'

function teamColorClass(name: string) {
  const map: Record<string, string> = { 'Team A': 'team-a', 'Team B': 'team-b', 'Team C': 'team-c', 'Team D': 'team-d' }
  return map[name] || 'team-a'
}

export function StaffPage() {
  const { staff, loading } = useStaff()

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const day = staff.filter((s) => s.shift === 'Day')
  const night = staff.filter((s) => s.shift === 'Night')

  return (
    <>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric"><div className="metric-label">Total Staff</div><div className="metric-value">{staff.length}</div></div>
        <div className="metric"><div className="metric-label">Day Shift</div><div className="metric-value green">{day.length}</div></div>
        <div className="metric"><div className="metric-label">Night Shift</div><div className="metric-value amber">{night.length}</div></div>
        <div className="metric"><div className="metric-label">Teams</div><div className="metric-value">4</div></div>
      </div>

      <div className="card">
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Staff on Shift</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>ID</th><th>Team</th><th>Role</th><th>Shift</th></tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 30, height: 30, background: 'var(--bg4)', color: 'var(--text3)', fontSize: 11 }}>
                        {initials(s.name)}
                      </div>
                      <b style={{ color: 'var(--text)' }}>{s.name}</b>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{s.employee_id}</span></td>
                  <td>{s.teams ? <span className={`team-pill ${teamColorClass(s.teams.name)}`}>{s.teams.name}</span> : '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.role}</td>
                  <td><span className={`badge ${s.shift === 'Day' ? 'badge-amber' : 'badge-blue'}`}>{s.shift}</span></td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state">No staff records found. Add staff in Supabase.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
