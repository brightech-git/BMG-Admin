import { useState, useEffect, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { usePushNotification } from '../../hooks/notification/useNotificationQuery';
import {
    Box, Typography, TextField, Button, Card, CardContent, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { Send as SendIcon, Error as ErrorIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { MyContext } from '../../context/themeContext/themeContext';
import './NotificationForm.css';

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
        <div className={`notification-form-container ${themeMode}`}>
            <Card className="notification-form-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                            Send Notification
                        </Typography>
                    </Box>

                    {showError && (
                        <Alert
                            severity="error"
                            icon={<ErrorIcon />}
                            className="alert error"
                            onClose={() => setShowError(false)}
                        >
                            Title and Message are required!
                        </Alert>
                    )}

                    {showSuccess && (
                        <Alert
                            severity="success"
                            icon={<CheckIcon />}
                            className="alert success"
                            onClose={() => setShowSuccess(false)}
                        >
                            Notification sent successfully!
                        </Alert>
                    )}

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            Title <span className="required">*</span>
                        </Typography>
                        <TextField
                            name="title"
                            value={notification.title}
                            onChange={handleChange}
                            placeholder="Enter notification title"
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="form-input"
                            inputProps={{ maxLength: 100 }}
                        />
                    </Box>

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            Message <span className="required">*</span>
                        </Typography>
                        <TextField
                            name="message"
                            value={notification.message}
                            onChange={handleChange}
                            placeholder="Enter notification message"
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="form-input"
                            multiline
                            rows={4}
                            inputProps={{ maxLength: 500 }}
                        />
                    </Box>

                    <Box className="input-container" mb={2}>
                        <Typography variant="body2" className="input-label">
                            Image URL (optional)
                        </Typography>
                        <TextField
                            name="imageUrl"
                            value={notification.imageUrl}
                            onChange={handleChange}
                            placeholder="Enter image URL"
                            fullWidth
                            variant="outlined"
                            size="small"
                            className="form-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box className="input-adornment">🌐</Box>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    <Box className="action-buttons" display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={pushNotification.isPending}
                            startIcon={pushNotification.isPending ? <CircularProgress size={16} /> : <SendIcon />}
                            className="btn primary"
                        >
                            {pushNotification.isPending ? 'Sending...' : 'Send'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationForm;