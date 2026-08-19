import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Auditoria from "../Auditoria";
import { useAuditoria } from "../../../hooks/useAuditoria";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../hooks/useAuditoria", () => ({ useAuditoria: vi.fn() }));
vi.mock("../../../context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderComoAdmin() {
  useAuth.mockReturnValue({ usuario: { id: "u1", rol: "administrador" } });
  return render(
    <MemoryRouter initialEntries={["/admin/auditoria"]}>
      <Routes>
        <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
        <Route path="/admin/auditoria" element={<Auditoria />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Auditoria", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un rol sin permiso es redirigido, no ve el registro", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "operario" } });
    useAuditoria.mockReturnValue({ data: [], loading: false, error: null, recargar: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/admin/auditoria"]}>
        <Routes>
          <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
          <Route path="/admin/auditoria" element={<Auditoria />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });

  it("sin acciones, muestra el mensaje vacío", () => {
    useAuditoria.mockReturnValue({ data: [], loading: false, error: null, recargar: vi.fn() });
    renderComoAdmin();
    expect(screen.getByText(/Todavía no hay acciones registradas/)).toBeInTheDocument();
  });

  it("muestra cada acción con su etiqueta traducida y el detalle", () => {
    useAuditoria.mockReturnValue({
      data: [
        {
          id: "a1",
          usuario_nombre: "Sheila",
          accion: "calibrar_sensor",
          detalle: "RIO-PIURA-01: prealerta=10cm",
          creado_en: "2026-08-17T10:00:00Z",
        },
      ],
      loading: false,
      error: null,
      recargar: vi.fn(),
    });
    renderComoAdmin();

    expect(screen.getByText("Sheila")).toBeInTheDocument();
    expect(screen.getByText("calibración de sensor")).toBeInTheDocument();
    expect(screen.getByText("RIO-PIURA-01: prealerta=10cm")).toBeInTheDocument();
  });

  it("muestra el banner de error con botón de reintentar", () => {
    const recargar = vi.fn();
    useAuditoria.mockReturnValue({ data: null, loading: false, error: "network error", recargar });
    renderComoAdmin();
    expect(screen.getByText(/No se pudo cargar el registro/)).toBeInTheDocument();
  });
});
