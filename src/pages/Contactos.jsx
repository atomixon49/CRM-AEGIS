import { useEffect, useState } from 'react'

export default function Contactos() {
  const [rows, setRows] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ empresa_id: '', nombre_completo: '', cargo: '', email: '', telefono_celular: '', ciudad: '', estado: 'activo' })
  const [creating, setCreating] = useState(false)

  async function load() {
    setError('')
    try {
      const [pRes, eRes] = await Promise.all([
        fetch('/api/personas').then(r => r.json()),
        fetch('/api/empresas').then(r => r.json())
      ])
      setRows(Array.isArray(pRes) ? pRes : [])
      setEmpresas(Array.isArray(eRes) ? eRes : [])
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const body = { ...form };
      if (!body.empresa_id) delete body.empresa_id;
      const res = await fetch('/api/personas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('No se pudo crear el contacto')
      setForm({ empresa_id: empresas[0]?.id ?? '', nombre_completo: '', cargo: '', email: '', telefono_celular: '', ciudad: '', estado: 'activo' })
      load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  return (
    <div>
      <form onSubmit={create} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="grid gap-1 text-sm text-white/70">
            Nombre completo
            <input required value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Empresa
            <select value={form.empresa_id} onChange={e => setForm({ ...form, empresa_id: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              <option value="">—</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Cargo
            <input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Email
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Celular
            <input value={form.telefono_celular} onChange={e => setForm({ ...form, telefono_celular: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Ciudad
            <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button type="submit" disabled={creating} className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black disabled:opacity-70">Guardar</button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Cargo</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Celular</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.nombre_completo}</td>
                <td className="px-4 py-3 text-white/70">{r.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{r.email ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{r.telefono_celular ?? '—'}</td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-6 text-center text-white/50">Sin contactos.</div>}
      </div>
    </div>
  )
}
