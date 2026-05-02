import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Clock } from './components/Clock'
import { ProductivityPage } from './pages/ProductivityPage'
import { BreaksPage } from './pages/BreaksPage'
import { ReportsPage } from './pages/ReportsPage'
import { StaffPage } from './pages/StaffPage'
import { useTeams } from './hooks/useTeams'
import { useBreaks } from './hooks/useBreaks'
import { useMobile } from './hooks/useMobile'
import { MobileApp } from './mobile/MobileApp'

type Page = 'productivity' | 'breaks' | 'reports' | 'staff'

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'productivity', label: 'Productivity', icon: '📦' },
  { id: 'breaks', label: 'Break Tracker', icon: '⏸' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'staff', label: 'Staff', icon: '👥' },
]

const PAGE_TITLES: Record<Page, string> = {
  productivity: 'Productivity Module',
  breaks: 'Break Tracker',
  reports: 'Daily Reports',
  staff: 'Staff Management',
}

export default function App() {
  const isMobile = useMobile()
  const [page, setPage] = useState<Page>('productivity')
  const { teams } = useTeams()
  const { activeBreaks } = useBreaks()

  // Render mobile app for small screens
  if (isMobile) return <MobileApp />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-tag">FFC · HORECA</div>
          <div className="logo-sub">Operations Center</div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((n) => (
            <div
              key={n.id}
              className={`nav-item${page === n.id ? ' active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'breaks' && activeBreaks.length > 0 && (
                <span className="nav-badge">{activeBreaks.length}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Active Session</div>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Supervisor</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>HORECA · Day Shift</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="page-title">{PAGE_TITLES[page]}</div>
          <div className="topbar-right">
            <Clock />
            <span className="badge badge-green">Day Shift</span>
            {activeBreaks.length > 0 && (
              <span
                className="badge badge-red"
                style={{ cursor: 'pointer' }}
                onClick={() => setPage('breaks')}
                title="Click to view break tracker"
              >
                {activeBreaks.length} Out
              </span>
            )}
          </div>
        </header>

        <main className="content">
          {page === 'productivity' && <ProductivityPage teams={teams} />}
          {page === 'breaks' && <BreaksPage teams={teams} />}
          {page === 'reports' && <ReportsPage teams={teams} />}
          {page === 'staff' && <StaffPage />}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card2)',
            color: 'var(--text)',
            border: '1px solid var(--border2)',
            fontFamily: 'var(--body)',
            fontSize: 13,
          },
          success: { iconTheme: { primary: '#2ECC71', secondary: '#0A0F0D' } },
          error: { iconTheme: { primary: '#E74C3C', secondary: '#0A0F0D' } },
        }}
      />
    </div>
  )
}
