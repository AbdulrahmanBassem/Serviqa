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
    // 1. Create user (Firebase auto-logs them in here)
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // 2. Trigger the verification email
    await sendEmailVerification(user);

    // 3. Create the corresponding Shop document
    const shopData: ShopProfile = {
      shopId: user.uid,
      ownerName: data.ownerName,
      shopName: data.shopName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "shops", user.uid), shopData);
    
    // 4. Force a logout so they cannot access the dashboard yet
    await signOut(auth);
    
    return user;
  },

  login: async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    // Block access if the email is not verified
    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please check your inbox and verify your email address before logging in.");
    }
    
    return credential.user;
  },

  logout: async () => {
    await signOut(auth);
  }
};