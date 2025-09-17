import { useQuery } from "@tanstack/react-query"; 
import { offerBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: offerBannersService.getOfferBanners,
    });
};