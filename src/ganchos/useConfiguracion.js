import { useResource } from "./useResource";
import { getConfiguracion } from "../utilidades/api";

export function useConfiguracion() {
  return useResource(getConfiguracion, []);
}
