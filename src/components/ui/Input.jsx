import React from 'react'

export function Input({ label, error, required, icon, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input 
          className={`
            w-full py-2.5 min-h-[44px] bg-white border rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all
            ${error ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20'}
            ${icon ? 'pl-10 pr-4' : 'px-4'}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}
