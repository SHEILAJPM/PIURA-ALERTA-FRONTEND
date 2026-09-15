import { useResource } from "./useResource";
import { getChequeosSeguridad } from "../utilidades/api";

export function useChequeosSeguridad() {
  return useResource(getChequeosSeguridad, []);
}
