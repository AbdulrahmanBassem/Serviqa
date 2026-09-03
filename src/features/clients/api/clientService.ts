import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where,  
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Client, CreateClientPayload } from "../types";

const COLLECTION_NAME = "clients";

export const clientService = {
  getClients: async (shopId: string): Promise<Client[]> => {
    if (!shopId) throw new Error("Shop ID is required to fetch clients.");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId)
    );
    
    const snapshot = await getDocs(q);
    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];

    return clients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createClient: async (shopId: string, data: CreateClientPayload): Promise<Client> => {
    if (!shopId) throw new Error("Shop ID is required to create a client.");

    const newClientData = {
      ...data,
      shopId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newClientData);
    
    return {
      id: docRef.id,
      ...newClientData,
    };
  },

  updateClient: async (clientId: string, data: Partial<CreateClientPayload>): Promise<void> => {
    if (!clientId) throw new Error("Client ID is required to update.");
    
    const docRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(docRef, data);
  },

  deleteClient: async (clientId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID is required to delete.");
    
    const docRef = doc(db, COLLECTION_NAME, clientId);
    await deleteDoc(docRef);
  }
};