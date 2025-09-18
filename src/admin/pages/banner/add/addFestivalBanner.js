import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useUploadFestivalBannerMutation } from '../../../hooks/banners/FestivalBanner/useFestivalBanner';
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
import './AddFestivalBanner.css';

const AddFestivalBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [itemName, setItemName] = useState('');
    const [subItemName, setSubItemName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useUploadFestivalBannerMutation();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const itemNameOptions = [
        'DIWALI',
        'EID',
        'CHRISTMAS',
        'HOL serviceI',
        'RAKSHA_BANDHAN',
        'NAVRATRI',
        'ONAM'
    ];

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

        if (!itemName) {
            setError('Please select a festival.');
            return;
        }

        const payload = {
            image,
            title,
            subtitle: subtitle || null,
            item_name: itemName,
            sub_item_name: subItemName || null
        };

        mutate(payload, {
            onSuccess: () => {
                setSuccess('Festival Banner uploaded successfully!');
                setImage(null);
                setTitle('');
                setSubtitle('');
                setItemName('');
                setSubItemName('');
                setTimeout(() => setSuccess(null), 3000);
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload festival banner.');
            }
        });
    };

    return (
        <div className={`add-festival-banner-container ${themeMode}`}>
            <Card className="add-festival-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Add New Festival Banner
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Upload a new festival banner with title and festival selection
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
                                Festival <span className="required">*</span>
                            </Typography>
                            <TextField
                                select
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                            >
                                <MenuItem value="">Select a festival</MenuItem>
                                {itemNameOptions.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Typography className="form-label" mt={2}>
                                Sub Item Name (optional)
                            </Typography>
                            <TextField
                                placeholder="Enter sub item name"
                                value={subItemName}
                                onChange={(e) => setSubItemName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
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
                            disabled={isPending || !image || !title.trim() || !itemName}
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

export default AddFestivalBanner;