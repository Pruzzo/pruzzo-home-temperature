// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyAHexYczghik9ZV6ilyeksi0xlg1berHSQ",
  authDomain: "pruzzo-home-temperature.firebaseapp.com",
  databaseURL: "https://pruzzo-home-temperature-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pruzzo-home-temperature",
  storageBucket: "pruzzo-home-temperature.firebasestorage.app",
  messagingSenderId: "422794054449",
  appId: "1:422794054449:web:6592e30e4ecc368d833e10",
  measurementId: "G-127109E5WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);
