const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Organization slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    domain: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness
        lowercase: true,
        trim: true
    },
    subdomain: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
    },

    // Branding & White-labeling
    branding: {
        logo: String,
        favicon: String,
        primaryColor: {
            type: String,
            default: '#1a56db'
        },
        secondaryColor: {
            type: String,
            default: '#4f46e5'
        },
        customCSS: String,
        emailTemplate: String
    },

    // Subscription & Billing
    subscription: {
        plan: {
            type: String,
            enum: ['trial', 'basic', 'professional', 'enterprise'],
            default: 'trial'
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'cancelled', 'past_due'],
            default: 'active'
        },
        trialEndsAt: Date,
        currentPeriodStart: Date,
        currentPeriodEnd: Date,
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false
        },
        stripeCustomerId: String,
        stripeSubscriptionId: String
    },

    // Usage Limits
    limits: {
        maxStudents: {
            type: Number,
            default: 100
        },
        maxStaff: {
            type: Number,
            default: 10
        },
        maxCourses: {
            type: Number,
            default: 50
        },
        maxStorageGB: {
            type: Number,
            default: 5
        }
    },

    // Current Usage (for tracking)
    usage: {
        students: {
            type: Number,
            default: 0
        },
        staff: {
            type: Number,
            default: 0
        },
        courses: {
            type: Number,
            default: 0
        },
        storageGB: {
            type: Number,
            default: 0
        }
    },

    // Feature Flags
    features: {
        sso: {
            type: Boolean,
            default: false
        },
        customDomain: {
            type: Boolean,
            default: false
        },
        apiAccess: {
            type: Boolean,
            default: false
        },
        whiteLabel: {
            type: Boolean,
            default: false
        },
        advancedReporting: {
            type: Boolean,
            default: false
        },
        mobileApp: {
            type: Boolean,
            default: false
        },
        bulkImport: {
            type: Boolean,
            default: false
        },
        webhooks: {
            type: Boolean,
            default: false
        }
    },

    // Contact Information
    contact: {
        adminEmail: {
            type: String,
            required: [true, 'Admin email is required'],
            lowercase: true,
            trim: true
        },
        adminPhone: String,
        supportEmail: String,
        address: String,
        city: String,
        state: String,
        country: {
            type: String,
            default: 'Zambia'
        },
        postalCode: String
    },

    // Settings
    settings: {
        timezone: {
            type: String,
            default: 'Africa/Lusaka'
        },
        currency: {
            type: String,
            default: 'ZMW',
            enum: ['USD', 'EUR', 'GBP', 'ZMW', 'ZAR']
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'fr', 'es', 'pt']
        },
        dateFormat: {
            type: String,
            default: 'DD/MM/YYYY',
            enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
        },
        academicYearStart: {
            type: String,
            default: 'January',
            enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        weekStart: {
            type: String,
            default: 'Monday',
            enum: ['Sunday', 'Monday']
        }
    },

    // SSO Configuration
    ssoConfig: {
        provider: {
            type: String,
            enum: ['google', 'microsoft', 'saml', 'custom']
        },
        clientId: String,
        clientSecret: String,
        samlEntryPoint: String,
        samlIssuer: String,
        samlCert: String
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspensionReason: String,

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String,
    tags: [String]

}, {
    timestamps: true
});

// Indexes for performance
organizationSchema.index({ slug: 1 });
organizationSchema.index({ subdomain: 1 });
organizationSchema.index({ domain: 1 });
organizationSchema.index({ 'subscription.status': 1 });
organizationSchema.index({ isActive: 1 });

// Virtual for full subdomain URL
organizationSchema.virtual('subdomainUrl').get(function () {
    return `https://${this.subdomain}.premiumuni.com`;
});

// Virtual for checking if trial is active
organizationSchema.virtual('isTrialActive').get(function () {
    if (this.subscription.plan !== 'trial') return false;
    if (!this.subscription.trialEndsAt) return false;
    return new Date() < this.subscription.trialEndsAt;
});

// Method to check if feature is enabled
organizationSchema.methods.hasFeature = function (featureName) {
    return this.features[featureName] === true;
};

// Method to check if within usage limits
organizationSchema.methods.isWithinLimit = function (limitType) {
    return this.usage[limitType] < this.limits[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`];
};

// Method to increment usage
organizationSchema.methods.incrementUsage = async function (limitType, amount = 1) {
    this.usage[limitType] += amount;
    await this.save();
};

// Method to decrement usage
organizationSchema.methods.decrementUsage = async function (limitType, amount = 1) {
    this.usage[limitType] = Math.max(0, this.usage[limitType] - amount);
    await this.save();
};

// Pre-save hook to generate subdomain from slug if not provided
organizationSchema.pre('save', function (next) {
    if (!this.subdomain && this.slug) {
        this.subdomain = this.slug;
    }
    next();
});

module.exports = mongoose.model('Organization', organizationSchema);
