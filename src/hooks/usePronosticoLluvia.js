import { useResource } from "./useResource";
import { obtenerPronosticoLluvia } from "../lib/climaApi";

export function usePronosticoLluvia() {
  return useResource(obtenerPronosticoLluvia, []);
}
