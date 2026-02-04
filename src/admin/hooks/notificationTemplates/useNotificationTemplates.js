import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllNotificationTemplates, 
        getNotificationTemplateById, 
        createNotificationTemplate, 
        updateNotificationTemplate,
        getNotificationTemplateByTempKey,
        deleteNotificationTemplate } from "../../service/notificationTemplateService";

export const useAllTemplates = () => {
    return useQuery({
        queryKey: ["notificationTemplates"],
        queryFn: getAllNotificationTemplates,
    });
};
export const useTemplateById = (id) => {
    return useQuery({
        queryKey: ["notificationTemplate", id],
        queryFn: () => getNotificationTemplateById(id),
        enabled: !!id,
    });
};

export const useTemplateByTempKey = (tempKey) => {
    return useQuery({
        queryKey: ["notificationTemplate", tempKey],
        queryFn: () => getNotificationTemplateByTempKey(tempKey),
        enabled: !!tempKey,
    });
};
export const useCreateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => createNotificationTemplate(formData),
        onSuccess: () => {
            queryClient.invalidateQueries(["notificationTemplates"]);
        },
    });
};
export const useUpdateTemplate = (id) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => updateNotificationTemplate(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(["notificationTemplates"]);
            queryClient.invalidateQueries(["notificationTemplate", id]);
        },
        enabled: !!id,
    });
};
export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteNotificationTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["notificationTemplates"]);
        },
    
    });
};