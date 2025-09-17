import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBreadCrumbUploadMutation } from '../../../hooks/banners/breadcrumbBanner/useBreadCrumbBanner';
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
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddBreadCrumbBanner.css';

const AddBreadCrumbBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubTitle] = useState('');
    const [itemname, setItemName] = useState('');
    const [subItemName, setSubItemName] = useState('');
    const [gender, setGender] = useState('');
    const [occasion, setOccasion] = useState('');
    const [pages, setPages] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useBreadCrumbUploadMutation();

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
            setError('Please select an image file');
            return;
        }
        if (!title.trim() || !subtitle.trim()) {
            setError('Please enter both title and subtitle');
            return;
        }

        mutate(
            { image, title, subtitle, itemname, subItemName, gender, occasion, pages },
            {
                onSuccess: () => {
                    setSuccess('Banner uploaded successfully!');
                    setImage(null);
                    setTitle('');
                    setSubTitle('');
                    setItemName('');
                    setSubItemName('');
                    setGender('');
                    setOccasion('');
                    setPages('');
                },
                onError: (err) => {
                    setError(err.message || 'Failed to upload banner');
                },
            }
        );
    };

    const resetForm = () => {
        setImage(null);
        setTitle('');
        setSubTitle('');
        setItemName('');
        setSubItemName('');
        setGender('');
        setOccasion('');
        setPages('');
        setError(null);
        setSuccess(null);
    };

    return (
        <div className={`add-breadcrumb-banner-container ${themeMode}`}>
            <Card className="add-breadcrumb-banner-card">
                <CardContent>
                    <Box className="header-section" textAlign="center" mb={3}>
                        <Typography className="header-title">
                            Add New Breadcrumb Banner
                        </Typography>
                        <Typography className="header-subtitle">
                            Upload a breadcrumb banner image with details for your website
                        </Typography>
                    </Box>

                    <Box className="form-section" mb={3}>
                        <Typography variant="body2" className="form-label">
                            <AddIcon className="form-icon" />
                            Banner Title <span className="required">*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter banner title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className="form-input"
                            disabled={isPending}
                        />

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Banner Subtitle <span className="required">*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter banner subtitle"
                            value={subtitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className="form-input"
                            disabled={isPending}
                        />

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Item Category
                        </Typography>
                        <TextField
                            select
                            value={itemname}
                            onChange={(e) => setItemName(e.target.value)}
                            variant="outlined"
                            fullWidth
                            SelectProps={{ native: true }}
                            className="form-input"
                            disabled={isPending}
                        >
                            <option value="">Select an item category</option>
                            <option value="GIFT_IDEAS">Gift Ideas</option>
                            <option value="EARRINGS">Earrings</option>
                            <option value="NECKLACES_AND_SETS">Necklaces & Sets</option>
                            <option value="BANGLES_AND_BRACELETS">Bangles & Bracelets</option>
                            <option value="ANKLES_AND_TOE_RINGS">Ankles & Toe Rings</option>
                            <option value="PENDENTS_AND_CHAINS">Pendants & Chains</option>
                            <option value="MAANG_TIKKA_AND_HAIR_ACCESS">Maang Tikka & Hair Accessories</option>
                            <option value="OFFER">Offer</option>
                        </TextField>

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Sub Item Name
                        </Typography>
                        <TextField
                            placeholder="Enter sub item name"
                            value={subItemName}
                            onChange={(e) => setSubItemName(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className="form-input"
                            disabled={isPending}
                        />

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Gender
                        </Typography>
                        <TextField
                            select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            variant="outlined"
                            fullWidth
                            SelectProps={{ native: true }}
                            className="form-input"
                            disabled={isPending}
                        >
                            <option value="">Select gender</option>
                            <option value="MEN">Men</option>
                            <option value="WOMEN">Women</option>
                            <option value="KIDS">Kids</option>
                        </TextField>

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Occasion
                        </Typography>
                        <TextField
                            placeholder="Enter occasion"
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className="form-input"
                            disabled={isPending}
                        />

                        <Typography variant="body2" className="form-label" mt={2}>
                            <AddIcon className="form-icon" />
                            Page
                        </Typography>
                        <TextField
                            placeholder="Enter page name"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className="form-input"
                            disabled={isPending}
                        />
                    </Box>

                    <Box className="file-upload-section" mb={3}>
                        <Typography variant="body2" className="form-label">
                            <UploadIcon className="form-icon" />
                            Banner Image <span className="required">*</span>
                        </Typography>
                        <Typography variant="body2" className="form-hint">
                            Select a banner image (JPG, PNG, WEBP - Max 5MB)
                        </Typography>
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            loading={isPending}
                            height={300}
                        />
                    </Box>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert
                                    severity="error"
                                    icon={<ErrorIcon />}
                                    className="alert error"
                                >
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
                                <Alert
                                    severity="success"
                                    icon={<CheckIcon />}
                                    className="alert success"
                                >
                                    {success}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box className="action-buttons" mt={4}>
                        <Button
                            variant="outlined"
                            onClick={resetForm}
                            disabled={isPending}
                            className="btn secondary"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isPending || !image || !title.trim() || !subtitle.trim()}
                            startIcon={isPending ? <CircularProgress size={20} /> : <AddIcon />}
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

export default AddBreadCrumbBanner;