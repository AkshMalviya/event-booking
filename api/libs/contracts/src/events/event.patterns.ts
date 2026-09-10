export const EVENT_PATTERNS = {
  CREATE: 'events.create',
  FIND_ALL: 'events.find-all',
  FIND_ONE: 'events.find-one',
  RESERVE_SEATS: 'events.reserve-seats',
  RELEASE_SEATS: 'events.release-seats',
  FILTER_BY_TIMELINE: 'events.filter-by-timeline',
  FIND_ALL_ORGANIZER: 'events.find-all-organizer',
} as const;
