import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin using service account from env JSON or file path
let app;
if (!admin.apps.length) {
	const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

	if (!serviceAccountJson && !serviceAccountPath) {
		throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH env var");
	}

	const credential = serviceAccountJson
		? admin.credential.cert(JSON.parse(serviceAccountJson))
		: admin.credential.cert(serviceAccountPath);

	try {
		app = admin.initializeApp({
			credential,
			projectId: "dissasterconnect",
		});
		console.log("Firebase Admin initialized successfully");
	} catch (error) {
		console.error("Firebase Admin initialization error:", error);
		throw error;
	}
} else {
	app = admin.app();
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export default app;
