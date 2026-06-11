import { useEffect, useRef, useState } from 'react'

const HISTORY_KEY = 'aegis_ai_chat_history'

async function sendAI(sessionId, text) {
  const base = import.meta.env.VITE_AI_CHAT_URL || 'http://127.0.0.1:6543/ai/chat'
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message: text }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  const data = await res.json()
  return data.reply
}

export default function Asistente() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return saved ? JSON.parse(saved) : [
        { role: 'assistant', content: 'Hola, soy AEGIS. Te ayudo con consultas de clientes, seguimientos, pipeline o datos del CRM.' },
      ]
    } catch {
      return [{ role: 'assistant', content: 'Hola, soy AEGIS. Te ayudo con consultas de clientes, seguimientos, pipeline o datos del CRM.' }]
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
  const listRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const reply = await sendAI(sessionId, text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Ocurrió un error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-800/80 backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/30">AI</div>
          <div>
            <div className="text-sm font-semibold">Asistente comercial AEGIS</div>
            <div className="text-xs text-white/40">Consultas sobre leads, negocios, tareas y campañas.</div>
          </div>
        </div>

        <div ref={listRef} className="p-6 h-[500px] overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-white/60">
                Pensando...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => { e.preventDefault(); send() }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta sobre el CRM..."
              className="input flex-1"
            />
            <button type="submit" disabled={loading} className="btn btn-primary">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  )
}
