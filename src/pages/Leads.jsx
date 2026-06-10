import { useEffect, useState } from 'react'

export default function Leads() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ razon_social: '', sector: '', ciudad: '', estado: 'prospecto' })

  async function load() {
    setError('')
    try {
      const qs = new URLSearchParams()
      if (search) qs.set('q', search)
      if (estado) qs.set('estado', estado)
      const res = await fetch(`/api/leads?${qs.toString()}`)
      if (!res.ok) throw new Error('No se pudo cargar empresas')
      setRows(await res.json())
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [search, estado])

  async function create(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Error creando lead')
      setForm({ razon_social: '', sector: '', ciudad: '', estado: 'prospecto' })
      load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa…" className="h-9 w-64 rounded-lg border border-white/10 bg-black/20 px-3 text-sm outline-none" />
          <select value={estado} onChange={e => setEstado(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-sm">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="prospecto">Prospecto</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <button onClick={() => document.getElementById('form-lead').classList.toggle('hidden')} className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black">+ Nuevo lead</button>
      </div>

      <form id="form-lead" className="hidden mt-4 rounded-2xl border border-white/10 bg-white/5 p-4" onSubmit={create}>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm text-white/70">
            Razón social
            <input required value={form.razon_social} onChange={e => setForm({ ...form, razon_social: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Sector
            <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Ciudad
            <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Estado
            <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              <option value="prospecto">Prospecto</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={() => document.getElementById('form-lead').classList.add('hidden')} className="h-9 rounded-lg border border-white/10 px-3 text-sm">Cancelar</button>
          <button disabled={creating} type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black disabled:opacity-70">Guardar</button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Empresa</th>
              <th className="px-4 py-3 text-left font-medium">Sector</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.razon_social}</td>
                <td className="px-4 py-3 text-white/70">{r.sector ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{r.ciudad ?? '—'}</td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
                <td className="px-4 py-3 text-white/60">{new Date(r.created_at).toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-6 text-center text-white/50">Sin resultados.</div>}
      </div>
    </div>
  )
}

function Badge({ text }) {
  const color = {
    activo: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    prospecto: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    inactivo: 'bg-white/5 text-white/60 border-white/10'
  }[text] ?? 'bg-white/5 text-white/60 border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${color}`}>{text}</span>
}
