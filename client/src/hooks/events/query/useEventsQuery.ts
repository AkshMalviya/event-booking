import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { EventItem } from "../types";

const getEvents = () => {
  return request.get<EventItem[]>(API_URLS.EVENTS.FIND_ALL);
};

export const useEventsQuery = () => {
  return useQuery<EventItem[], ApiError>({
    queryKey: ["events"],
    queryFn: getEvents,
  });
};
