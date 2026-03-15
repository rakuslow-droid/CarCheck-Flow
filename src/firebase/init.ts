import { firebaseConfig, isFirebaseConfigValid } from "@/firebase/config";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function initializeFirebase() {
  let app: FirebaseApp;

  if (getApps().length > 0) {
    app = getApp();
  } else {
    if (!isFirebaseConfigValid()) {
      return { firebaseApp: null, auth: null, firestore: null };
    }
    app = initializeApp(firebaseConfig);
  }

  // 他のファイル（route.ts等）でも使いやすいように、各SDKを初期化して返します
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
