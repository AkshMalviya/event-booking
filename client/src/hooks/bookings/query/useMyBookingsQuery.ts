import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../types";

const getMyBookings = () => {
  return request.get<BookingItem[]>(API_URLS.BOOKINGS.MY_BOOKINGS);
};

export const useMyBookingsQuery = () => {
  return useQuery<BookingItem[], ApiError>({
    queryKey: ["bookings", "myBookings"],
    queryFn: getMyBookings,
  });
};
