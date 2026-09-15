import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "./appointmentService";
import { useAuth } from "../../auth/context/AuthContext";
import { jobKeys } from "../../jobs/api/jobHooks";
import type { CreateAppointmentPayload, Appointment } from "../types";

export const appointmentKeys = {
  all: (shopId: string) => ["appointments", shopId] as const,
};

export const useAppointments = () => {
  const { user } = useAuth();
  const shopId = user?.uid as string;
  return useQuery({
    queryKey: appointmentKeys.all(shopId),
    queryFn: () => appointmentService.getAppointments(shopId),
    enabled: !!shopId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;
  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) => appointmentService.createAppointment(shopId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all(shopId) }),
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAppointmentPayload> }) => 
      appointmentService.updateAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all(shopId) }),
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;
  return useMutation({
    mutationFn: (id: string) => appointmentService.deleteAppointment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all(shopId) }),
  });
};

export const useConvertAppointmentToJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;
  return useMutation({
    mutationFn: (appointment: Appointment) => appointmentService.convertToJob(shopId, appointment),
    onSuccess: () => {
      // Refresh the calendar to remove the converted appointment
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all(shopId) });
      // Refresh the jobs board so the new task appears in "To Do"
      queryClient.invalidateQueries({ queryKey: jobKeys.all(shopId) });
    },
  });
};