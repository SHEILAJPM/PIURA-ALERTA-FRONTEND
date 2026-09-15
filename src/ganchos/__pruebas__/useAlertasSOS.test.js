import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAlertasSOS } from "../useAlertasSOS";
import { getAlertasSOS } from "../../utilidades/api";
import { useWebSocketStatus } from "../../contexto/WebSocketContext";

vi.mock("../../utilidades/api", () => ({ getAlertasSOS: vi.fn() }));

const handlers = {};
vi.mock("../../contexto/WebSocketContext", () => ({
  useWebSocketEvent: (tipo, manejador) => {
    handlers[tipo] = manejador;
  },
  useWebSocketStatus: vi.fn(),
}));

function alerta(id, estado = "pendiente") {
  return { id, estado, nombre_contacto: `Persona ${id}` };
}

describe("useAlertasSOS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWebSocketStatus.mockReturnValue("open");
  });

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

  it("al conectar por primera vez, no recarga de más (solo el fetch inicial)", async () => {
    getAlertasSOS.mockResolvedValue([alerta(1)]);
    renderHook(() => useAlertasSOS());
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalledTimes(1));
  });

  it("al reconectar el WebSocket (no la primera vez), recarga por si se perdió algo mientras estuvo caído", async () => {
    getAlertasSOS.mockResolvedValueOnce([alerta(1)]);
    const { result, rerender } = renderHook(() => useAlertasSOS());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAlertasSOS).toHaveBeenCalledTimes(1);

    useWebSocketStatus.mockReturnValue("closed");
    rerender();
    expect(getAlertasSOS).toHaveBeenCalledTimes(1);

    getAlertasSOS.mockResolvedValueOnce([alerta(1), alerta(3)]);
    useWebSocketStatus.mockReturnValue("open");
    rerender();

    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.data.map((a) => a.id)).toEqual([1, 3]));
  });
});
