"use client";

import { useEffect } from "react";
import { usePushNotificationSingle } from "../../hooks/notification/useNotificationQuery";
import { useTemplateById } from "../../hooks/notificationTemplates/useNotificationTemplates";
import { ApplyNotification } from "../../../utils/notification/NotificationEngine";

export default function NotificationTemplate({
    payload,
    onClose,
    onSuccess,
}) {
    const { templateId, userId, imageUrl, data } = payload;

    const { data: template } = useTemplateById(templateId);
    const { mutate: sendNotification } = usePushNotificationSingle();

    useEffect(() => {
        if (!template || !data) return;

        const title = ApplyNotification(template.Title, data);
        const message = ApplyNotification(template.Message, data);
        const url = ApplyNotification(template.Url, data);
        console.log(message, "messageField");

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
                    onSuccess?.(res);
                    onClose?.();
                },
                onError: (err) => {
                    console.error("❌ Notification failed:", err);
                },
            }
        );
    }, [template,sendNotification ,payload, onClose, onSuccess]);

    return null;
}