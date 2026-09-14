import { useResource } from "./useResource";
import { getMisReclamosSeguro, getReclamosSeguro } from "../utilidades/api";

export function useMisReclamosSeguro() {
  return useResource(getMisReclamosSeguro, []);
}

export function useReclamosSeguroAdmin() {
  return useResource(getReclamosSeguro, []);
}
