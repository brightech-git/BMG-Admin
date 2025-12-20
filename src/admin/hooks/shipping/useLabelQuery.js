import { useQuery } from "@tanstack/react-query";
import { getLabelList } from "../../service/consignmentService";

export const useLabelQuery = (payload, options = {}) => {
    return useQuery({
        queryKey: [
            "label",
            payload?.orderId,
            payload?.courierTrackingId,
        ],
        queryFn: () => getLabelList(payload),
        enabled: false, // fully controlled by caller
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
        ...options,
    });
};
