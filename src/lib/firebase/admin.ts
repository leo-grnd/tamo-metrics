import * as admin from "firebase-admin";
import { firebaseConfig, validateConfig } from "./config";

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  validateConfig();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      clientEmail: firebaseConfig.clientEmail,
      privateKey: firebaseConfig.privateKey,
    }),
  });
}

export function getFirestore() {
  const app = initializeFirebase();
  return admin.firestore(app);
}

export function getApp() {
  return initializeFirebase();
}

export { admin };
