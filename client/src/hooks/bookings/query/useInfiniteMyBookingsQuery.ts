import { useInfiniteQuery } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { BookingItem } from "../types";

export interface BookingsQueryParams {
  filter?: "all" | "ongoing" | "upcoming" | "past";
  limit?: number;
}

interface BookingsResponse {
  data: BookingItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

const BOOKINGS_INFINITE_QUERY_KEY = (params: BookingsQueryParams) =>
  ["my-bookings-infinite", params] as const;

async function getInfiniteBookings({
  pageParam = 1,
  queryKey,
}: {
  pageParam: unknown;
  queryKey: readonly unknown[];
}): Promise<BookingsResponse> {
  const [, params] = queryKey as readonly [string, BookingsQueryParams];
  
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(pageParam));
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.filter) queryParams.append("filter", params.filter);

  return request.get<BookingsResponse>(
    `${API_URLS.BOOKINGS.MY_BOOKINGS}?${queryParams.toString()}`,
  );
}

export function useInfiniteMyBookingsQuery(params: BookingsQueryParams) {
  return useInfiniteQuery<BookingsResponse, ApiError>({
    queryKey: BOOKINGS_INFINITE_QUERY_KEY(params),
    queryFn: getInfiniteBookings,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
