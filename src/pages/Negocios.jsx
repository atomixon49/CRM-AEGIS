import { useEffect, useState } from 'react'

export default function Negocios() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ titulo: '', valor: '', empresa_id: '', etapa_id: '', responsable_id: '', estado: 'abierto' })
  const [empresas, setEmpresas] = useState([])
  const [usuarios, setUsuarios] = useState([])

  async function load() {
    setError('')
    try {
      const [nRes, eRes, uRes] = await Promise.all([
        fetch('/api/negocios').then(r => r.json()),
        fetch('/api/empresas').then(r => r.json()),
        fetch('/api/usuarios').then(r => r.json()),
      ])
      setRows(Array.isArray(nRes) ? nRes : [])
      setEmpresas(Array.isArray(eRes) ? eRes : [])
      setUsuarios(Array.isArray(uRes) ? uRes : [])
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      const body = { ...form, valor: form.valor ? Number(form.valor) : null };
      if (!body.empresa_id) delete body.empresa_id;
      if (!body.etapa_id) delete body.etapa_id;
      if (!body.responsable_id) delete body.responsable_id;
      const res = await fetch('/api/negocios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('No se pudo crear el negocio')
      setForm({ titulo: '', valor: '', empresa_id: empresas[0]?.id ?? '', etapa_id: '', responsable_id: '', estado: 'abierto' })
      load()
    } catch (e) { setError(e.message) }
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
            Valor
            <input value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3" />
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Empresa
            <select value={form.empresa_id} onChange={e => setForm({ ...form, empresa_id: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              <option value="">—</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white/70">
            Responsable
            <select value={form.responsable_id} onChange={e => setForm({ ...form, responsable_id: e.target.value })} className="h-9 rounded-lg border border-white/10 bg-black/20 px-3">
              <option value="">—</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-black">Guardar</button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Título</th>
              <th className="px-4 py-3 text-left font-medium">Valor</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.titulo}</td>
                <td className="px-4 py-3 text-white/70">{r.valor ? `$${Number(r.valor).toLocaleString('es-CO')}` : '—'}</td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-6 text-center text-white/50">Sin negocios.</div>}
      </div>
    </div>
  )
}
