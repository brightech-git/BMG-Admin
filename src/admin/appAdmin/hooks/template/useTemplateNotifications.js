import { useMutation, useQuery } from "@tanstack/react-query";
import { getAppNotificationsTemplates, sendAppNotification, createAppNotificationTemplate, updateAppNotificationTemplate, deleteAppnotiTemp } from "../../service/appNotificationService";
import { toast } from "react-toastify";
 
export const useTemplateNotifications = () => {
    return useQuery({
        queryKey: ["templateNotifications"],
        queryFn: getAppNotificationsTemplates,
    });
};

export const useSendAppNotificationByTemplate = () => {
    return useMutation({
        mutationFn: (id) => sendAppNotification(id),
        onSuccess: (data) => {
            console.log(data, 'data for noti');
            toast.success(`${data.status}`)
        },
        onError: (error) => {
            console.error("Error fetching notification template:", error);
            toast.error(`Failed to send notification: ${error.message}`);
        },
    });
};
export const useCreateAppNotificationTemplate = () => {
    return useMutation({
        mutationFn: (data) => createAppNotificationTemplate(data),
        onSuccess :(data) =>{
            console.log(data , 'datafornoti');
            toast.success(`${data.message}`)
        },
        onError: (error) => {
            console.error("Error fetching notification template:", error);
            toast.error(`Failed to create template: ${error.message}`);
        },

    });
};

export const useUpdateAppNotificationTemplate = () => {
    return useMutation({
        mutationFn: ({id, data}) => updateAppNotificationTemplate(id, data),
        onSuccess :(data) =>{
 
            toast.success(`${data.message}`)
        },
        onError: (error) => {
            console.error("Error fetching notification template:", error);
            toast.error(`Failed to update template: ${error.message}`);
        },
    });
};

export const useAppTempDeleteById = () =>{
    return useMutation({
        mutationFn: (id) => deleteAppnotiTemp(id),
        onSuccess: (data) => {

            toast.info(`${data.message}`)

        },
        onError: (error) => {
            console.error("Error fetching notification template:", error);
            toast.error(`Failed to delete template: ${error.message}`);
        },
    });
}