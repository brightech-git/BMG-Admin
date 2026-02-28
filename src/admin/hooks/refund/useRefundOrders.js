import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    approveRefundOrder,
    bookApprovedOrders,
    receivedRefundOrders,
    rejectedRefundOrders,
    completedRefundOrders,
    getRefundOrdersByStatus
} from "../../service/RefundOrders";


export const useRefundOrdersByStatus = (status, page, size, searchTerm) => {
    return useQuery({
        queryKey: ["getRefundOrdersByStatus", status, page, size, searchTerm],
        queryFn: () => getRefundOrdersByStatus(status, page, size, searchTerm),
        enabled: !!status && page !== undefined && size !== undefined, // only run when valid inputs
        select: (res) => res.data, // optional: unwrap .data directly
    });
};


/* ===============================
   Approve Refund
================================= */
export const useApproveRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRefundOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getRefundOrdersByStatus"] });
        },
    });
};
/* ===============================
   Reject Refund
================================= */
export const useRejectRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, reason }) =>
            rejectedRefundOrders(requestId, reason),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getRefundOrdersByStatus"] });
        },
        onError :() =>{
            queryClient.invalidateQueries({queryKey: ["getRefundOrdersByStatus"]});
        }
    });
};

/* ===============================
   Book Pickup
================================= */
export const useBookRefundPickup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookApprovedOrders,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getRefundOrdersByStatus"] });
        },
    });
};

/* ===============================
   Mark as Received
================================= */
export const useReceiveRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: receivedRefundOrders,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getRefundOrdersByStatus"] });
        },
    });
};



/* ===============================
   Complete Refund (Final)
================================= */
export const useCompleteRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: completedRefundOrders,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getRefundOrdersByStatus"] });
        },
    });
};