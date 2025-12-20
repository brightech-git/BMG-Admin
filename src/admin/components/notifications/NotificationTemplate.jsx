"use client";

import { useEffect } from "react";
import { usePushNotificationSingle } from "../../hooks/notification/useNotificationQuery";
import { useTemplateById } from "../../hooks/notificationTemplates/useNotificationTemplates";
import { ApplyNotification } from "../../../utils/notification/NotificationEngine";

export default function NotificationTemplate({
    templateId,
    orderId,
    userId,
    imageUrl,
    onClose,
    onSuccess, // ✅ callback for showing toast/snackbar
}) {
    const { data: template } = useTemplateById(templateId);
    const { mutate: sendNotification } = usePushNotificationSingle();

    useEffect(() => {
        if (!template) return;

        const data = { orderId };
        const title = ApplyNotification(template.Title, data);
        const message = ApplyNotification(template.Message, data);
        const url = ApplyNotification(template.Url, data);

        sendNotification(
            {
                userId,
                title,
                message,
                imageUrl: imageUrl || null,
                url: url || null,
            },
            {
                onSuccess: (res) => {
                    console.log("✅ Notification sent:", res);
                    onSuccess?.(res); // call the parent callback
                    onClose?.();
                },
                onError: (err) => {
                    console.error("❌ Notification failed:", err);
                },
            }
        );
    }, [template, orderId, userId, imageUrl, sendNotification, onClose, onSuccess]);

    return null;
}
