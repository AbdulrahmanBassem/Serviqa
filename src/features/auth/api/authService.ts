import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import type { ShopProfile, SignupPayload } from "../types";

export const authService = {
  registerShop: async (data: SignupPayload) => {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // 2. Send the built-in Verification Email
    await sendEmailVerification(user);

    // 3. Create the corresponding Shop document in Firestore
    const shopData: ShopProfile = {
      shopId: user.uid,
      ownerName: data.ownerName,
      shopName: data.shopName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    // Use the user's UID as the document ID for strict multi-tenant isolation
    await setDoc(doc(db, "shops", user.uid), shopData);
    
    return user;
  },

  login: async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  logout: async () => {
    await signOut(auth);
  }
};