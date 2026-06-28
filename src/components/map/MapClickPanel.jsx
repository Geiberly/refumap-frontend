import React, { useState } from "react";
import useMapStore from "../../store/useMapStore";
import CreatePointFromMapForm from "./CreatePointFromMapForm";

import { useNavigate } from "react-router-dom";

const REPORT_TYPES = [
  { id: "refuge", label: "Refugio disponible", desc: "Lugar seguro recibiendo personas.", path: "/reportar/refugio", icon: "🏠", color: "text-blue-600", bg: "bg-blue-50", hover: "hover:border-blue-300 hover:shadow-blue-900/5", border: "border-blue-100" },
  { id: "hospital", label: "Hospital operativo", desc: "Centro de salud atendiendo.", path: "/reportar/hospital", icon: "🏥", color: "text-green-600", bg: "bg-green-50", hover: "hover:border-green-300 hover:shadow-green-900/5", border: "border-green-100" },
  { id: "supply", label: "Centro de acopio", desc: "Donaciones, comida o insumos.", path: "/reportar/acopio", icon: "📦", color: "text-orange-500", bg: "bg-orange-50", hover: "hover:border-orange-300 hover:shadow-orange-900/5", border: "border-orange-100" },
  { id: "danger", label: "Zona peligrosa", desc: "Riesgo, daño o derrumbe.", path: "/reportar/zona-peligrosa", icon: "⚠️", color: "text-red-500", bg: "bg-red-50", hover: "hover:border-red-300 hover:shadow-red-900/5", border: "border-red-100" },
  { id: "road", label: "Vía bloqueada", desc: "Calles o carreteras afectadas.", path: "/reportar/via-bloqueada", icon: "🚧", color: "text-slate-600", bg: "bg-slate-100", hover: "hover:border-slate-300 hover:shadow-slate-900/5", border: "border-slate-200" },
];

function formatCoordinate(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(5) : "--";
}

export default function MapClickPanel() {
  const { isMapClickPanelOpen, closeMapClickPanel, clickedLocation } = useMapStore();
  const navigate = useNavigate();

  if (!isMapClickPanelOpen) return null;

  const handleClose = () => {
    closeMapClickPanel();
  };

  const handleSelect = (type) => {
    closeMapClickPanel();
    if (type.id === "person" || !clickedLocation) {
      window.location.href = type.path;
    } else {
      window.location.href = `${type.path}?lat=${clickedLocation.lat}&lng=${clickedLocation.lng}`;
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-[600] animate-slide-up sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[23rem]">
      <div className="fixed inset-0 z-[-1] sm:hidden" onClick={handleClose} />

      <section className="flex max-h-[55vh] flex-col overflow-hidden rounded-t-[1.75rem] border border-slate-200 bg-white shadow-[0_-16px_40px_rgba(15,23,42,0.16)] sm:max-h-[76vh] sm:rounded-[1.75rem] sm:shadow-2xl">
        <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                Nuevo reporte
              </p>
              <h3 className="mt-0.5 text-base font-black text-slate-950">
                Selecciona qué agregar
              </h3>
              {clickedLocation && (
                <p className="text-[11px] font-semibold text-slate-500">
                  {formatCoordinate(clickedLocation.lat)}, {formatCoordinate(clickedLocation.lng)}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500 transition-colors hover:bg-slate-200"
              type="button"
              aria-label="Cerrar panel"
            >
              ×
            </button>
          </div>
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] leading-tight font-medium text-slate-500">
            Puedes hacer click en otra zona del mapa para corregir el punto.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50">
          <div className="grid grid-cols-1 gap-2.5">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type)}
                className={`flex items-center gap-3 p-3 rounded-2xl border bg-white shadow-sm transition-all text-left group ${type.border} ${type.hover}`}
              >
                <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-full ${type.bg} ${type.color} text-lg shadow-sm`}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-[14px] truncate">{type.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{type.desc}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-slate-500"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
