import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "./jobService";
import { useAuth } from "../../auth/context/AuthContext";
import type { CreateJobPayload, JobStatus, UsedPart } from "../types";

export const jobKeys = {
  all: (shopId: string) => ["jobs", shopId] as const,
};

export const useJobs = () => {
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useQuery({
    queryKey: jobKeys.all(shopId),
    queryFn: () => jobService.getJobs(shopId),
    enabled: !!shopId,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (data: CreateJobPayload) => jobService.createJob(shopId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) }),
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobPayload> }) => jobService.updateJob(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) }),
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => jobService.updateJobStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) }),
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) }),
  });
};

export const useCompleteAndPayJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ 
      id, 
      amount, 
      mileage, 
      usedParts 
    }: { 
      id: string; 
      amount: number; 
      mileage: number; 
      usedParts: UsedPart[] 
    }) => jobService.completeAndPayJob(shopId, id, amount, mileage, usedParts),
    onSuccess: () => {
      // Invalidate jobs and metrics
      queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) });
      queryClient.invalidateQueries({ queryKey: ["dailyMetrics", shopId] });
      // NEW: Force inventory to refresh so deductions appear instantly
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] });
    },
  });
};

export const useDailyMetrics = (days: number = 7) => {
  const { user } = useAuth();
  const shopId = user?.uid as string;
  
  return useQuery({
    queryKey: ["dailyMetrics", shopId, days], 
    queryFn: () => jobService.getDailyMetrics(shopId, days),
    enabled: !!shopId,
  });
};

export const useUnarchiveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ 
      id, 
      amount, 
      usedParts 
    }: { 
      id: string; 
      amount: number; 
      usedParts?: UsedPart[] 
    }) => jobService.unarchiveJob(shopId, id, amount, usedParts || []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) });
      queryClient.invalidateQueries({ queryKey: ["dailyMetrics", shopId] });
      // NEW: Force inventory to refresh so restocked items appear instantly
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] }); 
    },
  });
};