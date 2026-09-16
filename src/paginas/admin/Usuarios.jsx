import React, { useCallback, useState } from "react";
import { useAuth } from "../../contexto/AuthContext";
import { useUsuarios } from "../../ganchos/useUsuarios";
import { actualizarRolUsuario, actualizarActivoUsuario } from "../../utilidades/api";
import AdminPageHeader from "../../componentes/admin/AdminPageHeader";
import BotonActivo from "../../componentes/admin/BotonActivo";
import RequiereRol from "../../componentes/admin/RequiereRol";
import Skeleton from "../../componentes/Skeleton";
import ErrorBanner from "../../componentes/ErrorBanner";
import { ROLES_ADMINISTRADOR } from "../../constantes/roles";
import { formatearFecha } from "../../utilidades/fecha";

const ROLES = [
  { valor: "ciudadano", etiqueta: "Ciudadano" },
  { valor: "operario", etiqueta: "Operador Técnico" },
  { valor: "defensa_civil", etiqueta: "Defensa Civil / COER" },
  { valor: "administrador", etiqueta: "Administrador" },
];

// Memoizado: con muchos usuarios, cambiar el rol de uno solo no debería
// re-renderizar (ni volver a montar el <select> de) todas las demás filas.
const FilaUsuario = React.memo(function FilaUsuario({ usuario, esUnoMismo, onCambiarRol, onCambiarActivo }) {
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [guardandoActivo, setGuardandoActivo] = useState(false);
  // Separados a propósito: son dos controles distintos en dos columnas
  // distintas -- un solo estado compartido mostraba el error del botón de
  // Activo junto al selector de rol (o viceversa), confundiendo cuál acción
  // realmente falló.
  const [errorRol, setErrorRol] = useState(null);
  const [errorActivo, setErrorActivo] = useState(null);

  async function manejarCambio(e) {
    const nuevoRol = e.target.value;
    setGuardandoRol(true);
    setErrorRol(null);
    try {
      await onCambiarRol(usuario.id, nuevoRol);
    } catch (err) {
      setErrorRol(err.message);
    } finally {
      setGuardandoRol(false);
    }
  }

  async function alternarActivo() {
    setGuardandoActivo(true);
    setErrorActivo(null);
    try {
      await onCambiarActivo(usuario.id, !usuario.activo);
    } catch (err) {
      setErrorActivo(err.message);
    } finally {
      setGuardandoActivo(false);
    }
  }

  return (
    <tr className="border-t" style={{ borderColor: "var(--color-border)" }}>
      <td className="pl-5 pr-4 py-3">
        <p className="font-semibold">{usuario.nombre}</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {usuario.correo}
        </p>
      </td>
      <td className="pr-4 py-3 text-xs font-mono-data" style={{ color: "var(--color-text-muted)" }}>
        {formatearFecha(usuario.creado_en)}
      </td>
      <td className="pr-4 py-3 text-right">
        <BotonActivo
          activo={usuario.activo}
          guardando={guardandoActivo}
          disabled={esUnoMismo}
          title={esUnoMismo ? "No puedes desactivar tu propia cuenta" : undefined}
          etiquetaInactivo="Desactivado"
          onClick={alternarActivo}
        />
        {errorActivo && (
          <p className="text-xs mt-1" style={{ color: "var(--color-alerta)" }}>
            {errorActivo}
          </p>
        )}
      </td>
      <td className="pr-5 py-3 text-right">
        <select
          value={usuario.rol}
          onChange={manejarCambio}
          disabled={guardandoRol}
          className="rounded-lg border px-2 py-1.5 text-sm disabled:opacity-50"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
          }}
        >
          {ROLES.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.etiqueta}
            </option>
          ))}
        </select>
        {errorRol && (
          <p className="text-xs mt-1" style={{ color: "var(--color-alerta)" }}>
            {errorRol}
          </p>
        )}
      </td>
    </tr>
  );
});

function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const { data: usuarios, loading, error, setData, recargar } = useUsuarios();

  const cambiarRol = useCallback(
    async (id, rol) => {
      const actualizado = await actualizarRolUsuario(id, rol);
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, rol: actualizado.rol } : u)));
    },
    [setData]
  );

  const cambiarActivo = useCallback(
    async (id, activo) => {
      const actualizado = await actualizarActivoUsuario(id, activo);
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, activo: actualizado.activo } : u)));
    },
    [setData]
  );

  return (
    <RequiereRol roles={ROLES_ADMINISTRADOR}>
      <AdminPageHeader titulo="USUARIOS" subtitulo="GESTIÓN DE ROLES (RBAC)" />

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={`No se pudieron cargar los usuarios: ${error}`} onRetry={recargar} />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : !usuarios || usuarios.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No hay cuentas registradas.</p>
        ) : (
          <div
            className="rounded-2xl border overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <th className="pl-5 pr-4 py-3 font-semibold">Usuario</th>
                  <th className="pr-4 py-3 font-semibold">Registrado</th>
                  <th className="pr-4 py-3 font-semibold text-right">Estado</th>
                  <th className="pr-5 py-3 font-semibold text-right">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <FilaUsuario
                    key={u.id}
                    usuario={u}
                    esUnoMismo={u.id === usuarioActual?.id}
                    onCambiarRol={cambiarRol}
                    onCambiarActivo={cambiarActivo}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequiereRol>
  );
}

export default Usuarios;
