import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FormularioCreacion from "../FormularioCreacion";

function renderFormulario({ validar, onCrear } = {}) {
  return render(
    <FormularioCreacion
      camposIniciales={{ nombre: "" }}
      validar={validar ?? ((v) => (v.nombre.trim() ? { datos: { nombre: v.nombre } } : { error: "Falta el nombre" }))}
      onCrear={onCrear ?? vi.fn().mockResolvedValue()}
      textoBoton="Agregar cosa"
      textoGuardar="Guardar"
      textoGuardando="Guardando..."
    >
      {({ valores, actualizar }) => (
        <input placeholder="nombre" value={valores.nombre} onChange={actualizar("nombre")} />
      )}
    </FormularioCreacion>
  );
}

describe("FormularioCreacion", () => {
  it("empieza colapsado, mostrando solo el botón para abrir", () => {
    renderFormulario();
    expect(screen.getByRole("button", { name: "Agregar cosa" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("nombre")).not.toBeInTheDocument();
  });

  it("al tocar el botón, expande el formulario con los campos", () => {
    renderFormulario();
    fireEvent.click(screen.getByRole("button", { name: "Agregar cosa" }));
    expect(screen.getByPlaceholderText("nombre")).toBeInTheDocument();
  });

  it("una validación fallida muestra el error y no llama a onCrear", async () => {
    const onCrear = vi.fn();
    renderFormulario({ onCrear });
    fireEvent.click(screen.getByRole("button", { name: "Agregar cosa" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(screen.getByText("Falta el nombre")).toBeInTheDocument();
    expect(onCrear).not.toHaveBeenCalled();
  });

  it("una validación exitosa llama a onCrear con los datos y colapsa de nuevo", async () => {
    const onCrear = vi.fn().mockResolvedValue();
    renderFormulario({ onCrear });
    fireEvent.click(screen.getByRole("button", { name: "Agregar cosa" }));
    fireEvent.change(screen.getByPlaceholderText("nombre"), { target: { value: "Sheila" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(onCrear).toHaveBeenCalledWith({ nombre: "Sheila" });
    expect(screen.getByRole("button", { name: "Agregar cosa" })).toBeInTheDocument();
  });

  it("si onCrear falla, muestra el mensaje de error y deja el formulario abierto", async () => {
    const onCrear = vi.fn().mockRejectedValue(new Error("el servidor rechazó la solicitud"));
    renderFormulario({ onCrear });
    fireEvent.click(screen.getByRole("button", { name: "Agregar cosa" }));
    fireEvent.change(screen.getByPlaceholderText("nombre"), { target: { value: "Sheila" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    });

    expect(screen.getByText("el servidor rechazó la solicitud")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("nombre")).toBeInTheDocument();
  });

  it("cancelar colapsa el formulario sin llamar a onCrear", () => {
    const onCrear = vi.fn();
    renderFormulario({ onCrear });
    fireEvent.click(screen.getByRole("button", { name: "Agregar cosa" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByPlaceholderText("nombre")).not.toBeInTheDocument();
    expect(onCrear).not.toHaveBeenCalled();
  });
});
