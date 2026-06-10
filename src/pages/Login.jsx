import { useState } from 'react'
import { useAuth } from '../contexts/auth'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message ?? 'Error al ingresar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight">AEGIS CRM</h1>
        <p className="text-white/60 text-sm mt-1">Ingresá con tu cuenta de la organización.</p>
        <div className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-white/60">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 outline-none focus:border-white/30"
              placeholder="tu@empresa.com"
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-white/60">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 outline-none focus:border-white/30"
              placeholder="••••••••"
              required
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-70"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  )
}
