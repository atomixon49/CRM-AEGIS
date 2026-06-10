import { createContext, useContext, useEffect, useState } from 'react'
import { getSession, signOut, signIn } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then((s) => { setSession(s); setLoading(false) })
  }, [])

  async function login(email, password) {
    const data = await signIn(email, password)
    setSession(data.session)
  }

  async function logout() {
    await signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
