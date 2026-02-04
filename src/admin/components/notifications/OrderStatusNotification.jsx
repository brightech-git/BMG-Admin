"use client";

import { useEffect } from "react";
import { usePushNotificationSingle } from "../../hooks/notification/useNotificationQuery";


export default function OrderStatusNotification({
    userId,
    orderId,
    currentStatus,
    trackingNumber,        // 👈 NEW (optional)
    supportContact = "+91 9XXXX XXXXX",
    imageUrl,
    redirectUrl,
    brandName = "Our Store",
    trigger = false,
}) {
    const { mutate: sendNotification } = usePushNotificationSingle();
 
   
    useEffect(() => {
        if (!trigger || !userId || !orderId || !currentStatus)
        return;

        const formattedTime = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        const title = `Order ${orderId} Status Update`;

        const message = [
            `Your order has been updated to ${currentStatus} on ${formattedTime}.`,
            ``,
            ``,
            trackingNumber
                ? `Tracking Number: ${trackingNumber}\nYou can track your order using this number.`
                : null,
            ``,
            `For any enquiries, please contact us at ${supportContact}.`,
        ]
            .filter(Boolean)
            .join("\n");

        // 🔍 Debug log
        console.group("📦 Order Status Notification");
        console.log({  currentStatus, trackingNumber });
        console.log("title:", title);
        console.log("message:", message);
        console.groupEnd();

        sendNotification({
            userId,
            title,
            message,
            imageUrl: imageUrl || null,
            url: redirectUrl || `/orders/${orderId}`,
        });
    }, [
        trigger,
        userId,
        orderId,
        currentStatus,
        trackingNumber,
        supportContact,
        imageUrl,
        redirectUrl,
        brandName,
        sendNotification,
    ]);

    return null;
}
