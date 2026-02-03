const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const { protect, superAdmin } = require('../middleware/auth');

// @route   GET /api/organizations
// @desc    Get all organizations (Super Admin only)
// @access  Private/Super Admin
router.get('/', protect, superAdmin, async (req, res) => {
    try {

        const organizations = await Organization.find()
            .populate('createdBy', 'firstName lastName email')
            .sort('-createdAt');

        res.json({
            success: true,
            count: organizations.length,
            data: organizations
        });
    } catch (error) {
        console.error('Get organizations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/organizations/current
// @desc    Get current organization (based on tenant context)
// @access  Public
router.get('/current', async (req, res) => {

    try {
        if (!req.organizationId) {
            return res.status(404).json({
                success: false,
                message: 'No organization context found'
            });
        }

        const organization = await Organization.findById(req.organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        res.json({
            success: true,
            data: organization
        });
    } catch (error) {
        console.error('Get current organization error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Private/Super Admin or Organization Admin
router.get('/:id', protect, async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email');

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user has access (super admin or belongs to this org)
        const user = await User.findById(req.user._id).select('+isSuperAdmin');
        if (!user.isSuperAdmin && req.organizationId && req.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: organization
        });
    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/organizations
// @desc    Create new organization
// @access  Private/Super Admin
router.post('/', protect, superAdmin, async (req, res) => {
    try {

        const {
            name,
            slug,
            subdomain,
            domain,
            contact,
            subscription,
            limits,
            features,
            settings,
            branding
        } = req.body;

        // Check if slug or subdomain already exists
        const existing = await Organization.findOne({
            $or: [
                { slug },
                { subdomain },
                ...(domain ? [{ domain }] : [])
            ]
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Organization with this slug, subdomain, or domain already exists'
            });
        }

        const organization = await Organization.create({
            name,
            slug,
            subdomain: subdomain || slug,
            domain,
            contact,
            subscription: subscription || {
                plan: 'trial',
                status: 'active',
                trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
            },
            limits: limits || {},
            features: features || {},
            settings: settings || {},
            branding: branding || {},
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: organization
        });
    } catch (error) {
        console.error('Create organization error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Organization with this slug, subdomain, or domain already exists'
            });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private/Super Admin or System Admin of organization
router.put('/:id', protect, async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user has access
        const user = await User.findById(req.user._id).select('+isSuperAdmin');
        const isSystemAdmin = req.user.role === 'system_admin' &&
            req.organizationId && req.organizationId.toString() === organization._id.toString();

        if (!user.isSuperAdmin && !isSystemAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name', 'domain', 'branding', 'contact', 'settings',
            'features', 'limits', 'ssoConfig'
        ];

        // Super admins can also update subscription
        if (user.isSuperAdmin) {
            allowedUpdates.push('subscription', 'isActive', 'isSuspended', 'suspensionReason');
        }

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (typeof req.body[field] === 'object' && !Array.isArray(req.body[field])) {
                    organization[field] = { ...organization[field].toObject(), ...req.body[field] };
                } else {
                    organization[field] = req.body[field];
                }
            }
        });

        await organization.save();

        res.json({
            success: true,
            message: 'Organization updated successfully',
            data: organization
        });
    } catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization (soft delete - set to inactive)
// @access  Private/Super Admin
router.delete('/:id', protect, superAdmin, async (req, res) => {
    try {

        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Soft delete - just set to inactive
        organization.isActive = false;
        organization.isSuspended = true;
        organization.suspensionReason = 'Organization deleted by super admin';
        await organization.save();

        res.json({
            success: true,
            message: 'Organization deactivated successfully'
        });
    } catch (error) {
        console.error('Delete organization error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/organizations/:id/stats
// @desc    Get organization statistics
// @access  Private/Super Admin or Organization Admin
router.get('/:id/stats', protect, async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user has access
        const user = await User.findById(req.user._id).select('+isSuperAdmin');
        if (!user.isSuperAdmin && req.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get detailed statistics
        const stats = {
            usage: organization.usage,
            limits: organization.limits,
            utilization: {
                students: organization.limits.maxStudents > 0
                    ? (organization.usage.students / organization.limits.maxStudents * 100).toFixed(2) + '%'
                    : 'N/A',
                staff: organization.limits.maxStaff > 0
                    ? (organization.usage.staff / organization.limits.maxStaff * 100).toFixed(2) + '%'
                    : 'N/A',
                courses: organization.limits.maxCourses > 0
                    ? (organization.usage.courses / organization.limits.maxCourses * 100).toFixed(2) + '%'
                    : 'N/A',
                storage: organization.limits.maxStorageGB > 0
                    ? (organization.usage.storageGB / organization.limits.maxStorageGB * 100).toFixed(2) + '%'
                    : 'N/A'
            },
            subscription: organization.subscription,
            features: organization.features
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get organization stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
