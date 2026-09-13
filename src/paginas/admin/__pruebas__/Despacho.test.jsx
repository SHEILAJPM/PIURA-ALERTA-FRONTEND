import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import Despacho from "../Despacho";
import { useUltimaLectura } from "../../../ganchos/useUltimaLectura";
import { useEstadoSensores } from "../../../ganchos/useEstadoSensores";
import { difundirAlertaManual, getAlertasSOS, actualizarEstadoSOS } from "../../../utilidades/api";

vi.mock("../../../ganchos/useUltimaLectura", () => ({ useUltimaLectura: vi.fn() }));
vi.mock("../../../ganchos/useEstadoSensores", () => ({ useEstadoSensores: vi.fn() }));
vi.mock("../../../utilidades/api", () => ({
  difundirAlertaManual: vi.fn(),
  getAlertasSOS: vi.fn(),
  actualizarEstadoSOS: vi.fn(),
}));
// useAlertasSOS se suscribe a eventos en vivo (ver AlertasSOS en Despacho.jsx);
// mockeado para no depender de un WebSocketProvider real en la prueba.
vi.mock("../../../contexto/WebSocketContext", () => ({ useWebSocketEvent: vi.fn() }));

function setup({ sensores = [], alertasSOS = [] } = {}) {
  useUltimaLectura.mockReturnValue({
    lectura: { nivel_cm: 12.5, estado: "normal" },
    loading: false,
    error: null,
  });
  useEstadoSensores.mockReturnValue({ data: sensores, loading: false, error: null });
  getAlertasSOS.mockResolvedValue(alertasSOS);
}

describe("Despacho", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el nivel actual del río y los nodos en línea", async () => {
    setup({ sensores: [{ en_linea: true }, { en_linea: true }, { en_linea: false }] });
    render(<Despacho />);
    expect(screen.getByText("12.5 cm")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalled());
  });

  it("el botón de difusión queda deshabilitado sin mensaje", async () => {
    setup();
    render(<Despacho />);
    expect(screen.getByRole("button", { name: "Enviar difusión" })).toBeDisabled();
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalled());
  });

  it("escribir un mensaje habilita el botón y pide confirmación antes de enviar", async () => {
    setup();
    render(<Despacho />);
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalled());

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
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalled());
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

  it("sin alertas SOS pendientes, no muestra la sección", async () => {
    setup({ alertasSOS: [] });
    render(<Despacho />);
    await waitFor(() => expect(getAlertasSOS).toHaveBeenCalled());
    expect(screen.queryByText(/^SOS —/)).not.toBeInTheDocument();
  });

  it("muestra una alerta SOS pendiente y permite marcarla atendida", async () => {
    setup({
      alertasSOS: [
        {
          id: "s1",
          nombre_contacto: "Adrian",
          telefono_contacto: "987654321",
          estado: "pendiente",
          creado_en: "2026-08-17T10:00:00Z",
          ubicacion: { type: "Point", coordinates: [-80.63, -5.19] },
        },
      ],
    });
    actualizarEstadoSOS.mockResolvedValue({ id: "s1", estado: "atendido" });
    render(<Despacho />);

    await waitFor(() => expect(screen.getByText("SOS — Adrian")).toBeInTheDocument());
    expect(screen.getByText(/987654321/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Marcar atendido" }));
    });

    expect(actualizarEstadoSOS).toHaveBeenCalledWith("s1", "atendido");
    await waitFor(() => expect(screen.queryByText("SOS — Adrian")).not.toBeInTheDocument());
  });
});
