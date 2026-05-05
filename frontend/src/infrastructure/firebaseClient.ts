import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7BiW0ATVka53gcqBZsdcyaVygtPACqQw',
  authDomain: 'stmayia.firebaseapp.com',
  projectId: 'stmayia',
  storageBucket: 'stmayia.firebasestorage.app',
  messagingSenderId: '68403537793',
  appId: '1:68403537793:web:48ff30165683d6d051aa80',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
