import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth, dispararSesionExpirada } from "../AuthContext";
import * as api from "../../lib/api";

vi.mock("../../lib/api", () => ({
  iniciarSesion: vi.fn(),
  registrarUsuario: vi.fn(),
}));

function Sonda() {
  const { usuario, login, logout, modal, sesionExpirada, cerrarModal } = useAuth();
  return (
    <div>
      <span data-testid="usuario">{usuario ? usuario.nombre : "sin-sesion"}</span>
      <span data-testid="modal">{modal ?? "cerrado"}</span>
      <span data-testid="sesion-expirada">{String(sesionExpirada)}</span>
      <button onClick={() => login("sheila@example.com", "clave1234")}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={cerrarModal}>cerrar-modal</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("arranca sin sesión si no hay nada en localStorage", () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>
    );
    expect(screen.getByTestId("usuario")).toHaveTextContent("sin-sesion");
  });

  it("login() guarda el usuario en el estado y en localStorage", async () => {
    api.iniciarSesion.mockResolvedValue({
      token: "token-falso",
      usuario: { id: "u1", nombre: "Sheila" },
    });

    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("usuario")).toHaveTextContent("Sheila");
    expect(JSON.parse(localStorage.getItem("piura-alerta-auth")).token).toBe("token-falso");
  });

  it("logout() limpia el estado y localStorage", async () => {
    api.iniciarSesion.mockResolvedValue({
      token: "token-falso",
      usuario: { id: "u1", nombre: "Sheila" },
    });

    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });
    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("usuario")).toHaveTextContent("sin-sesion");
    expect(localStorage.getItem("piura-alerta-auth")).toBeNull();
  });

  it("dispararSesionExpirada() cierra la sesión, abre el modal de login y marca sesionExpirada", async () => {
    api.iniciarSesion.mockResolvedValue({
      token: "token-falso",
      usuario: { id: "u1", nombre: "Sheila" },
    });

    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("usuario")).toHaveTextContent("Sheila");

    await act(async () => {
      dispararSesionExpirada();
    });

    expect(screen.getByTestId("usuario")).toHaveTextContent("sin-sesion");
    expect(screen.getByTestId("modal")).toHaveTextContent("login");
    expect(screen.getByTestId("sesion-expirada")).toHaveTextContent("true");
  });

  it("cerrar el modal apaga el aviso de sesión expirada", async () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>
    );

    await act(async () => {
      dispararSesionExpirada();
    });
    expect(screen.getByTestId("sesion-expirada")).toHaveTextContent("true");

    await act(async () => {
      screen.getByText("cerrar-modal").click();
    });
    expect(screen.getByTestId("sesion-expirada")).toHaveTextContent("false");
  });
});
