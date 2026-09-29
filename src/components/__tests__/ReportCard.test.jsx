import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReportCard from "../ReportCard";
import AuthModal from "../AuthModal";
import { AuthProvider } from "../../context/AuthContext";

const reporteBase = {
  id: "r1",
  usuario_nombre: "Adrian",
  descripcion: "Calle inundada en el jirón Loreto",
  foto_url: null,
  estado: "pendiente",
  reacciones_util: 3,
  reacciones_alerta: 0,
  reacciones_confirmo: 0,
  reaccion_usuario: null,
  creado_en: "2026-08-16T10:00:00Z",
};

function renderCard(reporte, onReaccion = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ReportCard reporte={reporte} onReaccion={onReaccion} />
        <AuthModal />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ReportCard", () => {
  beforeEach(() => localStorage.clear());

  it("sin sesión: al hacer click en útil se abre el modal de login y no llama a onReaccion", async () => {
    const onReaccion = vi.fn();
    renderCard(reporteBase, onReaccion);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Marcar como útil" }));
    });

    expect(onReaccion).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("con sesión: al marcar como útil llama a onReaccion con el id y tipo de reacción", async () => {
    localStorage.setItem(
      "piura-alerta-auth",
      JSON.stringify({
        token: "t",
        usuario: { id: "u1", nombre: "Sheila" },
      })
    );

    const onReaccion = vi.fn().mockResolvedValue(undefined);
    renderCard(reporteBase, onReaccion);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Marcar como útil" }));
    });

    expect(onReaccion).toHaveBeenCalledWith("r1", "util");
  });

  it("si ya marcó como útil, al hacer click nuevamente elimina la reacción", async () => {
    localStorage.setItem(
      "piura-alerta-auth",
      JSON.stringify({
        token: "t",
        usuario: { id: "u1", nombre: "Sheila" },
      })
    );

    const onReaccion = vi.fn().mockResolvedValue(undefined);

    renderCard(
      {
        ...reporteBase,
        reaccion_usuario: "util",
        reacciones_util: 4,
      },
      onReaccion
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Marcar como útil" }));
    });

    expect(onReaccion).toHaveBeenCalledWith("r1", null);
  });
});
