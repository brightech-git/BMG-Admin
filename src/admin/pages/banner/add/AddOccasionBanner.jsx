import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useUploadOccasionBannerMutation } from '../../../hooks/banners/occasionBanner/useUploadOccasionBanner';
import FileUploader from '../../../components/banner/FileUploader';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    MenuItem
} from '@mui/material';
import { CloudUpload as UploadIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Add as AddIcon } from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddOccasionBanner.css';

const AddOccasionBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [occasion, setOccasion] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useUploadOccasionBannerMutation();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const occasionOptions = ['WEDDING', 'PARTY', 'CASUAL', 'FESTIVAL', 'DAILY_WEAR'];
    const genderOptions = ['MALE', 'FEMALE', 'UNISEX'];

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
            setError('Please select a valid image file (JPEG, PNG, WEBP, max 5MB).');
            return;
        }

        if (!title.trim()) {
            setError('Please enter a title for the banner.');
            return;
        }

        if (!occasion) {
            setError('Please select an occasion.');
            return;
        }

        if (!gender) {
            setError('Please select a gender.');
            return;
        }

        const payload = {
            image,
            title,
            subtitle: subtitle || null,
            occasion,
            gender
        };

        mutate(payload, {
            onSuccess: () => {
                setSuccess('Occasion Banner uploaded successfully!');
                setImage(null);
                setTitle('');
                setSubtitle('');
                setOccasion('');
                setGender('');
                setTimeout(() => setSuccess(null), 3000);
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload occasion banner.');
            }
        });
    };

    return (
        <div className={`add-occasion-banner-container ${themeMode}`}>
            <Card className="add-occasion-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Add New Occasion Banner
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Upload a new occasion banner with title, occasion, and gender
                        </Typography>
                    </Box>

                    <Box mb={3}>
                        <Box className="form-section">
                            <Typography className="form-label">
                                Banner Title <span className="required">*</span>
                            </Typography>
                            <TextField
                                placeholder="Enter banner title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                            />

                            <Typography className="form-label" mt={2}>
                                Banner Subtitle (optional)
                            </Typography>
                            <TextField
                                placeholder="Enter banner subtitle"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                            />

                            <Typography className="form-label" mt={2}>
                                Occasion <span className="required">*</span>
                            </Typography>
                            <TextField
                                select
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                            >
                                <MenuItem value="">Select an occasion</MenuItem>
                                {occasionOptions.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Typography className="form-label" mt={2}>
                                Gender <span className="required">*</span>
                            </Typography>
                            <TextField
                                select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                            >
                                <MenuItem value="">Select gender</MenuItem>
                                {genderOptions.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    <Box mb={3}>
                        <Box className="form-section">
                            <Typography className="form-label">
                                Banner Image <span className="required">*</span>
                            </Typography>
                            <Typography className="form-hint">
                                Select a banner image (JPG, PNG, WEBP - Max 5MB)
                            </Typography>
                            <FileUploader
                                onFileSelect={handleFileSelect}
                                loading={isPending}
                                height={300}
                            />
                        </Box>
                    </Box>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert severity="error" icon={<ErrorIcon />} className="alert error">
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert severity="success" icon={<CheckIcon />} className="alert success">
                                    {success}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box className="action-buttons">
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={isPending || !image || !title.trim() || !occasion || !gender}
                            startIcon={isPending ? <CircularProgress size={24} /> : <AddIcon />}
                            className="btn primary"
                        >
                            {isPending ? 'Uploading...' : 'Upload Banner'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddOccasionBanner;