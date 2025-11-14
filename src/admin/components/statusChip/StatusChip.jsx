// ✅ StatusChip.jsx (Professional Version)
import React from 'react';

const StatusChip = ({ status, size = 'medium', onClick, themeMode = 'light' }) => {
    // Centralized status configuration with professional colors
    const statusConfig = {
        // 🟡 Waiting / Pending
        pending: { bg: "#FBBF24", text: "#1F2937" },
        placed: { bg: "#FBBF24", text: "#1F2937" }, // same as pending
        ready_to_ship: { bg: "#FBBF24", text: "#1F2937" },

        // 🔵 Processing
        in_processing: { bg: "#3B82F6", text: "#FFFFFF" },
        processing: { bg: "#3B82F6", text: "#FFFFFF" },
        packing: { bg: "#3B82F6", text: "#FFFFFF" },
        packed: { bg: "#3B82F6", text: "#FFFFFF" },

        // 🟣 Transit / Shipping
        shipped: { bg: "#6366F1", text: "#FFFFFF" },
        in_transit: { bg: "#6366F1", text: "#FFFFFF" },
        out_for_delivery: { bg: "#6366F1", text: "#FFFFFF" },

        // 🟢 Success
        delivered: { bg: "#10B981", text: "#FFFFFF" },

        // 🔴 Failed / Cancelled / RTO / Return
        cancelled: { bg: "#EF4444", text: "#FFFFFF" },
        delivery_failed: { bg: "#EF4444", text: "#FFFFFF" },
        rto_in_progress: { bg: "#EF4444", text: "#FFFFFF" },
        rto_delivered: { bg: "#EF4444", text: "#FFFFFF" },
        returned: { bg: "#EF4444", text: "#FFFFFF" },

        // 🟠 Refund
        refunded: { bg: "#F97316", text: "#FFFFFF" },
        refund: { bg: "#F97316", text: "#FFFFFF" },
    };

    const safeStatus = typeof status === 'string' ? status.toLowerCase() : '';
    const config = statusConfig[safeStatus] || statusConfig.pending;

    // Format label: "in_transit" -> "In Transit"
    const formattedLabel = safeStatus
        ? safeStatus.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : 'Unknown';

    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        medium: 'px-3 py-1.5 text-sm',
        large: 'px-4 py-2 text-md',
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center rounded-full font-semibold cursor-pointer transition-transform
                hover:scale-105 active:scale-95 ${sizeClasses[size]}
            `}
            style={{
                backgroundColor: config.bg,
                color: config.text,
                fontFamily: 'var(--font-secondary)',
            }}
            onClick={onClick}
        >
            {formattedLabel}
        </span>
    );
};

export default StatusChip;
