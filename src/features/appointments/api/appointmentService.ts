import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Appointment, CreateAppointmentPayload, AppointmentStatus } from "../types";
import type { CreateJobPayload, JobStatus } from "../../jobs/types"; // Importing your existing Job types

const COLLECTION_NAME = "appointments";

export const appointmentService = {
  getAppointments: async (shopId: string): Promise<Appointment[]> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId)
    );
    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    
    // Sort by date and time
    return appointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });
  },

  createAppointment: async (shopId: string, data: CreateAppointmentPayload): Promise<Appointment> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const newAptData = { ...data, shopId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newAptData);
    return { id: docRef.id, ...newAptData } as Appointment;
  },

  updateAppointment: async (id: string, data: Partial<CreateAppointmentPayload>): Promise<void> => {
    if (!id) throw new Error("Appointment ID is required.");
    await updateDoc(doc(db, COLLECTION_NAME, id), data);
  },

  deleteAppointment: async (id: string): Promise<void> => {
    if (!id) throw new Error("Appointment ID is required.");
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  convertToJob: async (shopId: string, appointment: Appointment): Promise<void> => {
    if (!shopId || !appointment.id) throw new Error("Shop ID and Appointment ID are required.");
    
    const batch = writeBatch(db);

    // 1. Create the new job payload
    const newJob: CreateJobPayload & { shopId: string; createdAt: string } = {
      shopId,
      clientId: appointment.clientId,
      vehicleId: appointment.vehicleId,
      title: appointment.title,
      description: appointment.notes || "",
      status: "todo" as JobStatus, // Drops it right into the start of your Kanban
      createdAt: new Date().toISOString()
    };

    // 2. Add the new job to the 'jobs' collection
    const newJobRef = doc(collection(db, "jobs"));
    batch.set(newJobRef, newJob);

    // 3. Mark the appointment as converted so it disappears from the active calendar
    const aptRef = doc(db, COLLECTION_NAME, appointment.id);
    batch.update(aptRef, { status: "converted" as AppointmentStatus });

    // Commit both operations atomically
    await batch.commit();
  }
};