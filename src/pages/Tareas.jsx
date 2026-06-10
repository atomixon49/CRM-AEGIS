import { useEffect, useState } from 'react'

export default function Tareas() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ titulo: '', tipo: 'seguimiento', prioridad: 'media', fecha_vencimiento: '' })
  const [creating, setCreating] = useState(false)

  async function load() {
    setError('')
    try {
      const res = await fetch('/api/tareas')
      setRows(Array.isArray((await res.json())) ? await res.json() : [])
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/tareas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('No se pudo crear la tarea')
      setForm({ titulo: '', tipo: 'seguimiento', prioridad: 'media', fecha_vencimiento: '' })
      load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  return (
    <div>
      <form onSubmit={create} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-4 gap-3">
          <label className="grid gap-1 text-sm text-white/70">
            Título
            <input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Tipo
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              {['llamada','reunión','correo','whatsapp','visita','enviar_cotización','seguimiento','otro'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Prioridad
            <select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              {['baja','media','alta','urgente'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Vencimiento
            <input type="date" value={form.fecha_vencimiento} onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button disabled={creating} type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black disabled:opacity-70">Guardar</button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-sm">{r.titulo}</div>
                <div className="text-xs text-white/60 mt-1">{r.tipo}</div>
              </div>
              <Badge text={r.estado} />
            </div>
            <div className="mt-3 text-xs text-white/60 flex items-center justify-between">
              <span>Prioridad: <span className="text-white/80">{r.prioridad}</span></span>
              <span>{r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString('es-CO') : '—'}</span>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <div className="mt-4 text-center text-white/50">Sin tareas pendientes.</div>}
    </div>
  )
}

function Badge({ text }) {
  const palette = {
    pendiente: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    en_progreso: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    completada: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    vencida: 'bg-red-500/10 text-red-300 border-red-500/20',
    cancelada: 'bg-white/5 text-white/60 border-white/10'
  }
  const cls = palette[text] ?? 'bg-white/5 text-white/60 border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${cls}`}>{text}</span>
}
