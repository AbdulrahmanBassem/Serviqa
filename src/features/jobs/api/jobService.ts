import { collection, getDocs, addDoc, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Job, CreateJobPayload, JobStatus } from "../types";

const COLLECTION_NAME = "jobs";

export const jobService = {
  getJobs: async (shopId: string): Promise<Job[]> => {
    if (!shopId) throw new Error("Shop ID is required.");

    const q = query(
      collection(db, COLLECTION_NAME),
      where("shopId", "==", shopId)
    );
    
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];

    // Sort chronologically
    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createJob: async (shopId: string, data: CreateJobPayload): Promise<Job> => {
    if (!shopId) throw new Error("Shop ID is required.");
    const newJobData = { ...data, shopId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newJobData);
    return { id: docRef.id, ...newJobData } as Job;
  },

  updateJob: async (jobId: string, data: Partial<CreateJobPayload>): Promise<void> => {
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
  }
};