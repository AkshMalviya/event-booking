/* eslint-disable */
// @ts-nocheck
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type BookingEntity = {
  __typename?: 'BookingEntity';
  createdAt: Maybe<Scalars['String']['output']>;
  event: Maybe<EventEntity>;
  eventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: BookingStatus;
  ticketsCount: Scalars['Int']['output'];
  totalPrice: Scalars['Int']['output'];
  updatedAt: Maybe<Scalars['String']['output']>;
  user: Maybe<UserEntity>;
  userId: Scalars['String']['output'];
};

export type BookingQueryDto = {
  filter?: InputMaybe<BookingTimelineFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export enum BookingStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING'
}

export enum BookingTimelineFilter {
  All = 'ALL',
  Ongoing = 'ONGOING',
  Past = 'PAST',
  Upcoming = 'UPCOMING'
}

export type CreateBookingDto = {
  eventId: Scalars['String']['input'];
  ticketsCount: Scalars['Int']['input'];
};

export type CreateEventDto = {
  availableSeats: Scalars['Int']['input'];
  description: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  image?: InputMaybe<Scalars['Upload']['input']>;
  price: Scalars['Float']['input'];
  startDate: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type EventEntity = {
  __typename?: 'EventEntity';
  availableSeats: Scalars['Int']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  endDate: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  image: Maybe<Scalars['String']['output']>;
  price: Scalars['Int']['output'];
  registeredCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  startDate: Maybe<Scalars['DateTime']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['String']['output'];
};

export type EventQueryDto = {
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<SortOrder>;
  timeline?: InputMaybe<EventTimeline>;
};

export enum EventTimeline {
  Ongoing = 'ONGOING',
  Past = 'PAST',
  Upcoming = 'UPCOMING'
}

export type LoginDto = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelBooking: BookingEntity;
  createBooking: BookingEntity;
  createEvent: EventEntity;
  login: UserEntity;
  logout: Scalars['String']['output'];
  register: Scalars['String']['output'];
  updateEvent: EventEntity;
};


export type MutationCancelBookingArgs = {
  id: Scalars['String']['input'];
};


export type MutationCreateBookingArgs = {
  data: CreateBookingDto;
};


export type MutationCreateEventArgs = {
  data: CreateEventDto;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginArgs = {
  input: LoginDto;
};


export type MutationRegisterArgs = {
  input: SignupDto;
};


export type MutationUpdateEventArgs = {
  data: UpdateEventDto;
  id: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  booking: BookingEntity;
  event: EventEntity;
  eventBookings: Array<BookingEntity>;
  events: Array<EventEntity>;
  me: UserEntity;
  myBookings: Array<BookingEntity>;
  myEvents: Array<EventEntity>;
};


export type QueryBookingArgs = {
  id: Scalars['String']['input'];
};


export type QueryEventArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventBookingsArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  query?: InputMaybe<EventQueryDto>;
};


export type QueryMyBookingsArgs = {
  query?: InputMaybe<BookingQueryDto>;
};


export type QueryMyEventsArgs = {
  query?: InputMaybe<EventQueryDto>;
};

