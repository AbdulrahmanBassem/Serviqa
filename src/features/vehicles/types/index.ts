export interface Vehicle {
  id: string;
  shopId: string;
  clientId: string;     // Relational link to the owner
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;         // Optional
  createdAt: string;
}

export type CreateVehiclePayload = Omit<Vehicle, "id" | "shopId" | "createdAt">;