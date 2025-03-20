import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Google Cloud Vision API configuration
export const visionConfig = {
  apiKey: process.env.REACT_APP_VISION_API_KEY,
  credentials: {
    type: 'service_account',
    project_id: process.env.REACT_APP_VISION_PROJECT_ID,
    private_key_id: process.env.REACT_APP_VISION_PRIVATE_KEY_ID,
    private_key: process.env.REACT_APP_VISION_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.REACT_APP_VISION_CLIENT_EMAIL,
    client_id: process.env.REACT_APP_VISION_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.REACT_APP_VISION_CLIENT_CERT_URL
  }
};

// Google Maps configuration
export const mapsConfig = {
  apiKey: process.env.REACT_APP_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  defaultOptions: {
    zoom: 15,
    center: { lat: 0, lng: 0 }
  }
};

// ML Kit configuration
export const mlKitConfig = {
  faceDetection: {
    enableLandmarks: true,
    performanceMode: 'accurate',
    minFaceSize: 0.15
  },
  textRecognition: {
    enableLanguageHints: true,
    languageHints: ['en']
  }
};

// Gemini API configuration
export const geminiConfig = {
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  model: 'gemini-pro',
  maxOutputTokens: 2048,
  temperature: 0.7,
  topP: 0.8,
  topK: 40
};

// Blockchain configuration
export const blockchainConfig = {
  network: process.env.REACT_APP_BLOCKCHAIN_NETWORK || 'testnet',
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  providerUrl: process.env.REACT_APP_PROVIDER_URL
};

// Security configuration
export const securityConfig = {
  encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY,
  jwtSecret: process.env.REACT_APP_JWT_SECRET,
  sessionTimeout: 3600, // 1 hour in seconds
  maxLoginAttempts: 5,
  lockoutDuration: 900 // 15 minutes in seconds
};

// Analytics configuration
export const analyticsConfig = {
  measurementId: process.env.REACT_APP_GA_MEASUREMENT_ID,
  debug: process.env.NODE_ENV === 'development',
  sendPageView: true,
  anonymizeIp: true
};

// Default export for all configurations
const configs = {
  firebase: firebaseConfig,
  vision: visionConfig,
  maps: mapsConfig,
  mlKit: mlKitConfig,
  gemini: geminiConfig,
  blockchain: blockchainConfig,
  security: securityConfig,
  analytics: analyticsConfig
};

export default configs; 