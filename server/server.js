import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const memory = new Map()

function detectIntent(message) {
  const m = message.toLowerCase()
  if (/\b(leads?|empresas?|clientes?)\b/.test(m)) return 'leads'
  if (/\b(negocios?|ventas?|oportunidades?)\b/.test(m)) return 'negocios'
  if (/\b(tareas?|pendientes?|actividades?)\b/.test(m)) return 'tareas'
  if (/\b(campañas?|campaña|marketing)\b/.test(m)) return 'campanas'
  if (/\b(dashboard|resumen|estado|kpi)\b/.test(m)) return 'dashboard'
  return null
}

async function queryCRM(intent) {
  if (intent === 'dashboard') {
    const [{ count: leads }, { count: negocios }, { count: tareas }, { data: pipeData }] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('negocios').select('*', { count: 'exact', head: true }).eq('estado', 'abierto'),
      supabase.from('tareas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('negocios').select('valor, etapa'),
    ])
    const pipeline = (pipeData || []).reduce((acc, n) => acc + (Number(n.valor) || 0), 0)
    return `Resumen del CRM: ${leads ?? 0} leads, ${negocios ?? 0} negocios abiertos, ${tareas ?? 0} tareas pendientes. Pipeline estimado: $${pipeline.toLocaleString('es-CO')}.`
  }
  if (intent === 'leads') {
    const { data, error } = await supabase.from('empresas').select('razon_social, estado, created_at').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay leads registrados aún.'
    const lines = data.map((r, i) => `${i + 1}. ${r.razon_social} (${r.estado}) — ${new Date(r.created_at).toLocaleDateString('es-CO')}`)
    return 'Últimos leads:\n' + lines.join('\n')
  }
  if (intent === 'negocios') {
    const { data, error } = await supabase.from('negocios').select('titulo, valor, etapa, estado').eq('estado', 'abierto').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay negocios abiertos.'
    const lines = data.map((r, i) => `${i + 1}. ${r.titulo} — $${Number(r.valor).toLocaleString('es-CO')} (${r.etapa})`)
    return 'Negocios abiertos:\n' + lines.join('\n')
  }
  if (intent === 'tareas') {
    const { data, error } = await supabase.from('tareas').select('titulo, estado, fecha_vencimiento').eq('estado', 'pendiente').order('fecha_vencimiento', { ascending: true }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay tareas pendientes.'
    const lines = data.map((r, i) => `${i + 1}. ${r.titulo} — vence ${r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString('es-CO') : 'sin fecha'}`)
    return 'Tareas pendientes:\n' + lines.join('\n')
  }
  if (intent === 'campanas') {
    const { data, error } = await supabase.from('campanas').select('nombre, tipo, estado').order('created_at', { ascending: false }).limit(5)
    if (error) throw error
    if (!data.length) return 'No hay campañas registradas.'
    const lines = data.map((r, i) => `${i + 1}. ${r.nombre} (${r.tipo}) — ${r.estado}`)
    return 'Campañas:\n' + lines.join('\n')
  }
  return null
}

app.post('/ai/chat', async (req, res) => {
  try {
    const { session_id, message } = req.body || {}
    if (!session_id || !message) return res.status(400).json({ error: 'session_id and message are required' })

    const history = memory.get(session_id) || []
    history.push({ role: 'user', content: message })

    const intent = detectIntent(message)
    const reply = await queryCRM(intent) || 'Podés consultarme por leads, negocios, tareas, campañas o dashboard. Ejemplo: "¿cuántos leads hay?" o "dame el resumen"'

    history.push({ role: 'assistant', content: reply })
    if (history.length > 40) memory.set(session_id, history.slice(-40))
    else memory.set(session_id, history)

    return res.json({ reply })
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
})

const PORT = parseInt(process.env.PORT || '8080', 10)
app.listen(PORT, () => {
  console.log(`AI chat backend running on http://127.0.0.1:${PORT}`)
})
