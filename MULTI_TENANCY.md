# Multi-Tenancy Implementation Guide

## Overview

PremiumUniversity has been upgraded to a **multi-tenant SaaS platform**. Multiple universities/institutions can now use the same system with complete data isolation.

## Key Features

✅ **Organization Management** - Each institution is a separate organization  
✅ **Data Isolation** - Complete separation of data between organizations  
✅ **Subdomain Support** - Each organization gets its own subdomain (e.g., `stanford.premiumuni.com`)  
✅ **Custom Domains** - Organizations can use their own domains  
✅ **Subscription Management** - Built-in billing and subscription tracking  
✅ **Feature Flags** - Enable/disable features per organization  
✅ **Usage Limits** - Track and enforce limits (students, staff, courses, storage)  
✅ **White-labeling** - Custom branding per organization  

## Architecture

### Tenant Resolution Flow

```
1. User visits: stanford.premiumuni.com
2. Tenant Middleware extracts subdomain: "stanford"
3. Looks up Organization with subdomain="stanford"
4. Attaches organizationId to all requests
5. All database queries automatically filtered by organizationId
```

### Database Schema

All models now include an `organizationId` field:

```javascript
{
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  }
}
```

## Setup & Migration

### 1. Run Migration Script

This script adds `organizationId` to all existing data:

```bash
cd backend
node scripts/migrateToMultiTenant.js
```

**What it does:**
- Creates a default organization (slug: 'default')
- Adds `organizationId` to all existing users, courses, enrollments, etc.
- Updates organization usage statistics

### 2. Environment Variables

No new environment variables required! The system works with existing configuration.

### 3. Verify Migration

```bash
# Check MongoDB
mongosh

# Verify default organization exists
db.organizations.findOne({ slug: 'default' })

# Verify users have organizationId
db.users.findOne({}, { organizationId: 1, email: 1 })
```

## Creating New Organizations

### Option 1: Via API (Requires Super Admin)

```bash
POST /api/organizations
Authorization: Bearer <super_admin_token>

{
  "name": "Stanford University",
  "slug": "stanford",
  "subdomain": "stanford",
  "contact": {
    "adminEmail": "admin@stanford.edu",
    "adminPhone": "+1234567890"
  },
  "subscription": {
    "plan": "professional",
    "status": "active"
  }
}
```

### Option 2: Via Script

Create `backend/scripts/createOrganization.js`:

```javascript
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
require('dotenv').config();

async function createOrg() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const org = await Organization.create({
    name: 'MIT',
    slug: 'mit',
    subdomain: 'mit',
    contact: { adminEmail: 'admin@mit.edu' },
    subscription: { plan: 'enterprise', status: 'active' }
  });
  
  console.log('Created:', org);
  process.exit(0);
}

createOrg();
```

## Accessing Organizations

### Subdomain Access

```
https://stanford.premiumuni.com  → Stanford organization
https://mit.premiumuni.com       → MIT organization
https://app.premiumuni.com       → Default organization
```

### Custom Domain Access

```
https://university.edu → Mapped to specific organization
```

### API Header (for testing)

```bash
curl -H "X-Tenant-ID: <organization_id>" https://api.premiumuni.com/api/courses
```

## Subscription Plans

| Plan | Price | Students | Staff | Courses | Storage |
|------|-------|----------|-------|---------|---------|
| **Trial** | Free (30 days) | 100 | 10 | 50 | 5 GB |
| **Basic** | $99/month | 500 | 25 | 100 | 20 GB |
| **Professional** | $299/month | 2,000 | 100 | 500 | 100 GB |
| **Enterprise** | $999/month | Unlimited | Unlimited | Unlimited | 500 GB |

## Feature Flags

Enable/disable features per organization:

```javascript
{
  features: {
    sso: true,              // Single Sign-On
    customDomain: true,     // Custom domain mapping
    apiAccess: true,        // API access
    whiteLabel: true,       // Remove branding
    advancedReporting: true,// Advanced analytics
    mobileApp: true,        // Mobile app access
    bulkImport: true,       // Bulk data import
    webhooks: true          // Webhook integrations
  }
}
```

## API Changes

### Tenant Context

All protected routes now have access to:

```javascript
req.organization     // Full organization object
req.organizationId   // Organization ID
req.tenant           // Tenant metadata (id, slug, name, plan, features, limits)
req.hasFeature(name) // Check if feature is enabled
req.isWithinLimit(type) // Check if within usage limit
```

### Example Usage in Routes

