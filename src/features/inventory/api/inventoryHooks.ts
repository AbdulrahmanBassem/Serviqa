import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "./inventoryService";
import { useAuth } from "../../auth/context/AuthContext";
import type { CreateInventoryPayload } from "../types";

export const inventoryKeys = {
  all: (shopId: string) => ["inventory", shopId] as const,
};

export const useInventory = () => {
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useQuery({
    queryKey: inventoryKeys.all(shopId),
    queryFn: () => inventoryService.getInventory(shopId),
    enabled: !!shopId,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (data: CreateInventoryPayload) => inventoryService.createItem(shopId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all(shopId) }),
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInventoryPayload> }) => inventoryService.updateItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all(shopId) }),
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shopId = user?.uid as string;

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all(shopId) }),
  });
};