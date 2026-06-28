import React from 'react'

export function Card({ children, className = '', padding = 'p-6', ...props }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-border overflow-hidden ${className}`}
      {...props}
    >
      <div className={padding}>
        {children}
      </div>
    </div>
  )
}
