import React from 'react'

export function CheckboxPill({ label, checked, onChange, icon, name, value }) {
  return (
    <label className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer border text-sm font-medium transition-all select-none
      ${checked 
        ? 'bg-blue-50 text-primary border-primary ring-2 ring-primary/20' 
        : 'bg-white text-slate-700 border-border hover:bg-slate-50'
      }
    `}>
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={onChange}
        name={name}
        value={value}
      />
      {icon && <span>{icon}</span>}
      {label}
    </label>
  )
}
