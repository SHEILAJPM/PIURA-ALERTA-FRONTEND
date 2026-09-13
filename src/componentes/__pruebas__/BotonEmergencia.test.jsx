import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import BotonEmergencia from "../BotonEmergencia";
import { useAuth } from "../../contexto/AuthContext";
import { enviarSOS } from "../../utilidades/api";

vi.mock("../../contexto/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../utilidades/api", () => ({ enviarSOS: vi.fn() }));

function abrirDialogo() {
  render(<BotonEmergencia />);
  fireEvent.click(screen.getByRole("button", { name: "Ver números de emergencia" }));
}

describe("BotonEmergencia / BotonSOS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ usuario: null });
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((exito) => exito({ coords: { latitude: -5.19, longitude: -80.63 } })),
    };
  });

  it("pide confirmación antes de mandar el SOS", () => {
    abrirDialogo();
    fireEvent.click(screen.getByRole("button", { name: /Enviar SOS/ }));
    expect(screen.getByText(/¿Confirmas que necesitas ayuda ahora\?/)).toBeInTheDocument();
    expect(enviarSOS).not.toHaveBeenCalled();
  });

  it("cancelar la confirmación no manda nada", () => {
    abrirDialogo();
    fireEvent.click(screen.getByRole("button", { name: /Enviar SOS/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText(/¿Confirmas que necesitas ayuda ahora\?/)).not.toBeInTheDocument();
    expect(enviarSOS).not.toHaveBeenCalled();
  });

  it("confirmar manda la ubicación obtenida del navegador", async () => {
    enviarSOS.mockResolvedValue({ id: "s1" });
    abrirDialogo();
    fireEvent.click(screen.getByRole("button", { name: /Enviar SOS/ }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sí, necesito ayuda" }));
    });

    expect(enviarSOS).toHaveBeenCalledWith({ lon: -80.63, lat: -5.19 });
    await waitFor(() =>
      expect(screen.getByText(/avisamos a Defensa Civil con tu ubicación/)).toBeInTheDocument()
    );
  });

  it("sin poder obtener la ubicación, muestra un error y no llama a enviarSOS", async () => {
    global.navigator.geolocation.getCurrentPosition = vi.fn((_exito, error) => error(new Error("denegado")));
    abrirDialogo();
    fireEvent.click(screen.getByRole("button", { name: /Enviar SOS/ }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sí, necesito ayuda" }));
    });

    expect(enviarSOS).not.toHaveBeenCalled();
    expect(screen.getByText(/No se pudo obtener tu ubicación/)).toBeInTheDocument();
  });
});
