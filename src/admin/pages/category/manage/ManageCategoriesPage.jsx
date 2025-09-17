// src/pages/ManageCategoriesPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    Divider,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    background: theme.palette?.background?.paper || '#ffffff',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette?.divider || 'rgba(0, 0, 0, 0.12)'}`,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        borderRadius: '8px',
    },
}));

const ModernButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '10px 20px',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(135deg, #eba748 0%, #e09a3a 100%)',
    color: theme.palette.common.white,
    '&:hover': {
        transform: 'translateY(-1px)',
        background: 'linear-gradient(135deg, #e09a3a 0%, #d48a2c 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    '&:disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));

const EditableField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        fontSize: '0.875rem',
        backgroundColor: theme.palette?.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#eba748',
            borderWidth: '2px',
        },
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
    },
}));

const SectionBadge = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    backgroundColor: theme.palette?.primary?.light || '#eba748',
    color: theme.palette?.primary?.contrastText || '#fff',
    borderRadius: '6px',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
    },
}));

const ResponsiveTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette?.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)',
    },
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '16px',
        borderBottom: `1px solid ${theme.palette?.divider || 'rgba(0, 0, 0, 0.12)'}`,
        padding: '8px',
    },
}));

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
    padding: '12px',
    borderBottom: 'none',
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        '&::before': {
            content: 'attr(data-label)',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: theme.palette?.text?.secondary || 'rgba(0, 0, 0, 0.6)',
            width: '40%',
        },
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
        padding: '6px 12px',
    },
}));

const UploadArea = styled(Box)(({ theme }) => ({
    borderRadius: '8px',
    border: `2px dashed ${theme.palette?.divider || 'rgba(235, 167, 72, 0.3)'}`,
    background: theme.palette?.background?.default || '#f8f9fa',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#eba748',
        backgroundColor: 'rgba(235, 167, 72, 0.05)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '0.5rem',
    },
}));

const ManageCategoriesPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
        name: '',
        keyName: '',
        keyValue: '',
        images: [], // Support up to two images
    });
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const baseUrl = "https://app.bmgjewellers.com";

    // Start editing an item
    const startEditing = (item, sectionLabel) => {
        setEditingItem({ ...item, sectionLabel });

        setFormData({
            id: item.id,
            label: sectionLabel,
            // Display fields (title & subtitle)
            name: item.name || "",     

            // Key fields
            keyName: item.keyName || "",  // e.g. "itemName"
            keyValue: item.keyValue || "",// e.g. "rings"

            // Images
            images: item.image ? [item.image] : [],
        });

        setFormError(null);
        setFormSuccess(null);
    };



    // Cancel editing
    const cancelEditing = () => {
        setEditingItem(null);
        setFormData({ id: null, name: '', label: '', keyName: '', keyValue: '', images: [] });
        setFormError(null);
        setFormSuccess(null);
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value} = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError(null);
    };
    // Handle File Change
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

    // Remove an image
    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Handle Save
    const handleSave = (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const { id,label, name,  keyName, keyValue, images } = formData;
        console.log(formData ,'formData')

        if (!id || !name?.trim() ||  !keyName?.trim() || !keyValue?.trim()) {
            setFormError('ID, Name,  Key Name, and Key Value are required.');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('id', id);
        formDataToSend.append('label',label);

        // Backend expects this mapping
        formDataToSend.append('title', keyName.trim());    // keyName
        formDataToSend.append('subtitle', keyValue.trim());  // keyValue
        formDataToSend.append('name', name.trim());  

        if (images?.length) {
            images.forEach((image) => {
                if (image instanceof File) {
                    formDataToSend.append('image', image);
                }
            });
        }

        updateMenuItem(formDataToSend, {
            onSuccess: (data) => {
                setFormSuccess(data.message || 'Category updated successfully!');
                setTimeout(() => {
                    setEditingItem(null);
                    setFormSuccess(null);
                }, 1500);
            },
            onError: (err) => {
                setFormError(err.response?.data?.error || 'Failed to update category.');
            },
        });
    };


    // Open delete confirmation dialog
    const openDeleteDialog = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    // Close delete confirmation dialog
    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    // Handle Delete
    const handleDelete = () => {
        if (itemToDelete) {
            deleteMenuItem(
                itemToDelete.id ,
                {
                    onSuccess: () => {
                        closeDeleteDialog();
                    },
                    onError: (err) => {
                        setFormError(err.response?.data?.error || 'Failed to delete category.');
                        closeDeleteDialog();
                    },
                }
            );
        }
    };

    // Filter items based on search term
    const filteredSections = menuSections.map((section) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keyValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                section.label.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter((section) => section.items.length > 0);

    return (
        <Box
            p={isSmallScreen ? 2 : 3}
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100vh',
            }}
        >
            <ModernCard sx={{ maxWidth: 1400, width: '100%', mx: 'auto' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Header Section */}
                    <Box
                        display="flex"
                        flexDirection={isMobile ? 'column' : 'row'}
                        justifyContent="space-between"
                        alignItems={isMobile ? 'flex-start' : 'center'}
                        mb={3}
                        gap={2}
                    >
                        <Typography
                            variant={isSmallScreen ? 'h5' : 'h4'}
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                background: 'linear-gradient(135deg, #1E1E2C 0%, #eba748 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Manage Categories
                        </Typography>
                        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} width={isMobile ? '100%' : 'auto'}>
                            <TextField
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{
                                    width: isMobile ? '100%' : 300,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: theme.palette.background.paper,
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <ModernButton
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/category/add')}
                                sx={{ minWidth: isMobile ? '100%' : 'auto' }}
                            >
                                {isMobile ? 'Add' : 'Add New Category'}
                            </ModernButton>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Categories Table */}
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" my={5}>
                            <CircularProgress sx={{ color: '#eba748' }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ borderRadius: '8px', mb: 3 }}>
                            Failed to load categories: {error.message}
                        </Alert>
                    ) : filteredSections.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
                            <Table aria-label="categories table">
                                <TableHead sx={{ backgroundColor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900' }}>
                                    <TableRow>
                                        {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>}
                                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                     
                                        {!isMobile && (
                                            <>
                                                <TableCell sx={{ fontWeight: 600 }}>Key Name</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Key Value</TableCell>
                                            </>
                                        )}
                                        <TableCell sx={{ fontWeight: 600 }}>Images</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSections.map((section) =>
                                        section.items.map((item) => (
                                            <ResponsiveTableRow key={`${section.label}-${item.keyValue}`}>
                                                {editingItem && editingItem.id === item.id ? (
                                                    <EditableField
                                                        name="label"
                                                        value={formData.label}
                                                        onChange={handleInputChange}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter Label name"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" fontWeight={500}>
                                                            <SectionBadge label={section.label} size="small" />
                                                    </Typography>
                                                )}
                                              
                                                <ResponsiveTableCell data-label="Name">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <EditableField
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Enter name"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {item.name}
                                                        </Typography>
                                                    )}
                                                </ResponsiveTableCell>
                                           
                                                {!isMobile && (
                                                    <>
                                                        <ResponsiveTableCell data-label="Key Name">
                                                            {editingItem && editingItem.id === item.id ? (
                                                                <EditableField
                                                                    name="keyName"
                                                                    value={formData.keyName}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    fullWidth
                                                                    placeholder="Enter key name"
                                                                />
                                                            ) : (
                                                                <Typography variant="body2">{item.keyName}</Typography>
                                                            )}
                                                        </ResponsiveTableCell>
                                                        <ResponsiveTableCell data-label="Key Value">
                                                            {editingItem && editingItem.id === item.id ? (
                                                                <EditableField
                                                                    name="keyValue"
                                                                    value={formData.keyValue}
                                                                    onChange={handleInputChange}
                                                                    size="small"
                                                                    fullWidth
                                                                    placeholder="Enter key value"
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label={item.keyValue}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ borderColor: '#eba748', color: '#eba748' }}
                                                                />
                                                            )}
                                                        </ResponsiveTableCell>
                                                    </>
                                                )}
                                                <ResponsiveTableCell data-label="Images">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <Box>
                                                            <UploadArea
                                                                onClick={() => document.getElementById(`fileInput-${item.id}`).click()}
                                                                sx={{ mb: 1 }}
                                                            >
                                                                <input
                                                                    id={`fileInput-${item.id}`}
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/webp"
                                                                    multiple
                                                                    onChange={handleFileChange}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <UploadIcon sx={{ fontSize: 24, color: '#eba748', mb: 1 }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formData.images.length > 0 ? `${formData.images.length} image(s) selected` : 'Click to upload images'}
                                                                </Typography>
                                                            </UploadArea>
                                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                                {formData.images.map((image, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        label={image instanceof File ? image.name : 'Existing Image'}
                                                                        onDelete={() => removeImage(index)}
                                                                        sx={{ backgroundColor: 'rgba(235, 167, 72, 0.1)', color: '#eba748' }}
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
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                        border: `1px solid ${theme.palette.divider}`,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        borderRadius: '4px',
                                                                        backgroundColor: 'grey.100',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: `1px dashed ${theme.palette.divider}`,
                                                                    }}
                                                                >
                                                                    <ImageIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell data-label="Actions">
                                                    {editingItem && editingItem.id === item.id ? (
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="Save">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleSave}
                                                                    disabled={isUpdating}
                                                                    sx={{ color: '#eba748' }}
                                                                >
                                                                    {isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={cancelEditing}
                                                                    disabled={isUpdating}
                                                                    sx={{ color: 'grey.600' }}
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
                                                                    sx={{ color: '#eba748' }}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => openDeleteDialog(item)}
                                                                    sx={{ color: '#dc3545' }}
                                                                    disabled={isDeleting}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </ResponsiveTableCell>
                                            </ResponsiveTableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box textAlign="center" py={6}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {searchTerm ? 'No categories match your search' : 'No categories found'}
                            </Typography>
                            {searchTerm && (
                                <Button onClick={() => setSearchTerm('')} sx={{ mt: 1, color: '#eba748' }}>
                                    Clear search
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Status Messages */}
                    <AnimatePresence>
                        {(formError || formSuccess) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ marginTop: 16 }}
                            >
                                {formError && (
                                    <Alert severity="error" onClose={() => setFormError(null)} sx={{ borderRadius: '8px' }}>
                                        {formError}
                                    </Alert>
                                )}
                                {formSuccess && (
                                    <Alert severity="success" onClose={() => setFormSuccess(null)} sx={{ borderRadius: '8px' }}>
                                        {formSuccess}
                                    </Alert>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={closeDeleteDialog}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{ sx: { borderRadius: '12px' } }}
                    >
                        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete the category "{itemToDelete?.name}"? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDeleteDialog} sx={{ color: 'grey.600' }}>
                                Cancel
                            </Button>
                            <ModernButton
                                onClick={handleDelete}
                                disabled={isDeleting}
                                startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </ModernButton>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default ManageCategoriesPage;

