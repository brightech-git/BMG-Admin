import pushNotification from "../../service/notificationService";
import { useMutation } from "@tanstack/react-query";


export const usePushNotification = () => {
    return useMutation({
        mutationFn: (data) => pushNotification(data),
    });
};