// OrderTrackingTimeline.tsx
import HorizontalTimeline from "../../components/timeline/HorizontalTimeline";
import { ORDER_STATUS_MASTER } from "../../data/track/orderStatusMaster";
import { getStatusIcon } from "../../components/icons/track/statusIcons";



export default function OrderTrackingWrapper({
    currentStatus,
    loading,
    error,
    onRetry,
}) {
    return (
        <HorizontalTimeline
            statuses={ORDER_STATUS_MASTER}
            currentStatus={currentStatus || "PLACED"}
            loading={loading}
            error={error}
            onRetry={onRetry}
            getIcon={getStatusIcon}
            emptyMessage="Tracking not available"
        />
    );
}
