import { useResource } from "./useResource";
import { getSensores } from "../utilidades/api";

export function useSensores() {
  return useResource(getSensores, []);
}
