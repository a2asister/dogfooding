export interface TripNode {
  id: number;
  name: string;
  address?: string;
  arrivalTime: Date;
  note?: string;
  order: number;
  tripId: number;
}

export interface Trip {
  id: number;
  title: string;
  description?: string;
  category: string;
  isArchived: boolean;
  createdAt: Date;
  nodes: TripNode[];
}