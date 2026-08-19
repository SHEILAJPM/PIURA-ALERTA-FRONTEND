import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPageHeader from "../AdminPageHeader";

describe("AdminPageHeader", () => {
  it("muestra el título", () => {
    render(<AdminPageHeader titulo="SENSORES" />);
    expect(screen.getByRole("heading", { name: /SENSORES/ })).toBeInTheDocument();
  });

  it("muestra el subtítulo cuando se pasa", () => {
    render(<AdminPageHeader titulo="SENSORES" subtitulo="Catálogo de nodos" />);
    expect(screen.getByText("Catálogo de nodos")).toBeInTheDocument();
  });

  it("no rompe si no hay subtítulo", () => {
    render(<AdminPageHeader titulo="SENSORES" />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("renderiza la acción cuando se pasa", () => {
    render(<AdminPageHeader titulo="SENSORES" accion={<button>+ Nuevo</button>} />);
    expect(screen.getByRole("button", { name: "+ Nuevo" })).toBeInTheDocument();
  });
});
