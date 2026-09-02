export interface ShopProfile {
  shopId: string;
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
}

export interface SignupPayload extends Omit<ShopProfile, "shopId" | "createdAt"> {
  password: string;
}