# Syndra Implementation Guide

Technical implementation details and architecture decisions.

## 🏗️ System Architecture

### Component Hierarchy

```
App (Router)
├── Layout (Navbar)
├── Routes
│   ├── / (Home - Public)
│   ├── /login (Login - Public)
│   ├── /dashboard (Dashboard - Creator+)
│   ├── /admin (Admin - Admin only)
│   └── /go/:slug (Redirect - Public)
└── AuthProvider (Context)
    └── Global Auth State
```

### Data Flow

```
User Action
  ↓
React Component
  ↓
Firebase Service (authService, analyticsService)
  ↓
Firestore / Cloud Functions
  ↓
Database
  ↓
Response → Component → UI Update
```

## 🔌 Service Architecture

### Authentication Service (`authService.js`)

```javascript
export async function registerUser(email, password, displayName) {
  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 2. Create Firestore user doc
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    displayName,
    role: 'creator',
    totalClicks: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return userCredential.user;
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
```

### Analytics Service (`analyticsService.js`)

```javascript
export async function getAdminOverview() {
  // Parallel queries for performance
  const [usersCount, productsCount, clicksCount] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(collection(db, "products")),
    getCountFromServer(collection(db, "clicks")),
  ]);
  
  return {
    users: usersCount.data().count,
    products: productsCount.data().count,
    clicks: clicksCount.data().count,
  };
}

export async function getUserAnalytics(uid) {
  // Fetch user doc + user's products
  const [userDoc, productsSnap] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDocs(query(
      collection(db, "products"),
      where("ownerUid", "==", uid),
      orderBy("totalClicks", "desc"),
      limit(6)
    )),
  ]);
  
  return {
    user: userDoc.data(),
    products: productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
  };
}
```

## 🔑 Click Tracking Implementation

### Backend Flow (`functions/index.js`)

```javascript
app.get("/go/:slug", async (req, res) => {
  const { slug } = req.params;
  
  // 1. Extract auth token from header
  const token = req.get("Authorization")?.split("Bearer ")[1];
  let visitorUserId = null;
  if (token) {
    visitorUserId = (await admin.auth().verifyIdToken(token)).uid;
  }
  
  // 2. Resolve product by slug
  const productSnap = await db.collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  
  const productData = productSnap.docs[0].data();
  
  // 3. Create click record with rich metadata
  const clickData = {
    eventType: "click",
    productId: productSnap.docs[0].id,
    userId: visitorUserId,
    ownerUid: productData.ownerUid,
    referrer: req.get("Referer"),
    userAgent: req.get("User-Agent"),
    ip: req.socket.remoteAddress,
    source: req.query.source, // utm_source
    medium: req.query.medium, // utm_medium
    campaign: req.query.campaign, // utm_campaign
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // 4. Atomic batch update (ACID-like transaction)
  const batch = db.batch();
  batch.set(db.collection("clicks").doc(), clickData);
  batch.update(productSnap.docs[0].ref, {
    totalClicks: admin.firestore.FieldValue.increment(1),
  });
  if (productData.ownerUid) {
    batch.update(db.collection("users").doc(productData.ownerUid), {
      totalClicks: admin.firestore.FieldValue.increment(1),
    });
  }
  await batch.commit();
  
  // 5. Redirect or return JSON
  return res.redirect(productData.etsyLink);
});
```

### Frontend Flow (`pages/Redirect.jsx`)

```javascript
function Redirect() {
  useEffect(() => {
    const trackAndRedirect = async () => {
      const { productId } = useParams();
      const token = await auth.currentUser?.getIdToken();
      
      // Call backend tracking endpoint
      const response = await fetch(`/api/go/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    };
    
    trackAndRedirect();
  }, []);
}
```

## 🎨 Component Implementation

### ProtectedRoute Component

```javascript
function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}
```

### AuthContext Implementation

```javascript
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setProfile(profileDoc.data());
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📊 Dashboard Components

### Creator Dashboard (`pages/dashboard.jsx`)

