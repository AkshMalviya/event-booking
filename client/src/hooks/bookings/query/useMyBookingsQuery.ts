import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../types";

const MY_BOOKINGS_QUERY_KEY = ["bookings", "myBookings"] as const;

function getMyBookings(): Promise<BookingItem[]> {
  return request.get<BookingItem[]>(API_URLS.BOOKINGS.MY_BOOKINGS);
}

export function useMyBookingsQuery() {
  return useQuery<BookingItem[], ApiError>({
    queryKey: MY_BOOKINGS_QUERY_KEY,
    queryFn: getMyBookings,
  });
}
