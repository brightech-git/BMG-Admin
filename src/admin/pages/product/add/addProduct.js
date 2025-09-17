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
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== STYLED COMPONENTS ==========
const ProfessionalCard = styled(Card)({
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--card-background-color)',
    border: `1px solid var(--border-color)`,
    boxShadow: '0 2px 8px var(--shadow-color)',
    transition: 'all 0.2s ease',
    width: '100%',
});

const ProfessionalButton = styled(Button)(({ color, disabled }) => ({
    borderRadius: 'var(--border-radius-sm)',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: 'var(--font-size-md)',
    padding: 'var(--spacing-xs) var(--spacing-md)',
    transition: 'all 0.2s ease',
    ...(color === 'primary' && {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-dark)',
        '&:hover': {
            backgroundColor: 'var(--active-border)',
            transform: disabled ? 'none' : 'translateY(-1px)',
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
            transform: disabled ? 'none' : 'translateY(-1px)',
        },
        '&:disabled': {
            borderColor: 'var(--disabled-bg)',
            color: 'var(--disabled-text)',
        },
    }),
}));

const UploadZone = styled(Box)(({ isDragOver, hasFiles }) => ({
    borderRadius: 'var(--border-radius-sm)',
    border: `2px dashed ${isDragOver ? 'var(--primary-color)' : hasFiles ? 'var(--success-color)' : 'var(--border-color)'}`,
    backgroundColor: isDragOver ? 'var(--active-bg)' : hasFiles ? 'var(--success-bg)' : 'var(--card-background-color)',
    padding: 'var(--spacing-md)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: hasFiles ? 'var(--success-color)' : 'var(--primary-color)',
        backgroundColor: hasFiles ? 'var(--success-bg)' : 'var(--active-bg)',
    },
}));

const FormSection = styled(Box)({
    backgroundColor: 'var(--card-background-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)',
});

