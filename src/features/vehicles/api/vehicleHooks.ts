import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "./vehicleService";
import { useAuth } from "../../auth/context/AuthContext";
import type { CreateVehiclePayload } from "../types";

export const vehicleKeys = {
  all: (shopId: string) => ["vehicles", shopId] as const,
};

export const useVehicles = () => {
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useQuery({
    queryKey: vehicleKeys.all(shopId),
    queryFn: () => vehicleService.getVehicles(shopId),
    enabled: !!shopId,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehicleService.createVehicle(shopId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all(shopId) }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehiclePayload> }) => vehicleService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all(shopId) }),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all(shopId) }),
  });
};