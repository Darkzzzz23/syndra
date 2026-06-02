const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "syndra-16aec";
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT;

const config = { projectId };
if (serviceAccountPath) {
  try {
    config.credential = admin.credential.cert(require(serviceAccountPath));
  } catch (err) {
    console.error("Unable to load service account credentials:", err.message);
    process.exit(1);
  }
} else {
  config.credential = admin.credential.applicationDefault();
}

admin.initializeApp(config);
const db = admin.firestore();
const auth = admin.auth();

const identifier = process.argv[2];

if (!identifier) {
  console.error("Usage: node migrateUserRoles.js <email-or-uid>");
  process.exit(1);
}

async function getAuthUser(identifier) {
  if (identifier.includes("@")) {
    return auth.getUserByEmail(identifier);
  }
  return auth.getUser(identifier);
}

async function main() {
  console.log("Migrating existing users with missing role fields...");
  const snapshot = await db.collection("users").get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};

    if (!data.role) {
      updates.role = "user";
    }
    if (updates.role || data.totalClicks === undefined || data.totalRevenue === undefined || data.commissionEarned === undefined) {
      if (data.totalClicks === undefined) updates.totalClicks = 0;
      if (data.totalRevenue === undefined) updates.totalRevenue = 0;
      if (data.commissionEarned === undefined) updates.commissionEarned = 0;
      await doc.ref.set(updates, { merge: true });
      updated++;
    }
  }

  console.log(`Updated ${updated} user documents.`);

  const targetUser = await getAuthUser(identifier);
  const userRef = db.collection("users").doc(targetUser.uid);
  await userRef.set({ role: "admin" }, { merge: true });
  await auth.setCustomUserClaims(targetUser.uid, { admin: true });

  console.log(`Assigned admin role to ${targetUser.uid} (${targetUser.email}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
