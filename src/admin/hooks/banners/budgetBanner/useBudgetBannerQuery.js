import { useQuery } from "@tanstack/react-query"; 
import { BudgetBannersService ,getBannersByKey} from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: BudgetBannersService.getBudgetBanners,
    });
};
export const useBannersByKey = (id) => {
    return useQuery({
        queryKey: ['banner', id],
        queryFn: () => BudgetBannersService.getBannersByKey(id),
        enabled: !!id, // Only run query if id exists
    });
};