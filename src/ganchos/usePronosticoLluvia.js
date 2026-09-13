import { useResource } from "./useResource";
import { obtenerPronosticoLluvia } from "../utilidades/climaApi";

export function usePronosticoLluvia() {
  return useResource(obtenerPronosticoLluvia, []);
}
