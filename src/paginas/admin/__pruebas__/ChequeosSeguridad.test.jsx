import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ChequeosSeguridad from "../ChequeosSeguridad";
import { useChequeosSeguridad } from "../../../ganchos/useChequeosSeguridad";
import { useAuth } from "../../../contexto/AuthContext";

vi.mock("../../../ganchos/useChequeosSeguridad", () => ({ useChequeosSeguridad: vi.fn() }));
vi.mock("../../../contexto/AuthContext", () => ({ useAuth: vi.fn() }));

function renderComoDefensaCivil() {
  useAuth.mockReturnValue({ usuario: { id: "u1", rol: "defensa_civil" } });
  return render(
    <MemoryRouter initialEntries={["/admin/chequeos-seguridad"]}>
      <Routes>
        <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
        <Route path="/admin/chequeos-seguridad" element={<ChequeosSeguridad />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ChequeosSeguridad", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un rol sin permiso (operario) es redirigido, no ve la lista", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "operario" } });
    useChequeosSeguridad.mockReturnValue({ data: [], loading: false, error: null, recargar: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/admin/chequeos-seguridad"]}>
        <Routes>
          <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
          <Route path="/admin/chequeos-seguridad" element={<ChequeosSeguridad />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });

  it("sin ciudadanos registrados, muestra el mensaje vacío", () => {
    useChequeosSeguridad.mockReturnValue({ data: [], loading: false, error: null, recargar: vi.fn() });
    renderComoDefensaCivil();
    expect(screen.getByText(/Todavía no hay ciudadanos registrados/)).toBeInTheDocument();
  });

  it("muestra cada ciudadano con su último chequeo", () => {
    useChequeosSeguridad.mockReturnValue({
      data: [
        { usuario_id: "u1", nombre: "Sheila", telefono: "987654321", ultimo_chequeo: "2026-08-17T10:00:00Z" },
        { usuario_id: "u2", nombre: "Adrian", telefono: null, ultimo_chequeo: null },
      ],
      loading: false,
      error: null,
      recargar: vi.fn(),
    });
    renderComoDefensaCivil();

    expect(screen.getByText("Sheila")).toBeInTheDocument();
    expect(screen.getByText("987654321")).toBeInTheDocument();
    expect(screen.getByText("Adrian")).toBeInTheDocument();
    expect(screen.getByText("Nunca avisó")).toBeInTheDocument();
  });

  it("muestra el banner de error con botón de reintentar", () => {
    const recargar = vi.fn();
    useChequeosSeguridad.mockReturnValue({ data: null, loading: false, error: "network error", recargar });
    renderComoDefensaCivil();
    expect(screen.getByText(/No se pudo cargar la lista/)).toBeInTheDocument();
  });
});
