import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import YardLanding from './YardLanding';
import UniversityLanding from './UniversityLanding';

const HomePage = () => {
    const { isMasterTenant, loading } = useOrganization();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return isMasterTenant ? <YardLanding /> : <UniversityLanding />;
};

export default HomePage;
