import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs for both client and server environments.
 * Returns null for services if configuration is missing.
 */
export function initializeFirebase() {
  // Use existing app if already initialized to prevent double-initialization errors
  if (getApps().length > 0) {
    const app = getApp();
    return getSdks(app);
  }

  // Check if we have the minimum required config
  if (!isFirebaseConfigValid()) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  } catch (e) {
    console.error('Firebase initialization error:', e);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }

  let auth: Auth | null = null;
  let firestore: Firestore | null = null;

  try {
    auth = getAuth(firebaseApp);
  } catch (e) {
    console.error('Failed to initialize Firebase Auth:', e);
  }

  try {
    firestore = getFirestore(firebaseApp);
  } catch (e) {
    console.error('Failed to initialize Firestore:', e);
  }

  return {
    firebaseApp,
    auth,
    firestore
  };
}
