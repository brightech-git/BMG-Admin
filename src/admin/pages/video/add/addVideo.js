import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    CircularProgress,
    InputAdornment
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon,
    VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddVideos.css';

const AddVideos = () => {
    const { themeMode } = useContext(MyContext);
    const [title, setTitle] = useState('');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { mutate: uploadVideo, isLoading, isError, error: mutationError, isSuccess, reset } = useUploadVideoMutation();

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                setTitle('');
                setVideo(null);
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                reset();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, reset]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setError('No file selected.');
            return;
        }

        if (!selectedFile.type.match('video.*')) {
            setError('Please select a video file (MP4, WebM, or QuickTime format).');
            return;
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (selectedFile.size > maxSize) {
            setError('File size exceeds maximum limit of 100MB.');
            return;
        }

        setVideo(selectedFile);
        setError(null);

        if (preview) URL.revokeObjectURL(preview);
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Video title is required.');
            return;
        }

        if (title.length > 100) {
            setError('Title must be less than 100 characters.');
            return;
        }

        if (!video) {
            setError('Please select a video file to upload.');
            return;
        }

        uploadVideo({ title, video }, {
            onSuccess: () => {
                // Handled by useEffect
            },
            onError: (err) => {
                setError(err.response?.data?.error || err.message || 'Failed to upload video.');
            }
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
        <div className={`add-videos-container ${themeMode}`}>
            <Card className="add-videos-card">
                <CardContent>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" className="header-title">
                            Upload New Video
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Add your video content to the platform with comprehensive details
                        </Typography>
                    </Box>

                    <Box mb={4}>
                        <Box className="form-section">
                            <Typography variant="body2" className="section-title">
                                <VideoIcon /> Video Title <span className="required">*</span>
                            </Typography>
                            <TextField
                                placeholder="Enter a descriptive title for your video"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                                fullWidth
                                inputProps={{ maxLength: 100 }}
                                className="form-input"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AddIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                <Typography variant="caption" className="form-caption">
                                    {title.length}/100 characters
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box mb={4}>
                        <Box className="form-section">
                            <Typography variant="body2" className="section-title">
                                <VideoIcon /> Video File <span className="required">*</span>
                            </Typography>
                            <Typography variant="body2" className="form-caption">
                                MP4, WebM, or QuickTime (Max 100MB)
                            </Typography>
                            {preview ? (
                                <Box className="video-preview-container">
                                    <video
                                        src={preview}
                                        muted
                                        controls={false}
                                        className="video-preview"
                                        aria-label="Video preview"
                                    />
                                    <Box className="video-preview-overlay">
                                        <Chip
                                            label={`${(video?.size / (1024 * 1024)).toFixed(2)} MB`}
                                            className="image-chip"
                                        />
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => document.getElementById('videoInput').click()}
                                            className="btn replace"
                                        >
                                            Replace Video
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    className="upload-area"
                                    onClick={() => document.getElementById('videoInput').click()}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        id="videoInput"
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <VideoIcon />
                                    <Typography variant="h6" className="upload-title">
                                        Select a video to upload
                                    </Typography>
                                    <Typography variant="body2" className="upload-subtitle">
                                        or drag and drop here
                                    </Typography>
                                    <Typography variant="caption" className="upload-caption">
                                        MP4, WebM, or QuickTime (Max 100MB)
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {video && (
                        <Box mb={3}>
                            <Chip
                                label={`${video.name} (${(video.size / (1024 * 1024)).toFixed(2)} MB)`}
                                className="image-chip"
                            />
                        </Box>
                    )}

                    <AnimatePresence>
                        {(isError || error || isSuccess) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {(isError || error) && (
                                    <Alert
                                        severity="error"
                                        icon={<ErrorIcon />}
                                        onClose={() => setError(null)}
                                        className="alert error"
                                    >
                                        {error || mutationError?.message || 'Failed to upload video.'}
                                    </Alert>
                                )}
                                {isSuccess && (
                                    <Alert
                                        severity="success"
                                        icon={<CheckIcon />}
                                        onClose={() => reset()}
                                        className="alert success"
                                    >
                                        Video uploaded successfully! Processing may take a few minutes.
                                    </Alert>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box display="flex" justifyContent="center" gap={2} mt={4}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setTitle('');
                                setVideo(null);
                                setPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            disabled={isLoading}
                            className="btn secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isLoading || !title.trim() || !video}
                            startIcon={isLoading ? <CircularProgress size={24} /> : <AddIcon />}
                            className="btn primary"
                        >
                            {isLoading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddVideos;