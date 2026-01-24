import { getAllRedemptions , updateRedemption } from "../../service/redemptionService";
import { useQuery , useMutation , QueryClient } from "@tanstack/react-query";

export const useAllRedemptions = () =>{
    return useQuery({
        queryKey: ["allRedemptions"],
        queryFn: getAllRedemptions,
    })
}

export const useUpdateRedemption = () => {
    const queryClient = new QueryClient();
    return useMutation({
        mutationFn: (sno) => updateRedemption(sno),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allRedemptions"] });
        },
    });
};