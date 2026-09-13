import { useResource } from "./useResource";
import { obtenerPuntosAyuda } from "../utilidades/ayudaCercana";

export function useAyudaCercana() {
  return useResource(obtenerPuntosAyuda, []);
}
