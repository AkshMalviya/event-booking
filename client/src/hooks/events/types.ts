export interface EventItem {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  slug: string;
  image?: string;
  description: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  price: number;
  tags: string[];
  registeredCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  price: number;
  tags?: string[];
  image?: File | null;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  availableSeats?: number;
  tags?: string[];
  image?: File | string | null;
}
