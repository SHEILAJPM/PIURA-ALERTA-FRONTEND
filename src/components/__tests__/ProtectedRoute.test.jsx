import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderConSesion(usuario, roles) {
  useAuth.mockReturnValue({ usuario, abrirModal: vi.fn() });
  render(
    <MemoryRouter initialEntries={["/panel"]}>
      <Routes>
        <Route path="/" element={<span>pagina-publica</span>} />
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/panel" element={<span>panel-privado</span>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sin sesión, redirige a / en vez de mostrar la ruta protegida", () => {
    renderConSesion(null, ["administrador"]);
    expect(screen.getByText("pagina-publica")).toBeInTheDocument();
    expect(screen.queryByText("panel-privado")).not.toBeInTheDocument();
  });

  it("con sesión pero rol no permitido, redirige a /", () => {
    renderConSesion({ id: "u1", nombre: "Sheila", rol: "ciudadano" }, ["administrador"]);
    expect(screen.getByText("pagina-publica")).toBeInTheDocument();
    expect(screen.queryByText("panel-privado")).not.toBeInTheDocument();
  });

  it("con sesión y rol permitido, muestra la ruta protegida", () => {
    renderConSesion({ id: "u1", nombre: "Sheila", rol: "administrador" }, ["administrador"]);
    expect(screen.getByText("panel-privado")).toBeInTheDocument();
  });

  it("sin restricción de roles, cualquier sesión pasa", () => {
    renderConSesion({ id: "u1", nombre: "Sheila", rol: "ciudadano" }, undefined);
    expect(screen.getByText("panel-privado")).toBeInTheDocument();
  });
});
