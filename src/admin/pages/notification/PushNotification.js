import React, { useState, useEffect } from "react";
import { usePushNotification } from "../../hooks/notification/useNotificationQuery";

const NotificationForm = () => {
    const pushNotification = usePushNotification();
    const [notification, setNotification] = useState({
      
        title: "",
        message: "",
        imageUrl: "",
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleChange = (e) => {
        setNotification({
            ...notification,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!notification.title || !notification.message) {
            alert("User ID, Title, and Message are required!");
            return;
        }
        pushNotification.mutate(notification, {
            onSuccess: () => {
                setNotification({ title: "", message: "", imageUrl: "" });
                setShowSuccess(true);
            },
            onError: () => {
                setShowError(true);
            },
        });
    };

    // Auto-close notifications after 3 seconds
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md sm:max-w-lg bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Send Notification
                </h2>

                <div>
                    <div className="space-y-4">
                    
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                value={notification.title}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={notification.message}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                                Image URL (optional)
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                value={notification.imageUrl}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={`px-4 py-2 rounded-md text-white font-medium ${pushNotification.isPending
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                disabled={pushNotification.isPending}
                            >
                                {pushNotification.isPending ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white mx-auto"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                                        ></path>
                                    </svg>
                                ) : (
                                    "Send"
                                )}
                            </button>
                        </div>
                    </div>

                    {showSuccess && (
                        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center">
                            Notification sent successfully!
                        </div>
                    )}

                    {showError && (
                        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-center">
                            Failed to send notification. Please try again.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationForm;