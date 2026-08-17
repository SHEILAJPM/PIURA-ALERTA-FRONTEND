import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
};

function CampoLogin({ onExito }) {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(correo, password);
      onExito?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-3">
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />
      {error && (
        <p className="text-sm" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg py-2.5 font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

function CampoRegistro({ onExito }) {
  const { registro } = useAuth();
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [datosOpcionales, setDatosOpcionales] = useState({ dni: "", telefono: "", direccion: "" });
  const [mostrarOpcionales, setMostrarOpcionales] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, setter) {
    return (e) => setter((prev) => ({ ...prev, [campo]: e.target.value }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await registro({
        ...form,
        dni: datosOpcionales.dni.trim() || undefined,
        telefono: datosOpcionales.telefono.trim() || undefined,
        direccion: datosOpcionales.direccion.trim() || undefined,
      });
      onExito?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={actualizar("nombre", setForm)}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Correo"
        value={form.correo}
        onChange={actualizar("correo", setForm)}
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Contraseña (mínimo 8 caracteres)"
        value={form.password}
        onChange={actualizar("password", setForm)}
        required
        minLength={8}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={inputStyle}
      />

      <button
        type="button"
        onClick={() => setMostrarOpcionales((v) => !v)}
        className="text-xs font-semibold"
        style={{ color: "var(--color-primary)" }}
      >
        {mostrarOpcionales ? "− Ocultar" : "+ Agregar"} DNI / teléfono / dirección (opcional)
      </button>

      {mostrarOpcionales && (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="DNI (8 dígitos)"
            value={datosOpcionales.dni}
            onChange={actualizar("dni", setDatosOpcionales)}
            pattern="\d{8}"
            title="8 dígitos"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={datosOpcionales.telefono}
            onChange={actualizar("telefono", setDatosOpcionales)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Dirección"
            value={datosOpcionales.direccion}
            onChange={actualizar("direccion", setDatosOpcionales)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg py-2.5 font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}

function AuthModal() {
  const { modal, cerrarModal, abrirModal } = useAuth();
  if (!modal) return null;

  const esLogin = modal === "login";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={cerrarModal}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{esLogin ? "Iniciar sesión" : "Crear cuenta"}</h3>
          <button
            type="button"
            onClick={cerrarModal}
            aria-label="Cerrar"
            className="text-xl leading-none"
            style={{ color: "var(--color-text-muted)" }}
          >
            ×
          </button>
        </div>

        {esLogin ? <CampoLogin onExito={cerrarModal} /> : <CampoRegistro onExito={cerrarModal} />}

        <p className="text-sm text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
          {esLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => abrirModal(esLogin ? "registro" : "login")}
            className="font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            {esLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
