import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMapPoints } from "../hooks/useMapPoints";
import useMapStore from "../store/useMapStore";
import { useGeolocation } from "../hooks/useGeolocation";
import FilterBar from "../components/filters/FilterBar";
import PointDetailCard from "../components/map/PointDetailCard";
import MapClickPanel from "../components/map/MapClickPanel";
import WeatherWidget from "../components/map/WeatherWidget";
import { isInsideVenezuela } from "../utils/geoValidation";

const MapView = lazy(() => import("../components/map/MapView"));

const REPORT_ACTIONS = [
  {
    to: "/reportar/refugio",
    label: "Reportar refugio",
    tone: "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-500",
  },
  {
    to: "/reportar/hospital",
    label: "Reportar hospital",
    tone: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
  },
  {
    to: "/report-person",
    label: "Persona ingresada",
    tone: "bg-purple-50 text-purple-700 border-purple-100",
    dot: "bg-purple-500",
  },
  {
    to: "/reportar/falla-camino",
    label: "Vía bloqueada",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  {
    to: "/reportar/zona-peligrosa",
    label: "Zona peligrosa",
    tone: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
  {
    to: "/reportar/centro-acopio",
    label: "Centro de acopio",
    tone: "bg-teal-50 text-teal-700 border-teal-100",
    dot: "bg-teal-500",
  },
];

function LegendCard({ pointsCount, roadBlocksCount }) {
  return (
    <div className="refumap-glass hidden w-[27rem] rounded-3xl p-5 sm:block">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">
          Leyenda y estado
        </h3>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
          hace 5 min
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <b className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] shadow-sm">🏥</b>
          Hospitales
        </span>
        <span className="flex items-center gap-2">
          <b className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] shadow-sm">🏠</b>
          Refugios
        </span>
        <span className="flex items-center gap-2">
          <b className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-[11px] shadow-sm">📦</b>
          Acopio
        </span>
        <span className="flex items-center gap-2">
          <b className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-[11px] shadow-sm">⚠️</b>
          Peligro
        </span>
        <span className="flex items-center gap-2">
          <b className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-[11px] shadow-sm">🚧</b>
          Vías bloqueadas
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
        <div className="rounded-2xl bg-green-50 p-3 text-green-800">
          <b className="block text-sm">{pointsCount}</b>
          puntos publicados
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
          <b className="block text-sm">{roadBlocksCount}</b>
          bloqueos activos
        </div>
      </div>
    </div>
  );
}

