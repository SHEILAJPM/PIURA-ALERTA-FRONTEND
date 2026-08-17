import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";
import Reportes from "./pages/Reportes";
import PanelOperario from "./pages/PanelOperario";

const Mapa = React.lazy(() => import("./pages/Mapa"));

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
                      fallback={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-150" />
                      }
                    >
                      <Mapa />
                    </Suspense>
                  }
                />
                <Route path="/reportes" element={<Reportes />} />
                <Route element={<ProtectedRoute roles={["operario", "defensa_civil", "administrador"]} />}>
                  <Route path="/panel-operario" element={<PanelOperario />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <AuthModal />
        </AuthProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
