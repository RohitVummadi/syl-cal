import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARpxIwkTGdEWYXeKrm1PKwOwuyal5Ek-Y",
  authDomain: "syl-cal.firebaseapp.com",
  projectId: "syl-cal",
  storageBucket: "syl-cal.firebasestorage.app",
  messagingSenderId: "100134718828",
  appId: "1:100134718828:web:23583dfef07c90f20db749",
  measurementId: "G-SKYBELHNM3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const analytics = getAnalytics(app);
