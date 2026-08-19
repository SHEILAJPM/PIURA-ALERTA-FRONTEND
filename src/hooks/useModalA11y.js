import { useEffect, useRef } from "react";

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Comportamiento accesible compartido por cualquier diálogo modal (AuthModal,
// ConfirmDialog): Escape cierra, el foco entra al diálogo al abrir y vuelve a
// donde estaba al cerrar, y Tab/Shift+Tab quedan atrapados adentro en vez de
// escaparse a la página de atrás. El componente que lo usa debe montar (no
// solo ocultar) el diálogo condicionalmente, para que el listener global de
// teclado no quede pegado cuando no hay nada abierto.
export function useModalA11y(onClose) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    const previoEnfocado = document.activeElement;
    contenedorRef.current?.focus();

    function manejarTeclado(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !contenedorRef.current) return;

      const focosables = contenedorRef.current.querySelectorAll(SELECTOR_FOCUSABLE);
      if (focosables.length === 0) return;
      const primero = focosables[0];
      const ultimo = focosables[focosables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclado);
    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      if (previoEnfocado instanceof HTMLElement) previoEnfocado.focus();
    };
  }, [onClose]);

  return contenedorRef;
}
