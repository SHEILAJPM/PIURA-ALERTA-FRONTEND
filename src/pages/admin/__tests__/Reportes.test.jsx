import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ModeracionReportes from "../Reportes";
import { useReportes } from "../../../hooks/useReportes";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../hooks/useReportes", () => ({ useReportes: vi.fn() }));
vi.mock("../../../context/AuthContext", () => ({ useAuth: vi.fn() }));

function reporte(overrides = {}) {
  return {
    id: "r1",
    usuario_nombre: "Adrian",
    descripcion: "Calle inundada",
    foto_url: null,
    estado: "pendiente",
    posible_spam: false,
    motivo_ia: null,
    creado_en: "2026-08-17T10:00:00Z",
    ...overrides,
  };
}

function renderComo(rol) {
  useAuth.mockReturnValue({ usuario: { id: "u1", rol } });
  return render(<ModeracionReportes />);
}

describe("ModeracionReportes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("administrador: sin reportes, muestra los 3 mensajes vacíos", () => {
    useReportes.mockReturnValue({ reportes: [], loading: false, error: null, actualizarEstado: vi.fn() });
    renderComo("administrador");
    expect(screen.getByText("No hay reportes pendientes de revisión.")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay reportes verificados.")).toBeInTheDocument();
    expect(screen.getByText("Todavía no se archivó ningún reporte.")).toBeInTheDocument();
  });

  it("administrador: separa pendientes, verificados y archivados, y marca el posible spam", () => {
    useReportes.mockReturnValue({
      reportes: [
        reporte({ id: "r1", estado: "pendiente", posible_spam: true, motivo_ia: "texto repetido" }),
        reporte({ id: "r2", estado: "verificado" }),
        reporte({ id: "r3", estado: "descartado" }),
      ],
      loading: false,
      error: null,
      actualizarEstado: vi.fn(),
    });
    renderComo("administrador");

    expect(screen.getByText("Pendientes (1)")).toBeInTheDocument();
    expect(screen.getByText("Verificados (1)")).toBeInTheDocument();
    expect(screen.getByText("Archivados (1)")).toBeInTheDocument();
    expect(screen.getByText(/Posible spam/)).toBeInTheDocument();
    expect(screen.getByText("Archivado")).toBeInTheDocument();
  });

  it("operario/defensa civil: solo ven pendientes, no hay secciones de verificados/archivados", () => {
    useReportes.mockReturnValue({
      reportes: [reporte({ id: "r1", estado: "pendiente" })],
      loading: false,
      error: null,
      actualizarEstado: vi.fn(),
    });
    renderComo("defensa_civil");

    expect(screen.getByText("Pendientes (1)")).toBeInTheDocument();
    expect(screen.queryByText(/^Verificados/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Archivados/)).not.toBeInTheDocument();
    // el backend ya filtra esto server-side, pero si por lo que sea llegara
    // uno igual no debería listarse para este rol
    expect(screen.queryByText("Aún no hay reportes verificados.")).not.toBeInTheDocument();
  });

  it("verificar un reporte pendiente llama a actualizarEstado", async () => {
    const actualizarEstado = vi.fn().mockResolvedValue(undefined);
    useReportes.mockReturnValue({
      reportes: [reporte({ id: "r1", estado: "pendiente" })],
      loading: false,
      error: null,
      actualizarEstado,
    });
    renderComo("administrador");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Verificar/ }));
    });

    expect(actualizarEstado).toHaveBeenCalledWith("r1", "verificado");
  });

  it("archivar un reporte pendiente llama a actualizarEstado", async () => {
    const actualizarEstado = vi.fn().mockResolvedValue(undefined);
    useReportes.mockReturnValue({
      reportes: [reporte({ id: "r1", estado: "pendiente" })],
      loading: false,
      error: null,
      actualizarEstado,
    });
    renderComo("operario");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Archivar/ }));
    });

    expect(actualizarEstado).toHaveBeenCalledWith("r1", "descartado");
  });

  it("muestra el banner de error cuando falla la carga", () => {
    useReportes.mockReturnValue({
      reportes: [],
      loading: false,
      error: "network error",
      actualizarEstado: vi.fn(),
    });
    renderComo("administrador");
    expect(screen.getByText(/No se pudieron cargar los reportes/)).toBeInTheDocument();
  });
});
