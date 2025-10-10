import React, { useState, useCallback, useRef, useContext } from 'react';
import { useProductContext } from '../../../context/product/productContext';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../context/themeContext/themeContext';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    CircularProgress,
    FormControl,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
    Snackbar,
    LinearProgress,
    Backdrop,
    InputLabel,
    FormGroup,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Delete as DeleteIcon,
    Category,
    Palette,
    Woman,
    Cake,
    TrendingUp,
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== STYLED COMPONENTS ==========
const ProfessionalCard = styled(Card)({
    borderRadius: '12px',
    backgroundColor: 'var(--card-background-color)',
    border: `1px solid var(--border-color)`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    width: '100%',
    overflow: 'visible',
});

const ProfessionalButton = styled(Button)(({ color, disabled }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '14px',
    padding: '10px 24px',
    transition: 'all 0.3s ease',
    boxShadow: 'none',
    ...(color === 'primary' && {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-dark)',
        '&:hover': {
            backgroundColor: 'var(--active-border)',
            transform: disabled ? 'none' : 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
        },
        '&:disabled': {
            backgroundColor: 'var(--disabled-bg)',
            color: 'var(--disabled-text)',
        },
    }),
    ...(color === 'secondary' && {
        borderColor: 'var(--primary-color)',
        color: 'var(--primary-color)',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'var(--active-bg)',
            transform: disabled ? 'none' : 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
        },
        '&:disabled': {
            borderColor: 'var(--disabled-bg)',
            color: 'var(--disabled-text)',
        },
    }),
}));

const UploadZone = styled(Box)(({ isDragOver, hasFiles }) => ({
    borderRadius: '8px',
    border: `2px dashed ${isDragOver ? 'var(--primary-color)' : hasFiles ? 'var(--success-color)' : 'var(--border-color)'}`,
    backgroundColor: isDragOver ? 'var(--active-bg)' : hasFiles ? 'var(--success-bg)' : 'var(--card-background-color)',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
        borderColor: hasFiles ? 'var(--success-color)' : 'var(--primary-color)',
        backgroundColor: hasFiles ? 'var(--success-bg)' : 'var(--active-bg)',
        transform: 'translateY(-1px)',
    },
}));

const FormSection = styled(Box)({
    backgroundColor: 'var(--card-background-color)',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: 'var(--primary-color)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
});

const StatusIndicator = styled(Box)(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    ...(status === 'complete' && {
        backgroundColor: 'var(--success-bg)',
        color: 'var(--success-color)',
        border: '1px solid var(--success-color)',
    }),
    ...(status === 'incomplete' && {
        backgroundColor: 'var(--error-bg)',
        color: 'var(--error-color)',
        border: '1px solid var(--error-color)',
    }),
    ...(status === 'partial' && {
        backgroundColor: 'var(--warning-bg)',
        color: 'var(--warning-color)',
        border: '1px solid var(--warning-color)',
    }),
}));

const AttributeIcon = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
});

