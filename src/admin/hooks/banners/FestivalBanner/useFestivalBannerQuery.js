import { useQuery } from "@tanstack/react-query"; 
import { FestivalBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: FestivalBannersService.getFestivalBanners,
    });
};