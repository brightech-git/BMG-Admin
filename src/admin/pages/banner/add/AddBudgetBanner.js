
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
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
import { CloudUpload as UploadIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Add as AddIcon } from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddBudgetBanner.css';

const AddBudgetBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useBudgetBanner();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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

        if (!minPrice) {
            setError('Please enter a minimum price.');
            return;
        }

        if (!maxPrice) {
            setError('Please enter a maximum price.');
            return;
        }

        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (isNaN(min) || min < 0) {
            setError('Minimum price must be a positive number.');
            return;
        }

        if (isNaN(max) || max < 0) {
            setError('Maximum price must be a positive number.');
            return;
        }

        if (min >= max) {
            setError('Minimum price must be less than maximum price.');
            return;
        }

        const payload = {
            image,
            title,
            subtitle: subtitle || null,
            min_price: min,
            max_price: max
        };

        mutate(payload, {
            onSuccess: () => {
                setSuccess('Budget Banner uploaded successfully!');
                setImage(null);
                setTitle('');
                setSubtitle('');
                setMinPrice('');
                setMaxPrice('');
                setTimeout(() => setSuccess(null), 3000);
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload budget banner.');
            }
        });
    };

    return (
        <div className={`add-budget-banner-container ${themeMode}`}>
            <Card className="add-budget-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Add New Budget Banner
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Upload a new budget banner with title and price range
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
                                Minimum Price <span className="required">*</span>
                            </Typography>
                            <TextField
                                type="number"
                                placeholder="Enter minimum price"
                                value={minPrice}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setMinPrice(value);
                                    }
                                }}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                inputProps={{ min: 0, step: '0.01' }}
                            />

                            <Typography className="form-label" mt={2}>
                                Maximum Price <span className="required">*</span>
                            </Typography>
                            <TextField
                                type="number"
                                placeholder="Enter maximum price"
                                value={maxPrice}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setMaxPrice(value);
                                    }
                                }}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                inputProps={{ min: 0, step: '0.01' }}
                            />
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
                            disabled={isPending || !image || !title.trim() || !minPrice || !maxPrice}
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

export default AddBudgetBanner;