# Syndra Security & Best Practices

Security architecture and best practices for Syndra.

## Authentication Security

### Firebase Auth Configuration

1. **Email/Password Verification**
   - Require email verification before dashboard access
   - Implement in `AuthContext.js`:
   ```javascript
   if (!user.emailVerified) {
     user.getIdTokenResult().then(idTokenResult => {
       // Redirect to verification screen
     });
   }
   ```

2. **Password Requirements**
   - Firebase default: 6+ characters
   - Consider adding custom rules for enterprise deployments

3. **Session Management**
   - Firebase handles refresh tokens automatically
   - Set session timeout in Firestore rules if needed

### Multi-Factor Authentication (MFA)

To enable MFA for admin accounts:

1. In Firebase Console → Authentication → Settings
2. Enable "Multi-factor authentication"
3. Require MFA for admin role users

## Firestore Security Rules

### Rule Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // USERS: Own profile only, admins see all
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow write: if isOwner(uid);
    }
    
    // PRODUCTS: Authenticated read, owner write
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.ownerUid) || isAdmin();
    }
    
    // CLICKS: Authenticated read, backend write
    match /clicks/{clickId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() || isBackend();
    }
  }
  
  // Helper functions
  function isAuthenticated() {
    return request.auth != null;
  }
  
  function isOwner(uid) {
    return request.auth.uid == uid;
  }
  
  function isAdmin() {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
  
  function isBackend() {
    return request.auth.token.iss != null;
  }
}
```

## Frontend Security

### Environment Variables

**DO NOT commit sensitive data:**
- API keys should never be in source code
- Use `.env.local` for local development
- Use Firebase Console for production config
- Gitignore: `.env*.local`, `.env*.private`

### Authentication Token Handling

In `src/pages/Redirect.jsx`:

```javascript
// Only send token in Authorization header
const token = await auth.currentUser?.getIdToken();
fetch(redirectUrl, {
  headers: {
    'Authorization': `Bearer ${token}` // Secure transmission
  }
});
```

### XSS Prevention

- React automatically escapes JSX expressions
- Use `textContent` instead of `innerHTML`
- Validate user input before display
- Example safe component:
```javascript
<div>{userInput}</div> // Safe - React escapes
<div dangerouslySetInnerHTML={{__html: userInput}} /> // UNSAFE
```

### CSRF Protection

- Firebase handles CSRF automatically
- Use idempotent operations where possible
- Validate `Origin` header for critical operations

## Backend (Cloud Functions) Security

### Validate Requests

```javascript
app.get("/go/:slug", async (req, res) => {
  // 1. Validate input
  const { slug } = req.params;
  if (!slug || typeof slug !== 'string' || slug.length > 100) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  
  // 2. Verify auth token if present
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      // User is authenticated
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  // 3. Sanitize user input
  const sanitized = slug.replace(/[^a-zA-Z0-9-_]/g, '');
  // ... continue processing
});
```

### Rate Limiting

Implement rate limiting for click endpoint:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.get('/go/:slug', limiter, async (req, res) => {
  // ... handler
});
```

### Dependency Security

Keep dependencies updated:
```bash
npm audit
npm audit fix
npm update
```

## Data Security

### Sensitive Data Handling

1. **Clicks Table**
   - IP addresses: Consider anonymization (last octet removal)
   - User Agent: Don't store full browser details
   - Referrer: Validate before storing

2. **User Profiles**
   - Never store passwords (Firebase handles)
   - Minimize PII in public docs
   - Use encryption for sensitive fields

### Data Retention

Policy for `clicks` collection:

```javascript
// Implement cleanup function to delete old clicks
const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.deleteOldClicks = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const snapshot = await admin.firestore()
      .collection('clicks')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    return batch.commit();
  });
```

## API Security

### CORS Configuration

Whitelist only trusted origins:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://syndra.com'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS']
};

app.use(cors(corsOptions));
```

### Request Validation

```javascript
// Validate Content-Type
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

// Validate request headers
app.use((req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type' });
  }
  next();
});
```

## Monitoring & Logging

### Security Logging

Log suspicious activities:

```javascript
async function logSecurityEvent(eventType, userId, details) {
  await admin.firestore()
    .collection('security_logs')
    .add({
      eventType,
      userId,
      details,
      ip: request.ip,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      severity: 'info' // 'info', 'warning', 'error'
    });
}

// Usage
await logSecurityEvent('failed_login', email, { reason: 'wrong_password' });
await logSecurityEvent('admin_action', uid, { action: 'delete_user' });
```

### Error Handling

Never expose sensitive info in error messages:

```javascript
// BAD: Reveals database structure
res.status(500).json({ error: `User ${uid} not found in collection "users"` });

// GOOD: Generic error message
res.status(500).json({ error: 'An error occurred. Please try again.' });
```

## Third-Party Integrations

### Etsy Link Security

Validate Etsy URLs before storing:

```javascript
function isValidEtsyUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'etsy.com' || parsed.hostname === 'www.etsy.com';
  } catch {
    return false;
  }
}
```

## Compliance

### GDPR Compliance

1. **Data Processing Agreement**
   - Firebase has a DPA in place
   - Ensure user data location compliance

2. **Right to be Forgotten**
   - Implement user data deletion:
   ```javascript
   exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
     const batch = admin.firestore().batch();
     
     // Delete user doc
     batch.delete(admin.firestore().collection('users').doc(user.uid));
     
     // Delete user's products
     const products = await admin.firestore()
       .collection('products')
       .where('ownerUid', '==', user.uid)
       .get();
     products.docs.forEach(doc => batch.delete(doc.ref));
     
     // Delete user's clicks (anonymize instead?)
     // Consider legal requirements
     
     return batch.commit();
   });
   ```

### Data Privacy

- Transparent privacy policy
- Clear data collection practices
- Opt-in for analytics and tracking
- Document all data processing

## Security Checklist

### Development
- [ ] No sensitive data in code
- [ ] Environment variables for secrets
- [ ] HTTPS enforced
- [ ] Input validation on all endpoints
- [ ] Security headers set
- [ ] CORS properly configured

### Deployment
- [ ] Firestore security rules applied
- [ ] Authentication required for sensitive routes
- [ ] Admin routes protected
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Backup strategy in place

### Maintenance
- [ ] Dependencies updated regularly
- [ ] Security vulnerabilities monitored
- [ ] Access logs reviewed monthly
- [ ] User data retention policy enforced
- [ ] Penetration testing performed annually
- [ ] Security training for team

## References

- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Firebase Authentication Security](https://firebase.google.com/docs/auth/best-practices)
- [Cloud Functions Security](https://cloud.google.com/functions/docs/securing)
