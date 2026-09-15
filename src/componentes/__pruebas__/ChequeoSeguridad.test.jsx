import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChequeoSeguridad from "../ChequeoSeguridad";
import { AuthProvider } from "../../contexto/AuthContext";
import { getMiChequeo, marcarSeguro } from "../../utilidades/api";

vi.mock("../../utilidades/api", () => ({
  getMiChequeo: vi.fn(),
  marcarSeguro: vi.fn(),
}));

function renderConSesion() {
  localStorage.setItem(
    "piura-alerta-auth",
    JSON.stringify({ token: "t", usuario: { id: "u1", nombre: "Sheila" } })
  );
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ChequeoSeguridad />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ChequeoSeguridad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("sin sesión, no muestra nada", () => {
    getMiChequeo.mockResolvedValue({ ultimoChequeo: null });
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <ChequeoSeguridad />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("con sesión y sin chequeo previo, invita a marcar que está a salvo", async () => {
    getMiChequeo.mockResolvedValue({ ultimoChequeo: null });
    renderConSesion();

    await waitFor(() =>
      expect(screen.getByText(/Avísale a Defensa Civil que estás bien/)).toBeInTheDocument()
    );
  });

  it("con un chequeo previo, muestra hace cuánto fue el último aviso", async () => {
    getMiChequeo.mockResolvedValue({ ultimoChequeo: new Date().toISOString() });
    renderConSesion();

    await waitFor(() => expect(screen.getByText(/Último aviso:/)).toBeInTheDocument());
  });

  it("al hacer click, llama a marcarSeguro y actualiza el mensaje", async () => {
    getMiChequeo.mockResolvedValue({ ultimoChequeo: null });
    marcarSeguro.mockResolvedValue({ id: "c1", creado_en: new Date().toISOString() });
    renderConSesion();

    await waitFor(() => expect(screen.getByText(/Avísale a Defensa Civil/)).toBeInTheDocument());

    await act(async () => {
      screen.getByRole("button", { name: "Marcar que estoy a salvo" }).click();
    });

    expect(marcarSeguro).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText(/Último aviso:/)).toBeInTheDocument());
  });

  it("si marcarSeguro falla, muestra el mensaje de error", async () => {
    getMiChequeo.mockResolvedValue({ ultimoChequeo: null });
    marcarSeguro.mockRejectedValue(new Error("Error de red"));
    renderConSesion();

    await waitFor(() => expect(screen.getByText(/Avísale a Defensa Civil/)).toBeInTheDocument());

    await act(async () => {
      screen.getByRole("button", { name: "Marcar que estoy a salvo" }).click();
    });

    await waitFor(() => expect(screen.getByText("Error de red")).toBeInTheDocument());
  });
});
