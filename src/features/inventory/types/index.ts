export interface InventoryItem {
  id: string;
  shopId: string;
  itemName: string;
  sku?: string;           // Optional Stock Keeping Unit or barcode
  quantity: number;
  unitPrice: number;
  supplier?: string;      // Optional vendor name
  createdAt: string;
}

export type CreateInventoryPayload = Omit<InventoryItem, "id" | "shopId" | "createdAt">;