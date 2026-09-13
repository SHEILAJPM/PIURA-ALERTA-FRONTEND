import { useResource } from "./useResource";
import { getHistorialAlertas } from "../utilidades/api";

export function useHistorialAlertas(limite = 30) {
  return useResource(() => getHistorialAlertas(limite), [limite]);
}
