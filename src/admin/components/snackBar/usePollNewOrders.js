import { useEffect, useRef } from "react";
import { useNewOrderNotifier } from "../../context/snackbar/NewOrderContext";
import { useNavigate } from "react-router-dom";

/**
 * Polls for new orders every X seconds and triggers snackbar notifications for them.
 * @param {Function} fetchOrders - API call to fetch orders. Must return { orders: [...] }
 * @param {number} pollInterval - polling interval in milliseconds (default 5000ms)
 */
export const usePollNewOrders = (fetchOrders, pollInterval = 5000) => {
    const { showNewOrder } = useNewOrderNotifier();
    const navigate = useNavigate();

    const existingOrderIdsRef = useRef(new Set()); // Track seen order IDs
    const initializedRef = useRef(false); // Track first fetch

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                console.log("⏳ Fetching orders...");
                const response = await fetchOrders();
                console.log("📦 Raw API response:", response);

                // Adjust to match your API structure
                const orders = response?.data?.orders || [];

                if (orders.length === 0) {
                    console.log("⚠️ No orders received from API.");
                    return;
                }


                console.log("📝 Fetched order IDs:", orders.map(o => o.orderId));

                // Sort orders by newest first
                const sortedOrders = [...orders].sort(
                    (a, b) => new Date(b.orderTime) - new Date(a.orderTime)
                );
                console.log("🔃 Orders sorted by newest first:", sortedOrders.map(o => o.orderId));

                // Initialize existing orders on first fetch
                if (!initializedRef.current) {
                    sortedOrders.forEach(order => existingOrderIdsRef.current.add(order.orderId));
                    initializedRef.current = true;
                    console.log("✅ Initialized existing order IDs:", Array.from(existingOrderIdsRef.current));
                    return; // Skip notifications for existing orders
                }

                console.log("📊 Existing order IDs before check:", Array.from(existingOrderIdsRef.current));

                // Detect new orders
                sortedOrders.forEach(order => {
                    if (!existingOrderIdsRef.current.has(order.orderId)) {
                        console.log("✨ New order detected:", order.orderId);

                        existingOrderIdsRef.current.add(order.orderId);

                        // Define the state you want to send to next page
                        const navigationState = {
                            key: order.status === "PLACED" ?"PLACED":"PAYMENT-PENDING",
                            values: ["IN-PROCESSING", "CANCELLED"],
                        };

                        showNewOrder({
                            message: `New Order #${order.orderId} received!`,
                            type: "info",
                            action: {
                                label: "View Order",
                                onClick: () => {
                                    console.log(`➡️ Navigating to /order/status/${order.status}`);
                                    navigate(`/order/status/${order.status}`, { state: navigationState });
                                },
                            },
                            duration: 7000,
                        });
                    } else {
                        console.log("⏩ Order already exists, skipping:", order.orderId);
                    }
                });


                console.log("📊 Existing order IDs after check:", Array.from(existingOrderIdsRef.current));

            } catch (err) {
                console.error("❌ Failed to fetch orders:", err);
            }
        }, pollInterval);

        return () => clearInterval(interval);
    }, [fetchOrders, showNewOrder, navigate, pollInterval]);
};
