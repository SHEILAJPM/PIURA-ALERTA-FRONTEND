import { useResource } from "./useResource";
import { getTickets } from "../lib/api";

export function useTickets() {
  return useResource(getTickets, []);
}
