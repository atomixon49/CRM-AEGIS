import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/leads', label: 'Leads', icon: '🏢' },
  { to: '/contactos', label: 'Contactos', icon: '👥' },
  { to: '/negocios', label: 'Negocios', icon: '💼' },
  { to: '/tareas', label: 'Tareas', icon: '✅' },
  { to: '/campanas', label: 'Campañas', icon: '📣' },
  { to: '/asistente', label: 'Asistente IA', icon: '🤖' }
]

export default function Layout() {
  const { logout } = useAuth()
  const { pathname } = useLocation()

  const title = NAV.find(n => n.to === pathname)?.label ?? 'AEGIS CRM'

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="h-screen sticky top-0 border-r border-white/10 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur-xl">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              A
            </div>
            <div>
              <div className="text-white font-semibold tracking-tight">AEGIS CRM</div>
              <div className="text-xs text-white/40">v2.0 · Preview</div>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-blue-500/10 border border-white/10'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="text-xs text-white/40 mt-0.5">Workspace · {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold">AI</div>
            </div>
          </div>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
