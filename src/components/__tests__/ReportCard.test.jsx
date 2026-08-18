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
  likes_count: 3,
  te_gusta: false,
  creado_en: "2026-08-16T10:00:00Z",
};

function renderCard(reporte, onLike = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ReportCard reporte={reporte} onLike={onLike} />
        <AuthModal />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ReportCard", () => {
  beforeEach(() => localStorage.clear());

  it("sin sesión: al hacer click en el like se abre el modal de login, no llama a onLike", async () => {
    const onLike = vi.fn();
    renderCard(reporteBase, onLike);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar me gusta" }));
    });

    expect(onLike).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("con sesión: el like llama a onLike con el id del reporte", async () => {
    localStorage.setItem(
      "piura-alerta-auth",
      JSON.stringify({ token: "t", usuario: { id: "u1", nombre: "Sheila" } })
    );
    const onLike = vi.fn().mockResolvedValue(undefined);
    renderCard(reporteBase, onLike);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(onLike).toHaveBeenCalledWith("r1");
  });

  it("muestra el corazón lleno cuando te_gusta es true", () => {
    localStorage.setItem(
      "piura-alerta-auth",
      JSON.stringify({ token: "t", usuario: { id: "u1", nombre: "Sheila" } })
    );
    renderCard({ ...reporteBase, te_gusta: true });
    expect(screen.getByRole("button").querySelector(".bi-heart-fill")).not.toBeNull();
  });
});
