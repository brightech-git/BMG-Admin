import { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent,
    Modal, TextField, InputAdornment, Avatar, Badge, Snackbar,
    useMediaQuery, useTheme, Grid
} from '@mui/material';
import { styled } from '@mui/system';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {
    Delete as DeleteIcon, CloudUpload as CloudUploadIcon,
    Search as SearchIcon, Add as AddIcon, Error as ErrorIcon,
    CheckCircle as CheckCircleIcon, Edit as EditIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
    useCategoriesQuery, useDeleteCategoryImageMutation, useUpdateCategoryImageMutation
} from '../../../hooks/category/useCategories';

// Constants
const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Styled components matching EstimationProductsPage
const StyledTableContainer = styled(TableContainer)(() => ({
    borderRadius: '16px',
    overflow: 'auto',
    background: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    maxHeight: '60vh',
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
        '& .MuiTableCell-head': {
            color: '#FFFFFF !important',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none',
            padding: '16px 12px',
            textAlign: 'left',
        }
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(242, 159, 103, 0.04)',
        },
    },
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(30, 30, 44, 0.06)',
        padding: '12px 16px',
        textAlign: 'left',
    },
    '& .MuiTableCell-body': {
        padding: '16px',
    },
}));

const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3B8FF3 0%, #F29F67 50%, #34B1AA 100%)',
    },
}));

const SearchField = styled(TextField)(({ theme }) => ({
    width: '100%',
    maxWidth: 300,
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': { borderColor: 'rgba(30, 30, 44, 0.06)' },
        '&:hover fieldset': { borderColor: '#3B8FF3' },
        '&.Mui-focused fieldset': { borderColor: '#3B8FF3' },
    },
    [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 'fit-content',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.75, 1.5),
        fontSize: '0.75rem',
    },
}));

const ModalBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 700,
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 32px rgba(30, 30, 44, 0.12)',
    padding: theme.spacing(4),
    borderRadius: '16px',
    outline: 'none',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
        width: '95%',
        padding: theme.spacing(2),
    },
}));

const DropzoneBox = styled(Box)(({ theme, isDragActive }) => ({
    border: `2px dashed ${isDragActive ? '#3B8FF3' : 'rgba(30, 30, 44, 0.06)'}`,
    borderRadius: '12px',
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? 'rgba(59, 143, 243, 0.04)' : '#f8f9fa',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(59, 143, 243, 0.08)',
        borderColor: '#3B8FF3',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
}));

