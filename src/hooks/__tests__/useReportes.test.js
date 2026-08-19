import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReportes } from "../useReportes";
import * as api from "../../lib/api";

vi.mock("../../lib/api", () => ({
  getReportes: vi.fn(),
  crearReporte: vi.fn(),
  darLike: vi.fn(),
  actualizarEstadoReporte: vi.fn(),
}));

// useReportes llama a useWebSocketEvent en cada render; mockearlo evita tener
// que envolver el hook en un WebSocketProvider real (que intentaría abrir un
// WebSocket real en jsdom).
vi.mock("../../context/WebSocketContext", () => ({
  useWebSocketEvent: vi.fn(),
}));

function reporte(id, creado_en) {
  return { id, creado_en, descripcion: `reporte-${id}` };
}

describe("useReportes: paginación por cursor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hayMas es true cuando la primera página llega completa (== limite)", async () => {
    api.getReportes.mockResolvedValue([reporte(1, "2024-01-02"), reporte(2, "2024-01-01")]);
    const { result } = renderHook(() => useReportes(2));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hayMas).toBe(true);
  });

  it("hayMas es false cuando la primera página llega corta", async () => {
    api.getReportes.mockResolvedValue([reporte(1, "2024-01-01")]);
    const { result } = renderHook(() => useReportes(30));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hayMas).toBe(false);
  });

  it("cargarMas pide la página siguiente con antes=creado_en del último cargado y la agrega al final", async () => {
    api.getReportes.mockResolvedValueOnce([reporte(1, "2024-01-02"), reporte(2, "2024-01-01")]);
    const { result } = renderHook(() => useReportes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));

    api.getReportes.mockResolvedValueOnce([reporte(3, "2023-12-31")]);
    await act(async () => {
      await result.current.cargarMas();
    });

    expect(api.getReportes).toHaveBeenLastCalledWith({ limite: 2, antes: "2024-01-01" });
    expect(result.current.reportes.map((r) => r.id)).toEqual([1, 2, 3]);
    // la página nueva llegó corta (1 < limite 2) -> ya no hay más
    expect(result.current.hayMas).toBe(false);
  });

  it("cargarMas no vuelve a pedir nada si ya no hay más páginas", async () => {
    api.getReportes.mockResolvedValueOnce([reporte(1, "2024-01-01")]);
    const { result } = renderHook(() => useReportes(30));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hayMas).toBe(false);

    await act(async () => {
      await result.current.cargarMas();
    });
    expect(api.getReportes).toHaveBeenCalledTimes(1);
  });
});
