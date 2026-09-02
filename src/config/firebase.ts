import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0FoXb1iEfY3TLzP4YenqEWw6lO8bmNvU",
  authDomain: "serviqa-e6273.firebaseapp.com",
  projectId: "serviqa-e6273",
  storageBucket: "serviqa-e6273.firebasestorage.app",
  messagingSenderId: "545040088122",
  appId: "1:545040088122:web:a1505ea84b18b039a20903"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);