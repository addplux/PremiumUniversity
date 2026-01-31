const Organization = require('../models/Organization');

/**
 * Tenant Middleware - Extracts organization context from request
 * Supports: subdomain, custom domain, and header-based tenant resolution
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        let organization = null;
        const host = req.get('host') || '';

        // Method 1: Check for tenant ID in header (for API clients)
        const tenantHeader = req.get('X-Tenant-ID');
        if (tenantHeader) {
            organization = await Organization.findById(tenantHeader);
        }

        // Method 2: Check for custom domain
        if (!organization) {
            // Remove port if present
            const domain = host.split(':')[0];
            organization = await Organization.findOne({
                domain: domain,
                isActive: true
            });
        }

        // Method 3: Check for subdomain
        if (!organization) {
            const parts = host.split('.');

            // Extract subdomain (e.g., 'stanford' from 'stanford.premiumuni.com')
            if (parts.length >= 3) {
                const subdomain = parts[0];

                // Ignore common subdomains
                if (!['www', 'api', 'admin', 'app'].includes(subdomain)) {
                    organization = await Organization.findOne({
                        subdomain: subdomain,
                        isActive: true
                    });
                }
            }
        }

        // Method 4: Check for slug in query parameter (development/testing)
        if (!organization && req.query.tenant) {
            organization = await Organization.findOne({
                slug: req.query.tenant,
                isActive: true
            });
        }

        // Method 5: Default to 'yard' (Master Tenant) for root access
        if (!organization) {
            organization = await Organization.findOne({
                slug: 'yard',
                isActive: true
            });

            // If no 'yard' organization exists, create it
            if (!organization) {
                console.log('No Yard master tenant found, creating one...');
                organization = await Organization.create({
                    name: 'Yard - Higher Ed Hosting',
                    slug: 'yard',
                    subdomain: 'yard',
                    contact: {
                        adminEmail: 'admin@yard.cloud'
                    },
                    subscription: {
                        plan: 'enterprise',
                        status: 'active'
                    },
                    limits: {
                        maxStudents: -1, // Unlimited
                        maxStaff: -1,
                        maxCourses: -1,
                        maxStorageGB: 1000
                    },
                    features: {
                        sso: true,
                        customDomain: true,
                        apiAccess: true,
                        whiteLabel: true,
                        advancedReporting: true,
                        mobileApp: true,
                        bulkImport: true,
                        webhooks: true,
                        multiTenancy: true
                    },
                    branding: {
                        primaryColor: '#8A2BE2', // Electric Purple
                        secondaryColor: '#4B0082', // Indigo
                        logo: '/assets/yard-logo.png'
                    }
                });
                console.log('Yard master tenant created:', organization.slug);
            }
        }

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found. Please check your URL or contact support.'
            });
        }

        // Check if organization is suspended
        if (organization.isSuspended) {
            return res.status(403).json({
                success: false,
                message: `This organization has been suspended. Reason: ${organization.suspensionReason || 'Contact support for details.'}`
            });
        }

        // Check subscription status
        if (organization.subscription.status !== 'active') {
            // Allow access to billing/subscription endpoints even if subscription is inactive
            const allowedPaths = ['/api/billing', '/api/subscription', '/api/auth/logout'];
            const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));

            if (!isAllowedPath) {
                return res.status(403).json({
                    success: false,
                    message: 'Organization subscription is not active. Please update your billing information.',
                    subscriptionStatus: organization.subscription.status
                });
            }
        }

        // Check if trial has expired
        if (organization.subscription.plan === 'trial' && !organization.isTrialActive) {
            const allowedPaths = ['/api/billing', '/api/subscription', '/api/auth/logout'];
            const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));

            if (!isAllowedPath) {
                return res.status(403).json({
                    success: false,
                    message: 'Your trial period has expired. Please upgrade to continue using the service.',
                    trialExpired: true
                });
            }
        }

        // Attach organization context to request
        req.organization = organization;
        req.organizationId = organization._id;
        req.tenant = {
            id: organization._id,
            slug: organization.slug,
            name: organization.name,
            plan: organization.subscription.plan,
            features: organization.features,
            limits: organization.limits,
            usage: organization.usage
        };

        // Add helper method to check features
        req.hasFeature = (featureName) => organization.hasFeature(featureName);

        // Add helper method to check limits
        req.isWithinLimit = (limitType) => organization.isWithinLimit(limitType);

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve organization context. Please try again.'
        });
    }
};

/**
 * Optional tenant middleware - doesn't fail if no tenant found
 * Useful for public endpoints that may or may not need tenant context
 */
const optionalTenantMiddleware = async (req, res, next) => {
    try {
        await tenantMiddleware(req, res, () => {
            // Continue even if tenant not found
            next();
        });
    } catch (error) {
        // Continue without tenant context
        req.organization = null;
        req.organizationId = null;
        req.tenant = null;
        next();
    }
};

module.exports = {
    tenantMiddleware,
    optionalTenantMiddleware
};
