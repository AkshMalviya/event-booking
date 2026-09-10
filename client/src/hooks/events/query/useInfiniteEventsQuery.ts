import { useInfiniteQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { EventItem } from "../types";

export interface EventsQueryParams {
  search?: string;
  isFree?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export interface EventsResponse {
  data: EventItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

const EVENTS_INFINITE_QUERY_KEY = (params: EventsQueryParams) =>
  ["events-infinite", params] as const;

async function getInfiniteEvents({
  pageParam = 1,
  queryKey,
}: {
  pageParam: unknown;
  queryKey: readonly unknown[];
}): Promise<EventsResponse> {
  const [, params] = queryKey as readonly [string, EventsQueryParams];

  const queryParams = new URLSearchParams();
  queryParams.append("page", String(pageParam));
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.isFree !== undefined)
    queryParams.append("isFree", params.isFree.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  return request.get<EventsResponse>(
    `${API_URLS.EVENTS.FIND_ALL}?${queryParams.toString()}`,
  );
}

export function useInfiniteEventsQuery(params: EventsQueryParams) {
  return useInfiniteQuery<EventsResponse, ApiError>({
    queryKey: EVENTS_INFINITE_QUERY_KEY(params),
    queryFn: getInfiniteEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
