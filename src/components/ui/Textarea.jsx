import React from 'react'

export function Textarea({ label, error, required, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea 
        className={`w-full px-4 py-3 min-h-[100px] bg-white border ${error ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg shadow-sm text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-y`}
        {...props}
      />
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  )
}
