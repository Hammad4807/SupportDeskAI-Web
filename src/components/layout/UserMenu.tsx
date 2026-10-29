import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.ts'

// "AK" for "Ali Khan"
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || '?'

// Avatar button in the top-right corner: who is logged in, their role, account page and log out.
export default function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside the menu or pressing Escape
  useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!user) return null

  const logOut = () => {
    signOut() // JWTs cannot be cancelled on the server: logging out = forgetting the token
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu__avatar"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Account menu for ${user.fullName}`}
        onClick={() => setOpen((open) => !open)}
      >
        {initials(user.fullName)}
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <div className="user-menu__name">{user.fullName}</div>
            <div className="user-menu__email">{user.email}</div>
            <span className="user-menu__role">{user.roles.join(', ')}</span>
          </div>
          <Link to="/account" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <UserRound size={16} aria-hidden="true" /> Your account
          </Link>
          <button type="button" className="user-menu__item" role="menuitem" onClick={logOut}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
