import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService } from "./clientService";
import { useAuth } from "../../auth/context/AuthContext";
import type { CreateClientPayload } from "../types";

export const clientKeys = {
  all: (shopId: string) => ["clients", shopId] as const,
};

export const useClients = () => {
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useQuery({
    queryKey: clientKeys.all(shopId),
    queryFn: () => clientService.getClients(shopId),
    enabled: !!shopId,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (data: CreateClientPayload) => clientService.createClient(shopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all(shopId) });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientPayload> }) => 
      clientService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all(shopId) });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all(shopId) });
    },
  });
};