const AddProducts = () => {
    const { uploadImages, createFormData, loading, error, setError } = useProductContext();
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        tagKey: '',
        description: '',
        selectedFiles: [],
        trendingOptions: { topTrending: false, featuredProducts: false, bestDesign: false },
        productAttributes: { gender: '', occasion: '', collectionType: '', materialFinish: '', colorAccents: '' },
    });

    const [uiState, setUiState] = useState({
        feedback: { error: '', success: '', info: '' },
        showAllFiles: false,
        isDragOver: false,
        snackbarOpen: false,
        uploadProgress: 0,
        isUploading: false,
    });

    const CONFIG = {
        validTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 10 * 1024 * 1024,
        maxFiles: 10,
        minFiles: 3,
        minTagLength: 3,
        minDescriptionLength: 10,
    };

    const ENUM_OPTIONS = {
        gender: ['MEN', 'WOMEN', 'KIDS'],
        occasion: ['DAILY_WEAR', 'WEDDING_WEAR', 'PARTY_WEAR', 'OFFICE_WEAR'],
        collectionType: ['TRADITIONAL', 'TRENDY', 'MINIMALIST', 'TEMPLE', 'ETHNIC'],
        materialFinish: ['GOLDCOATED', 'SILVERCOATED'],
        colorAccents: ['SILVER', 'GOLD'],
    };

    const ATTRIBUTE_ICONS = {
        gender: <Woman sx={{ fontSize: 18, color: 'var(--primary-color)' }} />,
        occasion: <Cake sx={{ fontSize: 18, color: 'var(--primary-color)' }} />,
        collectionType: <Category sx={{ fontSize: 18, color: 'var(--primary-color)' }} />,
        materialFinish: <Palette sx={{ fontSize: 18, color: 'var(--primary-color)' }} />,
        colorAccents: <TrendingUp sx={{ fontSize: 18, color: 'var(--primary-color)' }} />,
    };

    const clearAllFeedback = useCallback(() => {
        setUiState(prev => ({ ...prev, feedback: { error: '', success: '', info: '' } }));
        setError(null);
    }, [setError]);

    const setFeedback = useCallback((type, message, duration = 3000) => {
        clearAllFeedback();
        setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: message } }));
        if (type === 'success' || type === 'info') {
            setTimeout(() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: '' } })), duration);
        }
    }, [clearAllFeedback]);

    const validateFiles = useCallback(files => {
        if (!files || files.length === 0) return { isValid: false, error: 'Select at least one image.' };
        if (files.length > CONFIG.maxFiles) return { isValid: false, error: `Maximum ${CONFIG.maxFiles} files allowed.` };
        if (files.length < CONFIG.minFiles) return { isValid: false, error: `Minimum ${CONFIG.minFiles} files required.` };
        for (let file of files) {
            if (!CONFIG.validTypes.includes(file.type)) return { isValid: false, error: `Invalid file format: ${file.name}. Only JPG, PNG, WEBP allowed.` };
            if (file.size > CONFIG.maxSize) return { isValid: false, error: `${file.name} exceeds 10MB limit.` };
        }
        return { isValid: true };
    }, []);

    const handleDragEnter = useCallback(e => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragOver: true })); }, []);
    const handleDragLeave = useCallback(e => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragOver: false })); }, []);
    const handleDragOver = useCallback(e => { e.preventDefault(); }, []);
    const handleDrop = useCallback(e => {
        e.preventDefault();
        setUiState(prev => ({ ...prev, isDragOver: false }));
        processFiles(Array.from(e.dataTransfer.files));
    }, []);

    const processFiles = useCallback(files => {
        clearAllFeedback();
        const validation = validateFiles(files);
        if (!validation.isValid) {
            setFeedback('error', validation.error);
            return;
        }
        setFormData(prev => ({ ...prev, selectedFiles: files }));
        setFeedback('success', `${files.length} file(s) selected successfully.`, 2000);
    }, [validateFiles, clearAllFeedback, setFeedback]);

    const handleFileChange = useCallback(e => processFiles(Array.from(e.target.files || [])), [processFiles]);

    const removeFile = useCallback(index => {
        setFormData(prev => ({ ...prev, selectedFiles: prev.selectedFiles.filter((_, i) => i !== index) }));
        setFeedback('info', 'File removed successfully.', 1500);
    }, [setFeedback]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearAllFeedback();
    }, [clearAllFeedback]);

    const handleTrendingChange = useCallback(e => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, trendingOptions: { ...prev.trendingOptions, [name]: checked } }));
    }, []);

    const handleAttributeChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, productAttributes: { ...prev.productAttributes, [name]: value } }));
    }, []);

    const validateForm = useCallback(() => {
        const errors = [];
        const { tagKey, description, selectedFiles } = formData;

        if (!tagKey.trim()) {
            errors.push('Tag Key is required');
        } else if (tagKey.trim().length < CONFIG.minTagLength) {
            errors.push(`Tag Key must be at least ${CONFIG.minTagLength} characters`);
        }

        if (description.trim() && description.trim().length < CONFIG.minDescriptionLength) {
            errors.push(`Description must be at least ${CONFIG.minDescriptionLength} characters if provided`);
        }

        if (selectedFiles.length > 0) {
            const fileValidation = validateFiles(selectedFiles);
            if (!fileValidation.isValid) errors.push(fileValidation.error);
        }

        return { isValid: errors.length === 0, errors };
    }, [formData, validateFiles]);

    const handleUpload = useCallback(async () => {
        clearAllFeedback();
        const validation = validateForm();
        if (!validation.isValid) {
            setFeedback('error', `Please fix the following: ${validation.errors.join(', ')}`);
            return;
        }

        setUiState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
        let progressInterval;

        try {
            const uploadFormData = createFormData(
                formData.tagKey.trim(),
                formData.selectedFiles,
                formData.description.trim(),
                formData.trendingOptions,
                formData.productAttributes
            );
            uploadFormData.append('timestamp', new Date().toISOString());
            uploadFormData.append('fileCount', formData.selectedFiles.length);

            progressInterval = setInterval(() => {
                setUiState(prev => ({ ...prev, uploadProgress: Math.min(prev.uploadProgress + 10, 90) }));
            }, 200);

            await Promise.race([
                uploadImages(uploadFormData),
                new Promise((_, reject) => setTimeout(() => reject(new Error('UPLOAD_TIMEOUT')), 120000))
            ]);

            clearInterval(progressInterval);
            setUiState(prev => ({ ...prev, uploadProgress: 100, snackbarOpen: true }));
            setFeedback('success', 'Product uploaded successfully!');
            localStorage.setItem('productTagkey', formData.tagKey);

            setTimeout(() => {
                navigate(`/admin/product/manage/single`, { state: { tagkey: formData.tagKey } });
                resetForm();
            }, 1500);
        } catch (err) {
            clearInterval(progressInterval);
            setUiState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));

            let errorMessage = 'Upload failed. Please try again.';
            if (err.message === 'UPLOAD_TIMEOUT') errorMessage = 'Upload timed out. Please check your connection.';
            else if (err.name === 'NetworkError' || err.message?.toLowerCase().includes('network')) errorMessage = 'Network issue. Please check your connection.';
            else if (err.response?.status === 413) errorMessage = 'Files too large. Please reduce file sizes.';
            else if (err.response?.status === 400) errorMessage = err.response?.data?.message || 'Invalid data provided.';
            else if (err.response?.status === 500) errorMessage = 'Server error. Please try again later.';
            else if (err.response?.status === 429) errorMessage = 'Too many requests. Please wait a moment.';
            else if (err.message) errorMessage = err.message;

            setFeedback('error', errorMessage);
        }
    }, [formData, validateForm, createFormData, uploadImages, clearAllFeedback, setFeedback, navigate]);

    const resetForm = useCallback(() => {
        setFormData({
            tagKey: '',
            description: '',
            selectedFiles: [],
            trendingOptions: { topTrending: false, featuredProducts: false, bestDesign: false },
            productAttributes: { gender: '', occasion: '', collectionType: '', materialFinish: '', colorAccents: '' },
        });
        setUiState({
            feedback: { error: '', success: '', info: '' },
            showAllFiles: false,
            isDragOver: false,
            snackbarOpen: false,
            uploadProgress: 0,
            isUploading: false
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const getCompletionStatus = useCallback(() => {
        const { tagKey, description, selectedFiles } = formData;
        const requiredFields = [
            !!tagKey.trim() && tagKey.trim().length >= CONFIG.minTagLength,
            !!description.trim() && description.trim().length >= CONFIG.minDescriptionLength,
            selectedFiles.length >= CONFIG.minFiles,
        ];
        const completed = requiredFields.filter(Boolean).length;
        const total = requiredFields.length;

        return {
            status: completed === total ? 'complete' : completed === 0 ? 'incomplete' : 'partial',
            text: completed === total ? 'Ready to Upload' : completed === 0 ? 'Not Started' : 'In Progress',
            count: `${completed}/${total}`,
        };
    }, [formData]);

    const completionStatus = getCompletionStatus();

    return (
        <Box sx={{
            backgroundColor: 'var(--background-color)',
     
            py: { xs: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
        }}>
            {/* Upload Progress Backdrop */}
            <Backdrop open={uiState.isUploading} sx={{ zIndex: 1300, bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
                <Box textAlign="center" sx={{ color: 'white', p: 4, borderRadius: 2, bgcolor: 'var(--card-background-color)' }}>
                    <CircularProgress sx={{ color: 'var(--primary-color)', mb: 2 }} size={40} />
                    <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-text-color)' }}>
                        Uploading Product Images...
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={uiState.uploadProgress}
                        sx={{
                            width: 300,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'var(--border-color)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'var(--primary-color)',
                                borderRadius: 4,
                            }
                        }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, color: 'var(--secondary-text-color)' }}>
                        {uiState.uploadProgress}% Complete
                    </Typography>
                </Box>
            </Backdrop>

            {/* Main Content */}
            <ProfessionalCard>
                <CardContent sx={{ p: { xs: 3, md: 2 } }}>
                    {/* Header Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: 'var(--font-primary)',
                                    fontWeight: 700,
                                    color: 'var(--primary-color)',
                                    mb: 0.5
                                }}
                            >
                                Add Product Images
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--secondary-text-color)',
                                    fontSize: '16px'
                                }}
                            >
                                Upload a images and specifications for a product
                            </Typography>
                        </Box>
                        <StatusIndicator status={completionStatus.status}>
                            {completionStatus.status === 'complete' && <CheckIcon sx={{ fontSize: 20 }} />}
                            {completionStatus.status === 'incomplete' && <ErrorIcon sx={{ fontSize: 20 }} />}
                            {completionStatus.status === 'partial' && <InfoIcon sx={{ fontSize: 20 }} />}
                            {completionStatus.text} ({completionStatus.count})
                        </StatusIndicator>
                    </Box>

                    {/* Feedback Alerts */}
                    <Box sx={{ mb: 2 }}>
                        {uiState.feedback.error && (
                            <Alert
                                severity="error"
                                onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, error: '' } }))}
                                sx={{ mb: 2, borderRadius: '8px', fontSize: '14px' }}
                            >
                                {uiState.feedback.error}
                            </Alert>
                        )}
                        {uiState.feedback.success && (
                            <Alert
                                severity="success"
                                onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, success: '' } }))}
                                sx={{ mb: 2, borderRadius: '8px', fontSize: '14px' }}
                            >
                                {uiState.feedback.success}
                            </Alert>
                        )}
                        {uiState.feedback.info && (
                            <Alert
                                severity="info"
                                onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, info: '' } }))}
                                sx={{ mb: 2, borderRadius: '8px', fontSize: '14px' }}
                            >
                                {uiState.feedback.info}
                            </Alert>
                        )}
                    </Box>

                    {/* SECTION 1: Basic Information & Images - Full Width */}
                    <Grid container spacing={1}>
                        {/* Basic Information - Full Width */}
                        <Grid size={{xs:12 ,md:6 ,lg:6}} >
                            <FormSection>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 600,
                                        color: 'var(--primary-text-color)',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <InfoIcon sx={{ color: 'var(--primary-color)' }} />
                                    Basic Information
                                </Typography>

                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                        <TextField
                                            label="Product Tag Key "
                                            placeholder="e.g., GOLD-EARRINGS-001"
                                            value={formData.tagKey}
                                            onChange={e => handleInputChange('tagKey', e.target.value)}
                                            fullWidth
                                            required
                                            InputLabelProps={{
                                                sx: {
                                                    color: 'var(--secondary-text-color)',
                                                    '&.Mui-focused': { color: 'var(--primary-color)' }
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    fontSize: '16px',
                                                    color: 'var(--primary-text-color)',
                                                    backgroundColor: 'var(--card-background-color)',
                                                    borderRadius: '8px',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--border-color)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-color)',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-color)',
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{xs:12 ,md:6 ,lg:12}}>
                                        <TextField
                                            label="Product Description"
                                            placeholder="Provide a detailed description of the product..."
                                            value={formData.description}
                                            onChange={e => handleInputChange('description', e.target.value)}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            InputLabelProps={{
                                                sx: {
                                                    color: 'var(--secondary-text-color)',
                                                    '&.Mui-focused': { color: 'var(--primary-color)' }
                                                }
                                            }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    fontSize: '16px',
                                                    color: 'var(--primary-text-color)',
                                                    backgroundColor: 'var(--card-background-color)',
                                                    borderRadius: '8px',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--border-color)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-color)',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'var(--primary-color)',
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </FormSection>
                        </Grid>

                        {/* Image Upload - Full Width */}
                        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                            <FormSection>
                               

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontFamily: 'var(--font-primary)',
                                                fontWeight: 600,
                                                color: 'var(--primary-text-color)',
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <UploadIcon sx={{ color: 'var(--primary-color)' }} />
                                            Product Images
                                        </Typography>
                                        <UploadZone
                                            isDragOver={uiState.isDragOver}
                                            hasFiles={formData.selectedFiles.length > 0}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            {formData.selectedFiles.length > 0 ? (
                                                <>
                                                    <CheckIcon sx={{ fontSize: 48, color: 'var(--success-color)', mb: 1 }} />
                                                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: 'var(--primary-text-color)', mb: 0.5 }}>
                                                        {formData.selectedFiles.length} Files Selected
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                                        Click or drag to add more files
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadIcon sx={{ fontSize: 48, color: 'var(--primary-color)', mb: 1 }} />
                                                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: 'var(--primary-text-color)', mb: 0.5 }}>
                                                        Upload Product Images
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                                        JPG, PNG, WEBP • 3-10 files • Max 10MB each
                                                    </Typography>
                                                </>
                                            )}
                                        </UploadZone>
                                    </Grid>

                                    {/* File List - Full Width when files exist */}
                                    {formData.selectedFiles.length > 0 && (
                                        <Grid size={{xs:12 ,md:6 ,lg:6}}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'var(--primary-text-color)' }}>
                                                    Selected Files ({formData.selectedFiles.length})
                                                </Typography>
                                                <Box sx={{
                                                    display: 'grid',
                                                    gap: 1,
                                                    gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr' },
                                                    maxHeight: uiState.showAllFiles ? 'none' : 200,
                                                    overflow: 'auto'
                                                }}>
                                                    {(uiState.showAllFiles ? formData.selectedFiles : formData.selectedFiles.slice(0, 8)).map((file, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                border: `1px solid var(--border-color)`,
                                                                borderRadius: '6px',
                                                                p: 1.5,
                                                                bgcolor: 'var(--card-background-color)',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    borderColor: 'var(--primary-color)',
                                                                    bgcolor: 'var(--active-bg)'
                                                                }
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    flex: 1,
                                                                    fontSize: '13px',
                                                                    color: 'var(--primary-text-color)',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {file.name}
                                                            </Typography>
                                                            <Button
                                                                size="small"
                                                                onClick={() => removeFile(index)}
                                                                sx={{
                                                                    minWidth: 0,
                                                                    color: 'var(--error-color)',
                                                                    p: 0.5
                                                                }}
                                                            >
                                                                <DeleteIcon sx={{ fontSize: '18px' }} />
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Box>
                                                {formData.selectedFiles.length > 8 && (
                                                    <Button
                                                        variant="text"
                                                        onClick={() => setUiState(prev => ({ ...prev, showAllFiles: !prev.showAllFiles }))}
                                                        sx={{
                                                            color: 'var(--primary-color)',
                                                            fontSize: '14px',
                                                            mt: 2,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {uiState.showAllFiles ? 'Show Less' : `View All ${formData.selectedFiles.length} Files`}
                                                    </Button>
                                                )}
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </FormSection>
                        </Grid>
                        {/* SECTION 2: Product Specifications - Full Width */}
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                            <FormSection>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 600,
                                        color: 'var(--primary-text-color)',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <Category sx={{ color: 'var(--primary-color)' }} />
                                    Product Specifications
                                </Typography>

                                <Grid container spacing={3}>
                                    {Object.keys(ENUM_OPTIONS).map((attr) => (
                                        <Grid size={{ xs: 12, sm:6,md: 6, lg: 2 }} key={attr}>
                                            <FormControl fullWidth size="medium">
                                                <InputLabel
                                                    sx={{
                                                        fontSize: '14px',
                                                        color: 'var(--secondary-text-color)',
                                                        '&.Mui-focused': {
                                                            color: 'var(--primary-color)'
                                                        }
                                                    }}
                                                >
                                                    {attr.replace(/([A-Z])/g, ' $1').trim()}
                                                </InputLabel>
                                                <Select
                                                    name={attr}
                                                    value={formData.productAttributes[attr] || ''}
                                                    onChange={handleAttributeChange}
                                                    label={attr.replace(/([A-Z])/g, ' $1').trim()}
                                                    sx={{
                                                        fontSize: '14px',
                                                        color: 'var(--primary-text-color)',
                                                        height: '48px',
                                                        backgroundColor: 'var(--card-background-color)',
                                                        borderRadius: '8px',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--border-color)',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--primary-color)',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--primary-color)',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>Select</em>
                                                    </MenuItem>
                                                    {ENUM_OPTIONS[attr].map((option) => (
                                                        <MenuItem
                                                            key={option}
                                                            value={option}
                                                            sx={{ fontSize: '14px' }}
                                                        >
                                                            {option.replace(/_/g, ' ').replace('COATED', ' COATED')}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormSection>
                        </Grid>
                        {/* SECTION 3: Marketing Options - Full Width */}
                        <Grid size={{ xs: 12, md: 12, lg: 10 }}>
                            <FormSection>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 600,
                                        color: 'var(--primary-text-color)',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <TrendingUp sx={{ color: 'var(--primary-color)' }} />
                                    Marketing Options
                                </Typography>

                                <FormGroup>
                                    <Grid container spacing={2}>
                                        {['topTrending', 'featuredProducts', 'bestDesign'].map(option => (
                                            <Grid size={{ xs: 12,sm:4, md: 4, lg: 3 }} key={option}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.trendingOptions[option]}
                                                            onChange={handleTrendingChange}
                                                            name={option}
                                                            sx={{
                                                                color: 'var(--primary-color)',
                                                                '&.Mui-checked': {
                                                                    color: 'var(--primary-color)',
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography sx={{
                                                            fontSize: '15px',
                                                            color: 'var(--primary-text-color)',
                                                            fontWeight: 500
                                                        }}>
                                                            {option.replace(/([A-Z])/g, ' $1').trim()}
                                                        </Typography>
                                                    }
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </FormGroup>
                            </FormSection>
                        </Grid>

                    </Grid>

                    {/* Action Buttons */}
                    <Divider sx={{ my: 2, borderColor: 'var(--border-color)' }} />

                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        justifyContent: 'center',
                        flexDirection: { xs: 'row', sm: 'row' },
                        alignItems: 'center',
                        mb:1
                    }}>
                        <ProfessionalButton
                            variant="outlined"
                            color="secondary"
                            onClick={resetForm}
                            disabled={uiState.isUploading}
                            startIcon={<RefreshIcon sx={{ fontSize: 20 }} />}
                            sx={{ minWidth: { xs: '100%', sm: '160px' } }}
                        >
                            Reset Form
                        </ProfessionalButton>
                        <ProfessionalButton
                            variant="contained"
                            color="primary"
                            onClick={handleUpload}
                            disabled={uiState.isUploading || completionStatus.status !== 'complete'}
                            startIcon={uiState.isUploading ? <CircularProgress size={20} /> : <UploadIcon sx={{ fontSize: 20 }} />}
                            sx={{ minWidth: { xs: '100%', sm: '160px' } }}
                        >
                            {uiState.isUploading ? 'Uploading...' : 'Upload Product'}
                        </ProfessionalButton>
                    </Box>
                   
                      
                          <Box > 
                            <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 600,
                                        color: 'var(--primary-text-color)',
                                        mb: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    Validation Status
                                </Typography>
                                {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent:{xs:'flex-start',md:'center'}, width:'100%'}}>
                                    {[
                                        {
                                            label: 'Tag Key',
                                            valid: formData.tagKey.trim() && formData.tagKey.trim().length >= CONFIG.minTagLength,
                                            required: true
                                        },
                                        {
                                            label: 'Description',
                                            valid: !formData.description.trim() || formData.description.trim().length >= CONFIG.minDescriptionLength,
                                            required: true
                                        },
                                        {
                                            label: `Images (${formData.selectedFiles.length}/${CONFIG.minFiles}+)`,
                                            valid: formData.selectedFiles.length >= CONFIG.minFiles,
                                            required: true
                                        },
                                    ].map(({ label, valid, required }, index) => (
                                        <Chip
                                            key={index}
                                            label={label + (required ? ' *' : '')}
                                            color={valid ? 'success' : 'default'}
                                            icon={valid ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                                            variant={valid ? 'filled' : 'outlined'}
                                            sx={{
                                                bgcolor: valid ? 'var(--success-bg)' : 'transparent',
                                                color: valid ? 'var(--success-color)' : 'var(--secondary-text-color)',
                                                borderColor: valid ? 'var(--success-color)' : 'var(--border-color)',
                                                fontSize: {xs:'11px',sm:'14px'},
                                                fontWeight: 500,
                                                height: '36px',
                                            }}
                                        />
                                    ))}
                                </Box> */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {[
                                { label: 'Tag Key', valid: formData.tagKey.trim() && formData.tagKey.trim().length >= CONFIG.minTagLength },
                                { label: 'Description', valid: formData.description.trim() && formData.description.trim().length >= CONFIG.minDescriptionLength },
                                { label: `Images (${formData.selectedFiles.length}/${CONFIG.minFiles}+)`, valid: formData.selectedFiles.length >= CONFIG.minFiles },
                            ].map(({ label, valid }, index) => (
                                <Chip
                                    key={index}
                                    label={label}
                                    color={valid ? 'success' : 'default'}
                                    icon={valid ? <CheckIcon sx={{ fontSize: 'var(--font-size-sm)' }} /> : undefined}
                                    sx={{ bgcolor: valid ? 'var(--success-bg)' : 'var(--border-color)', color: valid ? 'var(--success-color)' : 'var(--secondary-text-color)', fontSize: 'var(--font-size-md)' }}
                                />
                            ))}
                        </Box>
                    </Box>
                    
                </CardContent>
            </ProfessionalCard>

            {/* Success Snackbar */}
            <Snackbar
                open={uiState.snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setUiState(prev => ({ ...prev, snackbarOpen: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="success"
                    sx={{
                        bgcolor: 'var(--success-color)',
                        color: 'var(--text-dark)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Product uploaded successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddProducts;