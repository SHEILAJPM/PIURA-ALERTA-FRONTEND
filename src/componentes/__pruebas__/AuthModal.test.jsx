import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthModal from "../AuthModal";
import { AuthProvider, useAuth } from "../../contexto/AuthContext";
import { iniciarSesion, verificarCodigo2FA } from "../../utilidades/api";

vi.mock("../../utilidades/api", () => ({
  iniciarSesion: vi.fn(),
  verificarCodigo2FA: vi.fn(),
  registrarUsuario: vi.fn(),
  olvidarPassword: vi.fn(),
}));

function BotonAbrir({ modo = "login" }) {
  const { abrirModal } = useAuth();
  return <button onClick={() => abrirModal(modo)}>abrir-{modo}</button>;
}

function renderModal(modo) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <BotonAbrir modo={modo} />
        <AuthModal />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("AuthModal", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("no renderiza nada si el modal está cerrado", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthModal />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("abre en modo login y muestra los campos de login", () => {
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
  });

  it("abre en modo registro y muestra los campos de registro", () => {
    renderModal("registro");
    fireEvent.click(screen.getByText("abrir-registro"));
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
  });

  it("el botón de cerrar (×) oculta el modal", () => {
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("cambia de login a registro con el link inferior", () => {
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));
    fireEvent.click(screen.getByText("Regístrate"));
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("un rol operativo (requiere_2fa) muestra el paso de código en vez de cerrar el modal", async () => {
    iniciarSesion.mockResolvedValue({ requiere_2fa: true, referencia: "ref-1" });
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));

    fireEvent.change(screen.getByPlaceholderText("Correo"), { target: { value: "admin@x.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "demo1234" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    });

    expect(screen.getByText(/código de 6 dígitos/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Correo")).not.toBeInTheDocument();
    // Abandonar un login a medias por "Regístrate" no tiene sentido en este paso.
    expect(screen.queryByText("Regístrate")).not.toBeInTheDocument();
  });

  it("un ciudadano normal (sin requiere_2fa) cierra el modal directo, sin pedir código", async () => {
    iniciarSesion.mockResolvedValue({ token: "t", usuario: { id: "u1", nombre: "Sheila", rol: "ciudadano" } });
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));

    fireEvent.change(screen.getByPlaceholderText("Correo"), { target: { value: "sheila@x.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "demo1234" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    });

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("completar el código llama a verificarCodigo2FA con la referencia", async () => {
    iniciarSesion.mockResolvedValue({ requiere_2fa: true, referencia: "ref-1" });
    verificarCodigo2FA.mockResolvedValue({
      token: "t",
      usuario: { id: "u2", nombre: "Admin", rol: "administrador" },
    });
    renderModal("login");
    fireEvent.click(screen.getByText("abrir-login"));
    fireEvent.change(screen.getByPlaceholderText("Correo"), { target: { value: "admin@x.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "demo1234" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    });

    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Verificar código" }));
    });

    expect(verificarCodigo2FA).toHaveBeenCalledWith({ referencia: "ref-1", codigo: "123456" });
    await waitFor(() => expect(screen.queryByRole("heading")).not.toBeInTheDocument());
  });
});
