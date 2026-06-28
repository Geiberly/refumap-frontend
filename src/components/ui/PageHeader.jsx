import React from 'react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, description, backTo = '/', icon, color = 'bg-blue-600 text-white' }) {
  return (
    <div className={`relative overflow-hidden px-4 py-6 text-white shadow-sm sm:px-6 sm:py-8 ${color}`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        {backTo && (
          <Link to={backTo} className="mb-5 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/90 hover:bg-white/20">
            ← Volver
          </Link>
        )}
        {icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-3xl shadow-inner backdrop-blur-sm">
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-white/90 sm:text-base">{description}</p>}
      </div>
    </div>
  )
}
