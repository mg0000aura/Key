const admin = require("firebase-admin");

const firebaseConfig = {
  apiKey: "AIzaSyAov8lQc9GKeV-SokT5gjv-aLCew2C6M-A",
  authDomain: "mg00-ed424.firebaseapp.com",
  databaseURL: "https://mg00-ed424-default-rtdb.firebaseio.com",
  projectId: "mg00-ed424",
  storageBucket: "mg00-ed424.firebasestorage.app",
  messagingSenderId: "877652383572",
  appId: "1:877652383572:web:96cd6ad86344741ad31ac1",
  measurementId: "G-6FV3VCC1D3"
};

function getApp() {
  if (admin.apps.length) return admin.app();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON. Create a Firebase service-account key and add it as a Vercel environment variable."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL
  });
}

function db() {
  return getApp().database();
}

function safeKey(key) {
  // Firebase RTDB keys cannot contain . # $ [ ]
  return String(key).replace(/[.#$[\]/]/g, "_");
}

module.exports = { firebaseConfig, db, safeKey };
