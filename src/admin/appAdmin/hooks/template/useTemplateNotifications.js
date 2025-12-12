import { useMutation, useQuery } from "@tanstack/react-query";
import { getAppNotificationsTemplates, sendAppNotification, createAppNotificationTemplate } from "../../service/appNotificationService";
 
export const useTemplateNotifications = () => {
    return useQuery({
        queryKey: ["templateNotifications"],
        queryFn: getAppNotificationsTemplates,
    });
};

export const useSendAppNotificationByTemplate = () => {
    return useMutation({
        mutationFn: (id) => sendAppNotification(id),
    });
};
export const useCreateAppNotificationTemplate = () => {
    return useMutation({
        mutationFn: (data) => createAppNotificationTemplate(data),
    });
};
