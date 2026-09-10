import { useInfiniteQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { EventsQueryParams, EventsResponse } from "./useInfiniteEventsQuery";

const MY_EVENTS_INFINITE_QUERY_KEY = (params: EventsQueryParams) =>
  ["my-events-infinite", params] as const;

export function useInfiniteMyEventsQuery(params: EventsQueryParams = {}) {
  return useInfiniteQuery<EventsResponse, ApiError>({
    queryKey: MY_EVENTS_INFINITE_QUERY_KEY(params),
    queryFn: async ({
      pageParam,
      queryKey,
    }: {
      pageParam: unknown;
      queryKey: readonly unknown[];
    }): Promise<EventsResponse> => {
      const [, queryParamsObj] = queryKey as readonly [
        string,
        EventsQueryParams,
      ];

      const queryParams = new URLSearchParams();
      queryParams.append("page", String(pageParam));

      if (queryParamsObj.limit) {
        queryParams.append("limit", String(queryParamsObj.limit));
      }

      return request.get<EventsResponse>(API_URLS.EVENTS.MY_EVENTS, {
        params: queryParams,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
