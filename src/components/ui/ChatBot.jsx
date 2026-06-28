import React, { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../../api/mapPoints'

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente virtual de RefuMap. ¿En qué te puedo ayudar hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      scrollToBottom()
      if (navigator.geolocation && !coords) {
        navigator.geolocation.getCurrentPosition(
          (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (error) => console.log('Error de GPS:', error)
        )
      }
    }
  }, [messages, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await sendChatMessage(newMessages, coords)
      setMessages([...newMessages, { role: 'assistant', content: response.data.message }])
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Lo siento, tuve un problema para conectarme. Intenta de nuevo más tarde.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "¿Cuál es el refugio más cercano?",
    "¿Qué debo hacer en un sismo?",
    "¿Cuántos refugios activos hay?"
  ]

  const handleSuggestion = async (text) => {
    if (loading) return
    const userMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await sendChatMessage(newMessages, coords)
      setMessages([...newMessages, { role: 'assistant', content: response.data.message }])
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Lo siento, tuve un problema para conectarme. Intenta de nuevo más tarde.' }])
    } finally {
      setLoading(false)
    }
  }

  // Utilidad para procesar saltos de línea, negritas y cursivas
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      // Separar por **texto** y *texto*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g)
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={j} className="font-bold text-slate-800">{part.slice(1, -1)}</strong>
            }
            return part
          })}
          <br />
        </span>
      )
    })
  }

  return (
    <>
      {/* Botón flotante Premium */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-[92px] left-4 md:bottom-6 md:left-auto md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-2xl text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] ring-4 ring-white transition-all duration-300 hover:scale-110 hover:shadow-[0_10px_40px_rgba(79,70,229,0.5)] ${open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:-translate-y-1'}`}
      >
        <span className="drop-shadow-md">✨</span>
      </button>

      {/* Ventana de Chat Premium */}
      <div className={`fixed bottom-[92px] left-4 md:bottom-6 md:left-auto md:right-6 z-50 flex h-[500px] max-h-[70vh] w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/5 transition-all duration-300 origin-bottom-left md:origin-bottom-right ${open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}`}>
        
        {/* Header con gradiente */}
        <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/40 shadow-inner">
              <span className="text-xl">🤖</span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-indigo-600"></span>
            </div>
            <div>
              <h3 className="text-[15px] font-black tracking-tight drop-shadow-sm">Asistente RefuMap</h3>
              <p className="text-[11px] font-medium text-blue-100/90 flex items-center gap-1.5">
                Inteligencia Artificial Activa
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5 space-y-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20' 
                  : 'bg-white text-slate-700 ring-1 ring-slate-100 rounded-2xl rounded-tl-sm'
              }`}>
                {formatText(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="max-w-[85%] rounded-2xl px-5 py-3.5 text-sm bg-white ring-1 ring-slate-100 rounded-tl-sm flex items-center gap-1.5 h-11 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias Rápidas */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 px-4 pb-3 bg-slate-50/50">
            {suggestions.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(text)}
                className="text-left text-[12.5px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm border border-indigo-100/50 rounded-xl px-3.5 py-1.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white p-4 pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2 p-1 rounded-full bg-slate-100 ring-1 ring-slate-200/60 focus-within:ring-indigo-500/50 focus-within:bg-white transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame lo que necesites..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md transition-all disabled:opacity-0 disabled:scale-75 hover:scale-105 hover:shadow-indigo-500/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
