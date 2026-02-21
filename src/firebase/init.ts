import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs for both client and server environments.
 * This file is safe to import in both Server Components/Route Handlers and Client Components.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // If config is invalid, we return dummy/null-safe SDKs to prevent crashing during build or hydration
  if (!isFirebaseConfigValid()) {
    console.warn('Firebase initialization skipped: Missing environment variables.');
    return {
      firebaseApp: {} as FirebaseApp,
      auth: {} as Auth,
      firestore: {} as Firestore
    };
  }

  let firebaseApp: FirebaseApp;
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // If firebaseApp is a dummy object (no options), return dummy services
  if (!firebaseApp.options) {
    return {
      firebaseApp,
      auth: {} as Auth,
      firestore: {} as Firestore
    };
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
