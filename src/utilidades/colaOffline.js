const CLAVE = "piura-alerta-reportes-pendientes";

function leerCola() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? [];
  } catch {
    return [];
  }
}

function guardarCola(cola) {
  localStorage.setItem(CLAVE, JSON.stringify(cola));
}

export function encolarReporte(datos) {
  const cola = leerCola();
  cola.push({ ...datos, _id: crypto.randomUUID() });
  guardarCola(cola);
}

export function contarPendientes() {
  return leerCola().length;
}

// Sin este guard, dos llamadas casi simultáneas (ej. el efecto de montaje y
// el evento 'online' disparándose juntos, o el doble-invoke de efectos que
// hace React.StrictMode en desarrollo) leerían la misma cola antes de que
// cualquiera termine de vaciarla, y el mismo reporte se mandaría dos veces.
let reintentando = false;

// Se llama al recuperar la conexión (o al montar la app): intenta mandar
// cada reporte guardado y solo lo saca de la cola si el envío realmente
// tuvo éxito — si vuelve a fallar por red, se queda para el próximo intento.
export async function reintentarColaReportes(crearReporte) {
  if (reintentando) return;
  reintentando = true;
  try {
    const cola = leerCola();
    if (cola.length === 0) return;

    const pendientes = [];
    for (const item of cola) {
      const { _id, ...datos } = item;
      try {
        await crearReporte(datos);
      } catch {
        pendientes.push(item);
      }
    }
    guardarCola(pendientes);
  } finally {
    reintentando = false;
  }
}
