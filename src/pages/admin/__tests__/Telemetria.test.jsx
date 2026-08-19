import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Telemetria from "../Telemetria";
import { useEstadoSensores } from "../../../hooks/useEstadoSensores";

vi.mock("../../../hooks/useEstadoSensores", () => ({
  useEstadoSensores: vi.fn(),
}));

describe("Telemetria", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mientras carga, muestra esqueletos", () => {
    useEstadoSensores.mockReturnValue({ data: null, loading: true, error: null });
    render(<Telemetria />);
    expect(screen.getByRole("heading", { name: /TELEMETRÍA/ })).toBeInTheDocument();
  });

  it("sin nodos, muestra el mensaje vacío", () => {
    useEstadoSensores.mockReturnValue({ data: [], loading: false, error: null });
    render(<Telemetria />);
    expect(screen.getByText("No hay nodos registrados todavía.")).toBeInTheDocument();
  });

  it("con datos, muestra nombre, código y estado en línea/sin señal", () => {
    useEstadoSensores.mockReturnValue({
      data: [
        {
          id: "s1",
          nombre: "Puente Bolognesi",
          codigo: "RIO-PIURA-01",
          en_linea: true,
          ultima_lectura: { nivel_cm: 12.5, estado: "normal", medido_en: new Date().toISOString() },
        },
        {
          id: "s2",
          nombre: "Puente Cáceres",
          codigo: "RIO-PIURA-02",
          en_linea: false,
          ultima_lectura: null,
        },
      ],
      loading: false,
      error: null,
    });
    render(<Telemetria />);

    expect(screen.getByText("Puente Bolognesi")).toBeInTheDocument();
    expect(screen.getByText("12.5 cm")).toBeInTheDocument();
    expect(screen.getByText("En línea")).toBeInTheDocument();

    expect(screen.getByText("Puente Cáceres")).toBeInTheDocument();
    expect(screen.getByText("Sin señal")).toBeInTheDocument();
    expect(screen.getByText("Todavía no hay lecturas.")).toBeInTheDocument();
  });

  it("muestra el banner de error cuando falla la carga", () => {
    useEstadoSensores.mockReturnValue({ data: null, loading: false, error: "network error" });
    render(<Telemetria />);
    expect(screen.getByText(/No se pudo cargar la telemetría/)).toBeInTheDocument();
  });
});
