import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KpiCard, { KpiCardSkeleton } from "../KpiCard";

describe("KpiCard", () => {
  it("muestra título, valor y descripción", () => {
    render(<KpiCard title="Nivel del río" value="12.5 cm" description="Registro actual" icon="🌊" />);
    expect(screen.getByText("Nivel del río")).toBeInTheDocument();
    expect(screen.getByText("12.5 cm")).toBeInTheDocument();
    expect(screen.getByText("Registro actual")).toBeInTheDocument();
  });
});

describe("KpiCardSkeleton", () => {
  it("renderiza sin lanzar errores", () => {
    const { container } = render(<KpiCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });
});
