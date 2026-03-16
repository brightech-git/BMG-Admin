import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllFilterSettings,
    getActiveFilterSettings,
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


/* GET ACTIVE */
export const useGetActiveFilterSettings = () => {
    return useQuery({
        queryKey: ["activeFilterSettings"],
        queryFn: getActiveFilterSettings
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
        mutationFn: updateFilterSetting,
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