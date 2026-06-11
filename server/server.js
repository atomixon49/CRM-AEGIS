import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const SYSTEM_PROMPT = `Eres AEGIS Assistant, un asistente comercial dentro del CRM AEGIS.
Tu objetivo es responder consultas del usuario y, cuando sea útil, ejecutar acciones concretas sobre su cuenta:
- consultar tablas relevantes (leads, contactos, empresas, negocios, tareas, campanas)
- responder con resúmenes claros, concisos y accionables
- mantener un tono_executivo, directo y en español
- si una operación no se puede completar por falta de datos, indícalo y propone la acción correcta`

const memory = new Map()

app.post('/ai/chat', async (req, res) => {
  try {
    const { session_id, message } = req.body || {}
    if (!session_id || !message) return res.status(400).json({ error: 'session_id and message are required' })

    const history = memory.get(session_id) || [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    history.push({ role: 'user', content: message })

    // Aca iria la llamada real al LLM.
    // Por ahora devolvemos una respuesta predefinida amigable para asegurar funcionamiento.
    const reply = `Recibido: "${message}". El backend del chat esta operativo.`

    history.push({ role: 'assistant', content: reply })
    memory.set(session_id, history)

    return res.json({ reply })
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
})

const PORT = process.env.PORT || 6543
app.listen(PORT, () => {
  console.log(`AI chat backend running on http://127.0.0.1:${PORT}`)
})
