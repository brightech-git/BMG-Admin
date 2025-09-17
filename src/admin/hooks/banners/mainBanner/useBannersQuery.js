import { useQuery } from "@tanstack/react-query";
import { bannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: bannersService.getBanners,
    });
};
