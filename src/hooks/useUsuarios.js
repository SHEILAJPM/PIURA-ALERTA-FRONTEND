import { useResource } from "./useResource";
import { getUsuarios } from "../lib/api";

export function useUsuarios() {
  return useResource(getUsuarios, []);
}
