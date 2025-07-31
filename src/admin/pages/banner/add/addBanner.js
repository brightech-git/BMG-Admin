// 📁 src/pages/admin/AddBanner.js
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadBannerMutation } from '../../../hooks/banners/useUploadBannerMutation';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== ENHANCED STYLED COMPONENTS ==========
const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3B8FF3 0%, #F29F67 50%, #34B1AA 100%)',
    },
}));

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: buttonVariant === 'contained' ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #2a7bd9 0%, #1e5fb8 100%)',
        }
    }),
    ...(color === 'secondary' && {
        background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e08f5a 0%, #cc7a45 100%)',
        }
    }),
}));

const UploadArea = styled(Box)(() => ({
    borderRadius: '12px',
    border: '2px dashed rgba(59, 143, 243, 0.3)',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#3B8FF3',
        backgroundColor: 'rgba(59, 143, 243, 0.05)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(59, 143, 243, 0.15)',
    },
}));

const AddBanner = () => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);
    const { mutate, isPending } = useUploadBannerMutation();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.type.match('image.*')) {
            setError('Please select an image file (JPEG, PNG, etc.)');
            setSuccess(null);
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            setSuccess(null);
            return;
        }

        setImage(selectedFile);
        setError(null);
        setSuccess(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!image) {
            setError('Please select an image file');
            return;
        }

        if (!title.trim()) {
            setError('Please enter a title for your banner');
            return;
        }

        mutate({ image, title }, {
            onSuccess: () => {
                setSuccess('Banner uploaded successfully!');
                // Reset form on success
                setImage(null);
                setTitle("");
                setPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload banner');
                setSuccess(null);
            }
        });
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Box
            p={3}
            sx={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <ModernCard sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    {/* Header Section */}
                    <Box textAlign="center" mb={4}>
                        <Typography 
                            variant="h4" 
                            sx={{ color: '#1E1E2C', fontWeight: 700, mb: 1 }}
                        >
                            Add New Banner
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: '#6B7280', fontSize: '1.1rem' }}
                        >
                            Upload a banner image with title for your website
                        </Typography>
                    </Box>

                    {/* Banner Title Input */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Banner Title
                        </Typography>
                        <TextField
                            placeholder="Enter banner title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#fff',
                                    fontSize: '1rem',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3B8FF3',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3B8FF3',
                                        borderWidth: '2px',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#6B7280',
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </Box>

                    {/* File Upload Area */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Banner Image
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                        >
                            Select a banner image (JPG, PNG, WEBP - Max 5MB)
                        </Typography>
                        
                        {!preview ? (
                            <UploadArea
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    width: '100%',
                                    minHeight: 200,
                                    border: '2px dashed #3B8FF3',
                                    background: '#f8f9fa',
                                    boxShadow: 'none',
                                    mb: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        borderColor: '#2a7bd9',
                                        backgroundColor: '#f0f6ff',
                                    },
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <UploadIcon sx={{ fontSize: 48, color: '#3B8FF3', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, textAlign: 'center' }}>
                                    Click or drag image here
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
                                    Select JPG/PNG/WEBP file (Max 5MB)
                                </Typography>
                            </UploadArea>
                        ) : (
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '2px solid rgba(59, 143, 243, 0.2)',
                                background: '#fff',
                                boxShadow: '0 4px 16px rgba(59, 143, 243, 0.1)'
                            }}>
                                    <img 
                                        src={preview} 
                                    alt="Banner Preview" 
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: 1
                                }}>
                                    <Chip
                                        label="Image Selected"
                                        color="primary"
                                        sx={{
                                            backgroundColor: 'rgba(59, 143, 243, 0.9)',
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={removeImage}
                                        sx={{
                                            backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                            color: 'white',
                                            minWidth: 'auto',
                                            px: 1,
                                            '&:hover': {
                                                backgroundColor: 'rgba(200, 35, 51, 0.9)',
                                            }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Image Selection Counter */}
                    {image && (
                        <Box mb={3}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                background: 'linear-gradient(135deg, #f0f6ff 0%, #e6f3ff 100%)',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 143, 243, 0.2)',
                                boxShadow: '0 2px 8px rgba(59, 143, 243, 0.1)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                        boxShadow: '0 4px 12px rgba(59, 143, 243, 0.3)'
                                    }}>
                                        <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#1E1E2C', 
                                            fontWeight: 600,
                                            mb: 0.5
                                        }}>
                                            Image Ready
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: '#6B7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label="1 image selected"
                                    color="primary"
                                    sx={{
                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                        color: '#3B8FF3',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Feedback Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            >
                                <Box mb={3}>
                                    <Alert
                                        severity="error"
                                        icon={<ErrorIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            backgroundColor: '#fff5f5',
                                            color: '#d32f2f',
                                            '& .MuiAlert-icon': { color: '#d32f2f' }
                                        }}
                        >
                            {error}
                                    </Alert>
                                </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                        {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                                <Box mb={3}>
                                    <Alert
                                        severity="success"
                                        icon={<CheckIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            backgroundColor: '#f0f9ff',
                                            color: '#0d9488',
                                            '& .MuiAlert-icon': { color: '#0d9488' }
                                        }}
                                    >
                                        {success}
                                    </Alert>
                                </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                    {/* Submit Button */}
                    <Box display="flex" justifyContent="center" mt={4}>
                        <ModernButton
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={isPending || !image || !title.trim()}
                            startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                            sx={{
                                minWidth: '300px',
                                height: '56px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 50%, #F29F67 100%)',
                                boxShadow: '0 8px 24px rgba(59, 143, 243, 0.25)',
                                textTransform: 'none',
                                letterSpacing: '0.5px',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2a7bd9 0%, #2a9891 50%, #e08f5a 100%)',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 32px rgba(59, 143, 243, 0.4)',
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                                    color: '#9e9e9e',
                                    transform: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '8px',
                                },
                            }}
                        >
                            {isPending ? 'Uploading...' : 'Upload Banner'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddBanner;