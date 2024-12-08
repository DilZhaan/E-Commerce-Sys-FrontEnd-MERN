// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_CONFIG_API,
  authDomain: "e-commerce-dilz.firebaseapp.com",
  projectId: "e-commerce-dilz",
  storageBucket: "e-commerce-dilz.firebasestorage.app",
  messagingSenderId: "786446679383",
  appId: "1:786446679383:web:278e6fd7f690115d4ad212",
  measurementId: "G-1VZK0ZXL8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);