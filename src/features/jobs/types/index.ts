export type JobStatus = "todo" | "in-progress" | "waiting-parts" | "done" | "archived";

export interface Job {
  id: string;
  shopId: string;
  clientId: string;
  vehicleId: string;
  title: string;
  description?: string;
  status: JobStatus;
  estimatedCost?: number;
  mileage?: number;
  usedParts?: UsedPart[]; 
  createdAt: string;
}

export type CreateJobPayload = Omit<Job, "id" | "shopId" | "createdAt">;

// NEW: Interface for parts consumed during a job
export interface UsedPart {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}