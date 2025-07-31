import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadCategoryMutation } from '../../../hooks/category/useCategories';
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

const AddCategoryPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAllFiles, setShowAllFiles] = useState(false);
    const { mutate: uploadCategory, isLoading } = useUploadCategoryMutation();

    const handleFileChange = (e) => {
        setError(null);
        setSuccess(null);

        const files = Array.from(e.target.files);
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (files.some(file => !validTypes.includes(file.type))) {
            setError('Only JPG, PNG, and WEBP formats are allowed.');
            return;
        }

        // Check file size (max 5MB per file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (files.some(file => file.size > maxSize)) {
            setError('Each file must be less than 5MB.');
            return;
        }

        setSelectedFiles(files);
    };

    const removeImage = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const sanitizedCategory = categoryName.trim();
        
        if (!sanitizedCategory) {
            setError('Category name is required');
            return;
        }

        if (!/^[a-zA-Z0-9\s]+$/.test(sanitizedCategory)) {
            setError('Category name can only contain letters, numbers, and spaces');
            return;
        }

        if (selectedFiles.length === 0) {
            setError('At least one image is required');
            return;
        }

        uploadCategory(
            { category: sanitizedCategory, images: selectedFiles },
            {
                onSuccess: (data) => {
                    setSuccess(data.message || 'Category and images uploaded successfully!');
                    setCategoryName('');
                    setSelectedFiles([]);
                    setShowAllFiles(false);
                },
                onError: (err) => {
                    const errorMessage = err.message || 'Failed to upload category';
                    setError(errorMessage);
                },
            }
        );
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
                            Add New Category
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: '#6B7280', fontSize: '1.1rem' }}
                        >
                            Create a new category with images for your products
                        </Typography>
                    </Box>

                    {/* Category Name Input */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Category Name
                        </Typography>
                        <TextField
                            placeholder="Enter category name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
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
                        <Typography
                            variant="caption"
                            sx={{ color: '#6B7280', fontSize: '0.75rem', mt: 0.5, display: 'block' }}
                        >
                            Only letters, numbers, and spaces are allowed
                        </Typography>
                    </Box>

                    {/* File Upload Area */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Category Images
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                        >
                            Select one or more images (JPG, PNG, WEBP - Max 5MB each)
                        </Typography>
                        <UploadArea
                            onClick={() => document.getElementById('fileInput').click()}
                            sx={{
                                width: '100%',
                                minHeight: 160,
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
                                id="fileInput"
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <UploadIcon sx={{ fontSize: 40, color: '#3B8FF3', mb: 1 }} />
                            <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 600, mb: 0.5, textAlign: 'center' }}>
                                {selectedFiles.length > 0
                                    ? `${selectedFiles.length} file(s) selected`
                                    : 'Click or drag images here'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
                                Select JPG/PNG/WEBP files (Max 5MB each)
                            </Typography>
                            {selectedFiles.length > 0 && (
                                <Chip
                                    label={`${selectedFiles.length} images selected`}
                                    color="primary"
                                    sx={{
                                        mt: 2,
                                        backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                        color: '#3B8FF3',
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </UploadArea>
                    </Box>

                    {/* Image Selection Counter */}
                    {selectedFiles.length > 0 && (
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
                                        <Typography sx={{ 
                                            color: 'white', 
                                            fontWeight: 700, 
                                            fontSize: '1.2rem' 
                                        }}>
                                            {selectedFiles.length}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#1E1E2C', 
                                            fontWeight: 600,
                                            mb: 0.5
                                        }}>
                                            Images Selected
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: '#6B7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            {selectedFiles.length === 1 ? '1 image' : `${selectedFiles.length} images`} ready for upload
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {selectedFiles.map((_, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                                opacity: 0.8
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            
                            {/* File Details - Show when files are selected */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ 
                                    color: '#6B7280', 
                                    fontWeight: 500,
                                    mb: 1
                                }}>
                                    Selected Files:
                                </Typography>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: 1,
                                    maxHeight: selectedFiles.length > 4 && !showAllFiles ? '120px' : 'auto',
                                    overflow: selectedFiles.length > 4 && !showAllFiles ? 'hidden' : 'visible'
                                }}>
                                    {(showAllFiles ? selectedFiles : selectedFiles.slice(0, 4)).map((file, index) => (
                                        <Chip
                                            key={index}
                                            label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                                            onDelete={() => removeImage(index)}
                                            sx={{
                                                backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                color: '#3B8FF3',
                                                fontWeight: 500,
                                                '& .MuiChip-deleteIcon': {
                                                    color: '#dc3545',
                                                    '&:hover': {
                                                        color: '#c82333'
                                                    }
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                                
                                {/* Show More/Less Toggle */}
                                {selectedFiles.length > 4 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            size="small"
                                            onClick={() => setShowAllFiles(!showAllFiles)}
                                            sx={{
                                                color: '#3B8FF3',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {showAllFiles ? 'Show Less' : 'Show All'} ({selectedFiles.length} files)
                                        </Button>
                                    </Box>
                                )}
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
                            disabled={isLoading || !categoryName.trim() || selectedFiles.length === 0}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
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
                            {isLoading ? 'Uploading...' : 'Upload Category & Images'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddCategoryPage;