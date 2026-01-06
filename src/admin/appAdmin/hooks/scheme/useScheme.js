import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSchemes, getSchemeById, deleteScheme, createScheme  ,updateScheme} from '../../service/schemeDetails';
import { toast } from 'react-toastify';

export const useSchemeDetails = () => {
    return useQuery({
        queryKey: ["schemeDetails"],
        queryFn: getAllSchemes,
    });
};  
export const useSchemeDetailsById = (id) => {
    return useQuery({
        queryKey: ["schemeDetails", id],
        queryFn: () => getSchemeById(id),
    });
};
export const useDelete = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteScheme(id),

        onSuccess: () => {
            toast.success("Scheme deleted");
            queryClient.invalidateQueries({ queryKey: ["schemeDetails"] });
        },

        onError: () => {
            toast.error("Delete failed");
        },
    });
};


export const useCreateScheme = () => {
    return useMutation({
        mutationFn: (data) => createScheme(data),
        onSuccess: (data) => {
            console.log(data, 'data');
        },
        onError: (error) => {
            console.error("Error fetching notification template:", error);
            toast.error(`Failed to create template: ${error.message}`);
        },
    });
};

export const useUpdateScheme = () => {
    return useMutation({
        mutationFn: (formData) => updateScheme(formData),

        onSuccess: (data) => {
            console.log("Updated:", data);
        },

        onError: (error) => {
            console.error("Error updating scheme:", error);
            toast.error("Failed to update scheme");
        },
    });
};

