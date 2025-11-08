// components/ui/EnhancedDialog.jsx
import React from 'react';
import {
    Close as CloseIcon,
    Check as CheckIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-50">
            <div
                className={`
                    w-full ${sizeClasses[maxWidth]} 
                    bg-[var(--card-background-color)] 
                    rounded-[var(--border-radius-lg)]
                    shadow-professional-hover
                    border border-[var(--border-color)]
                    max-h-[90vh] overflow-hidden
                    transform transition-all duration-300
                    scale-100 opacity-100
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
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
        PENDING: 'Payment Pending',
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

    // Complete status order including all possible states
    const statusOrder = [
        'PENDING', 'PENDING', 'PLACED', 'IN_PROCESSING',
        'READY', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'
    ];

    // Special statuses that break the normal flow
    const cancelledStatuses = ['CANCELLED', 'RTO_IN_PROGRESS', 'RTO_DELIVERED', 'REFUND'];
    const failedStatuses = ['DELIVERY_FAILED'];
    const pendingStatuses = ['PENDING', 'PENDING'];

    const getStatusLabel = (status) => {
        if (!status) return "Unknown";
        return STATUS_OPTIONS[status] ||
            status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const latestHistoryStatus = trackingData?.history?.[trackingData.history.length - 1]?.status;
    const currentStatus = trackingData?.current_status || latestHistoryStatus || 'PLACED';

    // Determine the current step and progress
    const isCancelled = cancelledStatuses.includes(currentStatus);
    const isFailed = failedStatuses.includes(currentStatus);
    const isPending = pendingStatuses.includes(currentStatus);
    const isPaymentPending = currentStatus === 'PENDING';

    // Calculate current step index
    let currentStepIndex = -1;
    if (isCancelled || isFailed) {
        currentStepIndex = -1; // Special state
    } else if (isPending) {
        currentStepIndex = statusOrder.indexOf(currentStatus);
    } else {
        currentStepIndex = statusOrder.indexOf(currentStatus);
        if (currentStepIndex === -1) {
            currentStepIndex = 2; // Default to PLACED if not found
        }
    }

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (isCancelled || isFailed) return 0;
        if (isPaymentPending) return 0;
        if (isPending && currentStatus === 'PENDING') return 10;

        const totalSteps = statusOrder.length - 1; // -1 because we start from 0
        const progress = (currentStepIndex / totalSteps) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    const progressPercentage = getProgressPercentage();

    // Progress configuration
    const progressConfig = {
        color: isCancelled
            ? 'var(--error-color)'
            : isFailed
                ? 'var(--warning-color)'
                : isPaymentPending
                    ? 'var(--warning-color)'
                    : 'var(--success-color)',

        backgroundColor: isCancelled
            ? 'var(--error-color)'
            : isFailed
                ? 'var(--warning-color)'
                : isPaymentPending
                    ? 'var(--warning-color)'
                    : 'var(--success-color)',

        icon: isCancelled
            ? CancelIcon
            : isFailed
                ? WarningIcon
                : isPaymentPending
                    ? HourglassEmptyIcon
                    : CheckIcon,

        statusText: isCancelled
            ? 'Cancelled'
            : isFailed
                ? 'Delivery Failed'
                : isPaymentPending
                    ? 'Payment Pending'
                    : `${progressPercentage}% Complete`
    };

    return (
        <div className="space-y-6">
            {/* Current Status Card */}
            <div className={`
                p-4 rounded-[var(--border-radius-md)] border
                ${isCancelled
                    ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-700'
                    : isFailed
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-700'
                        : isPaymentPending
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-700'
                            : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700'
                }
            `}>
                <div className="flex items-center space-x-3">
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${progressConfig.backgroundColor ? `bg-[${progressConfig.backgroundColor}]` : 'bg-[var(--success-color)]'}
                        text-white
                    `} style={{ backgroundColor: progressConfig.color }}>
                        {React.createElement(progressConfig.icon, {
                            className: "text-responsive-lg"
                        })}
                    </div>
                    <div className="flex-1">
                        <div className="text-responsive-xs text-[var(--secondary-text-color)]">
                            Current Status
                        </div>
                        <div className="text-responsive-md font-semibold text-[var(--primary-text-color)]">
                            {getStatusLabel(currentStatus)}
                        </div>
                        <div className="text-responsive-xs text-[var(--secondary-text-color)]">
                            {progressConfig.statusText}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar - Show only for non-special states */}
            {!isCancelled && !isFailed && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-responsive-sm font-medium text-[var(--primary-text-color)]">
                            Order Progress
                        </span>
                        <span className="text-responsive-xs font-semibold" style={{ color: progressConfig.color }}>
                            {progressPercentage}%
                        </span>
                    </div>

                    {/* Main Progress Bar */}
                    <div className="relative">
                        <div className="h-3 bg-[var(--border-color)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${progressPercentage}%`,
                                    backgroundColor: progressConfig.color
                                }}
                            />
                        </div>

                        {/* Progress Steps */}
                        <div className="flex justify-between mt-2">
                            {statusOrder.map((status, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={status} className="flex flex-col items-center">
                                        <div
                                            className={`
                                                w-6 h-6 rounded-full flex items-center justify-center text-white text-responsive-xxs font-bold
                                                transition-all duration-300
                                                ${isCompleted ? 'scale-110' : 'scale-90'}
                                            `}
                                            style={{
                                                backgroundColor: isCompleted ? progressConfig.color : 'var(--border-color)'
                                            }}
                                        >
                                            {isCompleted && <CheckIcon className="text-responsive-xs" />}
                                        </div>
                                        <div className={`
                                            text-responsive-xxs text-center mt-1 font-medium
                                            ${isCompleted ? 'text-[var(--primary-text-color)]' : 'text-[var(--secondary-text-color)]'}
                                            ${isCurrent ? 'font-bold' : ''}
                                        `}>
                                            {getStatusLabel(status)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Special State Messages */}
            {(isCancelled || isFailed) && (
                <div className={`
                    p-4 rounded-[var(--border-radius-md)] text-center
                    ${isCancelled
                        ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700'
                        : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
                    }
                `}>
                    <div className="text-responsive-md font-semibold mb-2" style={{ color: progressConfig.color }}>
                        {getStatusLabel(currentStatus)}
                    </div>
                    <div className="text-responsive-xs text-[var(--secondary-text-color)]">
                        {isCancelled
                            ? 'This order has been cancelled and will not be processed further.'
                            : 'Delivery attempt failed. The order will be retried or returned to sender.'
                        }
                    </div>
                </div>
            )}

            {/* Tracking History */}
            <div>
                <h3 className="text-responsive-md font-semibold text-[var(--primary-text-color)] mb-4">
                    Tracking History
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {trackingData?.history?.slice().reverse().map((track, index, array) => {
                        const isLatest = index === 0;
                        const trackStatus = track.status;
                        const isCancelledTrack = cancelledStatuses.includes(trackStatus);
                        const isFailedTrack = failedStatuses.includes(trackStatus);

                        return (
                            <div key={index} className="flex items-start space-x-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--active-bg)]">
                                <div
                                    className="flex-shrink-0 w-3 h-3 mt-1 rounded-full"
                                    style={{
                                        backgroundColor: isCancelledTrack
                                            ? 'var(--error-color)'
                                            : isFailedTrack
                                                ? 'var(--warning-color)'
                                                : 'var(--success-color)'
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                        <span className={`
                                            text-responsive-sm font-medium
                                            ${isLatest ? 'text-[var(--primary-text-color)]' : 'text-[var(--secondary-text-color)]'}
                                        `}>
                                            {getStatusLabel(trackStatus)}
                                        </span>
                                        <span className="text-responsive-xs text-[var(--secondary-text-color)]">
                                            {format(parseISO(track.updated_at), 'MMM d, yyyy h:mm a')}
                                        </span>
                                    </div>
                                    {track.remarks && (
                                        <p className="text-responsive-xs text-[var(--secondary-text-color)] italic">
                                            {track.remarks}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {(!trackingData?.history || trackingData.history.length === 0) && (
                        <div className="text-center py-4 text-[var(--secondary-text-color)] text-responsive-sm">
                            No tracking history available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};