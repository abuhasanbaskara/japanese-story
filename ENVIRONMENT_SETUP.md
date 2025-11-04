# Environment Setup Guide

Complete guide for managing Development and Production environments.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Cloudflare R2 Setup](#cloudflare-r2-setup)
5. [Deployment Checklist](#deployment-checklist)

---

## Overview

This project separates **Development** and **Production** environments to:
- ✅ Prevent production data from being overwritten during testing
- ✅ Isolate security and credentials
- ✅ Facilitate testing without affecting production
- ✅ Better error tracking and debugging

---

## Environment Variables

### Setup `.env.local` (Development)

Create `.env.local` file in the project root:

```env
# MongoDB Configuration - Development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanese-story-dev

# Cloudflare R2 - Development
R2_ACCOUNT_ID=your_dev_account_id
R2_ACCESS_KEY_ID=your_dev_access_key_id
R2_SECRET_ACCESS_KEY=your_dev_secret_access_key
R2_BUCKET_NAME=uploads-dev
R2_PUBLIC_BASE_URL=https://pub-xxxxx-dev.r2.dev

# Next.js Base URL (for API calls)
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production Environment Variables

Set these in your hosting platform (Vercel, Railway, etc.):

```env
# MongoDB Configuration - Production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanese-story-prod

# Cloudflare R2 - Production
R2_ACCOUNT_ID=your_prod_account_id
R2_ACCESS_KEY_ID=your_prod_access_key_id
R2_SECRET_ACCESS_KEY=your_prod_secret_access_key
R2_BUCKET_NAME=uploads-prod
R2_PUBLIC_BASE_URL=https://cdn.yourdomain.com

# Next.js Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## Database Setup

### Strategy: Separate Databases

**Recommended:** Use separate databases for dev and prod.

#### Development Database
```
Database Name: japanese-story-dev
Purpose: Testing, development, experiments
```

#### Production Database
```
Database Name: japanese-story-prod
Purpose: Live user data, real content
```

### Setup in MongoDB Atlas

1. **Create Development Database:**
   - Login to MongoDB Atlas
   - Create a new cluster or use existing cluster
   - Create database: `japanese-story-dev`
   - Set user credentials (save for `.env.local`)

2. **Create Production Database:**
   - Create separate database: `japanese-story-prod`
   - Set user credentials (save for production env vars)
   - **Important:** Use different user than development

3. **Network Access:**
   - Development: Allow local IP (for local testing)
   - Production: Allow hosting platform IP (Vercel, Railway, etc.)
   - Or use `0.0.0.0/0` for development (not recommended for production)

### Alternative: Same Database, Different Collections

If you don't want to create separate databases:

```
japanese-story (single database)
├── stories-dev (collection)
└── stories-prod (collection)
```

**Implementation:** Update model to append `-dev` or `-prod` to collection name based on `NODE_ENV`.

---

## Cloudflare R2 Setup

### Strategy: Separate Buckets

**Recommended:** Use separate buckets for dev and prod.

#### Development Bucket
```
Bucket Name: uploads-dev
Public URL: https://pub-xxxxx-dev.r2.dev
Purpose: Development images, test uploads
```

#### Production Bucket
```
Bucket Name: uploads-prod
Public URL: https://cdn.yourdomain.com (custom domain)
Purpose: Production images, live content
```

### Setup in Cloudflare R2

1. **Create Development Bucket:**
   - Login to Cloudflare Dashboard → R2
   - Create bucket: `uploads-dev`
   - Enable Public Access → Create R2.dev subdomain
   - Copy R2.dev URL → set to `R2_PUBLIC_BASE_URL` in `.env.local`

2. **Create Production Bucket:**
   - Create bucket: `uploads-prod`
   - Setup Custom Domain (recommended):
     - Go to Settings → Connect Domain
     - Connect `cdn.yourdomain.com` (or other subdomain)
     - Cloudflare will automatically setup DNS and SSL
   - Or use R2.dev subdomain for production

3. **R2 API Tokens:**
   - Development: Create token with access to `uploads-dev` bucket
   - Production: Create separate token with access to `uploads-prod` bucket
   - **Security:** Don't share credentials between dev and prod

### Alternative: Same Bucket, Prefix Folders

If you don't want to create separate buckets:

```
uploads (single bucket)
├── dev/
│   └── [image files]
└── prod/
    └── [image files]
```

**Implementation:** Update upload API to prepend `dev/` or `prod/` to filename based on `NODE_ENV`.

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables are set in hosting platform
- [ ] Production database is created and tested
- [ ] Production R2 bucket is created and configured
- [ ] Custom domain is configured (if used)
- [ ] `next.config.ts` is updated with production hostname
- [ ] Hardcoded credentials are removed from code

### Environment Variables in Hosting Platform

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables for:
   - **Production**
   - **Preview** (optional, for staging)
   - **Development** (optional)
3. Redeploy after adding variables

#### Railway
1. Go to Project → Variables
2. Add all environment variables
3. Redeploy

#### Other Platforms
Set environment variables according to platform documentation.

### Post-Deployment

- [ ] Test API endpoints
- [ ] Verify database connection
- [ ] Test image upload
- [ ] Verify images accessible via public URL
- [ ] Check error logs
- [ ] Monitor R2 bucket usage

---

## Best Practices

### 1. Never Hardcode Credentials
❌ **Don't:**
```javascript
const mongoUri = 'mongodb+srv://user:pass@cluster.mongodb.net/db'
```

✅ **Do:**
```javascript
const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined')
}
```

### 2. Use Environment-Specific Values
```javascript
const bucketName = process.env.R2_BUCKET_NAME || (process.env.NODE_ENV === 'production' ? 'uploads-prod' : 'uploads-dev')
```

### 3. Validate Environment Variables
```javascript
const requiredEnvVars = ['MONGODB_URI', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID']
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

### 4. Separate Secrets per Environment
- Development: Store in `.env.local` (git-ignored)
- Production: Store in hosting platform
- **Never commit `.env.local` to git**

### 5. Use .env.example Template
Create `.env.example` as a template (without actual values):
```env
MONGODB_URI=your_mongodb_uri_here
R2_ACCOUNT_ID=your_r2_account_id_here
...
```

---

## Troubleshooting

### Database Connection Failed
- Check `MONGODB_URI` format
- Verify MongoDB Atlas Network Access (IP whitelist)
- Check user credentials
- Verify database name exists

### R2 Upload Failed
- Verify R2 credentials
- Check bucket name exists
- Verify R2 API token permissions
- Check bucket public access settings

### Images Not Loading
- Verify `R2_PUBLIC_BASE_URL` is correct
- Check `next.config.ts` remotePatterns includes hostname
- Verify R2 bucket public access is enabled
- Check if custom domain DNS is properly configured

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git
- Rotate credentials regularly
- Use different credentials for dev and prod
- Enable MFA for Cloudflare and MongoDB accounts
- Monitor R2 bucket access logs
- Set up MongoDB audit logging for production

---

## API URL Management

### Using the API Utility

The project includes a utility function (`lib/api.ts`) that automatically handles API URLs for both development and production:

```typescript
import { getApiUrl, getBaseUrl, isDevelopment } from '@/lib/api'

// Get full API URL
const apiUrl = getApiUrl('/api/stories')
// Development: 'http://localhost:3000/api/stories'
// Production: 'https://yourdomain.com/api/stories'

// Get base URL only
const baseUrl = getBaseUrl()
// Development: 'http://localhost:3000'
// Production: 'https://yourdomain.com'

// Check environment
if (isDevelopment()) {
  // Development-only code
}
```

### How It Works

**Server-side (Server Components, API Routes):**
- Uses `NEXT_PUBLIC_BASE_URL` environment variable if set
- Falls back to `VERCEL_URL` if deployed on Vercel
- Falls back to `http://localhost:3000` for development
- Falls back to `https://yourdomain.com` for production (update this)

**Client-side (Client Components):**
- Uses `NEXT_PUBLIC_BASE_URL` environment variable if set
- Auto-detects from `window.location.origin` if not set
- Relative URLs (e.g., `/api/stories`) also work automatically

### Best Practice

For **server-side** API calls, always use `getApiUrl()`:
```typescript
// ✅ Good - Server Component
const res = await fetch(getApiUrl('/api/stories'))
```

For **client-side** API calls, you can use:
- Relative URLs (recommended): `/api/stories` (works automatically)
- Or `getApiUrl()` if you need explicit control: `getApiUrl('/api/stories')`

---

## Quick Reference

### Development
- Database: `japanese-story-dev`
- R2 Bucket: `uploads-dev`
- URL: `http://localhost:3000`
- Env File: `.env.local`
- API URL: Auto-detected or `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

### Production
- Database: `japanese-story-prod`
- R2 Bucket: `uploads-prod`
- URL: `https://yourdomain.com`
- Env Variables: Set in hosting platform
- API URL: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
