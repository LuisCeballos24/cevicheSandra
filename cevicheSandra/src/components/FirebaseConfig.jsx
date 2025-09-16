// FirebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore"; // <-- ESTA LÍNEA ES CLAVE

const firebaseConfig = {
  apiKey: "AIzaSyBCFYwgE9DMEEoggZx3t0jJXLaGJI7qvUU",
  authDomain: "propios-c6d5c.firebaseapp.com",
  projectId: "propios-c6d5c",
  storageBucket: "propios-c6d5c.firebasestorage.app",
  messagingSenderId: "607156406266",
  appId: "1:607156406266:web:cf687a163f3731c56ac643",
  measurementId: "G-ZLC48C0FC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);
export const db = getFirestore(app);
// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
