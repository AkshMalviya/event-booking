import { useMutation } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { CreateEventPayload, EventItem } from "../types";
import { queryClient } from "@/app/providers";

function createEvent(
  payload: CreateEventPayload | FormData,
): Promise<EventItem> {
  let formData: FormData;

  if (payload instanceof FormData) {
    formData = payload;
  } else {
    formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("startDate", payload.startDate);
    formData.append("endDate", payload.endDate);
    formData.append("availableSeats", String(payload.availableSeats));
    formData.append("price", String(payload.price));

    if (payload.tags && payload.tags.length > 0) {
      formData.append("tags", JSON.stringify(payload.tags));
    }

    if (payload.image instanceof File) {
      formData.append("image", payload.image);
    }
  }

  // Do NOT pass headers: { "Content-Type": "multipart/form-data" }.
  // Passing "Content-Type": undefined ensures Axios and browser set the correct multipart/form-data with boundary.
  return request.post<EventItem>(API_URLS.EVENTS.CREATE, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
}

export function useCreateEventMutation() {
  return useMutation<EventItem, ApiError, CreateEventPayload | FormData>({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-infinite"] });
    },
  });
}