const ImagePreview = styled('img')(() => ({
    width: '100%',
    height: 'auto',
    maxHeight: 150,
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid rgba(30, 30, 44, 0.06)',
    boxShadow: '0 2px 8px rgba(30, 30, 44, 0.08)',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

const toastOptions = {
    position: 'top-right',
    top: 50,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progressStyle: { background: '#3B8FF3' },
    style: {
        borderRadius: '10px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 500,
    },
};

const ManageCategoriesPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('480px'));

    const [searchTerm, setSearchTerm] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const { data: categories, isLoading, error, refetch } = useCategoriesQuery();
    const deleteMutation = useDeleteCategoryImageMutation();
    const updateMutation = useUpdateCategoryImageMutation();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        multiple: false,
        maxSize: MAX_FILE_SIZE,
        onDrop: (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                const reasons = fileRejections
                    .map((rej) => rej.errors.map((err) => `${rej.file.name}: ${err.message}`).join(', '))
                    .join('; ');
                showError(`File rejected: ${reasons}`);
            } else {
                if (newImage) URL.revokeObjectURL(newImage.preview);
                const file = acceptedFiles[0];
                if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                    showError('Invalid file type. Please upload an image (PNG, JPG, JPEG, WebP).');
                    return;
                }
                setNewImage(
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                );
            }
        },
    });

    const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    };

    const showSuccess = (message) => {
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm || !categories) return categories || [];
        const lowerSearch = searchTerm.toLowerCase();
        return categories.filter((cat) =>
            cat.category_name.toLowerCase().includes(lowerSearch)
        );
    }, [categories, searchTerm]);

    useEffect(() => {
        return () => {
            if (newImage) URL.revokeObjectURL(newImage.preview);
        };
    }, [newImage]);

    const handleEdit = (category, imagePath) => {
        setSelectedCategory(category);
        setSelectedImagePath(imagePath);
        setEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (!newImage) {
            showError('Please select a new image');
            return;
        }
        updateMutation.mutate(
            {
                category: selectedCategory.category_name,
                oldImagePath: selectedImagePath,
                newImage,
            },
            {
                onSuccess: () => {
                    showSuccess('Image updated successfully!');
                    refetch();
                    setEditModalOpen(false);
                    setNewImage(null);
                },
                onError: (err) => {
                    showError(err.message || 'Failed to update image');
                },
            }
        );
    };

    const handleDelete = (category, imagePath) => {
        setDeleteTarget({ category, imagePath });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(
            { category: deleteTarget.category, imagePath: deleteTarget.imagePath },
            {
                onSuccess: (data) => {
                    showSuccess(data.message || 'Image deleted successfully!');
                    refetch();
                    setDeleteDialogOpen(false);
                    setDeleteTarget(null);
                },
                onError: (err) => {
                    showError(err.message || 'Failed to delete image');
                },
            }
        );
    };

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ borderRadius: '12px', backgroundColor: '#fff5f5', color: '#d32f2f' }}>
                    Failed to load categories. Please try again.
                </Alert>
                <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)' }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box p={isMobile ? 1 : 3} sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
            <ModernCard>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={3}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ color: '#1E1E2C', fontWeight: 700 }}>
                            Manage Categories
                        </Typography>
                        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                            <SearchField
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                            />
                            <ActionButton
                                variant="contained"
                                onClick={() => window.location.href = '/admin/category/add'}
                                startIcon={<AddIcon />}
                                sx={{ 
                                    borderRadius: '8px', 
                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                    fontWeight: 600 
                                }}
                            >
                                {isSmallScreen ? 'Add' : 'Add Category'}
                            </ActionButton>
                        </Stack>
                    </Box>

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Showing {filteredCategories.length} categories
                                </Typography>
                            </Box>
                            <StyledTableContainer>
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: '80px', width: '15%', fontWeight: 700 }}>ID</TableCell>
                                            <TableCell sx={{ minWidth: '200px', width: '35%', fontWeight: 700 }}>Category Name</TableCell>
                                            <TableCell sx={{ minWidth: '150px', width: '25%', fontWeight: 700 }}>Images</TableCell>
                                            <TableCell sx={{ minWidth: '120px', width: '25%', fontWeight: 700 }} align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category, index) => (
                                                <TableRow key={category.id || index} hover>
                                                    <TableCell sx={{ fontWeight: 600, color: '#3B8FF3', padding: '16px' }}>
                                                        {category.id}
                                                    </TableCell>
                                                    <TableCell sx={{ padding: '16px' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E1E2C', textTransform: 'uppercase' }}>
                                                            {category.category_name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ padding: '16px' }}>
                                                        <Box display="flex" gap={1} flexWrap="wrap">
                                                            {category.images.map((image, imgIndex) => (
                                                                <Tooltip key={imgIndex} title={`Image ${imgIndex + 1}`} arrow>
                                                                    <Badge
                                                                        badgeContent={imgIndex + 1}
                                                                        color="primary"
                                                                        overlap="circular"
                                                                        anchorOrigin={{
                                                                            vertical: 'top',
                                                                            horizontal: 'right',
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={`${BASE_IMAGE_URL}${image}`}
                                                                            alt={`${category.category_name} image ${imgIndex + 1}`}
                                                                            sx={{
                                                                                width: isMobile ? 40 : 56,
                                                                                height: isMobile ? 40 : 56,
                                                                                cursor: 'pointer',
                                                                                border: '1px solid rgba(30, 30, 44, 0.06)',
                                                                            }}
                                                                            onClick={() => window.open(`${BASE_IMAGE_URL}${image}`, '_blank')}
                                                                        />
                                                                    </Badge>
                                                                </Tooltip>
                                                            ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ padding: '16px' }}>
                                                        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                                                            {category.images.map((image, imgIndex) => (
                                                                <Box key={imgIndex} display="flex" gap={0.5}>
                                                                    <Tooltip title={`Edit image ${imgIndex + 1}`}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleEdit(category, image)}
                                                                            color="primary"
                                                                            sx={{ 
                                                                                borderRadius: '8px', 
                                                                                backgroundColor: 'rgba(59, 143, 243, 0.08)' 
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title={`Delete image ${imgIndex + 1}`}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleDelete(category.category_name, image)}
                                                                            disabled={deleteMutation.isLoading}
                                                                            color="error"
                                                                            sx={{ 
                                                                                borderRadius: '8px', 
                                                                                backgroundColor: 'rgba(244, 67, 54, 0.08)' 
                                                                            }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No categories found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>
                        </>
                    )}
                </CardContent>
            </ModernCard>

            {/* Edit Image Modal */}
            <Modal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setNewImage(null);
                }}
                aria-labelledby="edit-image-modal"
                aria-describedby="edit-category-image"
                keepMounted={false}
            >
                <ModalBox
                    component={motion.div}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Typography
                        id="edit-image-modal"
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: '#1E1E2C',
                            mb: 3,
                        }}
                    >
                        Update Image for {selectedCategory?.category_name}
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#3B8FF3' }}>
                                Current Image
                            </Typography>
                            <Box display="flex" justifyContent="center" mb={2}>
                                <ImagePreview
                                    src={`${BASE_IMAGE_URL}${selectedImagePath}`}
                                    alt="Current category image"
                                />
                            </Box>
                            <Chip
                                label="Current Image"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#F29F67' }}>
                                New Image
                            </Typography>
                            <DropzoneBox {...getRootProps()} isDragActive={isDragActive}>
                                <input {...getInputProps()} />
                                <CloudUploadIcon
                                    sx={{
                                        fontSize: 48,
                                        color: isDragActive ? '#3B8FF3' : '#6B7280',
                                        mb: 1,
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    color={isDragActive ? '#3B8FF3' : '#1E1E2C'}
                                    gutterBottom
                                    sx={{ fontWeight: 600 }}
                                >
                                    {isDragActive ? 'Drop the image here' : 'Drag & drop a new image, or click to select'}
                                </Typography>
                                <Typography variant="caption" color="#6B7280">
                                    Supported formats: PNG, JPG, JPEG, WebP (max 5MB)
                                </Typography>
                            </DropzoneBox>
                            {newImage && (
                                <Box mt={2}>
                                    <ImagePreview
                                        src={newImage.preview}
                                        alt={newImage.name}
                                    />
                                    <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="#6B7280">
                                            {newImage.name}
                                        </Typography>
                                        <Typography variant="caption" color="#6B7280">
                                            {(newImage.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label="New Image"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    <Box mt={4} display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                        <ActionButton
                            variant="outlined"
                            onClick={() => {
                                setEditModalOpen(false);
                                setNewImage(null);
                            }}
                            disabled={updateMutation.isLoading}
                            sx={{ 
                                borderRadius: '8px', 
                                color: '#6B7280', 
                                borderColor: '#6B7280',
                                fontWeight: 600 
                            }}
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={updateMutation.isLoading || !newImage}
                            startIcon={updateMutation.isLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : null}
                            sx={{
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                fontWeight: 600
                            }}
                        >
                            {updateMutation.isLoading ? 'Updating...' : 'Update Image'}
                        </ActionButton>
                    </Box>
                </ModalBox>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-confirm-dialog"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="delete-confirm-dialog" sx={{ 
                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                }}>
                    Confirm Image Deletion
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2, color: '#1E1E2C' }}>
                        Are you sure you want to delete this image from the category &quot;{deleteTarget?.category}&quot;?
                    </Typography>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Avatar
                            src={`${BASE_IMAGE_URL}${deleteTarget?.imagePath}`}
                            alt="Image to delete"
                            sx={{
                                width: 120,
                                height: 120,
                                border: '2px solid #f44336',
                            }}
                        />
                    </Box>
                    <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                        This action cannot be undone. The image will be permanently deleted.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <ActionButton
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteMutation.isLoading}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '8px', 
                            color: '#6B7280', 
                            borderColor: '#6B7280',
                            fontWeight: 600 
                        }}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={confirmDelete}
                        color="error"
                        disabled={deleteMutation.isLoading}
                        startIcon={deleteMutation.isLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : <DeleteIcon />}
                        variant="contained"
                        sx={{
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                            fontWeight: 600
                        }}
                    >
                        {deleteMutation.isLoading ? 'Deleting...' : 'Delete Image'}
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Toast Container */}
            <ToastContainer {...toastOptions} />

            {/* Snackbar for error messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ 
                        width: '100%',
                        borderRadius: '8px',
                        fontWeight: 600
                    }}
                    iconMapping={{
                        error: <ErrorIcon fontSize="inherit" />,
                        success: <CheckCircleIcon fontSize="inherit" />,
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageCategoriesPage; 