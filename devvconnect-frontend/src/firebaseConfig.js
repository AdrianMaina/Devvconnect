// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMXKTZrmbXbMxTQcSUmInGsPkEC58GCnQ",
  authDomain: "devvconnect-77922.firebaseapp.com",
  projectId: "devvconnect-77922",
  storageBucket: "devvconnect-77922.firebasestorage.app",
  messagingSenderId: "53263313793",
  appId: "1:53263313793:web:a55b090e1fb7674b619680"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export default app;
