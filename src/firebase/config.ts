/**
 * Firebase configuration retrieved from environment variables.
 * Using NEXT_PUBLIC_ prefix allows these values to be accessible in the browser.
 */

const getEnv = (key: string, required = true): string => {
  // Check both process.env and a fallback to empty string to prevent crashing during build
  const value = process.env[key];
  if (!value && required) {
    // Only log error in production or if explicitly needed, 
    // but don't throw so the build process can potentially complete.
    if (process.env.NODE_ENV === 'production') {
      console.warn(`Firebase Config Warning: Missing environment variable ${key}`);
    }
  }
  return value || '';
};

export const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', false),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: getEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', false),
};

/**
 * Validates if the configuration is complete enough to initialize Firebase.
 */
export function isFirebaseConfigValid(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}
