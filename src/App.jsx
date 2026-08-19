import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { ROLES_PANEL_ADMIN } from "./constants/roles";

// Mapa y Reportes cargan Leaflet (pesado) a través de RiesgoMap: lazy para
// que ese peso no entre en el bundle inicial de Home ni del panel admin.
const Mapa = React.lazy(() => import("./pages/Mapa"));
const Reportes = React.lazy(() => import("./pages/Reportes"));
const ModeracionReportes = React.lazy(() => import("./pages/admin/Reportes"));
const AdminAlbergues = React.lazy(() => import("./pages/admin/Albergues"));
const CatalogoNodos = React.lazy(() => import("./pages/admin/Sensores"));
const Telemetria = React.lazy(() => import("./pages/admin/Telemetria"));
const Calibracion = React.lazy(() => import("./pages/admin/Calibracion"));
const Usuarios = React.lazy(() => import("./pages/admin/Usuarios"));
const Auditoria = React.lazy(() => import("./pages/admin/Auditoria"));
const Tickets = React.lazy(() => import("./pages/admin/Tickets"));
const Despacho = React.lazy(() => import("./pages/admin/Despacho"));

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
                </Route>
              </Route>
            </Routes>
            <AuthModal />
          </BrowserRouter>
        </AuthProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
