import { useOutletContext } from 'react-router'

// Values AppLayout shares with every page through <Outlet context={...}>.
export interface LayoutContext {
  refreshKey: number // changes after a ticket is created, so lists reload
  openCreateModal: () => void
}

export function useLayout() {
  return useOutletContext<LayoutContext>()
}
