import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Despacho from "../Despacho";
import { useUltimaLectura } from "../../../hooks/useUltimaLectura";
import { useEstadoSensores } from "../../../hooks/useEstadoSensores";
import { difundirAlertaManual } from "../../../lib/api";

vi.mock("../../../hooks/useUltimaLectura", () => ({ useUltimaLectura: vi.fn() }));
vi.mock("../../../hooks/useEstadoSensores", () => ({ useEstadoSensores: vi.fn() }));
vi.mock("../../../lib/api", () => ({ difundirAlertaManual: vi.fn() }));

function setup({ sensores = [] } = {}) {
  useUltimaLectura.mockReturnValue({
    lectura: { nivel_cm: 12.5, estado: "normal" },
    loading: false,
    error: null,
  });
  useEstadoSensores.mockReturnValue({ data: sensores, loading: false, error: null });
}

describe("Despacho", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el nivel actual del río y los nodos en línea", () => {
    setup({ sensores: [{ en_linea: true }, { en_linea: true }, { en_linea: false }] });
    render(<Despacho />);
    expect(screen.getByText("12.5 cm")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("el botón de difusión queda deshabilitado sin mensaje", () => {
    setup();
    render(<Despacho />);
    expect(screen.getByRole("button", { name: "Enviar difusión" })).toBeDisabled();
  });

  it("escribir un mensaje habilita el botón y pide confirmación antes de enviar", async () => {
    setup();
    render(<Despacho />);

    fireEvent.change(screen.getByPlaceholderText(/Evacúen preventivamente/), {
      target: { value: "Aviso de prueba" },
    });
    expect(screen.getByRole("button", { name: "Enviar difusión" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Enviar difusión" }));
    expect(screen.getByRole("dialog", { name: "Confirmar difusión" })).toBeInTheDocument();
    expect(difundirAlertaManual).not.toHaveBeenCalled();
  });

  it("confirmar la difusión llama a difundirAlertaManual con el mensaje", async () => {
    setup();
    difundirAlertaManual.mockResolvedValue({ enviado_a: 5 });

    render(<Despacho />);
    fireEvent.change(screen.getByPlaceholderText(/Evacúen preventivamente/), {
      target: { value: "Aviso de prueba" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar difusión" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sí, enviar ahora" }));
    });

    expect(difundirAlertaManual).toHaveBeenCalledWith("Aviso de prueba");
    expect(screen.getByText(/Enviado a 5 suscriptor/)).toBeInTheDocument();
  });
});
