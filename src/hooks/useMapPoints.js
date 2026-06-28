import { useEffect } from 'react'
import { getMapPoints, getCategories, getRoadBlocks } from '../api/mapPoints'
import useMapStore from '../store/useMapStore'

export function useMapPoints() {
  const { setPoints, setCategories, setRoadBlocks, setLoading, getActiveFilters } = useMapStore()
  const filters = useMapStore((s) => s.filters)

  const loadCategories = async () => {
    try {
      const { data } = await getCategories()
      setCategories(data.data || [])
    } catch (e) {
      console.error('Error cargando categorías:', e)
    }
  }

  const loadRoadBlocks = async () => {
    try {
      const { data } = await getRoadBlocks()
      setRoadBlocks(data.data || [])
    } catch (e) {
      console.error('Error cargando bloqueos:', e)
    }
  }

  const loadPoints = async () => {
    setLoading(true)
    try {
      const activeFilters = getActiveFilters()
      const { data } = await getMapPoints(activeFilters)
      setPoints(data.data || [])
    } catch (e) {
      console.error('Error cargando puntos:', e)
    } finally {
      setLoading(false)
    }
  }

  // Cargar puntos cuando cambian los filtros
  useEffect(() => {
    loadPoints()
  }, [JSON.stringify(filters)])

  // Cargar categorías y bloqueos una sola vez
  useEffect(() => {
    loadCategories()
    loadRoadBlocks()
  }, [])

  return { loadPoints, loadCategories }
}
