import { useQuery } from "@tanstack/react-query"; 
import { occasionBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: occasionBannersService.getOccasionBanners,
    });
};