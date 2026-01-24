"use client";

import { FiX } from "react-icons/fi";
import OrderTrackingTimeline from "./OrderTrackingTimeline";

export default function TrackOrderModal({
    open,
    order,
    onClose,
}) {
    if (!open || !order) return null;

    return (
        <div className="fixed inset-0 z-50 mt-2 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate__animated animate__fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-[95%] max-w-3xl rounded-lg shadow-lg
                animate__animated animate__zoomIn"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 m-0 ">
                            Track Order
                        </p>
                        <p className="text-xs text-gray-500 m-0">
                            Order ID: {order.order_id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Content */}
                <div className="py-2 max-h-[70vh] overflow-y-auto">
                    <OrderTrackingTimeline orderId={order.order_id} />
                </div>
            </div>
        </div>
    );
}
