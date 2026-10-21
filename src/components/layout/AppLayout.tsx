import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import TopNav from './TopNav.tsx'
import Sidebar from './Sidebar.tsx'
import CreateTicketModal from '../CreateTicketModal.tsx'
import Flag from '../Flag.tsx'
import ErrorBoundary from '../ErrorBoundary.tsx'
import type { LayoutContext } from '../../hooks/useLayout.ts'
import type { Ticket } from '../../types/ticket.ts'
import './layout.css'

// Jira-style shell: top navigation, project sidebar, page content.
export default function AppLayout() {
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()

  const handleCreated = (ticket: Ticket) => {
    setCreateOpen(false)
    setCreatedTicket(ticket)
    setRefreshKey((n) => n + 1)
  }

  // Stable function, so the flag's auto-dismiss timer is not restarted on every render.
  const dismissFlag = useCallback(() => setCreatedTicket(null), [])

  const context: LayoutContext = { refreshKey, openCreateModal: () => setCreateOpen(true) }

  return (
    <div className="app-shell">
      <TopNav onCreate={context.openCreateModal} />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          {/* A crash inside a page keeps the nav and sidebar usable; key resets it after navigating away. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet context={context} />
          </ErrorBoundary>
        </main>
      </div>

      {isCreateOpen && <CreateTicketModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}

      {createdTicket && (
        <Flag key={createdTicket.id} ticket={createdTicket} onDismiss={dismissFlag} />
      )}
    </div>
  )
}
