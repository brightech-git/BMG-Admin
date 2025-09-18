
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
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
    CloudUpload as UploadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddMenuItemPage.css';

const AddMenuItemPage = () => {
    const { themeMode } = useContext(MyContext);
    const [formData, setFormData] = useState({
        label: '',
        name: '',
        title: '',
        subtitle: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { mutate: uploadMenuItem, isLoading } = useUploadMenuItem();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleFileChange = (e) => {
        setError(null);
        setSuccess(null);

        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!file) return;

        if (!validTypes.includes(file.type)) {
            setError('Only JPG, PNG, and WEBP formats are allowed.');
            return;
        }

        if (file.size > maxSize) {
            setError('File must be less than 5MB.');
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { label, name, title, subtitle } = formData;

        if (!label.trim() || !name.trim() || !title.trim() || !subtitle.trim()) {
            setError('Section Label, Name, Key Name, and Key Value are required.');
            return;
        }

        if (!/^[a-zA-Z0-9\s]+$/.test(label) || !/^[a-zA-Z0-9\s]+$/.test(name)) {
            setError('Section Label and Name can only contain letters, numbers, and spaces.');
            return;
        }

        if (!selectedFile) {
            setError('An image is required.');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('label', label.trim());
        formDataToSend.append('name', name.trim());
        formDataToSend.append('title', title.trim());
        formDataToSend.append('subtitle', subtitle.trim());
        formDataToSend.append('image', selectedFile);

        uploadMenuItem(formDataToSend, {
            onSuccess: (data) => {
                setSuccess(data.message || 'Menu item uploaded successfully!');
                setTimeout(() => {
                    setFormData({ label: '', name: '', title: '', subtitle: '' });
                    setSelectedFile(null);
                    document.getElementById('fileInput').value = '';
                    setSuccess(null);
                }, 3000);
            },
            onError: (err) => {
                setError(err.response?.data?.error || 'Failed to upload menu item.');
            }
        });
    };

    return (
        <div className={`add-menu-item-container ${themeMode}`}>
            <Card className="add-menu-item-card">
                <CardContent>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" className="header-title">
                            Add New Menu Item
                        </Typography>
                        <Typography variant="body1" className="header-subtitle">
                            Create a new menu item for the header navigation
                        </Typography>
                    </Box>

                    <Box mb={4}>
                        <Box className="form-section">
                          
                            <Box display="grid" gap={2} className="form-grid">
                                <TextField
                                    name="label"
                                    placeholder="Enter section label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Section Label"
                                    className="form-inputs"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AddIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    name="name"
                                    placeholder="Enter name (e.g., itemName, gender)"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Name"
                                    className="form-inputs"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AddIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    name="title"
                                    placeholder="Enter key name"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Key Name"
                                    className="form-inputs"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AddIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    name="subtitle"
                                    placeholder="Enter key value"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    fullWidth
                                    label="Key Value"
                                    className="form-inputs"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AddIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" className="form-caption">
                                Only letters, numbers, and spaces are allowed
                            </Typography>
                        </Box>
                    </Box>

                    <Box mb={4}>
                        <Box className="form-section">
                            <Typography variant="body2" className="section-title">
                                <UploadIcon /> Menu Item Image <span className="required">*</span>
                            </Typography>
                            <Typography variant="body2" className="form-caption">
                                Select an image (JPG, PNG, WEBP - Max 5MB)
                            </Typography>
                            <Box
                                className="upload-area"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <UploadIcon />
                                <Typography variant="h6" className="upload-title">
                                    {selectedFile ? selectedFile.name : 'Click or drag image here'}
                                </Typography>
                                <Typography variant="body2" className="upload-subtitle">
                                    Select JPG/PNG/WEBP file (Max 5MB)
                                </Typography>
                                {selectedFile && (
                                    <Chip
                                        label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                                        onDelete={removeFile}
                                        className="image-chip"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <AnimatePresence>
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error && (
                                    <Alert
                                        severity="error"
                                        icon={<ErrorIcon />}
                                        onClose={() => setError(null)}
                                        className="alert error"
                                    >
                                        {error}
                                    </Alert>
                                )}
                                {success && (
                                    <Alert
                                        severity="success"
                                        icon={<CheckIcon />}
                                        onClose={() => setSuccess(null)}
                                        className="alert success"
                                    >
                                        {success}
                                    </Alert>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box display="flex" justifyContent="center" gap={2} mt={4}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setFormData({ label: '', name: '', title: '', subtitle: '' });
                                setSelectedFile(null);
                                document.getElementById('fileInput').value = '';
                            }}
                            disabled={isLoading}
                            className="btn secondary"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.label.trim() || !formData.name.trim() || !formData.title.trim() || !formData.subtitle.trim() || !selectedFile}
                            startIcon={isLoading ? <CircularProgress size={24} /> : <AddIcon />}
                            className="btn primary"
                        >
                            {isLoading ? 'Uploading...' : 'Upload Menu Item'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddMenuItemPage;