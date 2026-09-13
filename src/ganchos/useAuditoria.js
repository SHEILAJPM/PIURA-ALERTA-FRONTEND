import { useResource } from "./useResource";
import { getAuditoria } from "../utilidades/api";

export function useAuditoria(limite = 100) {
  return useResource(() => getAuditoria(limite), [limite]);
}
