import { useQuery } from "@tanstack/react-query"; 
import { CategoryBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: CategoryBannersService.getCategoryBanners,
    });
};