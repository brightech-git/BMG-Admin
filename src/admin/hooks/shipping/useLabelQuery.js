import { useQuery } from "@tanstack/react-query";
import { getLabelList } from "../../service/consignmentService";

export const useLabelQuery = (payload) => {
    return useQuery({
        queryKey: ["label", payload],
        queryFn: () => getLabelList(payload),
        enabled: !!payload, // only run if payload is not null/undefined
    });
};
