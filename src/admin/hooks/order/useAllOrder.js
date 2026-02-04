import { useQuery, useMutation } from "@tanstack/react-query";
import { orderService } from "../../service/orderService";
import { getOrderStatus, getAllOrderSummary } from "../../service/orderService";
// 🔹 1. Get All Orders (paginated)
export const useAllOrders = (page, size) => {
    return useQuery({
        queryKey: ['getAllOrders', page, size],
        queryFn: () => orderService.getAllOrders(page, size),
        enabled: page !== undefined && size !== undefined,
    });
};

// 🔹 2. Track Order by orderId
export const useTrackOrder = (orderId) => {
    return useQuery({
        queryKey: ['trackOrder', orderId],
        queryFn: () => orderService.trackOrder(orderId),
        enabled: !!orderId,
    });
};

// 🔹 3. Verify Payment by orderId
export const useVerifyPayment = (orderId) => {
    return useQuery({
        queryKey: ['verifyPayment', orderId],
        queryFn: () => orderService.verifyPayment(orderId),
        enabled: !!orderId,
    });
};

// 🔹 4. Update Order Status (mutation)
export const useUpdateOrderStatus = () => {
    return useMutation({
        mutationFn: (payload) => orderService.updateStatus(payload),
    });
    
};
// 🔹 5. Get Orders by Date Range
export const useOrdersByDateRange = (startDate, endDate) => {
    return useQuery({
        queryKey: ['ordersByDateRange', startDate, endDate],
        queryFn: async () => {
            const response = await orderService.getOrdersByDateRange(startDate, endDate);
            return response.data; // Make sure to return response.data
        },
        enabled: !!startDate && !!endDate,
    });
};

export const useOrdersByStatus = (status, page, size, searchTerm) => {
    return useQuery({
        queryKey: ["getOrdersByStatus", status, page, size,searchTerm],
        queryFn: () => orderService.getOrdersByStatus(status, page, size,searchTerm),
        enabled: !!status && page !== undefined && size !== undefined, // only run when valid inputs
        select: (res) => res.data, // optional: unwrap .data directly
    });
};

export const useOrderStatus = (orderId, trackingId) => {
    return useQuery({
        queryKey: ["orderStatus", orderId, trackingId],
        queryFn: () => getOrderStatus(orderId, trackingId),
        enabled: !!orderId && !!trackingId, // only run if both exist
        refetchInterval: 60 * 1000, // refresh every 1 min
    });
};

// 🔹 6. Order Summary (mutation)
export const useAllOrderSummary = () => {
    return useQuery({
        queryKey: ["orderSummary"],
        queryFn: () => getAllOrderSummary(),
        refetchInterval: 60 * 1000, // refresh every 1 min
    });
};