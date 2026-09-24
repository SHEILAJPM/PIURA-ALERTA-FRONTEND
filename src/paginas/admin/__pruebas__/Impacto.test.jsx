import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Impacto from "../Impacto";
import { useImpacto } from "../../../ganchos/useImpacto";
import { useHistorialAlertas } from "../../../ganchos/useHistorialAlertas";
import { useAuth } from "../../../contexto/AuthContext";

vi.mock("../../../ganchos/useImpacto", () => ({ useImpacto: vi.fn() }));
vi.mock("../../../ganchos/useHistorialAlertas", () => ({ useHistorialAlertas: vi.fn() }));
vi.mock("../../../contexto/AuthContext", () => ({ useAuth: vi.fn() }));

const historialVacio = { data: [], loading: false, error: null, recargar: vi.fn() };

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
  beforeEach(() => {
    vi.clearAllMocks();
    useHistorialAlertas.mockReturnValue(historialVacio);
  });

  it("un rol sin permiso (operario) es redirigido, no ve el panel", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "operario" } });
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

  it("defensa_civil sí ve el panel (el resumen es para ellos y la municipalidad)", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "defensa_civil" } });
    useImpacto.mockReturnValue({ data: impactoBase, loading: false, error: null, recargar: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/admin/impacto"]}>
        <Routes>
          <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
          <Route path="/admin/impacto" element={<Impacto />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("PANEL DE IMPACTO")).toBeInTheDocument();
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

  it("sin eventos en el historial, no muestra los botones de exportar", () => {
    useImpacto.mockReturnValue({ data: impactoBase, loading: false, error: null, recargar: vi.fn() });
    renderComoAdmin();
    expect(screen.getByText(/Todavía no se registró ningún cambio de estado/)).toBeInTheDocument();
    expect(screen.queryByText("Exportar CSV")).not.toBeInTheDocument();
  });

  it("con eventos en el historial, ofrece exportar CSV y PDF", () => {
    useImpacto.mockReturnValue({ data: impactoBase, loading: false, error: null, recargar: vi.fn() });
    useHistorialAlertas.mockReturnValue({
      data: [
        {
          id: 1,
          estado_anterior: "normal",
          estado_nuevo: "prealerta",
          nivel_cm: 12,
          iniciado_en: "2026-01-01T10:00:00Z",
          sensor_nombre: "Puente Bolognesi",
        },
      ],
      loading: false,
      error: null,
      recargar: vi.fn(),
    });
    renderComoAdmin();

    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getByText(/Puente Bolognesi/)).toBeInTheDocument();
  });
});
