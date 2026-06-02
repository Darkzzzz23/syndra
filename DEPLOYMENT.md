# Syndra Deployment Guide

Complete guide for deploying Syndra to production on Firebase.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Active Firebase project
- Billing enabled (Blaze plan for Cloud Functions)
- Domain name (optional, for custom hosting)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `syndra-prod`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Services

**Authentication:**
- Go to Authentication → Sign-in method
- Enable "Email/Password"
- Optionally enable Google, GitHub sign-in

**Firestore Database:**
- Create database in "Production mode"
- Choose region (us-central1 recommended)
- Apply security rules (see section 2)

**Cloud Functions:**
- Navigate to Functions
- Set region to match Firestore
- Ensure Blaze plan is active

**Hosting:**
- Go to Hosting
- Click "Get started"
- Note the default domain

### 1.3 Get Firebase Config

In Project Settings → General, copy your web config:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## Step 2: Security Configuration

### 2.1 Apply Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{uid} {
      // Users can read/write their own document
      allow read, write: if request.auth.uid == uid;
      // Admins can read all user docs
      allow read: if request.auth.uid != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Products collection
    match /products/{document=**} {
      // Authenticated users can read
      allow read: if request.auth != null;
      // Authenticated users can create
      allow create: if request.auth != null;
      // Only owner or admin can update/delete
      allow update, delete: if request.auth.uid == resource.data.ownerUid || 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Clicks collection
    match /clicks/{document=**} {
      // Authenticated users can read
      allow read: if request.auth != null;
      // Backend can write with service account
      allow create: if request.auth.uid != null || 
                       request.auth.token.iss != null; // Service account writes
    }
  }
}
```

### 2.2 Create Firestore Indexes

For optimal query performance, create these indexes in Firestore:

**Products index:**
- Collection: `products`
- Fields: `ownerUid` (Ascending), `totalClicks` (Descending)

**Clicks index:**
- Collection: `clicks`
- Fields: `createdAt` (Descending)

**Users index:**
- Collection: `users`
- Fields: `createdAt` (Descending)

Firebase will prompt to create indexes automatically when you run queries.

## Step 3: Frontend Deployment

### 3.1 Environment Variables

Create `.env.production.local`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3.2 Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### 3.3 Initialize Firebase Hosting

```bash
firebase init hosting
```

When prompted:
- Choose your Firebase project
- Set public directory to `build`
- Configure as SPA: `Yes`
- Overwrite `build/index.html`: `No`

### 3.4 Deploy Frontend

```bash
firebase deploy --only hosting
```

Your frontend will be live at `https://<project-id>.web.app`

## Step 4: Backend (Cloud Functions) Deployment

### 4.1 Function Configuration

In `functions/index.js`, ensure environment variables are set:

```javascript
const admin = require("firebase-admin");
admin.initializeApp();
```

No additional env vars needed for backend - Firebase admin SDK auto-authenticates.

### 4.2 CORS Configuration

In `functions/index.js`, CORS is enabled:

```javascript
const cors = require("cors");
const app = express();
app.use(cors({ origin: true })); // Allow all origins (restrict as needed)
```

For production, restrict origins:

```javascript
app.use(cors({ 
  origin: ['https://your-domain.com', 'https://www.your-domain.com']
}));
```

### 4.3 Deploy Cloud Functions

```bash
cd functions
firebase deploy --only functions
```

Your functions will be available at:
```
https://<region>-<project-id>.cloudfunctions.net/go/:slug
```

### 4.4 Test Click Tracking

```bash
# Test with curl
curl "https://<region>-<project-id>.cloudfunctions.net/go/your-product-slug?source=test&json=1"
```

Should return:
```json
{
  "redirectUrl": "https://etsy.com/..."
}
```

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Firebase Console → Hosting → Custom domains
2. Click "Add custom domain"
3. Enter your domain (e.g., `syndra.com`)
4. Verify domain ownership
5. Update DNS records as instructed

