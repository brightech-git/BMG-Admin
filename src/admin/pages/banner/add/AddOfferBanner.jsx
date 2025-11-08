import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useUploadOfferBannerMutation } from '../../../hooks/banners/offerBanner/useUploadOfferBanner';
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
import './AddOfferBanner.css';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import { formatLabel } from '../../../../utils/formating/stringUtils';

const AddOfferBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [itemName, setItemName] = useState('');
    const [subItemName, setSubItemName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useUploadOfferBannerMutation();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const { items: itemNames } = useItemNames();

    // Map item category options
    const itemNameOptions = itemNames.map(item => item.ITEMCTRNAME);

    // Find the selected item object based on selected name
    const selectedItem = itemNames.find(item => item.ITEMCTRNAME === itemName);

    // Fetch sub-items based on selected item's ITEMCTRID
    const { items: subItemData, loading: loadingSub } = useItemNames(selectedItem?.ITEMCTRID || null);

    // Get sub-items array safely
    const subItemNameOptions = subItemData?.[0]?.subitems || [];

    const handleFileSelect = (file, error) => {
        setImage(file);
        setError(error);
        setSuccess(null);
    };



    console.log(title,subtitle,itemName,subItemName ,'data')
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
            setError('Please select an item category.');
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
                setSuccess('Offer Banner uploaded successfully!');
                setImage(null);
                setTitle('');
                setSubtitle('');
                setItemName('');
                setSubItemName('');
                setTimeout(() => setSuccess(null), 3000);
            },
            onError: (err) => {
                setError(err.message || 'Failed to upload offer banner.');
            }
        });
    };

    return (
        <div className={`add-offer-banner-container ${themeMode}`}>
            <Card className="add-offer-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                            Add New Offer Banner
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Upload a new offer banner with title and item category
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
                                Item Category <span className="required">*</span>
                            </Typography>

                            <TextField
                                select
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                SelectProps={{ native: true }} // use native <select> with <option>
                            >
                                {/* Placeholder option */}
                                <option value="">Select an item category</option>

                                {itemNameOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {formatLabel(opt)}
                                    </option>
                                ))}
                            </TextField>

                            {/* Sub Item */}
                            <Typography className="form-label" mt={2}>
                                Sub Item Name (optional)
                            </Typography>
                            <TextField
                                select
                                value={subItemName}
                                onChange={(e) => setSubItemName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                className="form-input"
                                SelectProps={{ native: true }}
                                disabled={!itemName || loadingSub} // disable until item selected or loading
                            >
                                <option value="">Select a sub item</option>
                                {subItemNameOptions.map((sub) => (
                                    <option key={sub.SUBITEMID} value={sub.SUBITEMNAME}>
                                        {formatLabel(sub.SUBITEMNAME)}
                                    </option>
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

export default AddOfferBanner;