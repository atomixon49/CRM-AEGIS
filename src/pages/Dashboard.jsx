import { useEffect, useState } from 'react'
import { fetchRows, insertRow } from '../services/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, negocios: 0, tareas: 0, pipeline: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancel = false
    setLoading(true)
    Promise.all([
      fetchRows('empresas', (q) => q.select('id', { count: 'exact', head: true })),
      fetchRows('negocios', (q) => q.select('valor', { count: 'exact', head: true })),
      fetchRows('tareas', (q) => q.select('id', { count: 'exact', head: true })),
    ])
      .then(([emp, neg, tar]) => {
        if (cancel) return
        setStats({
          leads: emp?.length ?? 0,
          negocios: neg?.length ?? 0,
          tareas: tar?.length ?? 0,
          pipeline: 0,
        })
      })
      .catch((e) => { if (!cancel) setError(String(e)) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Leads / Empresas" value={stats.leads} loading={loading} />
        <Kpi title="Negocios abiertos" value={stats.negocios} loading={loading} />
        <Kpi title="Tareas pendientes" value={stats.tareas} loading={loading} />
      </div>
      {error && <p className="text-sm text-red-400">Error: {error}</p>}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-medium text-white/70">Pipeline estimado</h2>
        <p className="text-2xl font-semibold">${Number(stats.pipeline || 0).toLocaleString('es-CO')}</p>
      </div>
    </div>
  )
}

function Kpi({ title, value, loading }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{loading ? '...' : value}</p>
    </div>
  )
}
