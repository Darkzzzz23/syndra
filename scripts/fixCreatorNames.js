const admin = require("firebase-admin");
const serviceAccount = require("../functions/syndra-16aec-firebase-adminsdk-fbsvc-982820260b.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function fixNames() {
  const snap = await db.collection("products").get();
  
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.creatorDisplayName && data.creatorEmail) {
      await doc.ref.update({
        creatorDisplayName: data.creatorEmail.split("@")[0],
      });
      console.log(`Updated: ${data.title} -> ${data.creatorEmail.split("@")[0]}`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

fixNames();