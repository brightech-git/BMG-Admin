// 📁 src/pages/admin/AddBanner.js
import { useState } from 'react';
import { motion, AnimatePresence, maxGeneratorDuration } from 'framer-motion';
import { useBudgetBanner } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import FileUploader from '../../../components/banner/FileUploader';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== STYLED COMPONENTS ==========
const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(30, 30, 44, 0.12)',
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
        background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 100%)',
        }
    }),
    ...(color === 'secondary' && {
        background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 100%)',
        }
    }),
}));

const AddBugetBanner = () => {

    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [subtitle, setSubTitle] = useState("");
    const [min_price, setMin_Price] = useState("");
    const [max_price, setMax_Price] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useBudgetBanner();

    const handleFileSelect = (file, error) => {
        setImage(file);
        setError(error);
        setSuccess(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!image) {
            setError('Please select an image file');
            return;
        }
        if (!subtitle || !min_price || !max_price) {
            setError('Please enter all required ');
            return;
        }


        if (!title.trim()) {
            setError('Please enter a title for your banner');
            return;
        }

        mutate({ image, title, subtitle,min_price, max_price }, {
            onSuccess: () => {
                setSuccess(' Budget Banner uploaded successfully!');
                setImage(null);
                setTitle("");
                setSubTitle("");
                setMin_Price("");
                setMax_Price("");
                
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload banner');
            }
        });
    };

    const resetForm = () => {
        setTitle('');
        setImage(null);
        setError(null);
        setSuccess(null);
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
            <ModernCard sx={{
                maxWidth: { xs: '100%', sm: 800, md: 900, lg: 1000 },
                width: '100%',
                margin: 'auto'
            }}>
                <CardContent sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
                    {/* Header Section */}
                    <Box textAlign="center" mb={5}>
                        <Typography
                            variant="h3"
                            sx={{
                                color: '#1E1E2C',
                                fontWeight: 800,
                                mb: 2,
                                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                                background: 'linear-gradient(135deg, #1E1E2C 0%, #eba748 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Add New Budget Banner
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#6B7280',
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}
                        >
                            Upload a banner image with title for your website
                        </Typography>
                    </Box>

                    {/* Banner Title Input */}
                    <Box mb={4}>
                        <Box sx={{
                            backgroundColor: 'rgba(235, 167, 72, 0.05)',
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid rgba(235, 167, 72, 0.1)'
                        }}>
                            {/* Banner Title */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E1E2C',
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <AddIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Banner Title
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
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
                                            borderColor: '#eba748',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            />

                            {/* Banner SubTitle */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E1E2C',
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginTop: '10px'
                                }}
                            >
                                <AddIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Banner SubTitle
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <TextField
                                placeholder="Enter banner subtitle"
                                value={subtitle}
                                onChange={(e) => setSubTitle(e.target.value)}
                                variant="outlined"
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#fff',
                                        fontSize: '1rem',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            />

                            {/* Item Name Dropdown */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E1E2C',
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginTop: '10px'
                                }}
                            >
                                <AddIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Minimum Price
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <TextField
                                type="number"
                                placeholder='Enter the minimum price'
                                value={min_price}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setMin_Price(value);
                                }}
                                variant="outlined"
                                fullWidth
                                SelectProps={{
                                    native: true,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#fff',
                                        fontSize: '1rem',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            >
                             
                           
                            </TextField>

                            {/* Gender Dropdown */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E1E2C',
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginTop: '10px'
                                }}
                            >
                                <AddIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Maximum Price
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <TextField
                                type="number"
                                placeholder="Enter maximum price"
                                value={max_price}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setMax_Price(value);
                                }}
                                variant="outlined"
                                fullWidth
                                SelectProps={{
                                    native: true,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#fff',
                                        fontSize: '1rem',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#eba748',
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            >
                                
                            </TextField>
                        </Box>
                    </Box>

                    {/* File Upload Area */}
                    <Box mb={4}>
                        <Box sx={{
                            backgroundColor: 'rgba(235, 167, 72, 0.05)',
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid rgba(235, 167, 72, 0.1)'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E1E2C',
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginTop: '10px'
                                }}
                            >
                                <UploadIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Banner Image
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                            >
                                Select a banner image (JPG, PNG, WEBP - Max 5MB)
                            </Typography>

                            <FileUploader
                                onFileSelect={handleFileSelect}
                                loading={isPending}
                                height={300}
                            />
                        </Box>
                    </Box>

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

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="center" gap={3} mt={6}>
                        <ModernButton
                            variant="outlined"
                            onClick={resetForm}
                            disabled={isPending}
                            sx={{
                                minWidth: '140px',
                                height: '56px',
                                borderColor: '#eba748',
                                color: '#eba748',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                '&:hover': {
                                    borderColor: '#e09a3a',
                                    color: '#e09a3a',
                                    backgroundColor: 'rgba(235, 167, 72, 0.05)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            Clear
                        </ModernButton>

                        <ModernButton
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={isPending || !image || !title.trim()}
                            startIcon={isPending ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                            sx={{
                                minWidth: '220px',
                                height: '56px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 50%, #d48a2c 100%)',
                                boxShadow: '0 8px 24px rgba(235, 167, 72, 0.25)',
                                textTransform: 'none',
                                letterSpacing: '0.5px',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 50%, #c47a1c 100%)',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 32px rgba(235, 167, 72, 0.4)',
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                    color: '#9e9e9e',
                                    transform: 'none',
                                    boxShadow: 'none',
                                },
                                '& .MuiButton-startIcon': {
                                    marginRight: '10px',
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

export default AddBugetBanner;