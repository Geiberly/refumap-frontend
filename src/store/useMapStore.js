import { create } from 'zustand'

const useMapStore = create((set, get) => ({
  // Estado del mapa
  points: [],
  roadBlocks: [],
  categories: [],
  selectedPoint: null,
  isLoading: false,
  isDetailOpen: false,
  mapInstance: null,
  
  // Nuevo: Reporte desde mapa
  clickedLocation: null,
  isMapClickPanelOpen: false,

  // Filtros activos
  filters: {
    type: '',
    status: '',
    search: '',
  },

  // Acciones
  setPoints: (points) => set({ points }),
  setRoadBlocks: (roadBlocks) => set({ roadBlocks }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setMapInstance: (map) => set({ mapInstance: map }),

  selectPoint: (point) => set({ selectedPoint: point, isDetailOpen: !!point, isMapClickPanelOpen: false, clickedLocation: null }),
  closeDetail: () => set({ selectedPoint: null, isDetailOpen: false }),

  // Acciones para Map Click
  setClickedLocation: (latlng) => set({ clickedLocation: latlng, isMapClickPanelOpen: !!latlng, isDetailOpen: false, selectedPoint: null }),
  closeMapClickPanel: () => set({ clickedLocation: null, isMapClickPanelOpen: false }),

  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),

  resetFilters: () => set({
    filters: {
      type: '',
      status: '',
      search: '',
    },
  }),

  // Construir params de API desde filtros activos
  getActiveFilters: () => {
    const { filters } = get()
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.search) params.search = filters.search
    return params
  },

  hasActiveFilters: () => {
    const { filters } = get()
    return !!(
      filters.type || filters.status || filters.search
    )
  },
}))

export default useMapStore
