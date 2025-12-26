// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARpxIwkTGdEWYXeKrm1PKwOwuyal5Ek-Y",
  authDomain: "syl-cal.firebaseapp.com",
  projectId: "syl-cal",
  storageBucket: "syl-cal.firebasestorage.app",
  messagingSenderId: "100134718828",
  appId: "1:100134718828:web:23583dfef07c90f20db749",
  measurementId: "G-SKYBELHNM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);