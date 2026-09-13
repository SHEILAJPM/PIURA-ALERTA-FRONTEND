import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Impacto from "../Impacto";
import { useImpacto } from "../../../ganchos/useImpacto";
import { useAuth } from "../../../contexto/AuthContext";

vi.mock("../../../ganchos/useImpacto", () => ({ useImpacto: vi.fn() }));
vi.mock("../../../contexto/AuthContext", () => ({ useAuth: vi.fn() }));

function renderComoAdmin() {
  useAuth.mockReturnValue({ usuario: { id: "u1", rol: "administrador" } });
  return render(
    <MemoryRouter initialEntries={["/admin/impacto"]}>
      <Routes>
        <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
        <Route path="/admin/impacto" element={<Impacto />} />
      </Routes>
    </MemoryRouter>
  );
}

const impactoBase = {
  usuarios_totales: 11,
  usuarios_por_rol: { ciudadano: 10, administrador: 1 },
  suscriptores_telegram: 5,
  suscriptores_push: 3,
  alertas_automaticas_enviadas: 7,
  reportes_totales: 6,
  reportes_por_estado: { pendiente: 4, verificado: 2 },
  polizas_vigentes: 6,
  chequeos_seguridad_ultimas_24h: 8,
};

describe("Impacto", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un rol sin permiso (defensa_civil) es redirigido, no ve el panel", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "defensa_civil" } });
    useImpacto.mockReturnValue({ data: null, loading: false, error: null, recargar: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/admin/impacto"]}>
        <Routes>
          <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
          <Route path="/admin/impacto" element={<Impacto />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });

  it("muestra las estadísticas principales cuando cargan los datos", () => {
    useImpacto.mockReturnValue({ data: impactoBase, loading: false, error: null, recargar: vi.fn() });
    renderComoAdmin();

    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("Usuarios registrados")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Ciudadanos a salvo (últimas 24h)")).toBeInTheDocument();
  });

  it("muestra el desglose de usuarios por rol y reportes por estado", () => {
    useImpacto.mockReturnValue({ data: impactoBase, loading: false, error: null, recargar: vi.fn() });
    renderComoAdmin();

    expect(screen.getByText("Ciudadanos")).toBeInTheDocument();
    expect(screen.getByText("Administradores")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Verificados")).toBeInTheDocument();
  });

  it("muestra el banner de error con botón de reintentar", () => {
    const recargar = vi.fn();
    useImpacto.mockReturnValue({ data: null, loading: false, error: "network error", recargar });
    renderComoAdmin();
    expect(screen.getByText(/No se pudo cargar el panel de impacto/)).toBeInTheDocument();
  });
});