const StatusIndicator = styled(Box)(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: 'var(--font-size-md)',
    fontWeight: 500,
    ...(status === 'complete' && {
        backgroundColor: 'var(--success-bg)',
        color: 'var(--success-color)',
    }),
    ...(status === 'incomplete' && {
        backgroundColor: 'var(--error-bg)',
        color: 'var(--error-color)',
    }),
    ...(status === 'partial' && {
        backgroundColor: 'var(--warning-bg)',
        color: 'var(--warning-color)',
    }),
}));

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
        if (files.length > CONFIG.maxFiles) return { isValid: false, error: `Max ${CONFIG.maxFiles} files.` };
        if (files.length < CONFIG.minFiles) return { isValid: false, error: `Min ${CONFIG.minFiles} files.` };
        for (let file of files) {
            if (!CONFIG.validTypes.includes(file.type)) return { isValid: false, error: `Invalid format: ${file.name}.` };
            if (file.size > CONFIG.maxSize) return { isValid: false, error: `${file.name} exceeds 10MB.` };
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
        setFeedback('success', `${files.length} file(s) selected.`, 2000);
    }, [validateFiles, clearAllFeedback, setFeedback]);

    const handleFileChange = useCallback(e => processFiles(Array.from(e.target.files || [])), [processFiles]);

    const removeFile = useCallback(index => {
        setFormData(prev => ({ ...prev, selectedFiles: prev.selectedFiles.filter((_, i) => i !== index) }));
        setFeedback('info', 'File removed.', 1500);
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
        if (!tagKey.trim()) errors.push('Tag Key required');
        else if (tagKey.trim().length < CONFIG.minTagLength) errors.push(`Tag Key ≥ ${CONFIG.minTagLength} chars`);
        if (!description.trim()) errors.push('Description required');
        else if (description.trim().length < CONFIG.minDescriptionLength) errors.push(`Description ≥ ${CONFIG.minDescriptionLength} chars`);
        const fileValidation = validateFiles(selectedFiles);
        if (!fileValidation.isValid) errors.push(fileValidation.error);
        return { isValid: errors.length === 0, errors };
    }, [formData, validateFiles]);

    const handleUpload = useCallback(async () => {
        clearAllFeedback();
        const validation = validateForm();
        if (!validation.isValid) {
            setFeedback('error', `Fix: ${validation.errors.join(', ')}`);
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
            setFeedback('success', 'Product uploaded!');
            setTimeout(() => {
                resetForm();
                navigate(`/admin/product/manage/${formData.tagKey}`);
            }, 1500);
        } catch (err) {
            clearInterval(progressInterval);
            setUiState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
            let errorMessage = 'Upload failed.';
            if (err.message === 'UPLOAD_TIMEOUT') errorMessage = 'Upload timed out.';
            else if (err.name === 'NetworkError' || err.message?.toLowerCase().includes('network')) errorMessage = 'Network issue.';
            else if (err.response?.status === 413) errorMessage = 'Files too large.';
            else if (err.response?.status === 400) errorMessage = err.response?.data?.message || 'Invalid data.';
            else if (err.response?.status === 500) errorMessage = 'Server error.';
            else if (err.response?.status === 429) errorMessage = 'Too many requests.';
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
        setUiState({ feedback: { error: '', success: '', info: '' }, showAllFiles: false, isDragOver: false, snackbarOpen: false, uploadProgress: 0, isUploading: false });
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
            text: completed === total ? 'Ready' : completed === 0 ? 'Not Started' : 'In Progress',
            count: `${completed}/${total}`,
        };
    }, [formData]);

    const completionStatus = getCompletionStatus();

    return (
        <Box sx={{
            backgroundColor: 'var(--background-color)',
            minHeight: '100vh',
            py: { xs: 5, sm: 3, md: 5 },   // vertical padding
            px: { xs: 2, sm: 4, md: 10, lg: 15 }, // horizontal padding responsive
        }}>
            <Backdrop open={uiState.isUploading} sx={{ zIndex: 1300, bgcolor: 'rgba(0, 0, 0, 0.5)' }}>
                <Box textAlign="center" sx={{ color: 'var(--text-dark)' }}>
                    <CircularProgress sx={{ color: 'var(--primary-color)', mb: 1 }} size={30} />
                    <Typography variant="body2" sx={{ fontSize: 'var(--font-size-md)' }}>Uploading...</Typography>
                    <LinearProgress
                        variant="determinate"
                        value={uiState.uploadProgress}
                        sx={{ width: 150, bgcolor: 'var(--border-color)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary-color)' } }}
                    />
                </Box>
            </Backdrop>

            <ProfessionalCard>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography
                            variant="h6"
                            sx={{ fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--primary-color)', fontSize: 'var(--font-size-xl)' }}
                        >
                            Add Product
                        </Typography>
                        <StatusIndicator status={completionStatus.status}>
                            {completionStatus.status === 'complete' && <CheckIcon sx={{ fontSize: 'var(--font-size-sm)' }} />}
                            {completionStatus.status === 'incomplete' && <ErrorIcon sx={{ fontSize: 'var(--font-size-sm)' }} />}
                            {completionStatus.status === 'partial' && <InfoIcon sx={{ fontSize: 'var(--font-size-sm)' }} />}
                            {completionStatus.text} ({completionStatus.count})
                        </StatusIndicator>
                    </Box>

                    {uiState.feedback.error && (
                        <Alert severity="error" onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, error: '' } }))} sx={{ mb: 1, borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                            {uiState.feedback.error}
                        </Alert>
                    )}
                    {uiState.feedback.success && (
                        <Alert severity="success" onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, success: '' } }))} sx={{ mb: 1, borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                            {uiState.feedback.success}
                        </Alert>
                    )}
                    {uiState.feedback.info && (
                        <Alert severity="info" onClose={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, info: '' } }))} sx={{ mb: 1, borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                            {uiState.feedback.info}
                        </Alert>
                    )}

                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <FormSection>
                                <Typography
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 500,
                                        color: 'var(--primary-text-color)',
                                        fontSize: 'var(--font-size-md)',
                                        mb: 1
                                    }}
                                >
                                    Basic Info
                                </Typography>

                                <TextField
                                    label="Tag Key"
                                    placeholder="e.g., GOLD-EARRINGS-001"
                                    value={formData.tagKey}
                                    onChange={e => handleInputChange('tagKey', e.target.value)}
                                    fullWidth
                                    InputLabelProps={{
                                        sx: {
                                            color: 'var(--secondary-text-color)',
                                            '&.Mui-focused': { color: 'var(--primary-color)' }
                                        }
                                    }}
                                    sx={{
                                        mb: 1,
                                        '& .MuiInputBase-root': {
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--primary-text-color)',
                                            backgroundColor: 'var(--card-background-color)',
                                            borderRadius: 'var(--border-radius-md)',
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

                                <TextField
                                    label="Description"
                                    placeholder="Describe product..."
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
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--primary-text-color)',
                                            backgroundColor: 'var(--card-background-color)',
                                            borderRadius: 'var(--border-radius-md)',
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
                            </FormSection>

                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormSection>
                                <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 500, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-md)', mb: 1 }}>
                                    Images
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
                                            <CheckIcon sx={{ fontSize: 24, color: 'var(--success-color)' }} />
                                            <Typography sx={{ fontWeight: 500, fontSize: 'var(--font-size-md)', color: 'var(--primary-text-color)' }}>
                                                {formData.selectedFiles.length} Files
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: 'var(--font-size-md)', color: 'var(--secondary-text-color)' }}>
                                                Click/drag to add
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon sx={{ fontSize: 24, color: 'var(--primary-color)' }} />
                                            <Typography sx={{ fontWeight: 500, fontSize: 'var(--font-size-md)', color: 'var(--primary-text-color)' }}>
                                                Upload Images
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)' }}>
                                                JPG, PNG, WEBP • 3-10 files
                                            </Typography>
                                        </>
                                    )}
                                </UploadZone>
                            </FormSection>
                        </Grid>

                        {formData.selectedFiles.length > 0 && (
                            <Grid item xs={12}>
                                <FormSection>
                                    <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 500, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-md)', mb: 1 }}>
                                        Images ({formData.selectedFiles.length})
                                    </Typography>
                                    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(180px, 1fr))' }, maxHeight: uiState.showAllFiles ? 'none' : 150, overflow: 'hidden' }}>
                                        {(uiState.showAllFiles ? formData.selectedFiles : formData.selectedFiles.slice(0, 3)).map((file, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', border: `1px solid var(--border-color)`, borderRadius: 'var(--border-radius-sm)', p: 0.5, bgcolor: 'var(--card-background-color)' }}>
                                                <Typography variant="body2" sx={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--primary-text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {file.name}
                                                </Typography>
                                                <Button size="small" onClick={() => removeFile(index)} sx={{ minWidth: 0, color: 'var(--error-color)' }}>
                                                    <DeleteIcon sx={{ fontSize: 'var(--font-size-sm)' }} />
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                    {formData.selectedFiles.length > 3 && (
                                        <Button
                                            variant="text"
                                            onClick={() => setUiState(prev => ({ ...prev, showAllFiles: !prev.showAllFiles }))}
                                            sx={{ color: 'var(--primary-color)', fontSize: 'var(--font-size-sm)', mt: 0.5 }}
                                        >
                                            {uiState.showAllFiles ? 'Show Less' : `All ${formData.selectedFiles.length} Files`}
                                        </Button>
                                    )}
                                </FormSection>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={4}>
                            <FormSection>
                                <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 500, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-md)', mb: 1 }}>
                                    Marketing
                                </Typography>
                                {['topTrending', 'featuredProducts', 'bestDesign'].map(option => (
                                    <FormControlLabel
                                        key={option}
                                        control={
                                            <Checkbox
                                                checked={formData.trendingOptions[option]}
                                                onChange={handleTrendingChange}
                                                name={option}
                                                sx={{ color: 'var(--primary-color)', '&.Mui-checked': { color: 'var(--primary-color)', padding: '4px' } }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-text-color)' }}>
                                                {option.replace(/([A-Z])/g, ' $1').trim()}
                                            </Typography>
                                        }
                                        sx={{ margin: 0 }}
                                    />
                                ))}
                            </FormSection>
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <FormSection>
                                <Typography
                                    sx={{
                                        fontFamily: 'var(--font-primary)',
                                        fontWeight: 500,
                                        color: 'var(--primary-text-color)',
                                        fontSize: 'var(--font-size-md)',
                                        mb: 1,
                                    }}
                                >
                                    Specifications
                                </Typography>

                                <Grid container spacing={1}>
                                    {Object.keys(ENUM_OPTIONS).map((attr) => (
                                        <Grid item xs={6} key={attr}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    name={attr}
                                                    value={formData.productAttributes[attr] || ''}
                                                    onChange={handleAttributeChange}
                                                    displayEmpty
                                                    renderValue={(selected) =>
                                                        selected
                                                            ? selected.replace(/_/g, ' ').replace('COATED', ' COATED')
                                                            : `Select ${attr.replace(/([A-Z])/g, ' $1').trim()}`
                                                    }
                                                    sx={{
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--primary-text-color)',
                                                        height: 36,
                                                        backgroundColor: 'var(--card-background-color)',
                                                        borderRadius: 'var(--border-radius-md)',
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
                                                    {/* Placeholder */}
                                                    <MenuItem value="" disabled>
                                                        Select {attr.replace(/([A-Z])/g, ' $1').trim()}
                                                    </MenuItem>

                                                    {/* Dynamic options (no dark mode sx overrides) */}
                                                    {ENUM_OPTIONS[attr].map((option) => (
                                                        <MenuItem key={option} value={option}>
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

                        
                    </Grid>

                    <Divider sx={{ my: 1.5, borderColor: 'var(--border-color)' }} />

                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        <ProfessionalButton
                            variant="outlined"
                            color="secondary"
                            onClick={resetForm}
                            disabled={uiState.isUploading}
                            startIcon={<RefreshIcon sx={{ fontSize: 'var(--font-size-md)' }} />}
                        >
                            Reset
                        </ProfessionalButton>
                        <ProfessionalButton
                            variant="contained"
                            color="primary"
                            onClick={handleUpload}
                            disabled={uiState.isUploading || completionStatus.status !== 'complete'}
                            startIcon={uiState.isUploading ? <CircularProgress size={16} /> : <UploadIcon sx={{ fontSize: 'var(--font-size-md)' }} />}
                        >
                            Upload
                        </ProfessionalButton>
                    </Box>

                    <Box sx={{ mt: 1.5, p: 1, bgcolor: 'var(--card-background-color)', borderRadius: 'var(--border-radius-sm)', border: `1px solid var(--border-color)` }}>
                        <Typography sx={{ fontWeight: 500, color: 'var(--primary-text-color)', fontSize: 'var(--font-size-md)', textAlign: 'center', mb: 1 }}>
                            Validation
                        </Typography>
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

            <Snackbar
                open={uiState.snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setUiState(prev => ({ ...prev, snackbarOpen: false }))}
            >
                <Alert
                    severity="success"
                    sx={{ bgcolor: 'var(--success-color)', color: 'var(--text-dark)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}
                >
                    Product uploaded!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddProducts;