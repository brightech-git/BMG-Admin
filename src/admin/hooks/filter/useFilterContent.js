import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllFilterContent,
    getProductsFiltersContent,
    createFilterContent,
    updateFilterContent,
    deleteFilterContent
} from "../../service/filterContentService";


/* GET ALL */
export const useGetAllFilterContents = (filter) => {
    return useQuery({
        queryKey: ["filterContents", filter], // ✅ include filter in key
        queryFn: () => getAllFilterContent({ filter }),
      
    });
};

export const useGetActiveFilterContents = () => {
    return useQuery({
        queryKey: ["activeFilterContents"],
        queryFn: getProductsFiltersContent
    });
};


/* CREATE */
export const useCreateFilterContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFilterContent,
        onSuccess: () => {
            queryClient.invalidateQueries(["filterContents"]);
            queryClient.invalidateQueries(["activeFilterContents"]);
        }
    });
};


/* UPDATE */
export const useUpdateFilterContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateFilterContent({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries(["filterContents"]);
            queryClient.invalidateQueries(["activeFilterContents"]);
        }
    });
};


/* DELETE */
export const useDeleteFilterContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteFilterContent,
        onSuccess: () => {
            queryClient.invalidateQueries(["filterContents"]);
            queryClient.invalidateQueries(["activeFilterContents"]);
        }
    });
};