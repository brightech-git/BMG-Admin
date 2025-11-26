import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fectRefundOrders, fetchrefundOrdersById, updateRefundOrdersById, deleteRefundOrdersById } from "../../service/RefundOrders";

// Fetch all refund orders
export const useRefundOrders = () => {
    return useQuery({
        queryKey: ['refundOrders'],
        queryFn: fectRefundOrders,
    });
};

// Fetch refund order by ID
export const useRefundOrderById = (id) => {
    return useQuery({
        queryKey: ['refundOrder', id],
        queryFn: () => fetchrefundOrdersById(id),
        enabled: !!id,
    });
};

// Update refund order
export const useUpdateRefundOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRefundOrdersById,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['refundOrders'] });
            queryClient.invalidateQueries({ queryKey: ['refundOrder', variables.id] });
        },
    });
};

// Delete refund order
export const useDeleteRefundOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRefundOrdersById,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['refundOrders'] });
            queryClient.invalidateQueries({ queryKey: ['refundOrder', id] });
        },
    });
};
