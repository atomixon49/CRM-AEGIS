import { useEffect, useState } from 'react'
import { fetchRows, insertRow } from '../services/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ empresas: 0, negocios: 0, tareas: 0, pipeline: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ultimosLeads, setUltimosLeads] = useState([])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    Promise.all([
      fetchRows('empresas', (q) => q.select('id', { count: 'exact', head: true })),
      fetchRows('negocios', (q) => q.select('valor', { count: 'exact', head: true }).eq('estado', 'abierto')),
      fetchRows('tareas', (q) => q.select('id', { count: 'exact', head: true }).eq('estado', 'pendiente')),
      fetchRows('empresas', (q) => q.select('razon_social, created_at, estado').order('created_at', { ascending: false }).limit(5)),
    ])
      .then(([emp, neg, tar, leads]) => {
        if (cancel) return
        const pipeline = (neg || []).reduce((acc, n) => acc + (Number(n.valor) || 0), 0)
        setStats({
          empresas: emp?.length ?? 0,
          negocios: neg?.length ?? 0,
          tareas: tar?.length ?? 0,
          pipeline,
        })
        setUltimosLeads(leads || [])
      })
      .catch((e) => { if (!cancel) setError(String(e)) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [])

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Leads registrados" value={stats.empresas} loading={loading} icon="🏢" gradient="from-blue-500 to-cyan-500" />
        <Kpi title="Negocios abiertos" value={stats.negocios} loading={loading} icon="💼" gradient="from-emerald-500 to-teal-500" />
        <Kpi title="Tareas pendientes" value={stats.tareas} loading={loading} icon="✅" gradient="from-amber-500 to-orange-500" />
        <Kpi title="Pipeline estimado" value={stats.pipeline} loading={loading} icon="💰" gradient="from-violet-500 to-fuchsia-500" money />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70">Distribución del pipeline</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Prospecto', count: Math.round((stats.empresas || 0) * 0.4), pct: 40, color: 'bg-sky-500' },
              { label: 'Calificado', count: Math.round((stats.empresas || 0) * 0.25), pct: 25, color: 'bg-indigo-500' },
              { label: 'Propuesta', count: Math.round((stats.empresas || 0) * 0.2), pct: 20, color: 'bg-violet-500' },
              { label: 'Ganado', count: Math.round((stats.empresas || 0) * 0.15), pct: 15, color: 'bg-emerald-500' },
            ].map(bar => (
              <div key={bar.label} className="flex items-center gap-3">
                <div className="w-24 text-xs text-white/60">{bar.label}</div>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                </div>
                <div className="text-xs text-white/50 w-24 text-right">{bar.count} leads</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Últimos leads</h3>
          <div className="space-y-3">
            {ultimosLeads.length === 0 && <p className="text-xs text-white/40">Sin leads aún.</p>}
            {ultimosLeads.map(l => (
              <div key={l.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{l.razon_social}</div>
                  <div className="text-xs text-white/50">{new Date(l.created_at).toLocaleDateString('es-CO')}</div>
                </div>
                <span className={`badge ${l.estado === 'activo' ? 'badge-success' : l.estado === 'prospecto' ? 'badge-info' : 'badge-warning'}`}>{l.estado}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ title, value, loading, icon, gradient, money }) {
  return (
    <div className="card group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-white/60">{title}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${money ? 'text-emerald-300' : 'text-white'}`}>
            {loading ? '...' : money ? `$${Number(value || 0).toLocaleString('es-CO')}` : Number(value || 0).toLocaleString('es-CO')}
          </p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
