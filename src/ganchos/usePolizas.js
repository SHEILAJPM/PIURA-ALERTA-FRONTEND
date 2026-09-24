import { useResource } from "./useResource";
import { getPolizas } from "../utilidades/api";

export function usePolizas() {
  return useResource(getPolizas, []);
}
