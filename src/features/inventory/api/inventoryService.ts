import { collection, getDocs, addDoc, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { InventoryItem, CreateInventoryPayload } from "../types";

const COLLECTION_NAME = "inventory";

export const inventoryService = {
  getInventory: async (shopId: string): Promise<InventoryItem[]> => {
    if (!shopId) throw new Error("Shop ID is required.");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId)
    );
    
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createItem: async (shopId: string, data: CreateInventoryPayload): Promise<InventoryItem> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const newItemData = { ...data, shopId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newItemData);
    return { id: docRef.id, ...newItemData } as InventoryItem;
  },

  updateItem: async (itemId: string, data: Partial<CreateInventoryPayload>): Promise<void> => {
    if (!itemId) throw new Error("Item ID is required.");
    await updateDoc(doc(db, COLLECTION_NAME, itemId), data);
  },

  deleteItem: async (itemId: string): Promise<void> => {
    if (!itemId) throw new Error("Item ID is required.");
    await deleteDoc(doc(db, COLLECTION_NAME, itemId));
  }
};