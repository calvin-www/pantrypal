// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoqlkjEnfkHQKjIACWuOWGo-XvEWXHh10",
    authDomain: "expense-tracker-a8458.firebaseapp.com",
    projectId: "expense-tracker-a8458",
    storageBucket: "expense-tracker-a8458.appspot.com",
    messagingSenderId: "533659274359",
    appId: "1:533659274359:web:213572307f1a74fd370a72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)