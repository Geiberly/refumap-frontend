import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 mb-8">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mb-6">Políticas de Privacidad</h1>
        <p className="text-slate-500 mb-8 font-medium">Última actualización: Junio de 2026</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            RefuMap es una plataforma humanitaria creada con el único fin de ayudar a la población venezolana durante el estado de emergencia ocasionado por los eventos naturales recientes. Al usar nuestra plataforma, aceptas estas políticas.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Información que recopilamos</h2>
          <p>
            Recopilamos información proporcionada voluntariamente por los ciudadanos y hospitales, que puede incluir: nombres, números de cédula, ubicación de incidentes, e información básica de contacto para los reportes.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Uso de la información</h2>
          <p>
            Toda la información recolectada se utiliza <strong>exclusivamente para fines humanitarios</strong>: localizar a personas desaparecidas o ingresadas, ubicar centros de acopio y advertir sobre zonas de peligro. Los datos no serán vendidos, alquilados ni utilizados para fines comerciales o políticos bajo ninguna circunstancia.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Visibilidad pública</h2>
          <p>
            Ten en cuenta que la información reportada (como el estado de personas ingresadas y ubicaciones de refugios) será visible públicamente para que otros familiares y ciudadanos puedan acceder a ella de forma rápida y sin barreras. Te sugerimos no publicar información sensible que no sea estrictamente necesaria para la localización.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Seguridad y Retención</h2>
          <p>
            Hacemos nuestro mayor esfuerzo por mantener la plataforma segura. Una vez que la emergencia sea oficialmente declarada como finalizada y la plataforma deje de ser necesaria, la base de datos de personas será eliminada de nuestros servidores de forma permanente para proteger la privacidad de todos los involucrados.
          </p>
        </div>
      </div>
    </div>
  )
}
