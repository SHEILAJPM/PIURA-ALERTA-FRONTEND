import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Albergues from "../Albergues";
import { useAlbergues } from "../../../ganchos/useAlbergues";
import { actualizarOcupacionAlbergue, crearAlbergue, eliminarAlbergue } from "../../../utilidades/api";

vi.mock("../../../ganchos/useAlbergues", () => ({ useAlbergues: vi.fn() }));
vi.mock("../../../utilidades/api", () => ({
  actualizarOcupacionAlbergue: vi.fn(),
  crearAlbergue: vi.fn(),
  eliminarAlbergue: vi.fn(),
}));

function albergue(overrides = {}) {
  return {
    id: "a1",
    nombre: "Coliseo Gerónimo Seminario",
    direccion: "Av. Grau 123",
    capacidad: 100,
    ocupacion_actual: 20,
    ...overrides,
  };
}

describe("Albergues", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin albergues, muestra el mensaje vacío", () => {
    useAlbergues.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Albergues />);
    expect(screen.getByText("No hay albergues registrados.")).toBeInTheDocument();
  });

  it("clasifica el nivel de ocupación (disponible/casi lleno/crítico)", () => {
    useAlbergues.mockReturnValue({
      data: [
        albergue({ id: "a1", nombre: "Colegio San Miguel", ocupacion_actual: 10, capacidad: 100 }),
        albergue({ id: "a2", nombre: "Coliseo Municipal", ocupacion_actual: 65, capacidad: 100 }),
        albergue({ id: "a3", nombre: "Estadio Miguel Grau", ocupacion_actual: 95, capacidad: 100 }),
      ],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(<Albergues />);

    expect(screen.getByText("Colegio San Miguel").closest("tr")).toHaveTextContent("Disponible");
    expect(screen.getByText("Coliseo Municipal").closest("tr")).toHaveTextContent("Casi lleno");
    expect(screen.getByText("Estadio Miguel Grau").closest("tr")).toHaveTextContent("Crítico");
  });

  it("editar el aforo llama a actualizarOcupacionAlbergue con el nuevo valor", async () => {
    const setData = vi.fn();
    useAlbergues.mockReturnValue({
      data: [albergue()],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    actualizarOcupacionAlbergue.mockResolvedValue({ ocupacion_actual: 30 });

    render(<Albergues />);
    fireEvent.click(screen.getByRole("button", { name: "Editar aforo" }));

    const input = screen.getByLabelText("Nueva ocupación de Coliseo Gerónimo Seminario");
    fireEvent.change(input, { target: { value: "30" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(actualizarOcupacionAlbergue).toHaveBeenCalledWith("a1", 30);
    expect(setData).toHaveBeenCalled();
  });

  it("rechaza un valor por encima de la capacidad sin llamar a la API", async () => {
    useAlbergues.mockReturnValue({
      data: [albergue({ capacidad: 100 })],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });

    render(<Albergues />);
    fireEvent.click(screen.getByRole("button", { name: "Editar aforo" }));
    fireEvent.change(screen.getByLabelText("Nueva ocupación de Coliseo Gerónimo Seminario"), {
      target: { value: "999" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(actualizarOcupacionAlbergue).not.toHaveBeenCalled();
    expect(screen.getByText(/Debe ser un número entre 0 y 100/)).toBeInTheDocument();
  });

  it("agregar albergue llama a crearAlbergue con los datos del formulario", async () => {
    const setData = vi.fn();
    useAlbergues.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    crearAlbergue.mockResolvedValue({ id: "nuevo" });

    render(<Albergues />);
    fireEvent.click(screen.getByRole("button", { name: /Agregar albergue/ }));

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "I.E. San Miguel" } });
    fireEvent.change(screen.getByLabelText("Capacidad"), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText("Latitud"), { target: { value: "-5.19" } });
    fireEvent.change(screen.getByLabelText("Longitud"), { target: { value: "-80.63" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar albergue" }));
    });

    expect(crearAlbergue).toHaveBeenCalledWith({
      nombre: "I.E. San Miguel",
      direccion: undefined,
      capacidad: 200,
      lon: -80.63,
      lat: -5.19,
    });
    expect(setData).toHaveBeenCalled();
  });

  it("quitar un albergue pide confirmación y llama a eliminarAlbergue", async () => {
    const setData = vi.fn();
    useAlbergues.mockReturnValue({
      data: [albergue()],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    eliminarAlbergue.mockResolvedValue();

    render(<Albergues />);
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sí, quitar" }));
    });

    expect(eliminarAlbergue).toHaveBeenCalledWith("a1");
    expect(setData).toHaveBeenCalled();
  });
});
