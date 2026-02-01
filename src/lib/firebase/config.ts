export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function validateConfig() {
  if (!firebaseConfig.projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not defined");
  }
  if (!firebaseConfig.clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL is not defined");
  }
  if (!firebaseConfig.privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not defined");
  }
  return true;
}
