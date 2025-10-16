// components/ui/EnhancedDialog.jsx
import React from 'react';
import { Close as CloseIcon } from '@mui/icons-material';
import { format,  parseISO, } from 'date-fns';

export const EnhancedDialog = ({
    open,
    onClose,
    title,
    children,
    maxWidth = 'lg',
    themeMode = 'light'
}) => {
    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-sm">
            <div
                className={`
          w-full ${sizeClasses[maxWidth]} 
          bg-[var(--card-background-color)] 
          rounded-[var(--border-radius-lg)]
          shadow-professional-hover
          border border-[var(--border-color)]
          max-h-[90vh] overflow-hidden
          transform transition-smooth
          scale-95 opacity-1 animate-dialog-in
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b border-[var(--border-color)]">
                    <h2 className="text-responsive-lg font-bold text-[var(--primary-text-color)] font-[var(--font-primary)]">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="
              p-2 rounded-[var(--border-radius-sm)] 
              text-[var(--secondary-text-color)] 
              hover:bg-[var(--active-bg)] 
              hover:text-[var(--primary-text-color)]
              transition-smooth
            "
                    >
                        <CloseIcon className="text-responsive-md" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Enhanced Progress Tracker Component
export const ProgressTracker = ({ trackingData, themeMode = 'light' }) => {
    const STATUS_OPTIONS = {
        PENDING: 'Pending',
        PAYMENT_PENDING: 'Payment Pending',
        PLACED: 'Placed',
        IN_PROCESSING: 'Processing',
        READY: 'Move to ship',
        PACKED: 'Packed',
        SHIPPED: 'Shipped',
        IN_TRANSIT: 'In Transit',
        OUT_FOR_DELIVERY: 'Out for Delivery',
        DELIVERED: 'Delivered',
        DELIVERY_FAILED: 'Delivery Failed',
        CANCELLED: 'Cancelled',
        RTO_IN_PROGRESS: 'Return in Progress',
        RTO_DELIVERED: 'Returned',
        REFUND: 'Refunded',
    };

    const statusOrder = [
        'PAYMENT_PENDING', 'PENDING', 'PLACED', 'IN_PROCESSING',
        'READY', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'
    ];

    const getStatusLabel = (status) => {
        if (!status) return "Unknown";
        return STATUS_OPTIONS[status] ||
            status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const latestStatus = trackingData?.history?.[trackingData.history.length - 1]?.status;
    const currentStatus = trackingData?.current_status || latestStatus || 'PLACED';
    const currentStepIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="relative">
                <div className="flex justify-between mb-3">
                    {statusOrder.map((status, index) => (
                        <span
                            key={status}
                            className={`
                text-responsive-xs font-medium text-center
                ${index <= currentStepIndex ? 'text-[var(--success-color)]' : 'text-[var(--secondary-text-color)]'}
                max-w-20
              `}
                        >
                            {getStatusLabel(status)}
                        </span>
                    ))}
                </div>

                <div className="relative h-2 bg-[var(--border-color)] rounded-full">
                    <div
                        className="absolute top-0 left-0 h-full bg-[var(--success-color)] rounded-full transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (statusOrder.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Tracking History */}
            <div>
                <h3 className="text-responsive-md font-semibold text-[var(--primary-text-color)] mb-4">
                    Tracking History
                </h3>
                <div className="space-y-3">
                    {trackingData?.history?.slice().reverse().map((track, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--active-bg)]">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-[var(--success-color)] rounded-full" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-responsive-sm font-medium text-[var(--primary-text-color)]">
                                        {getStatusLabel(track.status)}
                                    </span>
                                    <span className="text-responsive-xs text-[var(--secondary-text-color)]">
                                        {format(parseISO(track.updated_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                                {track.remarks && (
                                    <p className="text-responsive-xs text-[var(--secondary-text-color)]">
                                        {track.remarks}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};