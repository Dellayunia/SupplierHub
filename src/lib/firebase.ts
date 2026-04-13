// untuk menyimpan konfigurasi API Key 

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBumyszUgSG-f9SJIoP_wpbQ5U4N51-1fc",
  authDomain: "supplierai-8a07e.firebaseapp.com",
  projectId: "supplierai-8a07e",
  storageBucket: "supplierai-8a07e.firebasestorage.app",
  messagingSenderId: "704183618935",
  appId: "1:704183618935:web:5efccfed18b2ad0f072572",
  measurementId: "G-N6BS8J21ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);