import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../../bookings/types";

const EVENT_BOOKINGS_QUERY_KEY = (eventId: string) =>
  ["events", eventId, "bookings"] as const;

export function useEventBookingsQuery(eventId: string) {
  return useQuery<BookingItem[], ApiError>({
    queryKey: EVENT_BOOKINGS_QUERY_KEY(eventId),
    queryFn: () => {
      return request.get<BookingItem[]>(
        API_URLS.EVENTS.GET_EVENT_BOOKINGS(eventId),
      );
    },
    enabled: !!eventId,
  });
}
