import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Calibracion from "../Calibracion";
import { useSensores } from "../../../hooks/useSensores";
import { actualizarCalibracionSensor } from "../../../lib/api";

vi.mock("../../../hooks/useSensores", () => ({ useSensores: vi.fn() }));
vi.mock("../../../lib/api", () => ({ actualizarCalibracionSensor: vi.fn() }));

function sensor(overrides = {}) {
  return {
    id: "s1",
    codigo: "RIO-PIURA-01",
    nombre: "Puente Bolognesi",
    nivel_prealerta_cm: 10,
    nivel_alerta_roja_cm: 16,
    ...overrides,
  };
}

describe("Calibracion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin nodos, muestra el mensaje vacío", () => {
    useSensores.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Calibracion />);
    expect(screen.getByText("No hay nodos registrados todavía.")).toBeInTheDocument();
  });

  it("muestra los umbrales actuales del sensor", () => {
    useSensores.mockReturnValue({
      data: [sensor()],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Calibracion />);
    expect(screen.getByText("10 cm")).toBeInTheDocument();
    expect(screen.getByText("16 cm")).toBeInTheDocument();
  });

  it("guardar una calibración válida llama a la API con los nuevos umbrales", async () => {
    const setData = vi.fn();
    useSensores.mockReturnValue({
      data: [sensor()],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    actualizarCalibracionSensor.mockResolvedValue({
      id: "s1",
      codigo: "RIO-PIURA-01",
      nivel_prealerta_cm: 12,
      nivel_alerta_roja_cm: 20,
    });

    render(<Calibracion />);
    fireEvent.click(screen.getByRole("button", { name: "Editar umbral" }));

    fireEvent.change(screen.getByLabelText("Prealerta"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("Alerta roja"), { target: { value: "20" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(actualizarCalibracionSensor).toHaveBeenCalledWith("s1", {
      nivel_prealerta_cm: 12,
      nivel_alerta_roja_cm: 20,
    });
    expect(setData).toHaveBeenCalled();
  });

  it("rechaza si la alerta roja no es mayor que la prealerta", async () => {
    useSensores.mockReturnValue({
      data: [sensor()],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });

    render(<Calibracion />);
    fireEvent.click(screen.getByRole("button", { name: "Editar umbral" }));
    fireEvent.change(screen.getByLabelText("Prealerta"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Alerta roja"), { target: { value: "15" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(actualizarCalibracionSensor).not.toHaveBeenCalled();
    expect(screen.getByText(/debe ser mayor que el de prealerta/)).toBeInTheDocument();
  });
});
