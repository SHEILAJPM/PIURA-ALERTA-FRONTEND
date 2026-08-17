import React from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useWebSocketStatus } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/mapa", label: "Mapa" },
  { to: "/reportes", label: "Reportes" },
];

const ROLES_PANEL_OPERARIO = ["operario", "defensa_civil", "administrador"];

const ESTADOS_CONEXION = {
  open: { color: "bg-emerald-400", texto: "En vivo" },
  connecting: { color: "bg-amber-400 animate-pulse", texto: "Conectando" },
  closed: { color: "bg-red-400", texto: "Sin conexión" },
};

function navClass({ isActive }) {
  return `transition font-medium ${isActive ? "text-white" : "text-white/70 hover:text-white"}`;
}

function Header() {
  const wsStatus = useWebSocketStatus();
  const conexion = ESTADOS_CONEXION[wsStatus] ?? ESTADOS_CONEXION.closed;
  const { usuario, logout, abrirModal } = useAuth();

  return (
    <header
      className="shadow-md sticky top-0 z-20"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/images/escudo-piura.png"
                alt="Escudo de Piura"
                className="w-9 h-9 object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Río Piura Alerta
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className={`w-1.5 h-1.5 rounded-full ${conexion.color}`} />
                {conexion.texto}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-3 sm:gap-6 text-sm sm:text-base">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === "/"} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
              {usuario && ROLES_PANEL_OPERARIO.includes(usuario.rol) && (
                <NavLink to="/panel-operario" className={navClass}>
                  Panel
                </NavLink>
              )}
            </nav>

            {usuario ? (
              <div className="flex items-center gap-2 sm:gap-3 text-sm text-white/90">
                <span className="hidden sm:inline">{usuario.nombre}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="font-medium text-white/70 hover:text-white transition"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => abrirModal("login")}
                className="font-medium text-white/70 hover:text-white transition"
              >
                Iniciar sesión
              </button>
            )}

            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
