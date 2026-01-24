import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const OrganizationContext = createContext();

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within OrganizationProvider');
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/organizations/current');

            if (response.data.success) {
                const org = response.data.data;
                setOrganization(org);

                // Apply branding immediately
                applyBranding(org.branding);

                // Update document title
                document.title = org.name || 'PremiumUniversity';

                // Update favicon if provided
                if (org.branding?.favicon) {
                    updateFavicon(org.branding.favicon);
                }
            }
        } catch (err) {
            console.error('Failed to fetch organization:', err);
            setError(err.response?.data?.message || 'Failed to load organization');

            // Set default organization for development
            setOrganization({
                name: 'Premium School of Health Sciences',
                slug: 'default',
                subdomain: 'app',
                subscription: {
                    plan: 'enterprise',
                    status: 'active'
                },
                branding: {
                    primaryColor: '#1a56db',
                    secondaryColor: '#4f46e5'
                },
                features: {},
                limits: {},
                usage: {}
            });
        } finally {
            setLoading(false);
        }
    };

    const applyBranding = (branding) => {
        if (!branding) return;

        const root = document.documentElement;

        // Apply custom colors
        if (branding.primaryColor) {
            root.style.setProperty('--primary-color', branding.primaryColor);
        }
        if (branding.secondaryColor) {
            root.style.setProperty('--secondary-color', branding.secondaryColor);
        }

        // Apply custom CSS if provided
        if (branding.customCSS) {
            const styleId = 'org-custom-css';
            let styleElement = document.getElementById(styleId);

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = branding.customCSS;
        }
    };

    const updateFavicon = (faviconUrl) => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    // Helper function to check if a feature is enabled
    const hasFeature = (featureName) => {
        return organization?.features?.[featureName] === true;
    };

    // Helper function to check if within usage limit
    const isWithinLimit = (limitType) => {
        if (!organization) return true;

        const usage = organization.usage?.[limitType] || 0;
        const limit = organization.limits?.[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`];

        if (!limit || limit === -1) return true; // Unlimited
        return usage < limit;
    };

    // Helper function to get usage percentage
    const getUsagePercentage = (limitType) => {
        if (!organization) return 0;

        const usage = organization.usage?.[limitType] || 0;
        const limit = organization.limits?.[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`];

        if (!limit || limit === -1) return 0; // Unlimited
        return Math.round((usage / limit) * 100);
    };

    // Helper function to check subscription status
    const isSubscriptionActive = () => {
        return organization?.subscription?.status === 'active';
    };

    // Helper function to check if trial is active
    const isTrialActive = () => {
        if (organization?.subscription?.plan !== 'trial') return false;
        if (!organization?.subscription?.trialEndsAt) return false;
        return new Date(organization.subscription.trialEndsAt) > new Date();
    };

    // Helper function to get days remaining in trial
    const getTrialDaysRemaining = () => {
        if (!isTrialActive()) return 0;
        const endDate = new Date(organization.subscription.trialEndsAt);
        const today = new Date();
        const diff = endDate - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const value = {
        organization,
        loading,
        error,
        refreshOrganization: fetchOrganization,

        // Branding
        branding: organization?.branding || {},
        logo: organization?.branding?.logo,
        primaryColor: organization?.branding?.primaryColor || '#1a56db',
        secondaryColor: organization?.branding?.secondaryColor || '#4f46e5',

        // Subscription
        subscription: organization?.subscription || {},
        plan: organization?.subscription?.plan || 'trial',
        subscriptionStatus: organization?.subscription?.status || 'active',
        isSubscriptionActive: isSubscriptionActive(),
        isTrialActive: isTrialActive(),
        trialDaysRemaining: getTrialDaysRemaining(),

        // Features
        features: organization?.features || {},
        hasFeature,

        // Limits & Usage
        limits: organization?.limits || {},
        usage: organization?.usage || {},
        isWithinLimit,
        getUsagePercentage,

        // Organization Info
        name: organization?.name || 'PremiumUniversity',
        slug: organization?.slug || 'default',
        subdomain: organization?.subdomain || 'app',
        domain: organization?.domain,

        // Settings
        settings: organization?.settings || {},
        timezone: organization?.settings?.timezone || 'UTC',
        currency: organization?.settings?.currency || 'USD',
        language: organization?.settings?.language || 'en',
        dateFormat: organization?.settings?.dateFormat || 'DD/MM/YYYY'
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};
