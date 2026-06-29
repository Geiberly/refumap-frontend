import React from "react";
import useMapStore from "../../store/useMapStore";

const QUICK_FILTERS = [
  { key: "category", value: "refugio", label: "Refugio", tone: "green" },
  { key: "category", value: "hospital", label: "Hospital", tone: "blue" },
  { key: "category", value: "centro-acopio", label: "Acopio", tone: "purple" },
  { key: "category", value: "zona-peligrosa", label: "Zona peligrosa", tone: "red" },
  { key: "category", value: "via-bloqueada", label: "Vía bloqueada", tone: "amber" },
];

const ACTIVE_STYLES = {
  green: "bg-green-600 border-green-600 text-white shadow-md shadow-green-900/10",
  blue: "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-900/10",
  amber: "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-900/10",
  red: "bg-red-600 border-red-600 text-white shadow-md shadow-red-900/10",
  purple: "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-900/10",
  slate: "bg-slate-700 border-slate-700 text-white shadow-md shadow-slate-900/10",
};

const DOT_STYLES = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  slate: "bg-slate-500",
};

export default function FilterBar() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useMapStore();

  const isFilterActive = (filter) => filters[filter.key] === filter.value;

  const toggleFilter = (filter) => {
    setFilter(filter.key, filters[filter.key] === filter.value ? "" : filter.value);
  };

  const activeCount = QUICK_FILTERS.filter(isFilterActive).length;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {hasActiveFilters() && (
        <button
          onClick={resetFilters}
          className="shrink-0 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white shadow-md active:scale-95"
          type="button"
        >
          Limpiar ({activeCount})
        </button>
      )}

      {QUICK_FILTERS.map((filter) => {
        const active = isFilterActive(filter);
        return (
          <button
            key={`${filter.key}-${filter.value}`}
            onClick={() => toggleFilter(filter)}
            className={`
              flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold tracking-tight transition active:scale-95 sm:text-sm
              ${active ? ACTIVE_STYLES[filter.tone] : "border-slate-200 bg-white/95 text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"}
            `}
            aria-pressed={active}
            type="button"
          >
            <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : DOT_STYLES[filter.tone]}`} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
