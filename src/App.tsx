import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.tsx'
import TicketsPage from './pages/TicketsPage.tsx'
import TicketDetailPage from './pages/TicketDetailPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
