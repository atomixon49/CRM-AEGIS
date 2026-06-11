import { useEffect, useState } from 'react'
import { fetchRows, insertRow } from '../services/supabase'

export default function Contactos() {
  const [rows, setRows] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre_completo: '', empresa_id: '', cargo: '', email: '', telefono_celular: '', ciudad: '', estado: 'activo' })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [p, e] = await Promise.all([
        fetchRows('personas', (q) => q.order('created_at', { ascending: false }).limit(50)),
        fetchRows('empresas', (q) => q.select('id, razon_social').order('razon_social').limit(200)),
      ])
      setRows(p)
      setEmpresas(e)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      const body = { ...form }
      if (!body.empresa_id) delete body.empresa_id
      await insertRow('personas', body)
      setForm({ nombre_completo: '', empresa_id: '', cargo: '', email: '', telefono_celular: '', ciudad: '', estado: 'activo' })
      load()
    } catch (e) { setError(String(e)) }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="grid gap-1 text-sm text-white/70">
          Nombre completo
          <input required value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Empresa
          <select value={form.empresa_id} onChange={(e) => setForm({ ...form, empresa_id: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
            <option value="">—</option>
            {empresas.map((em) => <option key={em.id} value={em.id}>{em.razon_social}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Cargo
          <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
        </label>
      </form>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Cargo</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.nombre_completo}</td>
                <td className="px-4 py-3 text-white/70">{r.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{r.email ?? '—'}</td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <div className="p-6 text-center text-white/50">Sin contactos.</div>}
      </div>
    </div>
  )
}

function Badge({ text }) {
  const color = { activo: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', inactivo: 'bg-white/5 text-white/60 border-white/10', cambio_cargo: 'bg-amber-500/10 text-amber-300 border-amber-500/20' }[text] ?? 'bg-white/5 text-white/60 border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${color}`}>{text}</span>
}
