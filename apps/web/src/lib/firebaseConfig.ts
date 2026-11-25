/**
 * NAMH ASTRO — Firebase Web Client Configuration
 * Real Firebase Project: namhastro-e8dab
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCa1q5DmCcKX8JMQsb0vyUiw6wpOCLn9ts",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "namhastro-e8dab.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "namhastro-e8dab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "namhastro-e8dab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "878029338655",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:878029338655:web:1b76ae4245712fb7903d2a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0YZ0QEF68B",
};
