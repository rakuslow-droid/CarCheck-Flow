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

  // If config is invalid, we return dummy/null-safe SDKs or throw a clear error 
  // depending on the environment. During pre-rendering, we want to avoid crashing.
  if (!isFirebaseConfigValid()) {
    if (typeof window === 'undefined') {
      console.warn('Firebase initialization skipped: Missing environment variables.');
      // Return a shape that won't crash immediate destructuring but might fail on usage
      return {
        firebaseApp: {} as FirebaseApp,
        auth: {} as Auth,
        firestore: {} as Firestore
      };
    }
  }

  let firebaseApp: FirebaseApp;
  try {
    // Try default initialization (works in some Firebase environments automatically)
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Ensure we handle cases where app might be an empty object from above
  if (!firebaseApp.options && !isFirebaseConfigValid()) {
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
