import { EventItem } from "../events/types";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "PENDING";

export interface BookingItem {
  id?: string;
  _id?: string;
  userId: string;
  eventId: string;
  event?: EventItem | null;
  user?: { name: string; email: string } | null;
  ticketsCount: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  eventId: string;
  ticketsCount: number;
}
