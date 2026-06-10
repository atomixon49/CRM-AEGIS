import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import Leads from './pages/Leads'
import Contactos from './pages/Contactos'
import Negocios from './pages/Negocios'
import Tareas from './pages/Tareas'
import Campanas from './pages/Campanas'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="contactos" element={<Contactos />} />
          <Route path="negocios" element={<Negocios />} />
          <Route path="tareas" element={<Tareas />} />
          <Route path="campanas" element={<Campanas />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
