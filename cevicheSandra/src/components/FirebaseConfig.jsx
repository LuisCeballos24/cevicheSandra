// FirebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBEdwCANDcQofNB7lOSjlQcpL-I8-uORCI",
    authDomain: "propios-ba684.firebaseapp.com",
    projectId: "propios-ba684",
    storageBucket: "propios-ba684.appspot.com",
    messagingSenderId: "451125740462",
    appId: "1:451125740462:web:9c62b5729e0d4d862fbe3f",
    measurementId: "G-GKG5B7DLF9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
