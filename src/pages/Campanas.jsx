import { useEffect, useState } from 'react'

export default function Campanas() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', tipo: 'email', segmento: '', mensaje_template: '' })
  const [creating, setCreating] = useState(false)

  async function load() {
    setError('')
    try {
      const res = await fetch('/api/campanas')
      setRows(Array.isArray((await res.json())) ? await res.json() : [])
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/campanas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('No se pudo crear la campaña')
      setForm({ nombre: '', tipo: 'email', segmento: '', mensaje_template: '' })
      load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  return (
    <div>
      <form onSubmit={create} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm text-white/70">
            Nombre
            <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Tipo
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white/70 col-span-2">
            Segmento
            <input value={form.segmento} onChange={e => setForm({ ...form, segmento: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70 col-span-2">
            Mensaje template
            <textarea value={form.mensaje_template} onChange={e => setForm({ ...form, mensaje_template: e.target.value })} className="h-28 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button disabled={creating} type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black disabled:opacity-70">Crear campaña</button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Enviados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.nombre}</td>
                <td className="px-4 py-3 text-white/70">{r.tipo}</td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
                <td className="px-4 py-3 text-white/70">{r.enviados ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-6 text-center text-white/50">Sin campañas.</div>}
      </div>
    </div>
  )
}

function Badge({ text }) {
  const palette = {
    borrador: 'bg-white/5 text-white/70 border-white/10',
    activa: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    pausada: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    finalizada: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
  }
  const cls = palette[text] ?? 'bg-white/5 text-white/60 border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${cls}`}>{text}</span>
}
