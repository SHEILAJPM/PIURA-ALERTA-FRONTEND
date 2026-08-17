import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HardwareStatusBadge from "../HardwareStatusBadge";

describe("HardwareStatusBadge", () => {
  it("sensor activo y en línea: muestra 'En línea'", () => {
    render(<HardwareStatusBadge activo enLinea />);
    expect(screen.getByText("En línea")).toBeInTheDocument();
  });

  it("sensor activo pero sin señal reciente: muestra 'Sin señal'", () => {
    render(<HardwareStatusBadge activo enLinea={false} />);
    expect(screen.getByText("Sin señal")).toBeInTheDocument();
  });

  it("sensor desactivado: muestra 'Inactivo' sin importar en_linea", () => {
    render(<HardwareStatusBadge activo={false} enLinea />);
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });
});
