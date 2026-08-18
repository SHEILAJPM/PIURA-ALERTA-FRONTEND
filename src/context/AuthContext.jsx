import React, { createContext, useContext, useEffect, useState } from "react";
import { registrarUsuario, iniciarSesion } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "piura-alerta-auth";

function leerSesionGuardada() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada);
  // null = cerrado; "login" | "registro" = modal abierto en ese modo.
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (sesion) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [sesion]);

  async function login(correo, password) {
    const { token, usuario } = await iniciarSesion({ correo, password });
    setSesion({ token, usuario });
    setModal(null);
    return usuario;
  }

  async function registro(datos) {
    const { token, usuario } = await registrarUsuario(datos);
    setSesion({ token, usuario });
    setModal(null);
  }

  function logout() {
    setSesion(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario: sesion?.usuario ?? null,
        token: sesion?.token ?? null,
        login,
        registro,
        logout,
        modal,
        abrirModal: (modo = "login") => setModal(modo),
        cerrarModal: () => setModal(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

// Fuera de React (ej. lib/api.js), para adjuntar el token sin pasar por props.
export function obtenerTokenGuardado() {
  return leerSesionGuardada()?.token ?? null;
}
