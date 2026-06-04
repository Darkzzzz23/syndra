// Run this once from your terminal:
// node scripts/seedProducts.js
//
// Make sure you have firebase-admin installed:
// cd functions && npm install firebase-admin && cd ..

const admin = require("firebase-admin");

// Use your service account or just run this in the functions folder context
const serviceAccount = require("../functions/syndra-16aec-firebase-adminsdk-fbsvc-982820260b.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const sampleProducts = [
  {
    title: "Ultimate Study Planner 2026",
    name: "Ultimate Study Planner 2026",
    description: "A beautifully designed study planner to help students organize their semester, track assignments, and prepare for exams. Includes monthly, weekly, and daily layouts. Perfect for high school and college students.",
    category: "Study Guides",
    price: 8.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/study-planner.pdf",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 42,
    totalSales: 7,
    averageRating: 4.5,
    totalReviews: 3,
    creatorEmail: "creator1@syndrahub.com",
    ownerUid: "seed_creator_1",
    creatorId: "seed_creator_1",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Algebra Mastery Worksheet Pack",
    name: "Algebra Mastery Worksheet Pack",
    description: "50 printable algebra worksheets covering linear equations, quadratics, polynomials, and word problems. Includes answer keys. Perfect for grades 8-12 and self-study.",
    category: "Worksheets",
    price: 12.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/algebra-pack.pdf",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 28,
    totalSales: 4,
    averageRating: 5,
    totalReviews: 2,
    creatorEmail: "creator2@syndrahub.com",
    ownerUid: "seed_creator_2",
    creatorId: "seed_creator_2",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Social Media Content Templates",
    name: "Social Media Content Templates",
    description: "20 customizable Canva templates for Instagram, TikTok, and Facebook. Includes story templates, post layouts, and carousel designs. Perfect for content creators and small businesses.",
    category: "Templates",
    price: 15.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/social-templates.zip",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 65,
    totalSales: 12,
    averageRating: 4.8,
    totalReviews: 5,
    creatorEmail: "creator3@syndrahub.com",
    ownerUid: "seed_creator_3",
    creatorId: "seed_creator_3",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Digital Art Brush Collection",
    name: "Digital Art Brush Collection",
    description: "30 premium Procreate brushes for digital artists. Includes sketching, inking, shading, and texture brushes. Compatible with iPad Pro and Procreate app.",
    category: "Digital Art",
    price: 19.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/brush-pack.zip",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 38,
    totalSales: 9,
    averageRating: 4.3,
    totalReviews: 4,
    creatorEmail: "creator4@syndrahub.com",
    ownerUid: "seed_creator_4",
    creatorId: "seed_creator_4",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Budget Planner & Expense Tracker",
    name: "Budget Planner & Expense Tracker",
    description: "Printable budget planner with monthly and weekly expense tracking. Includes savings goals, debt payoff tracker, and bill organizer. Perfect for personal finance management.",
    category: "Printables",
    price: 6.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/budget-planner.pdf",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 21,
    totalSales: 3,
    averageRating: 4.0,
    totalReviews: 1,
    creatorEmail: "creator5@syndrahub.com",
    ownerUid: "seed_creator_5",
    creatorId: "seed_creator_5",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "Creative Writing Prompts Ebook",
    name: "Creative Writing Prompts Ebook",
    description: "200 creative writing prompts to spark your imagination. Covers fiction, poetry, journaling, and storytelling. Includes tips for overcoming writer's block. Perfect for writers of all levels.",
    category: "E-books",
    price: 9.99,
    fileUrl: "https://res.cloudinary.com/debxbgnbm/image/upload/v1717000000/samples/writing-prompts.pdf",
    thumbnailUrl: "",
    previewUrls: [],
    status: "approved",
    active: true,
    totalClicks: 56,
    totalSales: 15,
    averageRating: 4.7,
    totalReviews: 8,
    creatorEmail: "creator6@syndrahub.com",
    ownerUid: "seed_creator_6",
    creatorId: "seed_creator_6",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function seedProducts() {
  console.log("Seeding products...");

  for (const product of sampleProducts) {
    const docRef = db.collection("products").doc();
    await docRef.set(product);
    console.log(`Created: ${product.title} (${docRef.id})`);
  }

  console.log("Done! 6 products added to Firestore.");
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});