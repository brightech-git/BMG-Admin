import {pushNotification,pushNotificationSingle} from "../../service/notificationService";
import { useMutation } from "@tanstack/react-query";


export const usePushNotification = () => {
    return useMutation({
        mutationFn: (data) => pushNotification(data),
    });
};

export const usePushNotificationSingle = () => {
    return useMutation({
        mutationFn: (data) => pushNotificationSingle(data),
        onSuccess: (data) => {
            console.log(data, 'data');
        },
        onError: (error) => {
            console.error("Push notification error:", error);
        }
        
    });
};