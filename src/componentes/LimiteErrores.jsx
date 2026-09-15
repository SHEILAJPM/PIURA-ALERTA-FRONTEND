import { Component } from "react";

// Los "error boundaries" de React todavía necesitan ser un componente de
// clase (no hay equivalente con hooks) -- caso único en este proyecto,
// reservado para envolver cosas que pueden fallar en tiempo de ejecución por
// algo fuera de nuestro control (ej. MascotaAsistente3D si el navegador no
// soporta WebGL), no errores normales de la app.
class LimiteErrores extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    if (this.state.fallo) return this.props.fallback;
    return this.props.children;
  }
}

export default LimiteErrores;
