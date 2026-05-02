import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { MobileClock } from '../components/MobileClock'
import { MobileHome } from './MobileHome'
import { MobileOrders } from './MobileOrders'
import { MobileBreaks } from './MobileBreaks'
import { MobileReports } from './MobileReports'
import { useOrders } from '../hooks/useOrders'
import { useBreaks } from '../hooks/useBreaks'
import { useTeams } from '../hooks/useTeams'
import '../mobile.css'

type Screen = 'home' | 'orders' | 'breaks' | 'reports'

const NAV = [
  { id: 'home' as Screen,    icon: '🏠', label: 'Home' },
  { id: 'orders' as Screen,  icon: '📦', label: 'Orders' },
  { id: 'breaks' as Screen,  icon: '⏸',  label: 'Breaks' },
  { id: 'reports' as Screen, icon: '📊', label: 'Reports' },
]

const TITLES: Record<Screen, string> = {
  home: 'FFC · HORECA',
  orders: 'My Orders',
  breaks: 'Break Tracker',
  reports: 'Daily Report',
}

export function MobileApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const { orders, addOrder, assignOrder, updateQtyDone, markDone } = useOrders()
  const { breaks, activeBreaks, checkOut, checkIn } = useBreaks()
  const { teams } = useTeams()

  return (
    <div className="mobile-app">
      {/* Top bar */}
      <div className="m-topbar">
        <div className="m-logo">{TITLES[screen]}</div>
        <MobileClock />
      </div>

      {/* Screen content */}
      <div className="m-content">
        {screen === 'home' && (
          <MobileHome
            orders={orders}
            activeBreaks={activeBreaks}
            teams={teams}
            onGoToOrders={() => setScreen('orders')}
            onGoToBreak={() => setScreen('breaks')}
          />
        )}
        {screen === 'orders' && (
          <MobileOrders
            orders={orders}
            teams={teams}
            onUpdateQty={updateQtyDone}
            onMarkDone={markDone}
          />
        )}
        {screen === 'breaks' && (
          <MobileBreaks
            teams={teams}
            breaks={breaks}
            activeBreaks={activeBreaks}
            onCheckOut={checkOut}
            onCheckIn={checkIn}
          />
        )}
        {screen === 'reports' && (
          <MobileReports
            orders={orders}
            breaks={breaks}
            teams={teams}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="m-bottomnav">
        {NAV.map((n) => (
          <div
            key={n.id}
            className={`m-nav-item${screen === n.id ? ' active' : ''}`}
            onClick={() => setScreen(n.id)}
          >
            {n.id === 'breaks' && activeBreaks.length > 0 && (
              <div className="m-nav-dot" />
            )}
            <span className="m-nav-icon">{n.icon}</span>
            <span className="m-nav-label">{n.label}</span>
          </div>
        ))}
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1C2820',
            color: '#E8F5EE',
            border: '1px solid #263830',
            fontFamily: 'Barlow, Inter, sans-serif',
            fontSize: 14,
            borderRadius: 14,
          },
          success: { iconTheme: { primary: '#2ECC71', secondary: '#080C0A' } },
          error:   { iconTheme: { primary: '#FF4444', secondary: '#080C0A' } },
        }}
      />
    </div>
  )
}
