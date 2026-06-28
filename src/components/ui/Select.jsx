import React from 'react'

export function Select({ label, error, required, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select 
        className={`w-full px-4 py-2.5 min-h-[44px] bg-white border ${error ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg shadow-sm text-base text-slate-900 focus:outline-none focus:ring-4 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat pr-10`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  )
}
