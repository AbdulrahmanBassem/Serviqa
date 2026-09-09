import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Job, CreateJobPayload, JobStatus } from "../types";

const COLLECTION_NAME = "jobs";

export const jobService = {
  getJobs: async (shopId: string): Promise<Job[]> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId),
    );
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
    return jobs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  createJob: async (shopId: string, data: CreateJobPayload): Promise<Job> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const newJobData = { ...data, shopId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newJobData);
    return { id: docRef.id, ...newJobData } as Job;
  },

  updateJob: async (
    jobId: string,
    data: Partial<CreateJobPayload>,
  ): Promise<void> => {
    if (!jobId) throw new Error("Job ID is required.");
    await updateDoc(doc(db, COLLECTION_NAME, jobId), data);
  },

  updateJobStatus: async (jobId: string, status: JobStatus): Promise<void> => {
    if (!jobId) throw new Error("Job ID is required.");
    await updateDoc(doc(db, COLLECTION_NAME, jobId), { status });
  },

  deleteJob: async (jobId: string): Promise<void> => {
    if (!jobId) throw new Error("Job ID is required.");
    await deleteDoc(doc(db, COLLECTION_NAME, jobId));
  },

  completeAndPayJob: async (shopId: string, jobId: string, amount: number): Promise<void> => {
    if (!shopId || !jobId) throw new Error("Shop ID and Job ID are required.");
    const batch = writeBatch(db);

    // 1. Move job off the board to "archived"
    const jobRef = doc(db, COLLECTION_NAME, jobId);
    batch.update(jobRef, { status: "archived" as JobStatus });

    // 2. Record revenue for the dashboard chart
    const today = new Date().toISOString().split("T")[0]; 
    const metricRef = doc(db, "shops", shopId, "dailyMetrics", today);
    batch.set(metricRef, {
      date: today,
      revenue: increment(amount),
      jobsCompleted: increment(1)
    }, { merge: true });

    await batch.commit();
  },

  getDailyMetrics: async (shopId: string, days: number = 7) => {
    if (!shopId) throw new Error("Shop ID is required.");
    
    const q = query(
      collection(db, "shops", shopId, "dailyMetrics"),
      orderBy("date", "desc"), 
      limit(days) // Now dynamically limits based on the UI selection
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as { date: string, revenue: number, jobsCompleted: number });
  },

  unarchiveJob: async (shopId: string, jobId: string, amount: number): Promise<void> => {
    if (!shopId || !jobId) throw new Error("Shop ID and Job ID are required.");
    const batch = writeBatch(db);

    // 1. Move the job back to the "todo" column
    const jobRef = doc(db, COLLECTION_NAME, jobId);
    batch.update(jobRef, { status: "todo" as JobStatus });

    // 2. Void the revenue from today's ledger
    const today = new Date().toISOString().split("T")[0]; 
    const metricRef = doc(db, "shops", shopId, "dailyMetrics", today);
    
    batch.set(metricRef, {
      date: today,
      revenue: increment(-amount),
      jobsCompleted: increment(-1)
    }, { merge: true });

    await batch.commit();
  }
};
