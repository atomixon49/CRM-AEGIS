import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/leads', label: 'Leads', icon: '🏢' },
  { to: '/contactos', label: 'Contactos', icon: '👥' },
  { to: '/negocios', label: 'Negocios', icon: '💼' },
  { to: '/tareas', label: 'Tareas', icon: '✅' },
  { to: '/campanas', label: 'Campañas', icon: '📣' }
]

export default function Layout() {
  const { logout } = useAuth()
  const { pathname } = useLocation()

  const title = NAV.find(n => n.to === pathname)?.label ?? 'AEGIS CRM'

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="h-[100vh] sticky top-0 border-r border-white/10 bg-black/20 p-4 flex flex-col">
        <div className="px-2 py-3 text-lg font-semibold tracking-wide">AEGIS</div>
        <nav className="mt-2 grid gap-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white">
            🚪 Salir
          </button>
        </div>
      </aside>

      <main className="min-h-[100vh]">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium">{title}</h1>
              <p className="text-white/50 text-xs">Workspace</p>
            </div>
            <div className="text-xs text-white/50">v0.1</div>
          </div>
        </header>

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