function HelpCard() {
  return (
    <div className="hidden w-[280px] rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-200 lg:block dark:bg-slate-900 dark:ring-slate-800">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-black text-[#001b3c] dark:text-white leading-tight">
            ¿Necesitas ayuda?
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Guía rápida de 3 pasos
          </p>
        </div>
      </div>
      
      <div className="relative space-y-4 text-sm">
        {/* Línea conectora */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800" />
        
        <div className="relative flex gap-4">
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#001b3c] dark:text-white">
            1
          </span>
          <p className="pt-1.5 leading-snug">
            <b className="block text-[#001b3c] dark:text-white">Busca o explora</b>
            <span className="text-xs text-slate-500 dark:text-slate-400">Encuentra ayuda cerca.</span>
          </p>
        </div>
        <div className="relative flex gap-4">
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#001b3c] dark:text-white">
            2
          </span>
          <p className="pt-1.5 leading-snug">
            <b className="block text-[#001b3c] dark:text-white">Verifica información</b>
            <span className="text-xs text-slate-500 dark:text-slate-400">Confirma los detalles.</span>
          </p>
        </div>
        <div className="relative flex gap-4">
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#001b3c] dark:bg-blue-600 ring-4 ring-white dark:ring-slate-900 shadow-sm border border-[#001b3c] dark:border-blue-600 text-xs font-bold text-white">
            3
          </span>
          <p className="pt-1.5 leading-snug">
            <b className="block text-[#001b3c] dark:text-white">Reporta y comparte</b>
            <span className="text-xs text-slate-500 dark:text-slate-400">Ayuda a tu comunidad.</span>
          </p>
        </div>
      </div>
      
      <Link
        to="/"
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        Saber más
      </Link>
    </div>
  );
}

export default function MapPage() {
  const {
    categories,
    points,
    roadBlocks,
    isLoading,
    selectedPoint,
    isDetailOpen,
    mapInstance,
  } = useMapStore();
  const { selectPoint, closeDetail, setFilter } = useMapStore();
  const {
    location: userLocation,
    error: locationError,
    isLoading: isLocationLoading,
    getDistanceFromMe,
    getLocation,
  } = useGeolocation();
  const [searchValue, setSearchValue] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);

  const location = useLocation();

  useMapPoints();

  // Solicita la ubicación una sola vez para poder mostrar “Tu ubicación” si está dentro de Venezuela.
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Centrar mapa en hospital si venimos desde HospitalsPublicPage
  useEffect(() => {
    const focus = location.state?.focusHospital;
    if (focus && mapInstance && isInsideVenezuela(focus.lat, focus.lng)) {
      mapInstance.flyTo([Number(focus.lat), Number(focus.lng)], 16, {
        duration: 0.7,
      });
    }
  }, [location.state, mapInstance]);

  const distance = selectedPoint
    ? getDistanceFromMe(selectedPoint.latitude, selectedPoint.longitude)
    : null;
  const updatedLabel = useMemo(() => {
    return new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchValue(v);
    setFilter("search", v);
  };

  const executeMapSearch = async () => {
    if (!searchValue.trim() || !mapInstance) return;
    setIsSearchingMap(true);
    try {
      // Usamos el área actual del mapa para darle prioridad a los lugares cercanos (viewbox)
      const bounds = mapInstance.getBounds();
      const viewbox = `${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`;
      
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&countrycodes=ve&viewbox=${viewbox}&bounded=0&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, boundingbox } = data[0];
        if (boundingbox) {
          // Nominatim devuelve: [south, north, west, east]
          const [south, north, west, east] = boundingbox.map(Number);
          // Leaflet espera: [[south, west], [north, east]]
          mapInstance.flyToBounds([[south, west], [north, east]], { 
            duration: 1.5, 
            maxZoom: 17, 
            padding: [30, 30] 
          });
        } else {
          mapInstance.flyTo([Number(lat), Number(lon)], 16, { duration: 1.5 });
        }
      }
    } catch (err) {
      console.error("Error buscando ubicación:", err);
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeMapSearch();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-slate-100 font-sans text-slate-950">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-100">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm font-bold text-slate-500">
                Cargando mapa...
              </p>
            </div>
          }
        >
          <MapView
            onPointSelect={selectPoint}
            userLocation={userLocation}
            getDistanceFromMe={getDistanceFromMe}
          />
        </Suspense>

        {/* Header flotante responsive */}
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-[420] sm:left-5 sm:right-5 flex flex-col gap-3">
          <div className="refumap-glass pointer-events-auto rounded-[2rem] p-3 sm:px-6 sm:py-2.5 flex items-center justify-between bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4 flex-1">
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-700 text-xs font-black text-white shadow-md">
                  RM
                </span>
                <span className="hidden sm:block">
                  <b className="block text-[15px] font-black text-slate-900 leading-tight">
                    RefuMap Venezuela
                  </b>
                  <span className="block text-[10px] font-medium text-slate-500">
                    Red ciudadana de ayuda en emergencias
                  </span>
                </span>
              </Link>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="relative flex-1 max-w-md">
                <button 
                  onClick={executeMapSearch}
                  disabled={isSearchingMap}
                  className="absolute inset-y-0 left-3 sm:left-4 flex items-center text-slate-400 hover:text-blue-600 disabled:opacity-50 z-10"
                  aria-label="Buscar ubicación en el mapa"
                >
                  {isSearchingMap ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  <span className="ml-2 hidden text-xs font-bold sm:block">Buscar</span>
                </button>
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: Los Jardines, Caracas..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 text-[13px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:bg-white sm:pl-20 sm:pr-12"
                />
                <button
                  onClick={getLocation}
                  className="absolute inset-y-1.5 right-1.5 flex w-7 items-center justify-center rounded-full text-blue-600 hover:bg-slate-200 bg-blue-50"
                  type="button"
                  aria-label="Usar mi ubicación"
                  title={locationError || "Usar mi ubicación"}
                >
                  {isLocationLoading ? "…" : "◎"}
                </button>
              </div>
            </div>
            <div className="hidden items-center gap-1 md:flex shrink-0 ml-4">
              <Link
                to="/"
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                Cómo funciona
              </Link>
              <Link
                to="/reportar"
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                Reportes
              </Link>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                Acceder
              </Link>
            </div>
          </div>

          <div className="pointer-events-auto">
            <FilterBar categories={categories} />
          </div>
        </div>

        {/* Widget de Clima */}
        <div className="pointer-events-none absolute right-3 top-[7.5rem] z-[410] hidden sm:block sm:right-5 sm:top-28">
          <WeatherWidget />
        </div>

        {/* Controles del mapa */}
        <div className="absolute left-4 top-[17.5rem] z-[400] hidden flex-col gap-2 sm:flex">
          <button
            onClick={getLocation}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-md hover:bg-slate-50"
            type="button"
            title={locationError || "Usar mi ubicación"}
            aria-label="Usar mi ubicación"
          >
            {isLocationLoading ? "…" : "➤"}
          </button>
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <button
              onClick={() => mapInstance?.zoomIn()}
              className="flex h-11 w-11 items-center justify-center border-b border-slate-100 text-xl font-bold hover:bg-slate-50"
              type="button"
            >
              +
            </button>
            <button
              onClick={() => mapInstance?.zoomOut()}
              className="flex h-11 w-11 items-center justify-center text-xl font-bold hover:bg-slate-50"
              type="button"
            >
              −
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-24 left-4 right-4 z-[400] hidden items-end justify-between gap-4 sm:flex">
          <LegendCard
            pointsCount={points.length}
            roadBlocksCount={roadBlocks.length}
          />
          <div className="refumap-glass pointer-events-auto flex items-center gap-3 rounded-3xl px-4 py-3 text-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-600 text-white">
              ✓
            </span>
            <div>
              <b>Mapa actualizado</b>
              <p className="text-xs text-slate-500">{updatedLabel}</p>
            </div>
            <span className="mx-2 h-8 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-500">
              {isLoading ? "Actualizando..." : "En línea"}
            </span>
          </div>
          <HelpCard />
        </div>

        {/* Botón de ubicación en móvil */}
        <button
          onClick={getLocation}
          className="absolute left-4 bottom-[5.5rem] z-[520] flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg sm:hidden"
          type="button"
          title={locationError || "Usar mi ubicación"}
          aria-label="Usar mi ubicación"
        >
          {isLocationLoading ? "…" : "➤"}
        </button>

        {/* FAB Reportar */}
        <div
          className={`absolute right-4 z-[520] transition-all duration-300 sm:right-6 ${isDetailOpen ? "bottom-7 sm:bottom-36" : "bottom-[5.5rem] sm:bottom-7"}`}
        >
          {isFabOpen && (
            <div className="animate-slide-up absolute bottom-20 right-0 w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl sm:bottom-20">
              <div className="border-b border-slate-100 bg-slate-50 p-4">
                <h4 className="text-sm font-extrabold text-slate-900">
                  ¿Qué deseas reportar?
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Selecciona una acción rápida.
                </p>
              </div>
              <div className="grid gap-1 p-2">
                {REPORT_ACTIONS.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${action.tone}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${action.dot}`} />
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsFabOpen((v) => !v)}
            className="group flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-500 h-14 w-14 sm:h-16 sm:w-16 text-white shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_30px_rgba(220,38,38,0.5)] active:scale-95"
            type="button"
            aria-label="Abrir menú de reportes"
          >
            <span className={`text-3xl sm:text-4xl font-light transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`} style={{ lineHeight: '0', marginTop: '-2px' }}>
              +
            </span>
          </button>
        </div>

        {/* El panel inferior redundante ha sido eliminado para un diseño más limpio */}

        {/* Detalle de punto */}
        {isDetailOpen && selectedPoint && (
          <div className="absolute inset-x-2 bottom-24 z-[600] sm:inset-x-6 sm:bottom-6">
            <div className="relative mx-auto max-w-3xl">
              <button
                onClick={closeDetail}
                className="absolute -right-2 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-md hover:bg-slate-100"
                type="button"
              >
                ✕
              </button>
              <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                <PointDetailCard
                  point={selectedPoint}
                  distance={distance}
                  onClose={closeDetail}
                />
              </div>
            </div>
          </div>
        )}

        <MapClickPanel />
      </div>

      <nav className="pb-safe z-[700] flex h-[4.5rem] shrink-0 items-center justify-around border-t border-slate-100 bg-white/90 backdrop-blur px-2 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link
          to="/mapa"
          className="flex w-20 flex-col items-center gap-1 rounded-2xl bg-blue-50 py-1.5 text-blue-700 transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-bold">Mapa</span>
        </Link>
        <Link
          to="/reportar"
          className="flex w-20 flex-col items-center gap-1 py-1.5 text-slate-400 hover:text-slate-600 transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] font-bold">Reportes</span>
        </Link>
        <Link
          to="/"
          className="flex w-20 flex-col items-center gap-1 py-1.5 text-slate-400 hover:text-slate-600 transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-bold">Info</span>
        </Link>
      </nav>
    </div>
  );
}
