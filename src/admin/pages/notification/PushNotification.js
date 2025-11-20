import { useState, useEffect, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { usePushNotification } from '../../hooks/notification/useNotificationQuery';
import { MyContext } from '../../context/themeContext/themeContext';

const NotificationForm = () => {
    const { themeMode } = useContext(MyContext);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const pushNotification = usePushNotification();
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        imageUrl: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleChange = (e) => {
        setNotification({
            ...notification,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!notification.title.trim() || !notification.message.trim()) {
            setShowError(true);
            return;
        }
        pushNotification.mutate(notification, {
            onSuccess: () => {
                setNotification({ title: '', message: '', imageUrl: '' });
                setShowSuccess(true);
            },
            onError: () => {
                setShowError(true);
            }
        });
    };

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
        <div className={` p-2 md:p-4 mt-5`}>
            <div className="bg-white rounded-lg shadow-md p-2 max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="header-section mb-6 border-b">
                    <h1 className={`font-bold text-primaryText text-sm`}>
                        Send Notification
                    </h1>
                </div>

                {/* Error Alert */}
                {showError && (
                    <div className="mb-2 p-2 bg-error bg-opacity-10 border border-red  flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-exclamation-circle text-red"></i>
                            <span className="text-red text-xs">Title and Message are required!</span>
                        </div>
                        <button
                            onClick={() => setShowError(false)}
                            className="text-red hover:opacity-70"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {/* Success Alert */}
                {showSuccess && (
                    <div className="mb-2 p-2 bg-success bg-opacity-10 border border-success rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-check-circle text-success"></i>
                            <span className="text-success text-xs ">Notification sent successfully!</span>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="text-success hover:opacity-70"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="md-1">
                        <label className="block text-xs font-medium text-primaryText mb-2">
                            Title <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={notification.title}
                            onChange={handleChange}
                            placeholder="Enter notification title"
                            maxLength={100}
                            className="w-full px-1 py-1.5 text-xs border border-border "
                        />
                        <div className="text-right text-xs text-secondaryText mt-1">
                            {notification.title.length}/100
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="mb-1">
                        <label className="block text-xs font-medium text-primaryText mb-2">
                            Message <span className="text-red">*</span>
                        </label>
                        <textarea
                            name="message"
                            value={notification.message}
                            onChange={handleChange}
                            placeholder="Enter notification message"
                            rows={4}
                            maxLength={500}
                            className="w-full px-1  text-xs py-1.5 border"
                        />
                        <div className="text-right text-xs text-secondaryText mt-1">
                            {notification.message.length}/500
                        </div>
                    </div>

                    {/* Image URL Input */}
                    <div className="mb-2">
                        <label className="block text-xs font-medium text-primaryText mb-2">
                            Image URL (optional)
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
                                <i className="fas fa-link"></i>
                            </div>
                            <input
                                type="url"
                                name="imageUrl"
                                value={notification.imageUrl}
                                onChange={handleChange}
                                placeholder="Enter image URL"
                                className="w-full pl-10 pr-4 py-2 border text-xs"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="action-buttons flex justify-end">
                        <button
                            type="submit"
                            disabled={pushNotification.isPending}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {pushNotification.isPending ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className='text-xs'>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                        <span className='text-xs' >Send</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotificationForm;