export type AppointmentStatus = "scheduled" | "converted" | "cancelled";

export interface Appointment {
  id: string;
  shopId: string;
  clientId: string;
  vehicleId: string;
  title: string;          // e.g., "100k Mile Service"
  date: string;           // ISO date string (YYYY-MM-DD)
  time: string;           // e.g., "09:00"
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export type CreateAppointmentPayload = Omit<Appointment, "id" | "shopId" | "createdAt">;