export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
    }

    const { session_id, message } = body || {}
    if (!session_id || !message) {
      return new Response(JSON.stringify({ error: 'session_id and message are required' }), { status: 400 })
    }

    const apiKey = env.AEGIS_AI_API_KEY || env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing AI key in Worker env' }), { status: 500 })
    }

    const systemPrompt = `Eres AEGIS Assistant, un asistente comercial dentro del CRM AEGIS.
Tu objetivo es responder consultas del usuario sobre leads, negocios, tareas y campañas.
Responde siempre en español, con tono ejecutivo, directo y accionable.
Si una operación no se puede completar, indícalo claramente.`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: `AI provider error ${res.status}: ${String(text).slice(0, 200)}` }), { status: 502 })
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return new Response(JSON.stringify({ error: 'Empty AI reply' }), { status: 502 })
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  },
}
