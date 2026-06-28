import React from 'react'
import { Button } from './Button'
import { Link } from 'react-router-dom'

export function EmptyState({ icon = '🔍', title, description, actionText, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-8 max-w-sm">{description}</p>
      
      {actionText && actionTo && (
        <Link to={actionTo} className="w-full sm:w-auto">
          <Button variant="primary" fullWidth>{actionText}</Button>
        </Link>
      )}
    </div>
  )
}
