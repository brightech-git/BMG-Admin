
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EcomMarketingAttributesService } from "../../service/ecomMarketingAttributesService";

export const useEcomMarketingAttributes = () => {
    const queryClient = useQueryClient();

    // 🟢 Fetch all marketing attributes
    const {
        data: attributes = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["ecomMarketingAttributes"],
        queryFn: EcomMarketingAttributesService.getAll,
    });

    // 🟢 Add new attribute
    const addAttribute = useMutation({
        mutationFn: (payload) => EcomMarketingAttributesService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["ecomMarketingAttributes"]);
        },
    });

    // 🟢 Update existing attribute
    const updateAttribute = useMutation({
        mutationFn: ({ id, payload }) =>
            EcomMarketingAttributesService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["ecomMarketingAttributes"]);
        },
    });

    // 🟢 Delete attribute
    const deleteAttribute = useMutation({
        mutationFn: (id) => EcomMarketingAttributesService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["ecomMarketingAttributes"]);
        },
    });

    return {
        attributes,
        loading: isLoading,
        error: isError ? error.message : null,
        addAttribute,
        updateAttribute,
        deleteAttribute,
    };
};
