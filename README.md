# Syndra - Creator Traffic Analytics SaaS

A modern, premium SaaS platform for creator-driven click tracking and traffic analytics. Track promo links, monitor real-time performance, and monetize your community with intelligent analytics.

## 🎯 Features

- **Real-time Click Tracking**: Instantly log and track every promo link click with rich context data
- **Creator Dashboards**: Beautiful, responsive interface for managing promos and viewing analytics
- **Admin Analytics**: Comprehensive system-wide analytics with top products, recent activity, and user metrics
- **Role-based Access**: Secure role-based routing (creator/admin with Firebase Auth)
- **Revenue Integration**: Track clicks with revenue data and conversion insights
- **Glassmorphism UI**: Modern dark-themed design with animations and blur effects
- **Firestore Backend**: Real-time database with automatic aggregations and batch operations

## 🏗️ Architecture

### Frontend
- **React 19** with React Router v7
- **Firebase Authentication** for secure user management
- **Firestore SDK** for real-time queries
- **Responsive CSS** with global animations and utilities
- **Dark SaaS Theme** with gradient overlays and glassmorphic cards

### Backend
- **Firebase Firestore** for primary data store
- **Firebase Functions** with Express.js for click redirect and tracking
- **Batch Operations** for atomic multi-document updates
- **Token Verification** for authenticated click tracking

## 📊 Firestore Schema

### Collections

#### `users`
```json
{
  "uid": "string (document ID)",
  "email": "string",
  "displayName": "string",
  "role": "creator | admin",
  "totalClicks": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `products`
```json
{
  "id": "string (document ID)",
  "name": "string",
  "slug": "string",
  "category": "string",
  "etsyLink": "string",
  "ownerUid": "string (user reference)",
  "totalClicks": "number",
  "revenue": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `clicks`
```json
{
  "eventType": "click",
  "productId": "string",
  "productSlug": "string",
  "userId": "string (optional)",
  "ownerUid": "string",
  "referrer": "string",
  "userAgent": "string",
  "ip": "string",
  "source": "string (utm_source)",
  "medium": "string (utm_medium)",
  "campaign": "string (utm_campaign)",
  "adId": "string (utm_ad)",
  "revenue": "number",
  "conversionStatus": "string",
  "createdAt": "timestamp"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase Project
- npm or yarn

### Installation

1. Clone and install
   ```bash
   git clone <repo>
   cd syndra
   npm install
   cd functions && npm install && cd ..
   ```

2. Configure Firebase (`.env.local`)
   ```env
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```

3. Enable Firebase Services
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Functions (Blaze plan)

4. Start dev server
   ```bash
   npm start
   ```

## 📱 Routes

| Path | Role | Description |
|------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Auth (login/register) |
| `/dashboard` | Creator+ | Creator analytics |
| `/admin` | Admin | System analytics |
| `/go/:slug` | Public | Click redirect |

## 🔐 Security Rules

Apply in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /products/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerUid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /clicks/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid != null || request.auth.token.iss != null;
    }
  }
}
```

## 💻 Development

```bash
# Frontend
npm start              # Dev server
npm run build         # Production build
npm test              # Run tests

# Backend (from functions/)
firebase emulator:start  # Local emulator
firebase deploy         # Deploy to Firebase
```

## 🔌 API Reference

### Click Redirect Endpoint
**GET** `/go/:slug`

**Query Params:**
- `source`: utm_source
- `medium`: utm_medium
- `campaign`: utm_campaign
- `ad`: utm_ad
- `json=1`: Return JSON

**Headers:**
- `Authorization: Bearer <idToken>` (optional)
- `Accept: application/json` (optional)

**Response:**
```json
{
  "redirectUrl": "https://etsy.com/..."
}
```

## 📈 Analytics Service

```javascript
import { 
  getAdminOverview,
  getTopProducts,
  getRecentUsers,
  getRecentClicks,
  getUserAnalytics 
} from './services/analyticsService';

// Get system stats
const { users, products, clicks } = await getAdminOverview();

// Get creator's analytics
const { user, products } = await getUserAnalytics(uid);
```

## 🎨 Styling

Global CSS classes:
- `.bodyGradient`: Dark background
- `.fadeUp`: Fade-in animation
- `.glowCard`: Glow effect card
- `.hero-border`: Hero border

Color palette:
- Deep blue: #0f172a
- Primary blue: #4f7cff
- Purple: #7c3aed

## 📦 Project Structure

```
syndra/
├── src/
│   ├── pages/           # Routes (Home, Login, Dashboard, Admin)
│   ├── components/      # UI components
│   ├── context/         # AuthContext
│   ├── services/        # Firebase services
│   ├── firebase/        # Config
│   └── index.css        # Global styles
├── functions/           # Cloud Functions
└── public/              # Static files
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## 📄 License

MIT

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)
### Syndra SaaS Setup

This project has been extended with role-based admin/user dashboards, click tracking through Firestore, and a more polished dark SaaS frontend.

#### Local development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open the app in your browser at `http://localhost:3000`.

#### Firebase setup

Create a Firebase project and configure:

- Authentication: Email/Password
- Firestore: Native mode
- Functions: Cloud Functions for Firebase
- Hosting: Firebase Hosting

Then copy your Firebase config into `src/firebase/config.js`.

#### Deployment

##### Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize the project:

```bash
firebase login
firebase init
```

3. Deploy frontend and functions:

```bash
firebase deploy --only hosting,functions
```

##### Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy the site:

```bash
vercel --prod
```

#### Project architecture

- `src/pages`: app screens (`Home`, `Login`, `Dashboard`, `Admin`, `Redirect`)
- `src/components`: reusable UI and route guards
- `src/context/AuthContext.js`: Firebase auth and profile loading
- `src/services`: Firebase operations for auth and analytics
- `functions/index.js`: click tracking endpoint, event logging, and redirect logic
### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
