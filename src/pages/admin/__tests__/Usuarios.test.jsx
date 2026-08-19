import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Usuarios from "../Usuarios";
import { useUsuarios } from "../../../hooks/useUsuarios";
import { actualizarRolUsuario } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../hooks/useUsuarios", () => ({ useUsuarios: vi.fn() }));
vi.mock("../../../lib/api", () => ({ actualizarRolUsuario: vi.fn() }));
vi.mock("../../../context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderComoAdmin() {
  useAuth.mockReturnValue({ usuario: { id: "u1", rol: "administrador" } });
  return render(
    <MemoryRouter initialEntries={["/admin/usuarios"]}>
      <Routes>
        <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Usuarios", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un rol sin permiso es redirigido, no ve la gestión de usuarios", () => {
    useAuth.mockReturnValue({ usuario: { id: "u1", rol: "operario" } });
    useUsuarios.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    render(
      <MemoryRouter initialEntries={["/admin/usuarios"]}>
        <Routes>
          <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });

  it("sin cuentas, muestra el mensaje vacío", () => {
    useUsuarios.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    renderComoAdmin();
    expect(screen.getByText("No hay cuentas registradas.")).toBeInTheDocument();
  });

  it("muestra cada usuario con su rol actual seleccionado", () => {
    useUsuarios.mockReturnValue({
      data: [
        {
          id: "u2",
          nombre: "Adrian",
          correo: "adrian@example.com",
          rol: "operario",
          creado_en: "2026-08-01T00:00:00Z",
        },
      ],
      loading: false,
      error: null,
      setData: vi.fn(),
      recargar: vi.fn(),
    });
    renderComoAdmin();

    expect(screen.getByText("Adrian")).toBeInTheDocument();
    expect(screen.getByText("adrian@example.com")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("operario");
  });

  it("cambiar el rol de un usuario llama a actualizarRolUsuario", async () => {
    const setData = vi.fn();
    useUsuarios.mockReturnValue({
      data: [
        {
          id: "u2",
          nombre: "Adrian",
          correo: "adrian@example.com",
          rol: "operario",
          creado_en: "2026-08-01T00:00:00Z",
        },
      ],
      loading: false,
      error: null,
      setData,
      recargar: vi.fn(),
    });
    actualizarRolUsuario.mockResolvedValue({ rol: "administrador" });

    renderComoAdmin();
    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "administrador" } });
    });

    expect(actualizarRolUsuario).toHaveBeenCalledWith("u2", "administrador");
    expect(setData).toHaveBeenCalled();
  });
});
