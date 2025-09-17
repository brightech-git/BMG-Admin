import { trackOrderById } from "../../service/orderService";
import { useQuery } from "@tanstack/react-query";

export const useTrackOrderById = (orderId) => {
    return useQuery({
        queryKey: ["trackOrder", orderId],
        queryFn: () => trackOrderById(orderId),
        enabled: !!orderId, // only run if orderId is provided
        refetchInterval: 60 * 1000, // auto refresh every 1 min
    });
};