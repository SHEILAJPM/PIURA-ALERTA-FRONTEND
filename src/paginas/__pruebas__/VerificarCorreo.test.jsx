import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import VerificarCorreo from "../VerificarCorreo";
import { verificarCorreo } from "../../utilidades/api";

vi.mock("../../utilidades/api", () => ({ verificarCorreo: vi.fn() }));

function renderConToken(token) {
  return render(
    <MemoryRouter initialEntries={[token ? `/verificar-correo?token=${token}` : "/verificar-correo"]}>
      <Routes>
        <Route path="/verificar-correo" element={<VerificarCorreo />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("VerificarCorreo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin token en la URL, muestra el aviso de enlace incompleto", () => {
    renderConToken(null);
    expect(screen.getByText("Enlace incompleto")).toBeInTheDocument();
    expect(verificarCorreo).not.toHaveBeenCalled();
  });

  it("con token válido, confirma y muestra el mensaje de éxito", async () => {
    verificarCorreo.mockResolvedValue();
    renderConToken("abc123");

    expect(verificarCorreo).toHaveBeenCalledWith("abc123");
    await waitFor(() => expect(screen.getByText("¡Correo verificado!")).toBeInTheDocument());
  });

  it("con token inválido o expirado, muestra el error", async () => {
    verificarCorreo.mockRejectedValue(new Error("El enlace no es válido o ya expiró"));
    renderConToken("vencido");

    await waitFor(() =>
      expect(screen.getByText("No se pudo verificar tu correo")).toBeInTheDocument()
    );
    expect(screen.getByText(/El enlace no es válido o ya expiró/)).toBeInTheDocument();
  });
});
