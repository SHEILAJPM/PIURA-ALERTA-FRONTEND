import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ModeracionReportes from "../Reportes";
import { useReportes } from "../../../hooks/useReportes";

vi.mock("../../../hooks/useReportes", () => ({ useReportes: vi.fn() }));

function reporte(overrides = {}) {
  return {
    id: "r1",
    usuario_nombre: "Adrian",
    descripcion: "Calle inundada",
    foto_url: null,
    estado: "pendiente",
    posible_spam: false,
    motivo_ia: null,
    creado_en: "2026-08-17T10:00:00Z",
    ...overrides,
  };
}

describe("ModeracionReportes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin reportes, muestra los mensajes vacíos de ambas secciones", () => {
    useReportes.mockReturnValue({ reportes: [], loading: false, error: null, actualizarEstado: vi.fn() });
    render(<ModeracionReportes />);
    expect(screen.getByText("No hay reportes pendientes de revisión.")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay reportes revisados.")).toBeInTheDocument();
  });

  it("separa pendientes de revisados y marca el posible spam", () => {
    useReportes.mockReturnValue({
      reportes: [
        reporte({ id: "r1", estado: "pendiente", posible_spam: true, motivo_ia: "texto repetido" }),
        reporte({ id: "r2", estado: "verificado" }),
      ],
      loading: false,
      error: null,
      actualizarEstado: vi.fn(),
    });
    render(<ModeracionReportes />);

    expect(screen.getByText("Pendientes (1)")).toBeInTheDocument();
    expect(screen.getByText(/Posible spam/)).toBeInTheDocument();
  });

  it("verificar un reporte pendiente llama a actualizarEstado", async () => {
    const actualizarEstado = vi.fn().mockResolvedValue(undefined);
    useReportes.mockReturnValue({
      reportes: [reporte({ id: "r1", estado: "pendiente" })],
      loading: false,
      error: null,
      actualizarEstado,
    });
    render(<ModeracionReportes />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Verificar/ }));
    });

    expect(actualizarEstado).toHaveBeenCalledWith("r1", "verificado");
  });

  it("descartar un reporte pendiente llama a actualizarEstado", async () => {
    const actualizarEstado = vi.fn().mockResolvedValue(undefined);
    useReportes.mockReturnValue({
      reportes: [reporte({ id: "r1", estado: "pendiente" })],
      loading: false,
      error: null,
      actualizarEstado,
    });
    render(<ModeracionReportes />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Descartar/ }));
    });

    expect(actualizarEstado).toHaveBeenCalledWith("r1", "descartado");
  });

  it("muestra el banner de error cuando falla la carga", () => {
    useReportes.mockReturnValue({
      reportes: [],
      loading: false,
      error: "network error",
      actualizarEstado: vi.fn(),
    });
    render(<ModeracionReportes />);
    expect(screen.getByText(/No se pudieron cargar los reportes/)).toBeInTheDocument();
  });
});
