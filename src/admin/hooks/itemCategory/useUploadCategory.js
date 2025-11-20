import { uploadCategory, updateCategory, deleteCategory } from "../../service/itemCategoryService";
import { useMutation, useQueryClient } from "@tanstack/react-query";


// Upload Category
export const useUploadCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
       
        mutationFn: (formData) => uploadCategory(formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            console.error('Error uploading category:', error);
        },
    });
};

// Update Category
export const useUpdateCategory = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => updateCategory(formData),
        onSuccess: (data) => {
            console.log('Category updated:', data);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            console.error('Error updating category:', error);
        },
    });
};

// Delete Category
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ( id ) => deleteCategory( id ),
        onSuccess: (data) => {
            console.log('Category deleted:', data);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            console.error('Error deleting category:', error);
        },
    });
};
