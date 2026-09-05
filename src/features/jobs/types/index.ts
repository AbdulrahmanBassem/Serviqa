export type JobStatus = "todo" | "in-progress" | "waiting-parts" | "done";

export interface Job {
  id: string;
  shopId: string;
  clientId: string;
  vehicleId: string;
  title: string;          // e.g., "Brake Pad Replacement"
  description?: string;   // Optional mechanic notes
  status: JobStatus;
  estimatedCost?: number; // Optional
  createdAt: string;
}

export type CreateJobPayload = Omit<Job, "id" | "shopId" | "createdAt">;