'use client'
// src/components/ui/Navbar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, AlertTriangle, Users, Shield } from 'lucide-react'

const navLinks = [
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/reportar', label: 'Reportar', icon: AlertTriangle },
  { href: '/personas', label: 'Personas', icon: Users },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/mapa"
          className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight hover:text-blue-400 transition-colors duration-150"
        >
          <span className="text-blue-500 text-xl">⟳</span>
          <span>Rastro</span>
          <span className="hidden sm:inline text-slate-500 text-xs font-normal ml-1">
            Respuesta a emergencias
          </span>
        </Link>

        {/* Links principales */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon size={15} strokeWidth={1.5} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}

          {/* Moderación — separado con divisor */}
          <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />
          <Link
            href="/moderacion"
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${pathname.startsWith('/moderacion')
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/60'
              }
            `}
          >
            <Shield size={15} strokeWidth={1.5} />
            <span className="hidden sm:inline">Moderación</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
