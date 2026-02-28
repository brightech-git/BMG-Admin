import { useQuery, useMutation } from "@tanstack/react-query";
import { orderService } from "../../service/orderService";
import { getAllOrders, updateStatus, getOrderStatus, getAllOrderSummary, getOrdersByStatus, getOrdersByDateRange } from "../../service/orderService";
// 🔹 1. Get All Orders (paginated)
export const useAllOrders = (page, size) => {
    return useQuery({
        queryKey: ['getAllOrders', page, size],
        queryFn: () => getAllOrders(page, size),
        enabled: page !== undefined && size !== undefined,
        select: (res) => res.data, // optional: unwrap .data directly
    });
};



// 🔹 4. Update Order Status (mutation)
export const useUpdateOrderStatus = () => {
    return useMutation({
        mutationFn: (payload) => updateStatus(payload),
    });
    
};
// 🔹 5. Get Orders by Date Range
export const useOrdersByDateRange = (startDate, endDate) => {
    return useQuery({
        queryKey: ['ordersByDateRange', startDate, endDate],
        queryFn: async () => {
            const response = await getOrdersByDateRange(startDate, endDate);
            return response.data; // Make sure to return response.data
        },
        enabled: !!startDate && !!endDate,
    });
};

export const useOrdersByStatus = (status, page, size, searchTerm) => {
    return useQuery({
        queryKey: ["getOrdersByStatus", status, page, size,searchTerm],
        queryFn: () => getOrdersByStatus(status, page, size,searchTerm),
        enabled: !!status && page !== undefined && size !== undefined, // only run when valid inputs
        select: (res) => res.data, // optional: unwrap .data directly
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


