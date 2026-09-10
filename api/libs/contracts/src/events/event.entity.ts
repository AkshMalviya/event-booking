export class EventEntity {
  id: string;
  userId: string;
  title: string;
  slug: string;
  image?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  availableSeats: number;
  price: number;
  tags: string[];
  registeredCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
