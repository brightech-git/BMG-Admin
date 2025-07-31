import { useState } from 'react';
import { useProductContext } from '../../../context/product/productContext';
import { useNavigate } from 'react-router-dom';
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

const AddProducts = () => {
    const { uploadImages, loading } = useProductContext();
    const navigate = useNavigate();
    const [sno, setSno] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [showAllFiles, setShowAllFiles] = useState(false);

    const handleFileChange = (e) => {
        setFeedback({ error: '', success: '' });

        const files = Array.from(e.target.files);
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (files.some(file => !validTypes.includes(file.type))) {
            setFeedback({ error: 'Only JPG, PNG, and WEBP formats are allowed.', success: '' });
            return;
        }

        setSelectedFiles(files);
    };

    const removeImage = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const handleUpload = async () => {
        setFeedback({ error: '', success: '' });

        if (!sno.trim()) {
            setFeedback({ error: 'Please enter a valid product serial number.', success: '' });
            return;
        }

        if (selectedFiles.length < 3 || selectedFiles.length > 5) {
            setFeedback({ error: 'Please select between 3 to 5 images.', success: '' });
            return;
        }

        if (!description.trim()) {
            setFeedback({ error: 'Please enter a product description.', success: '' });
            return;
        }

        try {
            await uploadImages(sno, selectedFiles, description);
            setFeedback({ error: '', success: 'Images and description uploaded successfully!' });
            localStorage.setItem('sno', sno);
            navigate(`/admin/product/manage/${sno}`);
            setSno('');
            setDescription('');
            setSelectedFiles([]);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Upload failed. Please try again.';
            setFeedback({ error: errorMessage, success: '' });
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
                            Upload Product Images
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: '#6B7280', fontSize: '1.1rem' }}
                        >
                            Attach images and description to a product entry
                        </Typography>
                    </Box>

                    {/* Product S/N Input */}
                    <Box mb={2}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Product S/N
                        </Typography>
                        <TextField
                            placeholder="Enter product serial number"
                        value={sno}
                        onChange={(e) => setSno(e.target.value)}
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

                    {/* Product Description */}
                    <Box mb={2}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Product Description
                        </Typography>
                        <TextField
                            placeholder="Write a brief description of the product..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                            variant="outlined"
                            multiline
                            rows={4}
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
                    <Box mb={2}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Product Images
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                        >
                            Select 3-5 images (JPG, PNG, WEBP)
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
                                Select 3–5 JPG/PNG/WEBP files
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
                            
                            {/* File Details - Only show when 3-5 images are selected */}
                            {selectedFiles.length >= 3 && (
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
                            )}
                        </Box>
                    )}

                    {/* Feedback Messages */}
                {feedback.error && (
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
                                {feedback.error}
                            </Alert>
                        </Box>
                )}

                {feedback.success && (
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
                                {feedback.success}
                            </Alert>
                        </Box>
                    )}

                    {/* Submit Button */}
                    <Box display="flex" justifyContent="center" mt={4}>
                        <ModernButton
                            onClick={handleUpload}
                            variant="contained"
                            color="primary"
                            disabled={loading || !sno || selectedFiles.length === 0 || !description.trim()}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
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
                            {loading ? 'Uploading...' : 'Upload Product & Description'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddProducts;