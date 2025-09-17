import { useQuery } from '@tanstack/react-query';
import productService from '../../service/productService';

export const useFilterItemsQuery = (filters = {}) => {
    return useQuery({
        queryKey: ['filter-items', filters],
        queryFn: () => productService.filterItems(filters),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
