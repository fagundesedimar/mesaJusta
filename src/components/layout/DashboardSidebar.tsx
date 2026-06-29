'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarLink {
  href: string
  label: string
}

const DONOR_LINKS: SidebarLink[] = [
  { href: '/dashboard/donor', label: 'Dashboard' },
  { href: '/dashboard', label: 'Minhas Doações' },
]

const ONG_LINKS: SidebarLink[] = [
  { href: '/ong/dashboard', label: 'Mapa' },
  { href: '/ong/reservations', label: 'Minhas Reservas' },
]

const ADMIN_LINKS: SidebarLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [links, setLinks] = useState<SidebarLink[]>([])
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) {
          const role = data.user.role
          if (role === 'DONOR') setLinks(DONOR_LINKS)
          else if (role === 'ONG') setLinks(ONG_LINKS)
          else if (role === 'ADMIN') setLinks(ADMIN_LINKS)
          setUserName(data.user.profile?.name ?? data.user.email ?? '')
        }
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="sidebar__logo">Mesa Justa</div>

      <nav aria-label="Menu principal">
        {links.length === 0 && <p className="sr-only">Carregando navegação...</p>}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            className={`sidebar__link${pathname === link.href ? ' sidebar__link--active' : ''}`}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
          {userName}
        </div>
        <Link
          href="/api/v1/auth/logout"
          className="sidebar__link"
          style={{ padding: '0.5rem 0', fontSize: '0.8rem' }}
          aria-label="Sair da conta"
        >
          Sair
        </Link>
      </div>
    </aside>
  )
}
