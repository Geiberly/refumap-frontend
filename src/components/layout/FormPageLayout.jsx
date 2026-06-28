import React from 'react'

export function FormPageLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950">
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 sm:pb-14">
        <div className="mb-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-900/20">🗺️</span>
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-950">RefuMap Venezuela</h1>
              <p className="text-xs font-medium text-slate-500">Red ciudadana de ayuda en emergencias.</p>
            </div>
          </div>
          {title && (
            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">FORM SYSTEM – {title}</p>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/60 sm:p-7 lg:p-8">
          <div className="mb-6 grid gap-3 rounded-3xl border border-green-100 bg-green-50 p-4 text-sm text-green-800 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white">✓</span>
            <div>
              <b>Tu reporte ayuda a salvar vidas</b>
              <p className="text-xs font-medium text-green-700/80">La información será revisada y tus datos privados no se publicarán.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-green-700">Seguro</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
