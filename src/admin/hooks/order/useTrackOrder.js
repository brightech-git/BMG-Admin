import { trackOrderById } from "../../service/orderService";
import { useQuery, useQueryClient ,useMutation } from "@tanstack/react-query";
import { OrderTracking } from "../../service/orderService";

export const useTrackOrderById = (orderId) => {
    return useQuery({
        queryKey: ["trackOrder", orderId],
        queryFn: () => trackOrderById(orderId),
        enabled: !!orderId, // only run if orderId is provided
        refetchInterval: 60 * 1000, // auto refresh every 1 min
    });
};

export const useTrackOrderBydtdc = () =>{
    return useMutation({
        mutationFn: (trackingId) => OrderTracking(trackingId),
        onSuccess: (data) => {
            console.log("Order tracking successful:", data);
        },
        onError: (error) => {
            console.error("Order tracking failed:", error);
        },
    });
}