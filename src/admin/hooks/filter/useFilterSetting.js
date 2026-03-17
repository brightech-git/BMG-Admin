import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllFilterSettings,
    createFilterSetting,
    updateFilterSetting,
    deleteFilterSetting
} from "../../service/filterService";


/* GET ALL */
export const useGetAllFilterSettings = () => {
    return useQuery({
        queryKey: ["filterSettings"],
        queryFn: getAllFilterSettings
    });
};


/* CREATE */
export const useCreateFilterSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFilterSetting,
        onSuccess: () => {
            queryClient.invalidateQueries(["filterSettings"]);
            queryClient.invalidateQueries(["activeFilterSettings"]);
        }
    });
};


/* UPDATE */
export const useUpdateFilterSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id , data}) =>updateFilterSetting({id,data}),
        onSuccess: () => {
            queryClient.invalidateQueries(["filterSettings"]);
            queryClient.invalidateQueries(["activeFilterSettings"]);
        }
    });
};


/* DELETE */
export const useDeleteFilterSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteFilterSetting,
        onSuccess: () => {
            queryClient.invalidateQueries(["filterSettings"]);
            queryClient.invalidateQueries(["activeFilterSettings"]);
        }
    });
};