import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexto/ThemeContext";
import { WebSocketProvider } from "./contexto/WebSocketContext";
import { AuthProvider } from "./contexto/AuthContext";
import Layout from "./componentes/Layout";
import AdminLayout from "./componentes/AdminLayout";
import AuthModal from "./componentes/AuthModal";
import InvitacionSesion from "./componentes/InvitacionSesion";
import ProtectedRoute from "./componentes/ProtectedRoute";
import Home from "./paginas/Home";
import MiPerfil from "./paginas/MiPerfil";
import RestablecerPassword from "./paginas/RestablecerPassword";
import Seguro from "./paginas/Seguro";
import MiPoliza from "./paginas/MiPoliza";
import { ROLES_PANEL_ADMIN } from "./constantes/roles";

// Mapa y Reportes cargan Leaflet (pesado) a través de RiesgoMap: lazy para
// que ese peso no entre en el bundle inicial de Home ni del panel admin.
const Mapa = React.lazy(() => import("./paginas/Mapa"));
const Reportes = React.lazy(() => import("./paginas/Reportes"));
const Historial = React.lazy(() => import("./paginas/Historial"));
const ModeracionReportes = React.lazy(() => import("./paginas/admin/Reportes"));
const AdminAlbergues = React.lazy(() => import("./paginas/admin/Albergues"));
const CatalogoNodos = React.lazy(() => import("./paginas/admin/Sensores"));
const Telemetria = React.lazy(() => import("./paginas/admin/Telemetria"));
const Calibracion = React.lazy(() => import("./paginas/admin/Calibracion"));
const Usuarios = React.lazy(() => import("./paginas/admin/Usuarios"));
const Auditoria = React.lazy(() => import("./paginas/admin/Auditoria"));
const Tickets = React.lazy(() => import("./paginas/admin/Tickets"));
const Despacho = React.lazy(() => import("./paginas/admin/Despacho"));
const Polizas = React.lazy(() => import("./paginas/admin/Polizas"));
const AsistenteFeedback = React.lazy(() => import("./paginas/admin/AsistenteFeedback"));

function conSuspenso(elemento) {
  return <Suspense fallback={<div className="p-8 h-150" />}>{elemento}</Suspense>;
}

function App() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/mapa"
                  element={
                    <Suspense
                      fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-150" />}
                    >
                      <Mapa />
                    </Suspense>
                  }
                />
                <Route path="/reportes" element={conSuspenso(<Reportes />)} />
                <Route path="/historial" element={conSuspenso(<Historial />)} />
                <Route path="/restablecer-password" element={<RestablecerPassword />} />
                <Route path="/seguro" element={<Seguro />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/perfil" element={<MiPerfil />} />
                  <Route path="/mi-poliza" element={<MiPoliza />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={ROLES_PANEL_ADMIN} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="reportes" replace />} />
                  <Route path="reportes" element={conSuspenso(<ModeracionReportes />)} />
                  <Route path="albergues" element={conSuspenso(<AdminAlbergues />)} />
                  <Route path="sensores" element={conSuspenso(<CatalogoNodos />)} />
                  <Route path="telemetria" element={conSuspenso(<Telemetria />)} />
                  <Route path="calibracion" element={conSuspenso(<Calibracion />)} />
                  <Route path="usuarios" element={conSuspenso(<Usuarios />)} />
                  <Route path="auditoria" element={conSuspenso(<Auditoria />)} />
                  <Route path="tickets" element={conSuspenso(<Tickets />)} />
                  <Route path="despacho" element={conSuspenso(<Despacho />)} />
                  <Route path="polizas" element={conSuspenso(<Polizas />)} />
                  <Route path="asistente" element={conSuspenso(<AsistenteFeedback />)} />
                </Route>
              </Route>
            </Routes>
            <AuthModal />
            <InvitacionSesion />
          </BrowserRouter>
        </AuthProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
