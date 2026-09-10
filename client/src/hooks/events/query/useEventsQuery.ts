import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { EventItem } from "../types";

const EVENTS_QUERY_KEY = ["events"] as const;

function getEvents(): Promise<EventItem[]> {
  return request.get<EventItem[]>(API_URLS.EVENTS.FIND_ALL);
}

export function useEventsQuery() {
  return useQuery<EventItem[], ApiError>({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: getEvents,
  });
}
