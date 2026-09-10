import { useQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { EventItem } from "../types";

function getEventBySlug(slug: string): Promise<EventItem> {
  return request.get<EventItem>(API_URLS.EVENTS.FIND_ONE(slug));
}

export function useEventBySlugQuery(slug: string) {
  return useQuery<EventItem, ApiError>({
    queryKey: ["events", slug],
    queryFn: () => getEventBySlug(slug),
    enabled: !!slug,
  });
}
