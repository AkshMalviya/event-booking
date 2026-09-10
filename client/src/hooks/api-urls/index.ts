export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const API_URLS = {
  AUTH: {
    LOGIN: `/auth/login`,
    REGISTER: `/auth/register`,
    LOGOUT: `/auth/logout`,
    ME: `/auth/me`,
  },
  EVENTS: {
    BASE: `/events`,
    FIND_ALL: "/events",
    MY_EVENTS: "/events/my-events",
    FIND_ONE: (slug: string) => `/events/${slug}`,
    GET_EVENT_BOOKINGS: (eventId: string) => `/events/${eventId}/bookings`,
    CREATE: `/events`,
  },
  BOOKINGS: {
    BASE: `/bookings`,
    CREATE: `/bookings`,
    MY_BOOKINGS: `/bookings/my-bookings`,
    FIND_ONE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
} as const;

export type ApiUrls = typeof API_URLS;
