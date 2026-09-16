// Mismo botón de "activo/inactivo" que se repetía en Sensores.jsx y
// Usuarios.jsx -- un solo lugar para el estilo del estado, cada llamador
// solo decide la etiqueta de "apagado" y si hace falta bloquearlo.
function BotonActivo({ activo, guardando, disabled = false, title, etiquetaInactivo = "Inactivo", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={guardando || disabled}
      title={title}
      className="text-xs font-semibold px-3 py-1 rounded-full disabled:opacity-50"
      style={
        activo
          ? { color: "var(--color-normal)", backgroundColor: "var(--color-normal-soft)" }
          : { color: "var(--color-text-muted)", backgroundColor: "var(--color-surface-alt)" }
      }
    >
      {guardando ? "..." : activo ? "Activo" : etiquetaInactivo}
    </button>
  );
}

export default BotonActivo;
