import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useCategoryUploadMutation } from '../../../hooks/banners/categoryBanner/useCategoryBanner';
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
    MenuItem,
    Select,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddCategoryBanner.css';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import BackdropProgress from '../../../components/backDrop/BackdropProgress';

const AddCategoryBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [itemName, setItemName] = useState('');
    const [subItemName, setSubItemName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useCategoryUploadMutation();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fetch all items
    const { items: allItems, loading: loadingItems } = useItemNames(null);

    // Fetch subitems based on selected item ID
    const { items: subItem, loading: loadingSub } = useItemNames(itemName || null);
    const subItems = subItem?.[0]?.subitems || [];

    const handleFileSelect = (file, error) => {
        setImage(file);
        setError(error);
        setSuccess(null);
    };

    const handleSubmit = (e) => {
        setOpenBackdrop(true);
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!image) return setError('Please select a valid image file (JPEG, PNG, WEBP, max 5MB).');
        if (!title.trim()) return setError('Please enter a title for the banner.');
        if (!itemName) return setError('Please select an item category.');

        const payload = {
            image,
            title,
            subtitle: subtitle || null,
            item_name: itemName,
            sub_item_name: subItemName || null,
        };
setProgress(10);
        mutate(payload, {
            onSuccess: () => {
                setProgress(100);
                setSuccess('Category Banner uploaded successfully!');
                setImage(null);
                setTitle('');
                setSubtitle('');
                setItemName('');
                setSubItemName('');


                setTimeout(() => {
                    setOpenBackdrop(false);
                    setProgress(0);
                    setSuccess(null);
                }, 1500);
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload category banner.');
            },
        });
    };

    return (
        <div className={`add-category-banner-container ${themeMode}`}>
            <Card className="add-category-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Add New Category Banner
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Upload a new category banner with title and item category
                        </Typography>
                    </Box>

                    <Box mb={3}>
                        <Box className="form-section">
                            {/* Banner Title */}
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

                            {/* Banner Subtitle */}
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

                            {/* Item Category */}
                            <Typography className="form-label" mt={2}>
                                Item Category <span className="required">*</span>
                            </Typography>
                            <Select
                                value={itemName}
                                onChange={(e) => {
                                    setItemName(e.target.value);
                                    setSubItemName('');
                                }}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                disabled={loadingItems}
                            >
                                <MenuItem value="">Select an item category</MenuItem>
                                {allItems?.map((opt) => (
                                    <MenuItem key={opt.ITEMCTRID} value={opt.ITEMCTRNAME}>
                                        {opt.ITEMCTRNAME}
                                    </MenuItem>
                                ))}
                            </Select>

                            {/* Sub Item */}
                            <Typography className="form-label" mt={2}>
                                Sub Item Name (optional)
                            </Typography>
                            <Select
                                value={subItemName}
                                onChange={(e) => setSubItemName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                disabled={!itemName || loadingSub}
                            >
                                <MenuItem value="">Select a sub item name</MenuItem>
                                {subItems.map((sub) => (
                                    <MenuItem key={sub.SUBITEMID} value={sub.SUBITEMNAME}>
                                        {sub.SUBITEMNAME}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>

                    {/* File Upload */}
                    <Box mb={3}>
                        <Box className="form-section">
                            <Typography className="form-label">
                                Banner Image <span className="required">*</span>
                            </Typography>
                            <Typography className="form-hint">
                                Select a banner image (JPG, PNG, WEBP - Max 5MB)
                            </Typography>
                            <FileUploader onFileSelect={handleFileSelect} loading={isPending} height={300} />
                        </Box>
                    </Box>

                    {/* Alerts */}
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

                    {/* Submit Button */}
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

export default AddCategoryBanner;
