import { useState } from "react";
import Icon from "../Icon";

// Lo que se repetía igual entre "+ Agregar albergue" (Albergues.jsx) y
// "+ Registrar nodo ESP32" (Sensores.jsx): el estado de abrir/cerrar,
// enviando/error, y el armazón visual (botón colapsado, form expandido,
// banner de error, botones guardar/cancelar). Los campos concretos siguen
// en cada página (children, con render prop) porque ahí sí difieren de
// verdad -- ni la cantidad de campos ni la validación son iguales entre un
// albergue y un sensor, así que no vale la pena forzarlos a un mismo molde.
function FormularioCreacion({ camposIniciales, validar, onCrear, textoBoton, textoGuardar, textoGuardando, children }) {
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState(camposIniciales);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  function actualizar(campo) {
    return (e) => setValores((prev) => ({ ...prev, [campo]: e.target.value }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    const resultado = validar(valores);
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onCrear(resultado.datos);
      setValores(camposIniciales);
      setAbierto(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Icon name="bi-plus-lg" aria-hidden="true" /> {textoBoton}
      </button>
    );
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border p-5 mb-6"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="grid gap-3 sm:grid-cols-2">{children({ valores, actualizar })}</div>

      {error && (
        <p className="text-sm mt-3" style={{ color: "var(--color-alerta)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={enviando}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {enviando ? textoGuardando : textoGuardar}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-sm font-medium px-4 py-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default FormularioCreacion;
