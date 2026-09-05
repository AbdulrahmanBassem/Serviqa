import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "./jobService";
import { useAuth } from "../../auth/context/AuthContext";
import type { CreateJobPayload, JobStatus } from "../types";

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