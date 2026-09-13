import { useEffect, useRef, useState } from "react";
import { useModalA11y } from "../ganchos/useModalA11y";
import Icon from "./Icon";

const DURACION_MS = 5000;

function tiempoTranscurrido(creadoEn) {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(creadoEn).getTime()) / 60000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.round(minutos / 60);
  return `${horas} h`;
}

// Visor de "historias" al estilo Instagram: modal flotante a pantalla
// completa, con una barra de progreso por historia que avanza sola cada
// DURACION_MS, y navegación por clic (mitad izquierda/derecha) o teclado.
function HistoriaModal({ historias, indiceInicial, onCerrar }) {
  const [indice, setIndice] = useState(indiceInicial);
  const [pausado, setPausado] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const contenedorRef = useModalA11y(onCerrar);
  const inicioRef = useRef(null);
  const acumuladoRef = useRef(0);

  const historia = historias[indice];

  function siguiente() {
    setIndice((i) => {
      if (i >= historias.length - 1) {
        onCerrar();
        return i;
      }
      return i + 1;
    });
  }

  function anterior() {
    setIndice((i) => Math.max(0, i - 1));
  }

  useEffect(() => {
    setProgreso(0);
    acumuladoRef.current = 0;
  }, [indice]);

  useEffect(() => {
    if (pausado) return;
    inicioRef.current = performance.now() - acumuladoRef.current;
    let frame;

    function tick(ahora) {
      const transcurrido = ahora - inicioRef.current;
      acumuladoRef.current = transcurrido;
      setProgreso(Math.min(1, transcurrido / DURACION_MS));
      if (transcurrido >= DURACION_MS) {
        siguiente();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, pausado]);

  useEffect(() => {
    function manejarTeclado(e) {
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
    }
    document.addEventListener("keydown", manejarTeclado);
    return () => document.removeEventListener("keydown", manejarTeclado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  if (!historia) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
    >
      <div
        ref={contenedorRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Historia de ${historia.usuario_nombre}`}
        tabIndex={-1}
        className="relative w-full h-full sm:h-[90vh] sm:max-h-225 sm:w-105 sm:rounded-2xl overflow-hidden outline-none bg-black"
        onPointerDown={() => setPausado(true)}
        onPointerUp={() => setPausado(false)}
        onPointerLeave={() => setPausado(false)}
      >
        <div className="absolute top-0 left-0 right-0 z-10 p-3 flex gap-1">
          {historias.map((h, i) => (
            <div key={h.id} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: `${i < indice ? 100 : i === indice ? progreso * 100 : 0}%`,
                  transition: i === indice ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-0 right-0 z-10 px-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate">{historia.usuario_nombre}</span>
            <span className="text-xs text-white/70 shrink-0">{tiempoTranscurrido(historia.creado_en)}</span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-white/90 hover:text-white p-1"
          >
            <Icon name="bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        <img
          src={historia.foto_url}
          alt={historia.descripcion}
          className="w-full h-full object-contain"
        />

        {/* Zonas de toque para navegar, entre la imagen (z-0) y los controles
            (z-10) -- si fueran el último hijo taparían el botón de cerrar. */}
        <button
          type="button"
          onClick={anterior}
          aria-label="Historia anterior"
          className="absolute left-0 top-0 h-full w-1/3 z-1"
        />
        <button
          type="button"
          onClick={siguiente}
          aria-label="Historia siguiente"
          className="absolute right-0 top-0 h-full w-2/3 z-1"
        />

        {historia.descripcion && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4 pt-10 text-white text-sm z-10 pointer-events-none"
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
          >
            {historia.descripcion}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoriaModal;
