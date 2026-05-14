import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrpeUgCXyMwbiB5mxkZeJDevaCi96iQOA",
  authDomain: "goye-media.firebaseapp.com",
  projectId: "goye-media",
  storageBucket: "goye-media.firebasestorage.app",
  messagingSenderId: "202109054723",
  appId: "1:202109054723:web:ad78ce716c45fd0ddf0336"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  auth, 
  googleProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
};