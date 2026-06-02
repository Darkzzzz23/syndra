const admin = require('firebase-admin');

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

const products = [
  {
    id: 'worksheet1',
    name: 'Study Planner (Grade 12)',
    description:
      'A structured daily study planner designed for Grade 12 students to improve time management and exam preparation efficiency.',
    category: 'Productivity / Education',
    etsyLink: 'https://www.etsy.com/listing/123456789',
  },
  {
    id: 'worksheet2',
    name: 'Math Revision Pack',
    description:
      'Complete revision worksheets covering algebra, calculus, and exam-style questions for high school students.',
    category: 'Mathematics',
    etsyLink: 'https://www.etsy.com/listing/987654321',
  },
  {
    id: 'worksheet3',
    name: 'English Writing Guide',
    description:
      'Helps students improve essay writing, grammar, and structured writing for academic success.',
    category: 'Language Skills',
    etsyLink: 'https://www.etsy.com/listing/456789123',
  },
];

async function seed() {
  console.log('Seeding products...');

  for (const p of products) {
    const ref = db.collection('products').doc(p.id);
    await ref.set(
      {
        slug: p.id,
        title: p.name,
        description: p.description,
        category: p.category,
        etsyLink: p.etsyLink,
        ownerUid: null,
        // analytics-ready fields
        totalClicks: 0,
        estimatedRevenue: 0,
        commissionEarned: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`Upserted product ${p.id}`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
