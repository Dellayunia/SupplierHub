import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBumyszUgSG-f9SJIoP_wpbQ5U4N51-1fc",
  authDomain: "supplierai-8a07e.firebaseapp.com",
  projectId: "supplierai-8a07e",
  storageBucket: "supplierai-8a07e.firebasestorage.app",
  messagingSenderId: "704183618935",
  appId: "1:704183618935:web:5efccfed18b2ad0f072572",
  measurementId: "G-N6BS8J21ER",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
