import { useResource } from "./useResource";
import { getSensores } from "../lib/api";

export function useSensores() {
  return useResource(getSensores, []);
}
