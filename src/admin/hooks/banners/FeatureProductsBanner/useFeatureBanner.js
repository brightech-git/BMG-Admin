import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import FeatureBanner from "../../../service/FeatureBannerService";


export const useFeaturedBannersQuery = () => {
    return useQuery({
        queryKey: ["featuredBanners"],
        queryFn: () => FeatureBanner.getFeaturedBanners(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUploadFeaturedBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({


        mutationFn: ({image,name}) => {
            const formData = new FormData();
           
            formData.append("image", image);
            formData.append("name", name);
            
            FeatureBanner.uploadFeaturedBanner(formData)},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};

export const useUpdateFeaturedBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => FeatureBanner.updateFeaturedBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};

export const useDeleteFeaturedBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => FeatureBanner.deleteFeaturedBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featuredBanners"] });
        },
    });
};