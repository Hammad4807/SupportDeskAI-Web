import { NavLink } from 'react-router'
import { LayoutDashboard, ListTodo } from 'lucide-react'

// Project sidebar with the main navigation links.
export default function Sidebar() {
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
      <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
        <LayoutDashboard size={16} aria-hidden="true" />
        Dashboard
      </NavLink>
      <NavLink to="/tickets" className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
        <ListTodo size={16} aria-hidden="true" />
        Tickets
      </NavLink>
    </nav>
  )
}
