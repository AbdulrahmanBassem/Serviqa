export interface Client {
  id: string;           
  shopId: string;       
  fullName: string;
  phoneNumber: string;
  email?: string;       
  notes?: string;       
  createdAt: string;
}

export type CreateClientPayload = Omit<Client, "id" | "shopId" | "createdAt">;