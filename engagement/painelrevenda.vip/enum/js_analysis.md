# JS Analysis — painelrevenda.vip

## Bundle Structure
The application is a React SPA (Single Page Application) built with Vite/ESM.

### Known JS Bundles (from Wayback Machine snapshot 2026-05-20)

#### 1. `/assets/index-DvRZpwdS.js` (Main App Bundle)
- **Type:** Module (ESM)
- **Role:** Main React application bundle
- **Content:** All application components, routing, API calls
- **Note:** Hash differs from previously known (was `index-Ardi_ksy.js`)

#### 2. `/assets/react-vendor-Cn_fNecn.js` (React Vendor)
- **Type:** Module (ESM)
- **Role:** React core library + ReactDOM
- **Size:** Typical React vendor bundle

#### 3. `/assets/query-vendor-BEB_Z3JG.js` (TanStack Query)
- **Type:** Module (ESM)
- **Role:** @tanstack/react-query for data fetching/caching
- **Note:** Used for API calls, likely REST endpoints

#### 4. `/assets/ui-vendor-z1JhplkZ.js` (UI Components)
- **Type:** Module (ESM)
- **Role:** UI component library (possibly custom or MUI/Chakra)

#### 5. `/assets/index-C37eOgKP.css` (Stylesheet)
- **Type:** CSS
- **Role:** Application styles

### Analytics
#### 6. `/~flock.js` (Flock Analytics)
- **Endpoint:** `/~api/analytics` (POST)
- **Type:** Privacy-focused analytics

## API Endpoints Inferred (from React SPA patterns)

### Authentication
```
POST /api/auth/login        - Login with email/password
POST /api/auth/register     - Register new account
POST /api/auth/forgot       - Password recovery
POST /api/auth/reset        - Password reset
POST /api/auth/logout       - Logout
```

### Credits & Plans
```
GET  /api/plans             - List available credit plans
POST /api/credits/purchase  - Purchase credits
GET  /api/credits/balance   - Check credit balance
POST /api/credits/transfer  - Transfer credits (reseller)
```

### Client Management
```
GET    /api/clients         - List clients
POST   /api/clients         - Add client
PUT    /api/clients/:id     - Update client
DELETE /api/clients/:id     - Remove client
GET    /api/clients/:id     - Get client details
POST   /api/clients/:id/block    - Block client
POST   /api/clients/:id/unblock  - Unblock client
```

### Reseller Management
```
GET    /api/resellers       - List sub-resellers
POST   /api/resellers       - Add sub-reseller
PUT    /api/resellers/:id   - Update sub-reseller
```

### Subscription
```
POST   /api/subscriptions/create   - Create subscription
POST   /api/subscriptions/renew    - Renew subscription
POST   /api/subscriptions/cancel   - Cancel subscription
GET    /api/subscriptions/status/:id - Check status
```

### Payment (PIX)
```
POST   /api/pix/generate    - Generate PIX QR Code
POST   /api/pix/verify      - Verify PIX payment
GET    /api/pix/transactions - List PIX transactions
```

### Admin
```
GET    /api/admin/dashboard       - Admin dashboard stats
GET    /api/admin/users           - List all users
GET    /api/admin/logs            - View system logs
POST   /api/admin/config          - Update config
```

### System
```
GET    /api/health           - Health check
GET    /api/version          - API version
GET    /api/status           - System status
```

## Potential Tokens/Keys (NOT FOUND - JS not downloadable)
Due to Cloudflare blocking, the JS bundle content could not be analyzed.
Potential token types that may exist in JS bundles:
- JWT tokens (pattern: `eyJ` base64-encoded JWTs)
- PIX API keys (Brazilian payment APIs)
- Stripe/Asaas payment gateway keys
- Firebase/Google Cloud API keys
- AWS keys (if using AWS services)
- Internal API authentication tokens

## Recommendations for Next Phase
1. Bypass Cloudflare via 2Captcha + headless browser to download JS bundles
2. Analyze JS bundles for hardcoded API keys, JWT secrets, internal routes
3. Test inferred API endpoints with parameter fuzzing
4. Look for .env, config files in JS bundles