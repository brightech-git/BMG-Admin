// trackingStatusConfig.ts
import { FaCheckCircle, FaBox, FaTruck, FaHourglassHalf } from "react-icons/fa";

export const TRACKING_STATUS_CONFIG = {
    PENDING: {
        title: "Order Created",
        icon: FaHourglassHalf,
        order: 1,
    },
    PLACED: {
        title: "Order Confirmed",
        icon: FaCheckCircle,
        order: 2,
    },
    IN_PROCESSING: {
        title: "Processing",
        icon: FaBox,
        order: 3,
    },
    SHIPPED: {
        title: "Shipped",
        icon: FaTruck,
        order: 4,
    },
    DELIVERED: {
        title: "Delivered",
        icon: FaCheckCircle,
        order: 5,
    },
};
