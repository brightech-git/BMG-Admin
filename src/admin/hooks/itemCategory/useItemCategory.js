import { getCategories } from '../../service/itemCategoryService';
import { useQuery } from '@tanstack/react-query';

const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 5,
    });
};
export default useCategories;