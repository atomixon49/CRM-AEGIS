import { useEffect, useState } from 'react'
import { fetchRows, insertRow } from '../services/supabase'

export default function Leads() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ razon_social: '', sector: '', ciudad: '', estado: 'prospecto' })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRows('empresas', (q) => q.order('created_at', { ascending: false }).limit(50))
      setRows(data)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await insertRow('empresas', form)
      setForm({ razon_social: '', sector: '', ciudad: '', estado: 'prospecto' })
      load()
    } catch (e) { setError(String(e)) }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="grid grid-cols-2 md:grid-cols-5 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="grid gap-1 text-sm text-white/70">
          Razón social
          <input required value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Sector
          <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Ciudad
          <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Estado
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
            <option value="prospecto">Prospecto</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black">Crear lead</button>
        </div>
      </form>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}

      <div className="overflow-hidden rounded-2xl border border-white/10">
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
        {!loading && rows.length === 0 && <div className="p-6 text-center text-white/50">Sin leads.</div>}
      </div>
    </div>
  )
}

function Badge({ text }) {
  const color = { activo: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', prospecto: 'bg-sky-500/10 text-sky-300 border-sky-500/20', inactivo: 'bg-white/5 text-white/60 border-white/10' }[text] ?? 'bg-white/5 text-white/60 border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${color}`}>{text}</span>
}
