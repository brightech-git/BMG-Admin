import { useState, useRef, useEffect } from 'react';
import { useUploadVideoMutation } from '../../../hooks/video/useVideoQuery';
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
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon,
    VideoLibrary as VideoIcon
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

const VideoPreview = styled('video')(() => ({
    width: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
}));

const AddVideos = () => {
    const [title, setTitle] = useState('');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const {
        mutate: uploadVideo,
        isLoading,
        isError,
        error: mutationError,
        isSuccess,
        reset,
    } = useUploadVideoMutation();

    // Reset success state after 5 seconds
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                reset();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, reset]);

    // Clean up preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setError('No file selected');
            return;
        }

        // Validate file type
        if (!selectedFile.type.match('video.*')) {
            setError('Please select a video file (MP4, WebM, or QuickTime format)');
            return;
        }

        // Validate file size (max 100MB)
        if (selectedFile.size > 100 * 1024 * 1024) {
            setError('File size exceeds maximum limit of 100MB');
            return;
        }

        setVideo(selectedFile);
        setError(null);

        // Create preview URL
        if (preview) {
            URL.revokeObjectURL(preview); // Clean up previous preview
        }
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Video title is required');
            return;
        }

        if (title.length > 100) {
            setError('Title must be less than 100 characters');
            return;
        }

        if (!video) {
            setError('Please select a video file to upload');
            return;
        }

        // ✅ Correct way to call mutation
        uploadVideo({ title, video }, {
            onSuccess: () => {
                setTitle('');
                setVideo(null);
                setPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (err) => {
                console.error('Upload error:', err);
                setError(
                    err.response?.data?.error ||
                    err.message ||
                    'An error occurred during video upload'
                );
            },
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const event = { target: { files: [file] } };
            handleFileChange(event);
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
                            Upload New Video
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: '#6B7280', fontSize: '1.1rem' }}
                        >
                            Add your video content to the platform
                        </Typography>
                    </Box>

                    {/* Video Title Input */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Video Title
                            <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter a descriptive title for your video"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            variant="outlined"
                            fullWidth
                            inputProps={{ maxLength: 100 }}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                {title.length}/100 characters
                            </Typography>
                        </Box>
                    </Box>

                    {/* Video Upload Area */}
                    <Box mb={3}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem', textAlign: 'left' }}
                        >
                            Video File
                            <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 2, textAlign: 'left' }}
                        >
                            MP4, WebM or QuickTime • Max 100MB
                        </Typography>
                        
                        {preview ? (
                            <Box sx={{ position: 'relative' }}>
                                <VideoPreview
                                    src={preview}
                                    muted
                                    controls={false}
                                    aria-label="Video preview"
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Chip
                                        label={`${(video?.size / (1024 * 1024)).toFixed(2)} MB`}
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
                                        onClick={() => document.getElementById('videoInput').click()}
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            color: '#3B8FF3',
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                            }
                                        }}
                                    >
                                        Replace Video
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <UploadArea
                                onClick={() => document.getElementById('videoInput').click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
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
                                    id="videoInput"
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <VideoIcon sx={{ fontSize: 48, color: '#3B8FF3', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#1E1E2C', fontWeight: 600, mb: 0.5, textAlign: 'center' }}>
                                    Select a video to upload
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', mb: 1 }}>
                                    or drag and drop here
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280', textAlign: 'center' }}>
                                    MP4, WebM or QuickTime • Max 100MB
                                </Typography>
                            </UploadArea>
                        )}
                    </Box>

                    {/* Video Selection Counter */}
                    {video && (
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
                                        <VideoIcon sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ 
                                            color: '#1E1E2C', 
                                            fontWeight: 600,
                                            mb: 0.5
                                        }}>
                                            Video Selected
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: '#6B7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Error Messages */}
                    {(isError || error) && (
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
                                {error || mutationError?.message || 'Failed to upload video'}
                            </Alert>
                        </Box>
                    )}

                    {/* Success Messages */}
                    {isSuccess && (
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
                                Video uploaded successfully! Processing may take a few minutes.
                            </Alert>
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="center" gap={2} mt={4}>
                        <ModernButton
                            variant="outlined"
                            onClick={() => {
                                setTitle('');
                                setVideo(null);
                                setPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            disabled={isLoading}
                            sx={{
                                minWidth: '120px',
                                height: '48px',
                                borderColor: '#6B7280',
                                color: '#6B7280',
                                '&:hover': {
                                    borderColor: '#4B5563',
                                    color: '#4B5563',
                                },
                            }}
                        >
                            Cancel
                        </ModernButton>

                        <ModernButton
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={isLoading || !title.trim() || !video}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                            sx={{
                                minWidth: '200px',
                                height: '48px',
                                fontSize: '1rem',
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
                            {isLoading ? 'Uploading...' : 'Upload Video'}
                        </ModernButton>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddVideos;