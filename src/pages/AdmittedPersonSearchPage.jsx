import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAdmittedPeople } from '../api/admittedPeople'

export default function AdmittedPersonSearchPage() {
  const location = useLocation()
  const prefilledHospitalName = location.state?.prefilledHospitalName || ''

  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')
  const [selectedHospital, setSelectedHospital] = useState(prefilledHospitalName)
  const [loading, setLoading] = useState(true)

  const fetchPeople = async (query = '') => {
    setLoading(true)
    try {
      const { data } = await getAdmittedPeople(query)
      setPeople(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPeople(search)
  }

  const getStatusBadge = (status) => {
    const badges = {
      'ingresada': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', borderLeft: 'border-l-amber-500', label: 'Ingresada' },
      'en_observacion': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', borderLeft: 'border-l-blue-500', label: 'En Observación' },
      'trasladada': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', borderLeft: 'border-l-purple-500', label: 'Trasladada' },
      'dada_de_alta': { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20', borderLeft: 'border-l-[#10b981]', label: 'Dada de Alta' },
      'sin_identificar': { bg: 'bg-[#cb161d]/10', text: 'text-[#cb161d]', border: 'border-[#cb161d]/20', borderLeft: 'border-l-[#cb161d]', label: 'Sin Identificar' },
    }
    const b = badges[status] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', borderLeft: 'border-l-slate-400', label: status }
    return {
      element: (
        <span className={`px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide uppercase border ${b.bg} ${b.text} ${b.border}`}>
          {b.label}
        </span>
      ),
      borderLeft: b.borderLeft
    }
  }

  // Extraer hospitales únicos para el filtro
  const uniqueHospitals = useMemo(() => {
    const hospitals = new Set()
    if (prefilledHospitalName) hospitals.add(prefilledHospitalName)
    people.forEach(p => {
      const hName = p.hospital?.name || p.hospital_name_snapshot
      if (hName) hospitals.add(hName)
    })
    return Array.from(hospitals).sort()
  }, [people, prefilledHospitalName])

  // Aplicar filtro local de hospital
  const filteredPeople = useMemo(() => {
    if (!selectedHospital) return people
    return people.filter(p => {
      const hName = p.hospital?.name || p.hospital_name_snapshot
      return hName === selectedHospital
    })
  }, [people, selectedHospital])

  return (
    <div className="min-h-screen bg-slate-100 pb-12 font-sans text-slate-900">
      {/* Header estilo HomePage */}
      <div className="bg-[#001b3c] px-4 pt-12 pb-20 sm:px-6 sm:pt-14 sm:pb-24 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-[#0b63f6]/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        {/* Botón Volver (Esquina superior izquierda) */}
        <Link to="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black text-[#001b3c] shadow-lg hover:bg-slate-50 transition-all hover:scale-105">
          ← Inicio
        </Link>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b63f6] to-blue-800 text-2xl shadow-lg ring-1 ring-white/10 mt-6 sm:mt-0">
            🔍
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-black text-white tracking-tight">
            Buscador de <span className="text-[#0b63f6] bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-[#0b63f6]">Personas</span>
          </h1>
          <p className="max-w-xl text-blue-100/70 text-sm sm:text-base font-medium">
            Localiza rápidamente a familiares o conocidos ingresados en centros de salud.
          </p>
        </div>
      </div>

      {/* Buscador Unificado */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-10 z-20 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center bg-white rounded-3xl sm:rounded-full p-1.5 shadow-xl shadow-slate-200/60 border border-slate-200 gap-2 sm:gap-0">
          <div className="flex-1 flex items-center px-4 w-full h-12 bg-slate-50 sm:bg-transparent rounded-full sm:rounded-none">
            <span className="text-lg mr-2 opacity-50">👤</span>
            <input 
              type="text"
              placeholder="Buscar por nombre, cédula, apodo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-bold text-sm"
            />
          </div>
          
          <div className="w-full h-px sm:w-px sm:h-8 bg-slate-200 mx-1 hidden sm:block"></div>
          
          <div className="w-full sm:w-64 flex items-center px-4 h-12 bg-slate-50 sm:bg-transparent rounded-full sm:rounded-none relative">
            <span className="text-lg mr-2 opacity-50">🏥</span>
            <select 
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-slate-700 font-bold text-sm cursor-pointer appearance-none"
            >
              <option value="">Todos los hospitales</option>
              {uniqueHospitals.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
          
          <button type="submit" className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#0b63f6] hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/30 transition-all active:scale-95 shrink-0">
            Buscar
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          Resultados <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs">{filteredPeople.length}</span>
        </h3>
        <Link to="/report-person">
          <button className="flex items-center gap-2 rounded-full bg-[#001b3c] px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-900 transition-all">
            + Reportar Ingreso
          </button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-slate-200 shadow-sm animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center">
            <div className="text-4xl mb-4 opacity-80">🔍</div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Escribe un nombre, apodo o cédula y dale buscar</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">La información proviene de reportes ciudadanos y hospitales. Así podemos buscar en nuestra base de datos para ayudarte a localizar a esa persona.</p>
            <Link to="/report-person">
              <button className="rounded-full bg-[#001b3c] px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-900 transition-all">
                Reportar persona ingresada
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPeople.map(person => {
              const initials = person.full_name.substring(0, 2).toUpperCase()
              const statusData = getStatusBadge(person.status_general)
              
              return (
                <div key={person.id} className={`bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg shadow-slate-200/50 transition-all p-4 sm:p-5 group border-l-[6px] ${statusData.borderLeft}`}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                      {initials}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 min-w-0">
                        <h3 className="font-black text-slate-900 text-lg break-words pr-4 leading-tight">{person.full_name}</h3>
                        <div className="self-start mt-1 sm:mt-0 shrink-0">{statusData.element}</div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3 font-medium">
                        {person.cedula && <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-300"></div><strong className="text-slate-700">C.I:</strong> {person.cedula}</span>}
                        {person.alias && <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-300"></div><strong className="text-slate-700">Apodo:</strong> <span className="break-words">{person.alias}</span></span>}
                        {person.approx_age && <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-300"></div><strong className="text-slate-700">Edad:</strong> {person.approx_age}</span>}
                        {person.sex && <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-300"></div><strong className="text-slate-700">Sexo:</strong> {person.sex}</span>}
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200/60 w-full overflow-hidden">
                        <div className="flex items-center gap-2 font-bold text-slate-800 mb-1 text-sm">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs shrink-0">🏥</div>
                          <span className="truncate">{person.hospital?.name || person.hospital_name_snapshot || 'Hospital no especificado'}</span>
                        </div>
                        {person.admitted_at && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium ml-8">
                            Ingreso: {new Date(person.admitted_at).toLocaleString('es-VE', { dateStyle: 'long', timeStyle: 'short' })}
                          </div>
                        )}
                        {person.public_notes && (
                          <div className="mt-2.5 ml-8">
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic shadow-sm break-words">
                              "{person.public_notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
