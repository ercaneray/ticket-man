// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvPCC4pYZMmV8iXj9GWEWCxDjfkB_eSRU",
  authDomain: "ticketman-5e247.firebaseapp.com",
  projectId: "ticketman-5e247",
  storageBucket: "ticketman-5e247.firebasestorage.app",
  messagingSenderId: "1016941536769",
  appId: "1:1016941536769:web:289942d01a45743e64c200",
  measurementId: "G-JF3N2ESLLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };