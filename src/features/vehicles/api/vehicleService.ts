import { collection, getDocs, addDoc, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Vehicle, CreateVehiclePayload } from "../types";

const COLLECTION_NAME = "vehicles";

export const vehicleService = {
  getVehicles: async (shopId: string): Promise<Vehicle[]> => {
    if (!shopId) throw new Error("Shop ID is required.");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId)
    );
    
    const snapshot = await getDocs(q);
    const vehicles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[];

    return vehicles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createVehicle: async (shopId: string, data: CreateVehiclePayload): Promise<Vehicle> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const newVehicleData = { ...data, shopId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newVehicleData);
    return { id: docRef.id, ...newVehicleData };
  },

  updateVehicle: async (vehicleId: string, data: Partial<CreateVehiclePayload>): Promise<void> => {
    if (!vehicleId) throw new Error("Vehicle ID is required.");
    await updateDoc(doc(db, COLLECTION_NAME, vehicleId), data);
  },

  deleteVehicle: async (vehicleId: string): Promise<void> => {
    if (!vehicleId) throw new Error("Vehicle ID is required.");
    await deleteDoc(doc(db, COLLECTION_NAME, vehicleId));
  }
};