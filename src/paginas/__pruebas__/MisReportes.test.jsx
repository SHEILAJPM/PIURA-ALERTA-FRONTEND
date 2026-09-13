import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MisReportes from "../MisReportes";
import { useReportes } from "../../ganchos/useReportes";
import { AuthProvider } from "../../contexto/AuthContext";

vi.mock("../../ganchos/useReportes", () => ({ useReportes: vi.fn() }));

function renderPagina() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <MisReportes />
      </AuthProvider>
    </MemoryRouter>
  );
}

const baseHook = {
  reportes: [],
  loading: false,
  error: null,
  darLike: vi.fn(),
  confirmarReporte: vi.fn(),
  cargarMas: vi.fn(),
  cargandoMas: false,
  hayMas: false,
};

describe("MisReportes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pide el feed con soloMios: true", () => {
    useReportes.mockReturnValue(baseHook);
    renderPagina();
    expect(useReportes).toHaveBeenCalledWith(20, { soloMios: true });
  });

  it("sin reportes, muestra el mensaje vacío con un link a /reportes", () => {
    useReportes.mockReturnValue(baseHook);
    renderPagina();
    expect(screen.getByText("Todavía no mandaste ningún reporte")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manda el primero" })).toHaveAttribute("href", "/reportes");
  });

  it("muestra cada reporte propio, incluido uno archivado", () => {
    useReportes.mockReturnValue({
      ...baseHook,
      reportes: [
        {
          id: "r1",
          usuario_nombre: "Sheila",
          descripcion: "reporte verificado",
          estado: "verificado",
          foto_url: null,
          likes_count: 0,
          confirmaciones_count: 0,
          creado_en: "2026-08-17T10:00:00Z",
        },
        {
          id: "r2",
          usuario_nombre: "Sheila",
          descripcion: "reporte archivado",
          estado: "descartado",
          foto_url: null,
          likes_count: 0,
          confirmaciones_count: 0,
          creado_en: "2026-08-17T09:00:00Z",
        },
      ],
    });
    renderPagina();
    expect(screen.getByText(/reporte verificado/)).toBeInTheDocument();
    expect(screen.getByText(/reporte archivado/)).toBeInTheDocument();
    expect(screen.getByText("No se publicó (archivado)")).toBeInTheDocument();
  });

  it("muestra el banner de error", () => {
    useReportes.mockReturnValue({ ...baseHook, error: "network error" });
    renderPagina();
    expect(screen.getByText(/No se pudieron cargar tus reportes/)).toBeInTheDocument();
  });
});
