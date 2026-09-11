import { useMutation } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../types";
import { queryClient } from "@/app/providers";

const cancelBooking = (bookingId: string) => {
  return request.patch<BookingItem>(API_URLS.BOOKINGS.CANCEL(bookingId));
};

export const useCancelBookingMutation = () => {
  return useMutation<BookingItem, ApiError, string>({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["events-infinite"] });
    },
  });
};