### 5.2 Configure CORS for Custom Domain

Update `functions/index.js`:

```javascript
app.use(cors({ 
  origin: ['https://your-domain.com', 'https://www.your-domain.com']
}));
```

Redeploy functions:
```bash
cd functions && firebase deploy --only functions
```

## Step 6: Monitoring & Maintenance

### 6.1 Monitor Functions

View logs:
```bash
firebase functions:log
```

In Firebase Console → Functions → Logs

### 6.2 Monitor Firestore

- **Usage**: Firebase Console → Firestore → Usage
- **Real-time Database**: Monitor read/write operations
- **Billing**: Set up budget alerts

### 6.3 Error Tracking

Enable Cloud Logging:
- Firebase Console → Functions → Logs
- Set up error notifications in Cloud Monitoring

### 6.4 Performance Monitoring

Add to `src/index.js`:
```javascript
import { initializePerformanceMonitoring } from "firebase/performance";
const perf = initializePerformanceMonitoring();
```

## Step 7: Scaling & Optimization

### 7.1 Firebase Functions Performance

- Set memory allocation in `functions/firebase.json`:
```json
{
  "functions": {
    "memory": "512MB",
    "timeoutSeconds": 60
  }
}
```

### 7.2 Firestore Optimization

- Use indexes for common queries
- Monitor collection sizes
- Archive old clicks data (consider Backup/Restore)

### 7.3 Frontend Optimization

- Code splitting enabled by default (React)
- Lazy load routes with `React.lazy()`
- Use CDN caching via Firebase Hosting

## Step 8: Data Seeding

### 8.1 Add Initial Products

In Firebase Console → Firestore → Add collection `products` with documents:

```json
{
  "name": "Creator's Guide",
  "slug": "creators-guide",
  "category": "Worksheet",
  "etsyLink": "https://etsy.com/...",
  "ownerUid": "admin_uid",
  "totalClicks": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 8.2 Create Admin User

1. Go to Authentication → Create admin user (test email)
2. In Firestore → `users` collection → Create doc with `uid` as ID:

```json
{
  "email": "admin@syndra.com",
  "displayName": "Admin",
  "role": "admin",
  "totalClicks": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Step 9: Post-Deployment Checklist

- [ ] Frontend loads at custom domain
- [ ] Authentication works (signup/login)
- [ ] Click tracking endpoint responds
- [ ] Admin dashboard displays stats
- [ ] Creator dashboard shows user analytics
- [ ] Security rules prevent unauthorized access
- [ ] Firestore indexes created
- [ ] Monitoring/logging enabled
- [ ] Backup strategy in place
- [ ] Domain SSL certificate active

## Troubleshooting

### CORS Errors

**Error**: "Cross-Origin Request Blocked"

**Fix**: Update CORS in `functions/index.js`:
```javascript
app.use(cors({ 
  origin: true // Or specify exact origins
}));
firebase deploy --only functions
```

### Firestore Rules Errors

**Error**: "Missing or insufficient permissions"

**Fix**:
1. Check user is authenticated: `request.auth != null`
2. Verify `ownerUid` matches in rules
3. Check admin role for admin operations

### Functions Not Deploying

**Error**: "Billing must be enabled"

**Fix**:
1. Go to Firebase Console → Settings → Billing
2. Upgrade to Blaze plan
3. Add payment method

### Slow Analytics Queries

**Error**: Queries timeout or are slow

**Fix**:
1. Create Firestore indexes (Firebase Console → Indexes)
2. Increase Function timeout in `firebase.json`
3. Implement query pagination

## Rollback

If issues occur after deployment:

```bash
# Rollback hosting to previous version
firebase hosting:channels:list
firebase hosting:clone -s prod -t rollback

# Rollback functions (redeploy previous version)
# Functions auto-rollback if deployment fails
# To manually rollback, deploy from git history
```

## Support

- Firebase Docs: https://firebase.google.com/docs
- GitHub Issues: [Your repo]
- Email: support@example.com
