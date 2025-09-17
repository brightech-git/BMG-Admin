import { useQuery } from "@tanstack/react-query"; 
import { BreadCrumbBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: BreadCrumbBannersService.getBreadCrumbBanners,
    });
};