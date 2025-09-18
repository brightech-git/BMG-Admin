import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useMenu, useUpdateMenuItem, useDeleteMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageCategoriesPage.css';

const ManageCategoriesPage = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const { data, isLoading, error } = useMenu();
    const menuSections = data?.menuSections || [];
    const { mutate: updateMenuItem, isLoading: isUpdating } = useUpdateMenuItem();
    const { mutate: deleteMenuItem, isLoading: isDeleting } = useDeleteMenuItem();
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id: null,
        label: '',
        name: '',
        keyName: '',
        keyValue: '',
        images: []
    });
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const baseUrl = "https://app.bmgjewellers.com";

    const startEditing = (item, sectionLabel) => {
        setEditingItem({ ...item, sectionLabel });
        setFormData({
            id: item.id,
            label: sectionLabel || '',
            name: item.name || '',
            keyName: item.keyName || '',
            keyValue: item.keyValue || '',
            images: item.image ? [item.image] : []
        });
        setFormError(null);
        setFormSuccess(null);
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setFormData({ id: null, label: '', name: '', keyName: '', keyValue: '', images: [] });
        setFormError(null);
        setFormSuccess(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const newImages = [];

        if (files.length > 2) {
            setFormError('You can upload up to 2 images.');
            return;
        }

        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                setFormError('Only JPG, PNG, and WEBP formats are allowed.');
                return;
            }
            if (file.size > maxSize) {
                setFormError('Each file must be less than 5MB.');
                return;
            }
            newImages.push(file);
        }

        setFormData((prev) => ({ ...prev, images: newImages }));
        setFormError(null);
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const { id, label, name, keyName, keyValue, images } = formData;

        if (!id || !label?.trim() || !name?.trim() || !keyName?.trim() || !keyValue?.trim()) {
            setFormError('Section Label, Name, Key Name, and Key Value are required.');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('id', id);
        formDataToSend.append('label', label.trim());
        formDataToSend.append('name', name.trim());
        formDataToSend.append('title', keyName.trim());
        formDataToSend.append('subtitle', keyValue.trim());
        if (images?.length) {
            images.forEach((image) => {
                if (image instanceof File) {
                    formDataToSend.append('image', image);
                }
            });
        }

        updateMenuItem(formDataToSend, {
            onSuccess: () => {
                setFormSuccess('Category updated successfully!');
                setTimeout(() => {
                    setEditingItem(null);
                    setFormData({ id: null, label: '', name: '', keyName: '', keyValue: '', images: [] });
                    setFormSuccess(null);
                }, 3000);
            },
            onError: (err) => {
                setFormError(err.message || 'Failed to update category.');
            }
        });
    };

    const openDeleteDialog = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleDelete = () => {
        if (itemToDelete) {
            deleteMenuItem(itemToDelete.id, {
                onSuccess: () => {
                    closeDeleteDialog();
                },
                onError: (err) => {
                    setFormError(err.message || 'Failed to delete category.');
                    closeDeleteDialog();
                }
            });
        }
    };

    const filteredSections = menuSections.map((section) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                section.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter((section) => section.items.length > 0);

    return (
        <div className={`manage-categories-container ${themeMode}`}>
            <Card className="manage-categories-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} gap={2}>
                            <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                                Manage Categories
                            </Typography>
                            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} width={isMobile ? '100%' : 'auto'}>
                                <TextField
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    className="search-input"
                                    InputProps={{
                                        startAdornment: (
                                           
                                                <SearchIcon />
                                         
                                        )
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/category/add')}
                                    className="btn primary"
                                >
                                    {isMobile ? 'Add' : 'Add New Category'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" my={5}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" className="alert error">
                            Failed to load categories: {error.message}
                        </Alert>
                    ) : filteredSections.length > 0 ? (
                        <TableContainer component={Paper} className="table-container">
                            <Table aria-label="categories table">
                                <TableHead className="table-head">
                                    <TableRow>
                                        {!isMobile && <TableCell className='table-head'>Section</TableCell>}
                                                <TableCell className='table-head'>Name</TableCell>
                                        {!isMobile && (
                                            <>
                                                        <TableCell className='table-head'>Key Name</TableCell>
                                                        <TableCell className='table-head'>Key Value</TableCell>
                                            </>
                                        )}
                                                <TableCell className='table-head'>Images</TableCell>
                                                <TableCell className='table-head'>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSections.map((section) =>
                                        section.items.map((item) => (
                                            <TableRow key={`${section.label}-${item.keyValue}`} className="table-row">
                                                {!isMobile && (
                                                    <TableCell className="table-cell" data-label="Section">
                                                        {editingItem && editingItem.id === item.id ? (
                                                            <TextField
                                                                name="label"
                                                                value={formData.label}
                                                                onChange={handleInputChange}
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Enter section label"
                                                                className="form-input"
                                                            />
                                                        ) : (
                                                            <Chip label={section.label} size="small" className="section-chip" />
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell className="table-cell" data-label="Name">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <TextField
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Enter name"
                                                            className="form-input"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" className='section-name'>{item.name}</Typography>
                                                    )}
                                                </TableCell>
                                                {!isMobile && (
                                                    <>
                                                        <TableCell className="table-cell" data-label="Key Name">
                                                            {editingItem && editingItem.id === item.id ? (
                                                                <TextField
                                                                    name="keyName"
                                                                    value={formData.keyName}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    fullWidth
                                                                    placeholder="Enter key name"
                                                                    className="form-input"
                                                                />
                                                            ) : (
                                                                    <Typography variant="body2" className='section-keyname'>{item.keyName}</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="table-cell" data-label="Key Value">
                                                            {editingItem && editingItem.id === item.id ? (
                                                                <TextField
                                                                    name="keyValue"
                                                                    value={formData.keyValue}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    fullWidth
                                                                    placeholder="Enter key value"
                                                                    className="form-input"
                                                                />
                                                            ) : (
                                                                    <Chip label={item.keyValue} size="small" className="chip"  />
                                                            )}
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className="table-cell" data-label="Images">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <Box>
                                                            <Box
                                                                className="upload-area"
                                                                onClick={() => document.getElementById(`fileInput-${item.id}`).click()}
                                                            >
                                                                <input
                                                                    id={`fileInput-${item.id}`}
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/webp"
                                                                    multiple
                                                                    onChange={handleFileChange}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <UploadIcon />
                                                                <Typography variant="body2">
                                                                    {formData.images.length > 0 ? `${formData.images.length} image(s) selected` : 'Click to upload images'}
                                                                </Typography>
                                                            </Box>
                                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                                {formData.images.map((image, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        label={image instanceof File ? image.name : 'Existing Image'}
                                                                        onDelete={() => removeImage(index)}
                                                                        className="image-chip"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    ) : (
                                                        <Box display="flex" gap={1}>
                                                            {item.image ? (
                                                                <Box
                                                                    component="img"
                                                                    src={`${baseUrl}${item.image}`}
                                                                    alt={item.name}
                                                                    className="thumbnail"
                                                                />
                                                            ) : (
                                                                <Box className="no-image">
                                                                    <ImageIcon />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell className="table-cell" data-label="Actions">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="Save">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleSave}
                                                                    disabled={isUpdating}
                                                                    className="action-icon save"
                                                                >
                                                                    {isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={cancelEditing}
                                                                    disabled={isUpdating}
                                                                    className="action-icon cancel"
                                                                >
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => startEditing(item, section.label)}
                                                                    className="action-icon edit"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => openDeleteDialog(item)}
                                                                    disabled={isDeleting}
                                                                    className="action-icon delete"
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box textAlign="center" py={6}>
                            <Typography variant="body1" className="empty-text">
                                {searchTerm ? 'No categories match your search' : 'No categories found'}
                            </Typography>
                            {searchTerm && (
                                <Button onClick={() => setSearchTerm('')} className="btn clear">
                                    Clear search
                                </Button>
                            )}
                        </Box>
                    )}

                    <AnimatePresence>
                        {(formError || formSuccess) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {formError && (
                                    <Alert severity="error" onClose={() => setFormError(null)} className="alert error">
                                        {formError}
                                    </Alert>
                                )}
                                {formSuccess && (
                                    <Alert severity="success" onClose={() => setFormSuccess(null)} className="alert success">
                                        {formSuccess}
                                    </Alert>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Dialog
                        open={deleteDialogOpen}
                        onClose={closeDeleteDialog}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{ className: 'dialog' }}
                    >
                        <DialogTitle className="dialog-title">Confirm Delete</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete the category "{itemToDelete?.name}"? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDeleteDialog} className="btn secondary">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                                className="btn delete"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageCategoriesPage;