import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "../ConfirmDialog";

function renderDialog(props = {}) {
  const onConfirmar = vi.fn();
  const onCancelar = vi.fn();
  render(
    <ConfirmDialog titulo="Confirmar difusión" onConfirmar={onConfirmar} onCancelar={onCancelar} {...props}>
      ¿Confirmar el envío a todos los suscriptores?
    </ConfirmDialog>
  );
  return { onConfirmar, onCancelar };
}

describe("ConfirmDialog", () => {
  it("se anuncia como diálogo modal, asociado a su título", () => {
    renderDialog();
    const dialogo = screen.getByRole("dialog");
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(dialogo).toHaveAccessibleName("Confirmar difusión");
  });

  it("mueve el foco al diálogo al abrir", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("Escape llama a onCancelar", () => {
    const { onCancelar } = renderDialog();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("clickear el fondo llama a onCancelar", () => {
    const { onCancelar } = renderDialog();
    fireEvent.click(screen.getByRole("dialog").parentElement);
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("clickear adentro del diálogo no lo cierra", () => {
    const { onCancelar } = renderDialog();
    fireEvent.click(screen.getByRole("dialog"));
    expect(onCancelar).not.toHaveBeenCalled();
  });

  it("el botón de confirmar llama a onConfirmar", () => {
    const { onConfirmar } = renderDialog({ textoConfirmar: "Sí, enviar ahora" });
    fireEvent.click(screen.getByRole("button", { name: "Sí, enviar ahora" }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it("mientras enviando, deshabilita ambos botones", () => {
    renderDialog({ enviando: true });
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
