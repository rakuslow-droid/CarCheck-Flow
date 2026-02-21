import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs for both client and server environments.
 * Returns null for services if configuration is missing.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  if (!isFirebaseConfigValid()) {
    console.warn('Firebase initialization skipped: Missing environment variables.');
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
  if (!firebaseApp || !firebaseApp.options) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }

  // We wrap these in try-catch to ensure that if one service fails (e.g. Auth), 
  // the others can still be returned if available.
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
