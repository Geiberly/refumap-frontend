import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 mb-8">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mb-6">Términos de Uso</h1>
        <p className="text-slate-500 mb-8 font-medium">Última actualización: Junio de 2026</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Bienvenido a RefuMap. Esta plataforma es un esfuerzo ciudadano y colaborativo, construido para facilitar la comunicación y el apoyo mutuo en tiempos de crisis.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Naturaleza de la información</h2>
          <p>
            <strong>Toda la información publicada en RefuMap es proveída por terceros</strong> (ciudadanos, voluntarios, y personal de salud). Aunque nuestro equipo de operadores hace su mejor esfuerzo por moderar y verificar la información, no podemos garantizar la exactitud, veracidad al 100% o actualización en tiempo real de todos los datos.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Responsabilidad del usuario</h2>
          <p>
            Al usar esta plataforma, te comprometes a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Publicar únicamente información real, verificada por ti mismo o por fuentes de absoluta confianza.</li>
            <li>No utilizar la plataforma para difundir rumores, noticias falsas o crear pánico.</li>
            <li>Abstenerte de usar lenguaje ofensivo o publicar contenido inapropiado.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Limitación de responsabilidad</h2>
          <p>
            El equipo desarrollador de RefuMap no se hace responsable por daños directos o indirectos que puedan surgir a partir del uso de la información aquí proporcionada. Instamos a los usuarios a confirmar las direcciones, estados de vías y disponibilidad de recursos mediante canales oficiales antes de realizar desplazamientos que involucren riesgo personal.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Moderación</h2>
          <p>
            Nos reservamos el derecho de editar, ocultar o eliminar cualquier reporte, noticia o dato que consideremos falso, duplicado o que incumpla estos términos, sin previo aviso.
          </p>
        </div>
      </div>
    </div>
  )
}
