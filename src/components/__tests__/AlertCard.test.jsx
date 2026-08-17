import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AlertCard from "../AlertCard";

describe("AlertCard", () => {
  it("por defecto (sin estado) muestra que no hay alertas activas", () => {
    render(<AlertCard />);
    expect(screen.getByText("No existen alertas activas")).toBeInTheDocument();
  });

  it("muestra el mensaje de prealerta", () => {
    render(<AlertCard estado="prealerta" />);
    expect(screen.getByText(/Prealerta: nivel del río en ascenso/)).toBeInTheDocument();
  });

  it("muestra el mensaje de alerta roja", () => {
    render(<AlertCard estado="alerta_roja" />);
    expect(screen.getByText(/riesgo de desborde/)).toBeInTheDocument();
  });
});
