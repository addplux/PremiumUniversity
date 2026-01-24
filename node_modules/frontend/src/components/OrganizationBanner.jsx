import { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import './OrganizationBanner.css';

const OrganizationBanner = () => {
    const {
        organization,
        isTrialActive,
        trialDaysRemaining,
        subscriptionStatus,
        plan,
        getUsagePercentage,
        isWithinLimit
    } = useOrganization();

    const [showBanner, setShowBanner] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');
    const [bannerType, setBannerType] = useState('info'); // 'info', 'warning', 'error'

    useEffect(() => {
        if (!organization) return;

        // Check for trial expiration
        if (isTrialActive && trialDaysRemaining <= 7) {
            setShowBanner(true);
            setBannerType('warning');
            setBannerMessage(
                `Your trial expires in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}. Upgrade to continue using all features.`
            );
            return;
        }

        // Check for inactive subscription
        if (subscriptionStatus !== 'active') {
            setShowBanner(true);
            setBannerType('error');
            setBannerMessage(
                `Your subscription is ${subscriptionStatus}. Please update your billing information to continue.`
            );
            return;
        }

        // Check for usage limits
        const studentUsage = getUsagePercentage('students');
        if (studentUsage >= 90) {
            setShowBanner(true);
            setBannerType('warning');
            setBannerMessage(
                `You're at ${studentUsage}% of your student limit. Consider upgrading your plan.`
            );
            return;
        }

        setShowBanner(false);
    }, [organization, isTrialActive, trialDaysRemaining, subscriptionStatus]);

    if (!showBanner) return null;

    return (
        <div className={`org-banner org-banner-${bannerType}`}>
            <div className="org-banner-content">
                <span className="org-banner-icon">
                    {bannerType === 'error' && '⚠️'}
                    {bannerType === 'warning' && '⏰'}
                    {bannerType === 'info' && 'ℹ️'}
                </span>
                <span className="org-banner-message">{bannerMessage}</span>
                <button
                    className="org-banner-close"
                    onClick={() => setShowBanner(false)}
                    aria-label="Close banner"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default OrganizationBanner;
