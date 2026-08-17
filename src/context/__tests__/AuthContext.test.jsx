import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import * as api from "../../lib/api";

vi.mock("../../lib/api", () => ({
  iniciarSesion: vi.fn(),
  registrarUsuario: vi.fn(),
}));

function Sonda() {
  const { usuario, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="usuario">{usuario ? usuario.nombre : "sin-sesion"}</span>
      <button onClick={() => login("sheila@example.com", "clave1234")}>login</button>
      <button onClick={logout}>logout</button>
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
});
