import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import LatestBanner from "../../../service/latestCollectionService";

export const useLatestBannersQuery = () => {
    return useQuery({
        queryKey: ["featuredBanners"],
        queryFn: () => LatestBanner.getLatestBanners(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUploadLatestBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({


        mutationFn: (formData) => {
            
            LatestBanner.uploadLatestBanner(formData)},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};

export const useUpdateLatestBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => LatestBanner.updateLatestBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};

export const useDeleteLatestBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => LatestBanner.deleteLatestBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};