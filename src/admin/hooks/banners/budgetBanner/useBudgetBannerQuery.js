import { useQuery } from "@tanstack/react-query"; 
import { BudgetBannersService } from "../../../service/bannersSerivce";

export const useBannersQuery = () => {
    return useQuery({
        queryKey: ['banners'],
        queryFn: BudgetBannersService.getBudgetBanners,
    });
};