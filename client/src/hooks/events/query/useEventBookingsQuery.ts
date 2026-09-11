import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../../bookings/types";

export const useEventBookingsQuery = (eventId: string) => {
  return useQuery<BookingItem[], ApiError>({
    queryKey: ["events", eventId, "bookings"],
    queryFn: () => {
      return request.get<BookingItem[]>(
        API_URLS.EVENTS.GET_EVENT_BOOKINGS(eventId),
      );
    },
    enabled: !!eventId,
  });
};
