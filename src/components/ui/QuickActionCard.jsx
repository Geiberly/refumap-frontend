import React from 'react'
import { Link } from 'react-router-dom'

export function QuickActionCard({ to, icon, title, description, colorClass }) {
  return (
    <Link 
      to={to} 
      className={`group relative flex items-start gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${colorClass.split(' ')[0]}`} />
      
      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-2xl ${colorClass}`}>
        {icon}
      </div>
      
      <div className="flex-1 pt-1">
        <h3 className="font-bold text-slate-900 text-[1.1rem] leading-tight mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 leading-snug">
            {description}
          </p>
        )}
      </div>
      
      <div className="text-slate-300 self-center group-hover:text-primary group-hover:translate-x-1 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </Link>
  )
}
