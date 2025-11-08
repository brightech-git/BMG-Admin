
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadBannerMutation } from '../../../hooks/banners/mainBanner/useUploadBannerMutation';
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
    Select,
    MenuItem
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddBanner.css';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';

const AddBanner = () => {
    const { themeMode } = useContext(MyContext);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubTitle] = useState('');
    const [itemname, setItemName] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate, isPending } = useUploadBannerMutation();
    const { attributes } = useEcomMarketingAttributes();

    const genderAttribute = attributes.find(attr => attr.description === "Gender");

    // Parse the valuesJson to an array
    const genderOptions = genderAttribute ? JSON.parse(genderAttribute.valuesJson) : [];

    const {items: itemNames} = useItemNames();
  

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
        if (!subtitle || !itemname || !gender) {
            setError('Please fill in all required fields');
            return;
        }
        if (!title.trim()) {
            setError('Please enter a title for your banner');
            return;
        }

        mutate(
            { image, title, subtitle, itemname, gender },
            {
                onSuccess: () => {
                    setSuccess('Banner uploaded successfully!');
                    
                    setImage(null);
                    setTitle('');
                    setSubTitle('');
                    setItemName('');
                    setGender('');
                    handleFileSelect(null, null);
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
        setGender('');
        setError(null);
        setSuccess(null);
    };

    return (
        <div className={`add-banner-container ${themeMode}`}>
            <Card className="add-banner-card">
                <CardContent>
                    <Box className="header-section" textAlign="center" mb={3}>
                        <Typography variant="h6" className="header-title">
                            Add New Banner
                        </Typography>
                        <Typography className="header-subtitle">
                            Upload a banner image with title for your website
                        </Typography>
                    </Box>

                    <Box className="form-section" mb={3}>
                        <Typography variant="body2" className="form-label">
                            
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
                           
                            Item Category <span className="required">*</span>
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
                            {itemNames.map((item) => (
                                <option key={item.ITEMCTRID} value={item.ITEMCTRNAME} style={{fontSize:'10px',fontWeight:'500'}}>
                                    {item.ITEMCTRNAME}
                                </option>
                            ))}
                        </TextField>

                        {/* // Inside your AddBanner component, replace the Gender section with: */}

                        <Typography variant="body2" className="form-label" mt={2}>
                            Gender <span className="required">*</span>
                        </Typography>

                        <Select
                            value={gender} // your state variable
                            onChange={(e) => setGender(e.target.value)}
                            displayEmpty
                            fullWidth
                            variant="outlined"
                            className="form-input"
                            disabled={isPending}
                        >
                            <MenuItem value="" disabled>
                                Select Gender
                            </MenuItem>
                            {genderOptions.map((option, idx) => (
                                <MenuItem key={idx} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>


                      
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
                            disabled={isPending || !image || !title.trim()}
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

export default AddBanner;