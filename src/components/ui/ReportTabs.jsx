import React from 'react'
import { Link } from 'react-router-dom'

const TABS = [
  { id: 'refugio', label: 'Refugio', icon: '🏠', to: '/reportar/refugio', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-[#1a2b4c] hover:bg-slate-50' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', to: '/reportar/hospital', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-slate-600 hover:bg-slate-50' },
  { id: 'persona', label: 'Persona', icon: '👤', to: '/report-person', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-slate-600 hover:bg-slate-50' },
  { id: 'via', label: 'Vía', icon: '🚧', to: '/reportar/falla-camino', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-slate-600 hover:bg-slate-50' },
  { id: 'peligro', label: 'Peligro', icon: '⚠️', to: '/reportar/zona-peligrosa', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-slate-600 hover:bg-slate-50' },
  { id: 'acopio', label: 'Acopio', icon: '📦', to: '/reportar/centro-acopio', activeColor: 'bg-[#1a2b4c] text-white', defaultColor: 'text-slate-600 hover:bg-slate-50' },
]

export function ReportTabs({ activeTab }) {
  return (
    <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-100 sm:border-b-0 pb-2 sm:pb-0 mb-6">
      <div className="flex sm:w-full gap-2 sm:gap-0 bg-white sm:bg-slate-50 sm:p-1 sm:rounded-xl">
        {TABS.map(tab => {
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              to={tab.to}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-full sm:rounded-lg text-sm font-bold transition-colors whitespace-nowrap sm:flex-1
                ${isActive ? tab.activeColor + ' shadow-sm' : tab.defaultColor + ' border border-slate-200 sm:border-0'}
              `}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
