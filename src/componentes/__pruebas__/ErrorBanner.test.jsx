import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBanner from "../ErrorBanner";

describe("ErrorBanner", () => {
  it("muestra el mensaje recibido", () => {
    render(<ErrorBanner message="No se pudo conectar" />);
    expect(screen.getByText("No se pudo conectar")).toBeInTheDocument();
  });

  it("no muestra botón de reintentar si no se pasa onRetry", () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.queryByText("Reintentar")).not.toBeInTheDocument();
  });

  it("llama a onRetry al hacer click en Reintentar", () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Reintentar"));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