```javascript
router.get('/courses', protect, tenantMiddleware, async (req, res) => {
  // Automatically filtered by organizationId
  const courses = await Course.find({ 
    organizationId: req.organizationId 
  });
  
  // Check feature access
  if (req.hasFeature('advancedReporting')) {
    // Show advanced analytics
  }
  
  res.json({ success: true, data: courses });
});
```

### Creating Resources

Always include `organizationId` when creating new resources:

```javascript
router.post('/courses', protect, tenantMiddleware, async (req, res) => {
  const course = await Course.create({
    ...req.body,
    organizationId: req.organizationId // Always add this
  });
  
  // Update usage statistics
  await req.organization.incrementUsage('courses');
  
  res.json({ success: true, data: course });
});
```

## Frontend Changes

### Detecting Current Organization

```javascript
// Get current organization info
const response = await axios.get('/api/organizations/current');
const organization = response.data.data;

console.log(organization.name);        // "Stanford University"
console.log(organization.subdomain);   // "stanford"
console.log(organization.subscription.plan); // "professional"
```

### Branding

```javascript
// Apply organization branding
const { branding } = organization;

document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
document.documentElement.style.setProperty('--secondary-color', branding.secondaryColor);

// Set logo
document.querySelector('.logo').src = branding.logo;
```

### Feature Checks

```javascript
// Check if feature is enabled
if (organization.features.sso) {
  // Show SSO login button
}

if (organization.features.advancedReporting) {
  // Show advanced reports menu
}
```

## Super Admin

### Creating Super Admin

```javascript
// In MongoDB
db.users.updateOne(
  { email: "superadmin@premiumuni.com" },
  { 
    $set: { 
      isSuperAdmin: true,
      organizationId: null  // Super admins don't belong to any org
    } 
  }
);
```

### Super Admin Capabilities

- Create/edit/delete organizations
- View all organizations
- Access any organization's data
- Manage subscriptions
- Suspend organizations

## Security

### Data Isolation

✅ All queries automatically filtered by `organizationId`  
✅ Indexes ensure fast tenant-specific queries  
✅ Middleware validates organization access  
✅ Subscription status checked on every request  

### Best Practices

1. **Always use tenant middleware** on protected routes
2. **Never skip organizationId** when creating resources
3. **Validate organization access** before sensitive operations
4. **Check subscription status** for premium features
5. **Monitor usage limits** to prevent abuse

## Monitoring

### Organization Statistics

```bash
GET /api/organizations/:id/stats

{
  "usage": {
    "students": 450,
    "staff": 25,
    "courses": 85,
    "storageGB": 12.5
  },
  "limits": {
    "maxStudents": 500,
    "maxStaff": 25,
    "maxCourses": 100,
    "maxStorageGB": 20
  },
  "utilization": {
    "students": "90.00%",
    "staff": "100.00%",
    "courses": "85.00%",
    "storage": "62.50%"
  }
}
```

### Usage Tracking

```javascript
// Increment usage
await organization.incrementUsage('students');

// Decrement usage
await organization.decrementUsage('students');

// Check if within limit
if (!organization.isWithinLimit('students')) {
  return res.status(403).json({ 
    message: 'Student limit reached. Please upgrade your plan.' 
  });
}
```

## Troubleshooting

### Organization Not Found

**Error**: `Organization not found. Please check your URL or contact support.`

**Solution**:
- Verify subdomain is correct
- Check organization exists: `db.organizations.find()`
- Ensure organization is active: `isActive: true`

### Subscription Inactive

**Error**: `Organization subscription is not active`

**Solution**:
- Update subscription status in database
- Or update via API: `PUT /api/organizations/:id`

### Data Not Showing

**Issue**: Users can't see their data after migration

**Solution**:
- Verify `organizationId` was added: `db.users.findOne({}, {organizationId: 1})`
- Re-run migration script if needed
- Check tenant middleware is working

### Duplicate Key Error

**Error**: `E11000 duplicate key error`

**Solution**:
- Drop old unique indexes: `db.courses.dropIndex("code_1")`
- Compound indexes are now used: `{organizationId: 1, code: 1}`

## Next Steps

1. ✅ **Run migration** - `node scripts/migrateToMultiTenant.js`
2. ⏳ **Test multi-tenancy** - Create test organizations
3. ⏳ **Update frontend** - Add organization branding
4. ⏳ **Add billing** - Integrate Stripe for subscriptions
5. ⏳ **Configure DNS** - Set up subdomain wildcards
6. ⏳ **Deploy** - Update deployment configuration

## Support

For issues or questions:
- Check logs: `tail -f backend/logs/app.log`
- MongoDB queries: Use indexes for performance
- Contact: support@premiumuni.com

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: ✅ Phase 1 Complete - Multi-Tenancy Foundation
