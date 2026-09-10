import { useMutation } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem, CreateBookingPayload } from "../types";
import { queryClient } from "@/app/providers";

function createBooking(payload: CreateBookingPayload): Promise<BookingItem> {
  return request.post<BookingItem>(API_URLS.BOOKINGS.CREATE, payload);
}

export function useCreateBookingMutation() {
  return useMutation<BookingItem, ApiError, CreateBookingPayload>({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["events-infinite"] });
    },
  });
}
