import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../service/filterService';

export const useFilterItemsQuery = (filters = {}) => {
    return useQuery({
        queryKey: ['filter-items', filters],
        queryFn: () => getProducts(filters),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
