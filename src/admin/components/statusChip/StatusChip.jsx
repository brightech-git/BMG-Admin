// ✅ StatusChip.jsx (fixed)
import React from 'react';

const StatusChip = ({ status, size = 'medium', onClick, themeMode = 'light' }) => {
    const statusConfig = {
        pending: { color: 'var(--status-pending)', glow: 'var(--status-glow-pending)', text: '#FFFFFF' },
        completed: { color: 'var(--status-completed)', glow: 'var(--status-glow-completed)', text: '#FFFFFF' },
        processing: { color: 'var(--status-processing)', glow: 'var(--status-glow-processing)', text: '#FFFFFF' },
        cancelled: { color: 'var(--status-cancelled)', glow: 'var(--status-glow-cancelled)', text: '#FFFFFF' },
        shipped: { color: 'var(--status-shipped)', glow: 'var(--status-glow-shipped)', text: '#FFFFFF' },
        delivered: { color: 'var(--status-delivered)', glow: 'var(--status-glow-delivered)', text: '#FFFFFF' },
        refunded: { color: 'var(--status-refunded)', glow: 'var(--status-glow-refunded)', text: '#FFFFFF' },
        placed: { color: 'var(--status-pending)', glow: 'var(--status-glow-pending)', text: '#FFFFFF' },
        in_processing: { color: 'var(--status-processing)', glow: 'var(--status-glow-processing)', text: '#FFFFFF' },
        packed: { color: 'var(--status-processing)', glow: 'var(--status-glow-processing)', text: '#FFFFFF' },
        in_transit: { color: 'var(--status-shipped)', glow: 'var(--status-glow-shipped)', text: '#FFFFFF' },
        out_for_delivery: { color: 'var(--status-shipped)', glow: 'var(--status-glow-shipped)', text: '#FFFFFF' },
        delivery_failed: { color: 'var(--status-cancelled)', glow: 'var(--status-glow-cancelled)', text: '#FFFFFF' },
        rto_in_progress: { color: 'var(--status-cancelled)', glow: 'var(--status-glow-cancelled)', text: '#FFFFFF' },
        rto_delivered: { color: 'var(--status-cancelled)', glow: 'var(--status-glow-cancelled)', text: '#FFFFFF' },
        refund: { color: 'var(--status-refunded)', glow: 'var(--status-glow-refunded)', text: '#FFFFFF' },
    };

    // ✅ Always lowercase safely
    const safeStatus = typeof status === 'string' ? status.toLowerCase() : '';
    const config = statusConfig[safeStatus] || statusConfig.pending;

    // ✅ Readable label like "IN PROCESSING" → "In Processing"
    const formattedLabel = safeStatus
        ? safeStatus.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : 'Unknown';
        console.log(formattedLabel, 'formattedLabel');

    const sizeClasses = {
        small: 'px-[var(--spacing-xs)] py-[var(--spacing-xs)] text-responsive-xs',
        medium: 'px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-responsive-sm',
        large: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-responsive-md',
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center rounded-full font-semibold font-secondary
                ${sizeClasses[size]} cursor-pointer transition-all duration-200
                hover:scale-105 active:scale-95
            `}
            style={{
                backgroundColor: config.color,
                color: '#ffffff',
                boxShadow: config.glow,
                filter: 'brightness(1.1)',
                fontFamily: 'var(--font-secondary)',
                fontSize:'var(--font-size-xxs)'
            }}
            onClick={onClick}
        >
            {formattedLabel}
        </span>
    );
};

export default StatusChip;
