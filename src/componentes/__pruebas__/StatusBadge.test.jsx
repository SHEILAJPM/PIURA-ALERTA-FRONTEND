import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("muestra 'Nivel normal' para estado normal", () => {
    render(<StatusBadge status="normal" />);
    expect(screen.getByText("Nivel normal")).toBeInTheDocument();
  });

  it("muestra 'Alerta roja' para estado alerta_roja", () => {
    render(<StatusBadge status="alerta_roja" />);
    expect(screen.getByText("Alerta roja")).toBeInTheDocument();
  });

  it("muestra 'Sin datos' para un estado desconocido o ausente", () => {
    render(<StatusBadge status={undefined} />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });
});
