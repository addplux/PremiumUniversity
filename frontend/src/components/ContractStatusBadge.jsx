import React from 'react';

const ContractStatusBadge = ({ status, endDate }) => {
    const getStatusConfig = () => {
        const today = new Date();
        const end = new Date(endDate);
        const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        if (status === 'Terminated') return { class: 'badge-danger', text: 'Terminated' };
        if (status === 'Expired') return { class: 'badge-secondary', text: 'Expired' };
        if (status === 'Draft') return { class: 'badge-warning', text: 'Draft' };

        if (daysRemaining < 0) return { class: 'badge-secondary', text: 'Expired' };
        if (daysRemaining <= 30) return { class: 'badge-warning', text: 'Expiring Soon' };
        if (daysRemaining <= 90) return { class: 'badge-info', text: 'Review Needed' };

        return { class: 'badge-success', text: 'Active' };
    };

    const config = getStatusConfig();

    return (
        <span className={`badge ${config.class}`}>
            {config.text}
        </span>
    );
};

export default ContractStatusBadge;
