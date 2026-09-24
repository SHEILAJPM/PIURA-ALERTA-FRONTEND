import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MiPerfil from "../MiPerfil";
import { useAuth } from "../../contexto/AuthContext";
import { useSensores } from "../../ganchos/useSensores";
import { obtenerPerfil, reenviarVerificacionCorreo } from "../../utilidades/api";

vi.mock("../../contexto/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../ganchos/useSensores", () => ({ useSensores: vi.fn() }));
vi.mock("../../utilidades/api", () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  cambiarPassword: vi.fn(),
  reenviarVerificacionCorreo: vi.fn(),
}));

const perfilBase = {
  nombre: "Sheila",
  correo: "sheila@x.com",
  rol: "ciudadano",
  creado_en: "2026-01-01T00:00:00Z",
  telefono: null,
  direccion: null,
  recibir_alertas_sms: false,
  sensor_interes_id: null,
};

function renderPerfil() {
  return render(
    <MemoryRouter>
      <MiPerfil />
    </MemoryRouter>
  );
}

describe("MiPerfil: verificación de correo y mis reportes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ actualizarUsuario: vi.fn() });
    useSensores.mockReturnValue({ data: [] });
  });

  it("con correo_verificado=false, muestra el aviso y el botón de reenviar", async () => {
    obtenerPerfil.mockResolvedValue({ ...perfilBase, correo_verificado: false });
    renderPerfil();

    await waitFor(() => expect(screen.getByText(/no confirmaste tu correo/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Reenviar correo" })).toBeInTheDocument();
  });

  it("con correo_verificado=true, no muestra el aviso", async () => {
    obtenerPerfil.mockResolvedValue({ ...perfilBase, correo_verificado: true });
    renderPerfil();

    await waitFor(() => expect(screen.getByText("Mi perfil")).toBeInTheDocument());
    expect(screen.queryByText(/no confirmaste tu correo/)).not.toBeInTheDocument();
  });

  it("tocar 'Reenviar correo' llama a la API y muestra confirmación", async () => {
    obtenerPerfil.mockResolvedValue({ ...perfilBase, correo_verificado: false });
    reenviarVerificacionCorreo.mockResolvedValue({ mensaje: "ok" });
    renderPerfil();

    await waitFor(() => expect(screen.getByRole("button", { name: "Reenviar correo" })).toBeInTheDocument());
    await act(async () => {
      screen.getByRole("button", { name: "Reenviar correo" }).click();
    });

    expect(reenviarVerificacionCorreo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText(/Te mandamos un nuevo enlace/)).toBeInTheDocument());
  });

  it("siempre muestra un link a Mis reportes", async () => {
    obtenerPerfil.mockResolvedValue({ ...perfilBase, correo_verificado: true });
    renderPerfil();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Ver mis reportes" })).toHaveAttribute("href", "/mis-reportes")
    );
  });
});
