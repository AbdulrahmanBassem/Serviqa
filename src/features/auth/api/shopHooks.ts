import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useAuth } from "../context/AuthContext";
import type { ShopProfile } from "../types";

export const useShopProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["shopProfile", user?.uid],
    queryFn: async (): Promise<ShopProfile | null> => {
      if (!user?.uid) return null;
      
      const shopRef = doc(db, "shops", user.uid);
      const shopSnap = await getDoc(shopRef);
      
      if (shopSnap.exists()) {
        return shopSnap.data() as ShopProfile;
      }
      return null;
    },
    enabled: !!user?.uid, 
    staleTime: 1000 * 60 * 30, 
  });
};