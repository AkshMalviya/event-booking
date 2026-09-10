import { useMutation } from "@tanstack/react-query";
import { UpdateEventPayload } from "../types";
import request from "@/lib/request.axios";
import { queryClient } from "@/app/providers";

export const useUpdateEventMutation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEventPayload;
    }) => {
      const formData = new FormData();

      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.startDate) formData.append("startDate", data.startDate);
      if (data.endDate) formData.append("endDate", data.endDate);
      if (data.availableSeats !== undefined)
        formData.append("availableSeats", data.availableSeats.toString());

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      }

      if (data.image && typeof data.image !== "string") {
        formData.append("image", data.image);
      }

      const response = await request.post(`/events/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};