```javascript
function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await getUserAnalytics(user.uid);
      setAnalytics(data);
    };
    
    if (user) loadAnalytics();
  }, [user]);
  
  return (
    <div>
      <h2>Your Products</h2>
      <div style={styles.productsGrid}>
        {analytics?.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Admin Dashboard (`pages/Admin.jsx`)

```javascript
function Admin() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  
  useEffect(() => {
    const loadAdminData = async () => {
      const [overview, products] = await Promise.all([
        getAdminOverview(),
        getTopProducts(6),
      ]);
      
      setStats(overview);
      setTopProducts(products);
    };
    
    loadAdminData();
  }, []);
  
  return (
    <div>
      <h1>System Analytics</h1>
      <div style={styles.statsGrid}>
        <StatCard label="Total Users" value={stats?.users} />
        <StatCard label="Total Products" value={stats?.products} />
        <StatCard label="Total Clicks" value={stats?.clicks} />
      </div>
    </div>
  );
}
```

## 🎯 Query Optimization

### Index Strategy

**Auto-indexed fields** (Firestore default):
- `uid` in users (document ID)
- `productId` in clicks (document ID)
- Timestamp fields

**Custom indexes** needed for:
```javascript
// Sort by clicks, filter by owner
query(
  collection(db, "products"),
  where("ownerUid", "==", uid),
  orderBy("totalClicks", "desc")
)
// Index: ownerUid (Asc), totalClicks (Desc)

// Recent clicks
query(
  collection(db, "clicks"),
  orderBy("createdAt", "desc"),
  limit(10)
)
// Index: createdAt (Desc)
```

### Query Pagination

```javascript
export async function getClicksPage(pageSize = 20, lastDoc = null) {
  let q = query(
    collection(db, "clicks"),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1)
  );
  
  if (lastDoc) {
    q = query(
      collection(db, "clicks"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize + 1)
    );
  }
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;
  
  return {
    clicks: docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: docs[docs.length - 1],
    hasMore,
  };
}
```

## 🔄 Real-time Updates (Optional)

For live dashboards, use Firestore listeners:

```javascript
export function subscribeToUserAnalytics(uid, callback) {
  // Subscribe to products collection
  const unsubscribe = onSnapshot(
    query(
      collection(db, "products"),
      where("ownerUid", "==", uid),
      orderBy("totalClicks", "desc")
    ),
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(products);
    }
  );
  
  return unsubscribe; // Call to stop listening
}
```

Usage:
```javascript
useEffect(() => {
  const unsubscribe = subscribeToUserAnalytics(user.uid, (products) => {
    setProducts(products); // Auto-update on changes
  });
  
  return unsubscribe;
}, [user.uid]);
```

## 🎨 Styling Architecture

### Global Utilities (`index.css`)

```css
/* Dark gradient background */
.bodyGradient {
  background: radial-gradient(circle at top, #0f172a, #05070d);
  color: #fff;
  font-family: Inter, sans-serif;
}

/* Fade-in animation */
.fadeUp {
  animation: fadeUp 0.8s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glassmorphic card glow */
.glowCard {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(79, 124, 255, 0.3);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(79, 124, 255, 0.1);
}
```

### Inline Styles Pattern

```javascript
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  card: {
    padding: "24px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};
```

## 🚀 Performance Optimizations

1. **Code Splitting**
   ```javascript
   const Admin = React.lazy(() => import('./pages/Admin'));
   ```

2. **Batch Writes**
   ```javascript
   const batch = db.batch();
   batch.set(...);
   batch.update(...);
   batch.delete(...);
   await batch.commit(); // Single round-trip
   ```

3. **Parallel Queries**
   ```javascript
   const [data1, data2, data3] = await Promise.all([
     getAdminOverview(),
     getTopProducts(),
     getRecentClicks(),
   ]);
   ```

4. **Query Limits**
   ```javascript
   limit(6) // Fetch only needed data
   ```

## 📝 Error Handling

```javascript
try {
  const user = await registerUser(email, password);
  navigate('/dashboard');
} catch (error) {
  if (error.code === 'auth/email-already-in-use') {
    setError('Email already registered');
  } else if (error.code === 'auth/weak-password') {
    setError('Password too weak');
  } else {
    setError('Signup failed: ' + error.message);
  }
}
```

## 🔧 Debugging

Enable verbose logging:

```javascript
// In development
if (process.env.NODE_ENV === 'development') {
  enableLogging(db, true); // Firestore logging
  console.log = (...args) => {
    // Custom logging
  };
}
```

---

See [README.md](README.md) for setup, [DEPLOYMENT.md](DEPLOYMENT.md) for production, and [SECURITY.md](SECURITY.md) for security practices.