export type SignupDto = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type UpdateEventDto = {
  availableSeats?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  image?: InputMaybe<Scalars['Upload']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UserEntity = {
  __typename?: 'UserEntity';
  createdAt: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['String']['output']>;
};

export type BookingQueryDto = {
  filter?: BookingTimelineFilter | null | undefined;
  limit?: number | null | undefined;
  page?: number | null | undefined;
};

export type BookingStatus =
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'PENDING';

export type BookingTimelineFilter =
  | 'ALL'
  | 'ONGOING'
  | 'PAST'
  | 'UPCOMING';

export type CreateBookingDto = {
  eventId: string;
  ticketsCount: number;
};

export type CreateEventDto = {
  availableSeats: number;
  description: string;
  endDate: string;
  image?: any;
  price: number;
  startDate: string;
  tags?: Array<string> | null | undefined;
  title: string;
};

export type EventQueryDto = {
  isFree?: boolean | null | undefined;
  limit?: number | null | undefined;
  page?: number | null | undefined;
  search?: string | null | undefined;
  sortBy?: string | null | undefined;
  sortOrder?: SortOrder | null | undefined;
  timeline?: EventTimeline | null | undefined;
};

export type EventTimeline =
  | 'ONGOING'
  | 'PAST'
  | 'UPCOMING';

export type LoginDto = {
  email: string;
  password: string;
};

export type SignupDto = {
  email: string;
  name: string;
  password: string;
};

export type SortOrder =
  | 'ASC'
  | 'DESC';

export type UpdateEventDto = {
  availableSeats?: number | null | undefined;
  description?: string | null | undefined;
  endDate?: any;
  image?: any;
  startDate?: any;
  tags?: Array<string> | null | undefined;
  title?: string | null | undefined;
};

export type LoginUserMutationVariables = Exact<{
  input: LoginDto;
}>;


export type LoginUserMutation = { login: { id: string, name: string, email: string, createdAt: string | null, updatedAt: string | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: string };

export type SignupMutationVariables = Exact<{
  input: SignupDto;
}>;


export type SignupMutation = { register: string };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { me: { id: string, name: string, email: string, createdAt: string | null, updatedAt: string | null } };

export type CancelBookingMutationVariables = Exact<{
  id: string;
}>;


export type CancelBookingMutation = { cancelBooking: { id: string, userId: string, eventId: string, ticketsCount: number, totalPrice: number, status: BookingStatus, createdAt: string | null, updatedAt: string | null } };

export type CreateBookingMutationVariables = Exact<{
  data: CreateBookingDto;
}>;


export type CreateBookingMutation = { createBooking: { id: string, userId: string, eventId: string, ticketsCount: number, totalPrice: number, status: BookingStatus, createdAt: string | null, updatedAt: string | null, event: { id: string, title: string, slug: string, image: string | null, startDate: any, endDate: any } | null } };

export type EventBookingsQueryVariables = Exact<{
  eventId: string;
}>;


export type EventBookingsQuery = { eventBookings: Array<{ id: string, userId: string, eventId: string, ticketsCount: number, totalPrice: number, status: BookingStatus, createdAt: string | null, updatedAt: string | null, event: { id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any } | null, user: { id: string, name: string, email: string, createdAt: string | null, updatedAt: string | null } | null }> };

export type MyBookingsQueryVariables = Exact<{
  query?: BookingQueryDto | null | undefined;
}>;


export type MyBookingsQuery = { myBookings: Array<{ id: string, userId: string, eventId: string, ticketsCount: number, totalPrice: number, status: BookingStatus, createdAt: string | null, updatedAt: string | null, event: { id: string, title: string, slug: string, image: string | null, startDate: any, endDate: any } | null }> };

export type CreateEventMutationVariables = Exact<{
  data: CreateEventDto;
  idempotencyKey?: string | null | undefined;
}>;


export type CreateEventMutation = { createEvent: { id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any } };

export type UpdateEventMutationVariables = Exact<{
  id: string;
  data: UpdateEventDto;
}>;


export type UpdateEventMutation = { updateEvent: { id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any } };

export type EventBySlugQueryVariables = Exact<{
  slug: string;
}>;


export type EventBySlugQuery = { event: { id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any } };

export type EventsQueryVariables = Exact<{
  query?: EventQueryDto | null | undefined;
}>;


export type EventsQuery = { events: Array<{ id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any }> };

export type MyEventsQueryVariables = Exact<{
  query?: EventQueryDto | null | undefined;
}>;


export type MyEventsQuery = { myEvents: Array<{ id: string, userId: string, title: string, slug: string, image: string | null, description: string, startDate: any, endDate: any, availableSeats: number, price: number, tags: Array<string>, registeredCount: number, createdAt: any, updatedAt: any }> };


export const LoginUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<LoginUserMutation, LoginUserMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const SignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Signup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignupDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SignupMutation, SignupMutationVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const CancelBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"ticketsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CancelBookingMutation, CancelBookingMutationVariables>;
export const CreateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBookingDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ticketsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateBookingMutation, CreateBookingMutationVariables>;
export const EventBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ticketsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<EventBookingsQuery, EventBookingsQueryVariables>;
export const MyBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingQueryDto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ticketsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyBookingsQuery, MyBookingsQueryVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventDto"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}},{"kind":"Argument","name":{"kind":"Name","value":"idempotencyKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEventDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEventMutation, UpdateEventMutationVariables>;
export const EventBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<EventBySlugQuery, EventBySlugQueryVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Events"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventQueryDto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<EventsQuery, EventsQueryVariables>;
export const MyEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventQueryDto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"availableSeats"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"registeredCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyEventsQuery, MyEventsQueryVariables>;