// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {initializeAuth, getReactNativePersistence} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5Tvr3BDpvdyfKE6UiJBGZpCAkicqLuPw",
  authDomain: "expense-tracker-f82c7.firebaseapp.com",
  projectId: "expense-tracker-f82c7",
  storageBucket: "expense-tracker-f82c7.firebasestorage.app",
  messagingSenderId: "595207254389",
  appId: "1:595207254389:web:fc0109be0cac58625b233c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

//db
export const firestore = getFirestore(app);
 