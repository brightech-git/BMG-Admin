import { useEffect } from "react";
import { usePushNotificationSingle } from "../../hooks/notification/useNotificationQuery";
import { useTemplateByTempKey } from "../../hooks/notificationTemplates/useNotificationTemplates";
import { ApplyNotification } from "../../../utils/notification/NotificationEngine";


export default function NotificationTemplate({
    payload,
    onClose,
    onSuccess,
    trigger = false, // ✅ new prop
}) {
    const { tempKey, userId, imageUrl, data } = payload;

    console.log(payload,'payloadfromOrder')

    const { data: template } = useTemplateByTempKey(tempKey);
    const { mutate: sendNotification } = usePushNotificationSingle();

    useEffect(() => {
        if (!trigger) return; // 🔹 Only send when trigger is true
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
    }, [trigger, template, sendNotification, payload, onClose, onSuccess]);

    return null;
}
