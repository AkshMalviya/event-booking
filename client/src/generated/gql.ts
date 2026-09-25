/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation LoginUser($input: LoginDto!) {\n  login(input: $input) {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}": typeof types.LoginUserDocument,
    "mutation Logout {\n  logout\n}": typeof types.LogoutDocument,
    "mutation Signup($input: SignupDto!) {\n  register(input: $input)\n}": typeof types.SignupDocument,
    "query User {\n  me {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}": typeof types.UserDocument,
    "mutation CancelBooking($id: String!) {\n  cancelBooking(id: $id) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": typeof types.CancelBookingDocument,
    "mutation CreateBooking($data: CreateBookingDto!) {\n  createBooking(data: $data) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateBookingDocument,
    "query EventBookings($eventId: String!) {\n  eventBookings(eventId: $eventId) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": typeof types.EventBookingsDocument,
    "query MyBookings($query: BookingQueryDto) {\n  myBookings(query: $query) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyBookingsDocument,
    "mutation CreateEvent($data: CreateEventDto!, $idempotencyKey: String) {\n  createEvent(data: $data, idempotencyKey: $idempotencyKey) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateEventDocument,
    "mutation UpdateEvent($id: String!, $data: UpdateEventDto!) {\n  updateEvent(id: $id, data: $data) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateEventDocument,
    "query EventBySlug($slug: String!) {\n  event(slug: $slug) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": typeof types.EventBySlugDocument,
    "query Events($query: EventQueryDto) {\n  events(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": typeof types.EventsDocument,
    "query MyEvents($query: EventQueryDto) {\n  myEvents(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyEventsDocument,
};
const documents: Documents = {
    "mutation LoginUser($input: LoginDto!) {\n  login(input: $input) {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}": types.LoginUserDocument,
    "mutation Logout {\n  logout\n}": types.LogoutDocument,
    "mutation Signup($input: SignupDto!) {\n  register(input: $input)\n}": types.SignupDocument,
    "query User {\n  me {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}": types.UserDocument,
    "mutation CancelBooking($id: String!) {\n  cancelBooking(id: $id) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": types.CancelBookingDocument,
    "mutation CreateBooking($data: CreateBookingDto!) {\n  createBooking(data: $data) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": types.CreateBookingDocument,
    "query EventBookings($eventId: String!) {\n  eventBookings(eventId: $eventId) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": types.EventBookingsDocument,
    "query MyBookings($query: BookingQueryDto) {\n  myBookings(query: $query) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}": types.MyBookingsDocument,
    "mutation CreateEvent($data: CreateEventDto!, $idempotencyKey: String) {\n  createEvent(data: $data, idempotencyKey: $idempotencyKey) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": types.CreateEventDocument,
    "mutation UpdateEvent($id: String!, $data: UpdateEventDto!) {\n  updateEvent(id: $id, data: $data) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": types.UpdateEventDocument,
    "query EventBySlug($slug: String!) {\n  event(slug: $slug) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": types.EventBySlugDocument,
    "query Events($query: EventQueryDto) {\n  events(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": types.EventsDocument,
    "query MyEvents($query: EventQueryDto) {\n  myEvents(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}": types.MyEventsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation LoginUser($input: LoginDto!) {\n  login(input: $input) {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation LoginUser($input: LoginDto!) {\n  login(input: $input) {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation Logout {\n  logout\n}"): (typeof documents)["mutation Logout {\n  logout\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation Signup($input: SignupDto!) {\n  register(input: $input)\n}"): (typeof documents)["mutation Signup($input: SignupDto!) {\n  register(input: $input)\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query User {\n  me {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query User {\n  me {\n    id\n    name\n    email\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation CancelBooking($id: String!) {\n  cancelBooking(id: $id) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CancelBooking($id: String!) {\n  cancelBooking(id: $id) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation CreateBooking($data: CreateBookingDto!) {\n  createBooking(data: $data) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateBooking($data: CreateBookingDto!) {\n  createBooking(data: $data) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query EventBookings($eventId: String!) {\n  eventBookings(eventId: $eventId) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query EventBookings($eventId: String!) {\n  eventBookings(eventId: $eventId) {\n    id\n    userId\n    eventId\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MyBookings($query: BookingQueryDto) {\n  myBookings(query: $query) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyBookings($query: BookingQueryDto) {\n  myBookings(query: $query) {\n    id\n    userId\n    eventId\n    event {\n      id\n      title\n      slug\n      image\n      startDate\n      endDate\n    }\n    ticketsCount\n    totalPrice\n    status\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation CreateEvent($data: CreateEventDto!, $idempotencyKey: String) {\n  createEvent(data: $data, idempotencyKey: $idempotencyKey) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateEvent($data: CreateEventDto!, $idempotencyKey: String) {\n  createEvent(data: $data, idempotencyKey: $idempotencyKey) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation UpdateEvent($id: String!, $data: UpdateEventDto!) {\n  updateEvent(id: $id, data: $data) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateEvent($id: String!, $data: UpdateEventDto!) {\n  updateEvent(id: $id, data: $data) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query EventBySlug($slug: String!) {\n  event(slug: $slug) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query EventBySlug($slug: String!) {\n  event(slug: $slug) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Events($query: EventQueryDto) {\n  events(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query Events($query: EventQueryDto) {\n  events(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MyEvents($query: EventQueryDto) {\n  myEvents(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyEvents($query: EventQueryDto) {\n  myEvents(query: $query) {\n    id\n    userId\n    title\n    slug\n    image\n    description\n    startDate\n    endDate\n    availableSeats\n    price\n    tags\n    registeredCount\n    createdAt\n    updatedAt\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;