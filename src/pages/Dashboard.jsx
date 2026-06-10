import { useMemo } from 'react'

const MOCK_NEGOCIOS = [
  { id: 1, titulo: 'Implementación CRM - Cliente A', valor: 12500000, etapas: 'Propuesta', responsable: 'Carlos Ruiz', temperatura: 'caliente' },
  { id: 2, titulo: 'Capacitación equipo ventas', valor: 3500000, etapas: 'Negociación', responsable: 'Ana López', temperatura: 'tibio' },
  { id: 3, titulo: 'Renovación licencias anuales', valor: 8700000, etapas: 'Ganado', responsable: 'María Torres', temperatura: 'caliente' },
  { id: 4, titulo: 'Proyecto BI para gerencia', valor: 22000000, etapas: 'Descubrimiento', responsable: 'Juan Gómez', temperatura: 'frío' },
  { id: 5, titulo: 'Soporte premium 12 meses', valor: 4100000, etapas: 'Cerrado perdido', responsable: 'Carlos Ruiz', temperatura: 'frío' },
]

const STAGES = [
  'Descubrimiento', 'Calificación', 'Propuesta', 'Negociación', 'Ganado', 'Cerrado perdido'
]

export default function Dashboard() {
  const kpis = useMemo(() => {
    const abiertos = MOCK_NEGOCIOS.filter((n) => !['Ganado', 'Cerrado perdido'].includes(n.etapas))
    const pipeline = abiertos.reduce((acc, n) => acc + (n.valor || 0), 0)
    const winRate = MOCK_NEGOCIOS.length
      ? Math.round((MOCK_NEGOCIOS.filter((n) => n.etapas === 'Ganado').length / MOCK_NEGOCIOS.length) * 100)
      : 0
    return { abiertos, pipeline, winRate }
  }, [])

  const etapasCounts = useMemo(() => {
    return STAGES.map((s) => ({ stage: s, count: MOCK_NEGOCIOS.filter((n) => n.etapas === s).length }))
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Negocios abiertos', value: kpis.abiertos.length },
          { label: 'Pipeline estimado', value: `$${kpis.pipeline.toLocaleString('es-CO')}` },
          { label: 'Win rate', value: `${kpis.winRate}%` }
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            <p className="text-sm text-white/60">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-medium text-white/70 mb-3">Negocios por etapa</h2>
          <div className="space-y-2">
            {etapasCounts.map((e) => {
              const max = Math.max(...etapasCounts.map((x) => x.count), 1)
              return (
                <div key={e.stage} className="flex items-center gap-3 text-sm">
                  <span className="w-28 text-white/70 truncate">{e.stage}</span>
                  <div className="h-3 flex-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${(e.count / max) * 100}%`, minWidth: e.count ? '8px' : 0 }}
                    />
                  </div>
                  <span className="w-6 text-right text-white/60">{e.count}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-medium text-white/70 mb-3">Actividad reciente</h2>
          <ul className="space-y-2 text-sm">
            {MOCK_NEGOCIOS.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-center justify-between">
                <span className="text-white/80 truncate">{n.titulo}</span>
                <span className="text-white/50 text-xs">{n.etapas}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white/70">Pipeline detallado</h2>
          <span className="text-xs text-white/50">Demo data</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-2 text-left">Negocio</th>
                <th className="px-4 py-2 text-left">Valor</th>
                <th className="px-4 py-2 text-left">Etapa</th>
                <th className="px-4 py-2 text-left">Responsable</th>
                <th className="px-4 py-2 text-left">Temperatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_NEGOCIOS.map((n) => (
                <tr key={n.id} className="hover:bg-white/5">
                  <td className="px-4 py-2">{n.titulo}</td>
                  <td className="px-4 py-2 text-white/70">${n.valor.toLocaleString('es-CO')}</td>
                  <td className="px-4 py-2 text-white/70">{n.etapas}</td>
                  <td className="px-4 py-2 text-white/70">{n.responsable}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${
                        n.temperatura === 'caliente'
                          ? 'border-red-500/30 bg-red-500/10 text-red-300'
                          : n.temperatura === 'tibio'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-white/10 bg-white/5 text-white/70'
                      }`}
                    >
                      {n.temperatura}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
