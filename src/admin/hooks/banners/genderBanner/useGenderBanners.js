import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import genderBannerMange from "../../../service/genderBannerService";

export const useGenderBanner = () => {
    const queryClient = useQueryClient();

    const { mutate: uploadGenderImages, isLoading: isUploading } = useMutation({
        mutationFn: genderBannerMange.uploadGenderImages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["genderBanners"] });
        },
    });

    const { mutate: updateGenderImages, isLoading: isUpdating } = useMutation({
        mutationFn: genderBannerMange.updateGenderImages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["genderBanners"] });
        },
    });

    const { mutate: deleteGenderImages, isLoading: isDeleting } = useMutation({
        mutationFn: genderBannerMange.deleteGenderImages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["genderBanners"] });
        },
    });

    const {
        data: genderBanners,
        isLoading: isFetching,
        error,
    } = useQuery({
        queryKey: ["genderBanners"],
        queryFn: genderBannerMange.getGenderBanners,
    });

    return {
        genderBanners,
        isFetching,
        error,
        uploadGenderImages,
        isUploading,
        updateGenderImages,
        isUpdating,
        deleteGenderImages,
        isDeleting,
    };
};
