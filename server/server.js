import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const useHermes = String(process.env.HERMES_ENABLED || 'false').toLowerCase() === 'true'
const memory = new Map()
const history = new Map()

async function callHermes(sessionId, message) {
  const base = (process.env.HERMES_BASE_URL || 'http://127.0.0.1:8642').replace(/\/$/, '')
  const apiKey = process.env.HERMES_API_KEY
  const url = `${base}/v1/chat/completions`

  const sessionHistory = history.get(sessionId) || []
  const messages = [
    { role: 'system', content: 'Eres AEGIS Assistant, un asistente comercial. Responde en español, directo y accionable.' },
    ...sessionHistory,
    { role: 'user', content: message }
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model: 'hermes-agent',
      messages,
      stream: false
    }),
    signal: AbortSignal.timeout(45000)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Hermes error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('Respuesta vacía')

  sessionHistory.push({ role: 'user', content: message }, { role: 'assistant', content: reply })
  if (sessionHistory.length > 40) history.set(sessionId, sessionHistory.slice(-40))
  else history.set(sessionId, sessionHistory)

  return reply
}

app.post('/ai/chat', async (req, res) => {
  try {
    const { session_id, message } = req.body || {}
    if (!session_id || !message) return res.status(400).json({ error: 'session_id and message are required' })

    if (useHermes) {
      const reply = await callHermes(session_id, message)
      return res.json({ reply })
    }

    memory.get(session_id)?.push({ role: 'user', content: message })
    const crmData = await queryCRM(message)
    const reply = crmData || 'No entendí la consulta. Proba con: "resumen", "leads", "negocios", "tareas" o "campañas".'
    memory.get(session_id)?.push({ role: 'assistant', content: reply })
    return res.json({ reply })
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
})

async function queryCRM(message) {
  const m = message.toLowerCase()
  if (/\b(dashboard|resumen|estado|kpi)\b/.test(m)) {
    const [{ count: leads }, { count: negocios }, { count: tareas }, { data: pipeData }] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('negocios').select('*', { count: 'exact', head: true }).eq('estado', 'abierto'),
      supabase.from('tareas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('negocios').select('valor, etapa')
    ])
    const pipeline = (pipeData || []).reduce((acc, n) => acc + (Number(n.valor) || 0), 0)
    return `Resumen del CRM: ${leads ?? 0} leads, ${negocios ?? 0} negocios abiertos, ${tareas ?? 0} tareas pendientes. Pipeline estimado: $${pipeline.toLocaleString('es-CO')}.`
  }
  if (/\b(leads?|empresas?|clientes?)\b/.test(m)) {
    const { data, error } = await supabase.from('empresas').select('razon_social, estado, created_at').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay leads registrados aún.'
    const lines = data.map((r, i) => `${i + 1}. ${r.razon_social} (${r.estado}) — ${new Date(r.created_at).toLocaleDateString('es-CO')}`)
    return 'Últimos leads:\n' + lines.join('\n')
  }
  if (/\b(negocios?|ventas?|oportunidades?)\b/.test(m)) {
    const { data, error } = await supabase.from('negocios').select('titulo, valor, etapa, estado').eq('estado', 'abierto').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay negocios abiertos.'
    const lines = data.map((r, i) => `${i + 1}. ${r.titulo} — $${Number(r.valor).toLocaleString('es-CO')} (${r.etapa})`)
    return 'Negocios abiertos:\n' + lines.join('\n')
  }
  if (/\b(tareas?|pendientes?|actividades?)\b/.test(m)) {
    const { data, error } = await supabase.from('tareas').select('titulo, estado, fecha_vencimiento').eq('estado', 'pendiente').order('fecha_vencimiento', { ascending: true }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay tareas pendientes.'
    const lines = data.map((r, i) => `${i + 1}. ${r.titulo} — vence ${r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString('es-CO') : 'sin fecha'}`)
    return 'Tareas pendientes:\n' + lines.join('\n')
  }
  if (/\b(campañas?|campaña|marketing)\b/.test(m)) {
    const { data, error } = await supabase.from('campanas').select('nombre, tipo, estado').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay campañas registradas.'
    const lines = data.map((r, i) => `${i + 1}. ${r.nombre} (${r.tipo}) — ${r.estado}`)
    return 'Campañas:\n' + lines.join('\n')
  }
  return null
}

const PORT = parseInt(process.env.PORT || '8080', 10)
app.listen(PORT, () => console.log(`AI chat backend running on http://127.0.0.1:${PORT}`))
