import { useResource } from "./useResource";
import { getZonasRiesgo } from "../lib/api";

export function useZonasRiesgo() {
  return useResource(getZonasRiesgo, []);
}
