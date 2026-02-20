import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs for both client and server environments.
 * This file is safe to import in both Server Components/Route Handlers and Client Components.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;
  try {
    firebaseApp = initializeApp();
  } catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
