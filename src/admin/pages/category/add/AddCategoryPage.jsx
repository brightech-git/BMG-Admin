import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
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

// ========== STYLED COMPONENTS (Unchanged) ==========
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

const UploadArea = styled(Box)(() => ({
    borderRadius: '12px',
    border: '2px dashed rgba(235, 167, 72, 0.3)',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#eba748',
        backgroundColor: 'rgba(235, 167, 72, 0.05)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(235, 167, 72, 0.15)',
    },
}));

const AddMenuItemPage = () => {
    const [formData, setFormData] = useState({
        label: '',
        name: '',
        value: '',
        title: '',
        subtitle: ''
    });
    const [selectedFile, setSelectedFile] = useState(null); // Single file for now
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate: uploadMenuItem, isLoading } = useUploadMenuItem();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleFileChange = (e) => {
        setError(null);
        setSuccess(null);

        const file = e.target.files[0]; // Take only the first file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!file) return;

        if (!validTypes.includes(file.type)) {
            setError('Only JPG, PNG, and WEBP formats are allowed.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File must be less than 5MB.');
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { label, name,  title, subtitle } = formData;

        // Validate inputs
        if (!label.trim() || !name.trim() || !title.trim() || !subtitle.trim()) {
            setError('All fields are required.');
            return;
        }

        if (!/^[a-zA-Z0-9\s]+$/.test(label) || !/^[a-zA-Z0-9\s]+$/.test(name) ) {
            setError('Label, name, and value can only contain letters, numbers, and spaces.');
            return;
        }

        if (!selectedFile) {
            setError('An image is required.');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('label', label.trim());
        formDataToSend.append('name', name.trim());
        formDataToSend.append('title', title.trim());
        formDataToSend.append('subtitle', subtitle.trim());
        formDataToSend.append('image', selectedFile);

        uploadMenuItem(
            formDataToSend,
            {
                onSuccess: (data) => {
                    setSuccess(data.message || 'Menu item uploaded successfully!');
                    setFormData({ label: '', name: '',  title: '', subtitle: '' });
                    setSelectedFile(null);
                    document.getElementById('fileInput').value = '';
                },
                onError: (err) => {
                    const errorMessage = err.response?.data?.error || 'Failed to upload menu item.';
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
                            Add New Menu Item
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
                            Create a new menu item for the header navigation
                        </Typography>
                    </Box>

                    {/* Form Inputs */}
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
                                    gap: 1
                                }}
                            >
                                <AddIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Menu Item Details
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <Box display="grid" gap={2} sx={{ gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                <TextField
                                    name="label"
                                    placeholder="Enter label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Label"
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
                                <TextField
                                    name="name"
                                    placeholder="Enter Key name ex:itemName, gender ..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Name"
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
                              
                                <TextField
                                    name="title"
                                    placeholder="Enter KeyName"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Key Name"
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
                                <TextField
                                    name="subtitle"
                                    placeholder="Enter Key Value"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Key value"
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
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{ color: '#6B7280', fontSize: '0.75rem', mt: 0.5, display: 'block' }}
                            >
                                Only letters, numbers, and spaces are allowed
                            </Typography>
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
                                    gap: 1
                                }}
                            >
                                <UploadIcon sx={{ color: '#eba748', fontSize: '1.2rem' }} />
                                Menu Item Image
                                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                            >
                                Select an image (JPG, PNG, WEBP - Max 5MB)
                            </Typography>
                            <UploadArea
                                onClick={() => document.getElementById('fileInput').click()}
                                sx={{
                                    width: '100%',
                                    minHeight: 160,
                                    border: '2px dashed #eba748',
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
                                        borderColor: '#e09a3a',
                                        backgroundColor: 'rgba(235, 167, 72, 0.05)',
                                    },
                                }}
                            >
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <UploadIcon sx={{ fontSize: 40, color: '#eba748', mb: 1 }} />
                                <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 600, mb: 0.5, textAlign: 'center' }}>
                                    {selectedFile ? selectedFile.name : 'Click or drag image here'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
                                    Select JPG/PNG/WEBP file (Max 5MB)
                                </Typography>
                                {selectedFile && (
                                    <Chip
                                        label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                                        onDelete={removeFile}
                                        color="primary"
                                        sx={{
                                            mt: 2,
                                            backgroundColor: 'rgba(235, 167, 72, 0.1)',
                                            color: '#eba748',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </UploadArea>
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
                            onClick={() => {
                                setFormData({ label: '', name: '', value: '', title: '', subtitle: '' });
                                setSelectedFile(null);
                                document.getElementById('fileInput').value = '';
                            }}
                            disabled={isLoading}
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
                            disabled={isLoading || !formData.label.trim() || !formData.name.trim() || !formData.title.trim() || !formData.subtitle.trim() || !selectedFile}
                            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
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
                                    marginRight: '8px',
                                },
                            }}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Menu Item'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddMenuItemPage;