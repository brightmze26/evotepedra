import {
  cert,
  getApps,
  initializeApp,
  App as FirebaseAdminApp,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: FirebaseAdminApp | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

function initAdminApp() {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    // kalau env kurang, kita mau tau pasti dari log:
    console.error("Missing Firebase Admin env vars", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!rawPrivateKey,
    });
    throw new Error(
      "Missing Firebase Admin env vars. Pastikan FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, dan FIREBASE_ADMIN_PRIVATE_KEY sudah di-set di Vercel (Production & Preview)."
    );
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    adminApp = getApps()[0]!;
  }

  return adminApp!;
}

export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    const app = initAdminApp();
    adminAuthInstance = getAuth(app);
  }
  return adminAuthInstance;
}

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    const app = initAdminApp();
    adminDbInstance = getFirestore(app);
  }
  return adminDbInstance;
}
