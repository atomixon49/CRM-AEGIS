import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

const ALLOWED_USERS = [
  { email: 'admin@aegis.local', password: 'admin123', label: 'Admin' },
  { email: 'gerente@aegis.local', password: 'gerente123', label: 'Gerente' },
  { email: 'vendedor@aegis.local', password: 'vendedor123', label: 'Vendedor' }
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
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
      navigate('/', { replace: true })
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Credenciales inválidas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md mt-[-10vh] space-y-4 rounded-2xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">AEGIS CRM</h1>
          <p className="text-sm text-gray-500">Ingresá con tu cuenta autorizada</p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-black py-2 font-medium text-white hover:bg-black/90 disabled:opacity-70">Ingresar</button>
      </form>
    </div>
  )
}
