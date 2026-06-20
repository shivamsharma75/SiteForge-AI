// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "siteforge-ai-effc9.firebaseapp.com",
  projectId: "siteforge-ai-effc9",
  storageBucket: "siteforge-ai-effc9.firebasestorage.app",
  messagingSenderId: "874228145133",
  appId: "1:874228145133:web:b7600d130c893df1d825e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth= getAuth(app)
const provider=new GoogleAuthProvider()

export {auth,provider}
