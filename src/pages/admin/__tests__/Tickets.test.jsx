import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Tickets from "../Tickets";
import { useTickets } from "../../../hooks/useTickets";
import { useSensores } from "../../../hooks/useSensores";
import { crearTicket, actualizarEstadoTicket } from "../../../lib/api";

vi.mock("../../../hooks/useTickets", () => ({ useTickets: vi.fn() }));
vi.mock("../../../hooks/useSensores", () => ({ useSensores: vi.fn() }));
vi.mock("../../../lib/api", () => ({ crearTicket: vi.fn(), actualizarEstadoTicket: vi.fn() }));

function ticket(overrides = {}) {
  return {
    id: "t1",
    titulo: "Sensor sin señal",
    descripcion: null,
    estado: "abierto",
    prioridad: "alta",
    sensor_codigo: null,
    sensor_nombre: null,
    creado_en: "2026-08-17T10:00:00Z",
    ...overrides,
  };
}

describe("Tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSensores.mockReturnValue({ data: [], loading: false, error: null });
  });

  it("sin tickets, muestra el mensaje vacío", () => {
    useTickets.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Tickets />);
    expect(screen.getByText("No hay tickets abiertos.")).toBeInTheDocument();
  });

  it("un ticket abierto muestra el botón para avanzarlo a 'Iniciar'", () => {
    useTickets.mockReturnValue({
      data: [ticket({ estado: "abierto" })],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Tickets />);
    expect(screen.getByText("Sensor sin señal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar" })).toBeInTheDocument();
  });

  it("un ticket cerrado no tiene botón de avanzar (ya no hay siguiente estado)", () => {
    useTickets.mockReturnValue({
      data: [ticket({ estado: "cerrado" })],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Tickets />);
    expect(screen.queryByRole("button", { name: "Iniciar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeInTheDocument();
  });

  it("avanzar un ticket llama a actualizarEstadoTicket con el siguiente estado", async () => {
    const setData = vi.fn();
    useTickets.mockReturnValue({
      data: [ticket({ estado: "abierto" })],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    actualizarEstadoTicket.mockResolvedValue({ estado: "en_progreso" });

    render(<Tickets />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Iniciar" }));
    });

    expect(actualizarEstadoTicket).toHaveBeenCalledWith("t1", "en_progreso");
    expect(setData).toHaveBeenCalled();
  });

  it("crear un ticket nuevo llama a crearTicket con el título", async () => {
    const setData = vi.fn();
    useTickets.mockReturnValue({ data: [], loading: false, error: null, setData, recargar: vi.fn() });
    crearTicket.mockResolvedValue({ id: "t2", titulo: "Calibrar RIO-PIURA-02", estado: "abierto" });

    render(<Tickets />);
    fireEvent.click(screen.getByRole("button", { name: "+ Nuevo ticket" }));
    fireEvent.change(screen.getByPlaceholderText(/Título/), {
      target: { value: "Calibrar RIO-PIURA-02" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Crear ticket" }));
    });

    expect(crearTicket).toHaveBeenCalledWith(expect.objectContaining({ titulo: "Calibrar RIO-PIURA-02" }));
    expect(setData).toHaveBeenCalled();
  });
});
