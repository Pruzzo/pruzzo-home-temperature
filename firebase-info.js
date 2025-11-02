// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);