import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAlertasSOS } from "../useAlertasSOS";
import { getAlertasSOS } from "../../utilidades/api";

vi.mock("../../utilidades/api", () => ({ getAlertasSOS: vi.fn() }));

const handlers = {};
vi.mock("../../contexto/WebSocketContext", () => ({
  useWebSocketEvent: (tipo, manejador) => {
    handlers[tipo] = manejador;
  },
}));

function alerta(id, estado = "pendiente") {
  return { id, estado, nombre_contacto: `Persona ${id}` };
}

describe("useAlertasSOS", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carga las alertas iniciales", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1)]);
    const { result } = renderHook(() => useAlertasSOS());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([alerta(1)]);
  });

  it("una alerta nueva por WebSocket se agrega al principio de la lista", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1)]);
    const { result } = renderHook(() => useAlertasSOS());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => handlers["alerta_sos"](alerta(2)));

    expect(result.current.data.map((a) => a.id)).toEqual([2, 1]);
  });

  it("no duplica una alerta que ya está en la lista (eco del propio envío)", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1)]);
    const { result } = renderHook(() => useAlertasSOS());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => handlers["alerta_sos"](alerta(1)));

    expect(result.current.data.map((a) => a.id)).toEqual([1]);
  });

  it("al marcarse atendida por WebSocket, desaparece de la lista (sin incluirAtendidas)", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1), alerta(2)]);
    const { result } = renderHook(() => useAlertasSOS());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => handlers["alerta_sos_actualizada"]({ id: 1, estado: "atendido" }));

    expect(result.current.data.map((a) => a.id)).toEqual([2]);
  });

  it("con incluirAtendidas=true, una alerta atendida se actualiza pero no se saca de la lista", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1), alerta(2)]);
    const { result } = renderHook(() => useAlertasSOS({ incluirAtendidas: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => handlers["alerta_sos_actualizada"]({ id: 1, estado: "atendido" }));

    expect(result.current.data.map((a) => a.id)).toEqual([1, 2]);
    expect(result.current.data.find((a) => a.id === 1).estado).toBe("atendido");
  });
});
