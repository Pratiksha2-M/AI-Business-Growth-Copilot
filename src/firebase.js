import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAQZxl_FFZKuSWtEWuBomW58Z9rhrCs0bw",
  authDomain: "smbs-d661e.firebaseapp.com",
  databaseURL: "https://smbs-d661e-default-rtdb.firebaseio.com",
  projectId: "smbs-d661e",
  storageBucket: "smbs-d661e.firebasestorage.app",
  messagingSenderId: "991005623135",
  appId: "1:991005623135:web:64d673e7ae270fd341ecea"
};

const app = initializeApp(firebaseConfig);

// Firestore — main database for sales, inventory, orders, expenses
export const db = getFirestore(app);

// Realtime Database — for live stock updates
export const rtdb = getDatabase(app);

export default app;
