import { useResource } from "./useResource";
import { getAuditoria } from "../lib/api";

export function useAuditoria(limite = 100) {
  return useResource(() => getAuditoria(limite), [limite]);
}
