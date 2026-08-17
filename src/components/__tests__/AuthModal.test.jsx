import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthModal from "../AuthModal";
import { AuthProvider, useAuth } from "../../context/AuthContext";

function BotonAbrir({ modo = "login" }) {
  const { abrirModal } = useAuth();
  return (
    <button onClick={() => abrirModal(modo)}>abrir-{modo}</button>
  );
}

function renderModal(modo) {
  return render(
    <AuthProvider>
      <BotonAbrir modo={modo} />
      <AuthModal />
    </AuthProvider>
  );
}

describe("AuthModal", () => {
  beforeEach(() => localStorage.clear());

  it("no renderiza nada si el modal está cerrado", () => {
    render(
      <AuthProvider>
        <AuthModal />
      </AuthProvider>
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
});
