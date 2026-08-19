import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Sensores from "../Sensores";
import { useSensores } from "../../../hooks/useSensores";
import { crearSensor } from "../../../lib/api";

vi.mock("../../../hooks/useSensores", () => ({ useSensores: vi.fn() }));
vi.mock("../../../lib/api", () => ({ crearSensor: vi.fn() }));

describe("Sensores (catálogo de nodos)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin nodos, muestra el mensaje vacío", () => {
    useSensores.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Sensores />);
    expect(screen.getByText("No hay nodos registrados todavía.")).toBeInTheDocument();
  });

  it("muestra los nodos existentes con su código", () => {
    useSensores.mockReturnValue({
      data: [{ id: "s1", codigo: "RIO-PIURA-01", nombre: "Puente Bolognesi", activo: true }],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Sensores />);
    expect(screen.getByText("Puente Bolognesi")).toBeInTheDocument();
    expect(screen.getByText("RIO-PIURA-01")).toBeInTheDocument();
  });

  it("registrar un nodo nuevo llama a crearSensor y lo agrega a la lista", async () => {
    const setData = vi.fn();
    useSensores.mockReturnValue({ data: [], loading: false, error: null, setData, recargar: vi.fn() });
    crearSensor.mockResolvedValue({
      id: "s2",
      codigo: "RIO-PIURA-02",
      nombre: "Puente Sánchez Cerro",
      nivel_prealerta_cm: 10,
      nivel_alerta_roja_cm: 16,
    });

    render(<Sensores />);
    fireEvent.click(screen.getByRole("button", { name: /Registrar nodo ESP32/ }));

    fireEvent.change(screen.getByPlaceholderText("RIO-PIURA-02"), { target: { value: "RIO-PIURA-02" } });
    fireEvent.change(screen.getByPlaceholderText("Puente Bolognesi"), {
      target: { value: "Puente Sánchez Cerro" },
    });
    fireEvent.change(screen.getByPlaceholderText("-5.1945"), { target: { value: "-5.19" } });
    fireEvent.change(screen.getByPlaceholderText("-80.6328"), { target: { value: "-80.63" } });
    fireEvent.change(screen.getByPlaceholderText("10"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("16"), { target: { value: "16" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Registrar nodo" }));
    });

    expect(crearSensor).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: "RIO-PIURA-02", nombre: "Puente Sánchez Cerro" })
    );
    expect(setData).toHaveBeenCalled();
  });
});
