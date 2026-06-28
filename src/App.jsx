import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import PrivateRoute from './components/layout/PrivateRoute'

// Páginas públicas — carga inmediata
import HomePage    from './pages/HomePage'
import LoginPage   from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ReportPage  from './pages/ReportPage'

// Páginas con lazy loading
const MapPage = lazy(() => import('./pages/MapPage'))
const OperatorRegisterPage = lazy(() => import('./pages/OperatorRegisterPage'))
const AdmittedPersonReportPage = lazy(() => import('./pages/AdmittedPersonReportPage'))
const AdmittedPersonSearchPage = lazy(() => import('./pages/AdmittedPersonSearchPage'))
const HospitalsPublicPage = lazy(() => import('./pages/HospitalsPublicPage'))
const ReportRefugePage = lazy(() => import('./pages/reports/ReportRefugePage'))
const ReportHospitalPage = lazy(() => import('./pages/reports/ReportHospitalPage'))
const ReportRoadIssuePage = lazy(() => import('./pages/reports/ReportRoadIssuePage'))
const ReportDangerZonePage = lazy(() => import('./pages/reports/ReportDangerZonePage'))
const ReportHelpPointPage = lazy(() => import('./pages/reports/ReportHelpPointPage'))

// Panel admin — lazy loaded como módulo independiente
const AdminLayout          = lazy(() => import('./components/layout/AdminLayout'))
const DashboardPage        = lazy(() => import('./pages/admin/DashboardPage'))
const MapPointsAdminPage   = lazy(() => import('./pages/admin/MapPointsAdminPage'))
const ReportsAdminPage     = lazy(() => import('./pages/admin/ReportsAdminPage'))
const OperatorsAdminPage   = lazy(() => import('./pages/admin/OperatorsAdminPage'))
const UsersAdminPage       = lazy(() => import('./pages/admin/UsersAdminPage'))
const AdmittedPeopleAdminPage = lazy(() => import('./pages/admin/AdmittedPeopleAdminPage'))
const HospitalNeedsAdminPage = lazy(() => import('./pages/admin/HospitalNeedsAdminPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-2xl animate-pulse shadow-md">
        🗺️
      </div>
      <p className="text-slate-500 text-sm font-medium">
        Cargando RefuMap...
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        expand={true} 
        richColors 
        toastOptions={{
          style: { fontSize: '1rem', padding: '16px 20px' }
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/reportar" element={<ReportPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Nuevas Rutas Públicas */}
          <Route path="/operator-register" element={<OperatorRegisterPage />} />
          <Route path="/report-person" element={<AdmittedPersonReportPage />} />
          <Route path="/search-person" element={<AdmittedPersonSearchPage />} />
          <Route path="/hospitals" element={<HospitalsPublicPage />} />
          <Route path="/hospitals/:id" element={<HospitalsPublicPage />} />
          
          <Route path="/reportar/refugio" element={<ReportRefugePage />} />
          <Route path="/reportar/hospital" element={<ReportHospitalPage />} />
          <Route path="/reportar/falla-camino" element={<ReportRoadIssuePage />} />
          <Route path="/reportar/zona-peligrosa" element={<ReportDangerZonePage />} />
          <Route path="/reportar/centro-acopio" element={<ReportHelpPointPage />} />

          {/* Login de admin */}
          <Route path="/refu-control" element={<AdminLoginPage />} />

          {/* Panel admin — protegido */}
          <Route path="/refu-control/panel" element={
            <PrivateRoute requiredRole="admin">
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="map-points" element={<MapPointsAdminPage />} />
            <Route path="reports" element={<ReportsAdminPage />} />
            <Route path="admitted-people" element={<AdmittedPeopleAdminPage />} />
            <Route path="hospital-needs" element={<HospitalNeedsAdminPage />} />
            <Route path="operators" element={<OperatorsAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
          </Route>

          {/* Panel operador — protegido */}
          <Route path="/operadores" element={
            <PrivateRoute requiredRole="operator">
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="map-points" element={<MapPointsAdminPage />} />
            <Route path="reports" element={<ReportsAdminPage />} />
            <Route path="admitted-people" element={<AdmittedPeopleAdminPage />} />
            <Route path="hospital-needs" element={<HospitalNeedsAdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
