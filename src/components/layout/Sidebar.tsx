import { NavLink } from 'react-router'
import { LayoutDashboard, ListTodo, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.ts'
import { canManageUsers, canSeeDashboard, isStaffOrAdmin } from '../../auth/permissions.ts'

const linkClass = ({ isActive }: { isActive: boolean }) => `sidebar__link${isActive ? ' is-active' : ''}`

// Project sidebar with the main navigation links. Each user only sees the links their role may use.
export default function Sidebar() {
  const { user } = useAuth()

  return (
    <nav className="sidebar" aria-label="Project">
      <div className="sidebar__project">
        <span className="sidebar__project-avatar" aria-hidden="true">SD</span>
        <div>
          <div className="sidebar__project-name">SupportDesk</div>
          <div className="sidebar__project-type">Service project</div>
        </div>
      </div>

      <div className="sidebar__section-label">Support</div>
      {canSeeDashboard(user) && (
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={16} aria-hidden="true" />
          Dashboard
        </NavLink>
      )}
      <NavLink to="/tickets" className={linkClass}>
        <ListTodo size={16} aria-hidden="true" />
        {isStaffOrAdmin(user) ? 'Tickets' : 'My tickets'}
      </NavLink>

      {canManageUsers(user) && (
        <>
          <div className="sidebar__section-label">Settings</div>
          <NavLink to="/users" className={linkClass}>
            <Users size={16} aria-hidden="true" />
            Users
          </NavLink>
        </>
      )}
    </nav>
  )
}
