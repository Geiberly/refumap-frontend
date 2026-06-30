import React from 'react'

export function Textarea({ label, error, required, optional, hint, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-baseline">
          <label className="text-sm font-bold text-slate-700">
            {label} {required && <span className="text-danger ml-0.5">*</span>}
          </label>
          {optional && <span className="text-xs text-slate-500 font-normal">(opcional)</span>}
        </div>
      )}
      <textarea 
        className={`w-full px-4 py-3 min-h-[100px] bg-white border ${error ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg shadow-sm text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-y`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  )
}
