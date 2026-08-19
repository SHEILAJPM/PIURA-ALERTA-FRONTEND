import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequiereRol from "../RequiereRol";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderConRol(rol, rolesPermitidos) {
  useAuth.mockReturnValue({ usuario: rol ? { id: "u1", rol } : null });
  render(
    <MemoryRouter initialEntries={["/admin/usuarios"]}>
      <Routes>
        <Route path="/admin/reportes" element={<span>seccion-por-defecto</span>} />
        <Route
          path="/admin/usuarios"
          element={
            <RequiereRol roles={rolesPermitidos}>
              <span>seccion-restringida</span>
            </RequiereRol>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequiereRol", () => {
  beforeEach(() => vi.clearAllMocks());

  it("con el rol permitido, muestra la sección", () => {
    renderConRol("administrador", ["administrador"]);
    expect(screen.getByText("seccion-restringida")).toBeInTheDocument();
  });

  it("con un rol no permitido, redirige a /admin/reportes sin mostrar la sección", () => {
    renderConRol("operario", ["administrador"]);
    expect(screen.queryByText("seccion-restringida")).not.toBeInTheDocument();
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });

  it("sin usuario en sesión, redirige a /admin/reportes", () => {
    renderConRol(null, ["administrador"]);
    expect(screen.getByText("seccion-por-defecto")).toBeInTheDocument();
  });
});
