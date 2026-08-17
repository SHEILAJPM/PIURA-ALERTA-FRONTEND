import { useResource } from "./useResource";
import { getAlbergues } from "../lib/api";

export function useAlbergues() {
  return useResource(getAlbergues, []);
}
