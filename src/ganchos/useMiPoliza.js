import { useResource } from "./useResource";
import { getMiPoliza } from "../utilidades/api";

export function useMiPoliza() {
  return useResource(getMiPoliza, []);
}
