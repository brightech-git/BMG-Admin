import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent,
    TextField, Avatar, MenuItem
} from '@mui/material';
import { Visibility, Edit, Delete, Add, Refresh, Search, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBannersQuery } from '../../../hooks/banners/FestivalBanner/useFestivalBannerQuery';
import { useUpdateFEstivalBannerMutation, useDeleteFestivalBannerMutation } from '../../../hooks/banners/FestivalBanner/useFestivalBanner';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageFestivalBanner.css';

import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

const ManageFestivalBanner = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubTitle, setEditSubTitle] = useState('');
    const [editItemName, setEditItemName] = useState('');
    const [editSubItemName, setEditSubItemName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleItems, setVisibleItems] = useState(20);
    const [loadedData, setLoadedData] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const tableContainerRef = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const { attributes } = useEcomMarketingAttributes();

    const festivalAttributes = attributes.find(attr=>attr.description == "Festival");
    const itemNameAttributes = ["FESTIVAL"];

    const itemNameOptions = festivalAttributes ? JSON.parse(festivalAttributes.valuesJson) : [];

    const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
    const { mutate: updateFestivalBanner, isLoading: isUpdating } = useUpdateFEstivalBannerMutation();
    const { mutate: deleteFestivalBanner, isLoading: isDeleting } = useDeleteFestivalBannerMutation();

    const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

    const festivalCategories = itemNameOptions;

    useEffect(() => {
        if (banners.length > 0) {
            const filtered = banners.filter(
                (banner) =>
                    banner?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    banner?.id.toString().includes(searchQuery)
            );
            setLoadedData(filtered);
        } else {
            setLoadedData([]);
        }
    }, [banners, searchQuery]);

    useEffect(() => {
        const handleTableScroll = () => {
            if (!tableContainerRef.current) return;

            const container = tableContainerRef.current;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingMore) {
                setIsLoadingMore(true);
                setTimeout(() => {
                    setVisibleItems((prev) => Math.min(prev + 20, loadedData.length));
                    setIsLoadingMore(false);
                }, 300);
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleTableScroll);
            return () => tableContainer.removeEventListener('scroll', handleTableScroll);
        }
    }, [visibleItems, loadedData.length, isLoadingMore]);

    const handleRefreshClick = () => {
        refetch();
        setSearchQuery('');
    };

    const handleEditClick = (banner) => {
        setSelectedId(banner.id);
        setEditFile(banner.image_path);
        setEditTitle(banner.title || '');
        setEditSubTitle(banner.subtitle || '');
        setEditItemName(banner.item_name || '');
        setEditSubItemName(banner.sub_item_name || '');
        setErrorMessage('');
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setErrorMessage('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('File size exceeds maximum limit of 5MB');
            return;
        }

        setEditFile(file);
        setErrorMessage('');
    };

    const handleEditTitleChange = (e) => {
        setEditTitle(e.target.value);
        setErrorMessage('');
    };

    const handleSubTitleChange = (e) => {
        setEditSubTitle(e.target.value);
        setErrorMessage('');
    };

    const handleItemNameChange = (e) => {
        setEditItemName(e.target.value);
        setErrorMessage('');
    };

    const handleSubItemNameChange = (e) => {
        setEditSubItemName(e.target.value);
        setErrorMessage('');
    };

    const handleSaveEdit = (id) => {
        if (!editTitle.trim()) {
            setErrorMessage('Please provide a title for the banner.');
            return;
        }

        if (!editItemName) {
            setErrorMessage('Please select a valid festival category.');
            return;
        }

        const payload = {
            id,
            title: editTitle,
            subtitle: editSubTitle,
            item_name: editItemName,
            sub_item_name: editSubItemName || null,
        };

        if (editFile instanceof File) {
            payload.image = editFile;
        }

        updateFestivalBanner(payload, {
            onSuccess: () => {
                setSuccessMessage('Festival Banner updated successfully!');
                setSelectedId(null);
                setEditFile(null);
                setEditTitle('');
                setEditSubTitle('');
                setEditItemName('');
                setEditSubItemName('');
                setTimeout(() => setSuccessMessage(''), 3000);
                refetch();
            },
            onError: (error) => {
                setErrorMessage(error.response?.data?.error || 'Failed to update banner.');
            },
        });
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setEditFile(null);
        setEditTitle('');
        setEditSubTitle('');
        setEditItemName('');
        setEditSubItemName('');
        setErrorMessage('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteFestivalBanner(id, {
                onSuccess: () => {
                    setSuccessMessage('Festival Banner deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to delete banner.');
                },
            });
        }
    };

    const handlePreviewClick = (banner) => {
        setSelectedBanner(banner);
        setPreviewModal(true);
    };

    if (error) {
        return (
            <div className={`manage-festival-banner-container ${themeMode}`}>
                <Box p={3}>
                    <Alert severity="error" className="alert error">
                        Failed to load banners. Please try again.
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={() => refetch()}
                        className="btn primary"
                    >
                        Retry
                    </Button>
                </Box>
            </div>
        );
    }

    return (
        <div className={`manage-festival-banner-container ${themeMode}`}>
            <Card className="manage-festival-banner-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'}>
                            <Box>
                                <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
                                    Manage Festival Banners
                                </Typography>
                                {/* <Typography variant="body1" className="header-subtitle">
                                    View and manage all festival banners with their associated images and festival categories
                                </Typography> */}
                            </Box>
                            <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={1} mt={isMobile ? 2 : 0}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => navigate('/admin/festivalbanner/add')}
                                    size={isSmallScreen ? 'small' : 'medium'}
                                    className="btn primary"
                                >
                                    {isSmallScreen ? 'Add' : 'Add Banner'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={handleRefreshClick}
                                    size={isSmallScreen ? 'small' : 'medium'}
                                    className="btn secondary"
                                >
                                    {isSmallScreen ? 'Refresh' : 'Refresh'}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>

                    {/* <Box className="summary-section" mb={3}>
                        <Box className="summary-content">
                            <Box className="summary-icon">
                                <Add />
                            </Box>
                            <Box>
                                <Typography variant="h6" className="summary-title">
                                    Banner Overview
                                </Typography>
                                <Typography variant="body2" className="summary-text">
                                    Total Banners: {loadedData.length} • Active Banners: {loadedData.filter(b => b.status === 'active').length}
                                </Typography>
                            </Box>
                        </Box>
                    </Box> */}

                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Search banners by title or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <Search className="search-icon" />,
                            }}
                            className="search-input"
                        />
                    </Box>

                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert severity="error" className="alert error">
                                    {errorMessage}
                                </Alert>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert severity="success" className="alert success">
                                    {successMessage}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isLoading ? (
                        <Box className="loading-container">
                            <CircularProgress className="loading-spinner" />
                        </Box>
                    ) : loadedData.length === 0 ? (
                        <Box className="empty-state">
                            <Alert severity="info" className="alert info">
                                {searchQuery ? 'No banners match your search' : 'No banners available'}
                            </Alert>
                        </Box>
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="subtitle1" className="table-info">
                                    Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} banners
                                </Typography>
                            </Box>
                            <TableContainer className="banner-table" ref={tableContainerRef}>
                                <Table stickyHeader size={isSmallScreen ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Image</TableCell>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Subtitle</TableCell>
                                            <TableCell>Festival Category</TableCell>
                                            <TableCell>Sub Item Name</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loadedData.slice(0, visibleItems).map((banner) => (
                                            <TableRow key={banner.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={`#${banner.id}`}
                                                        size="small"
                                                        className="id-chip"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <Box>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleEditFileChange}
                                                                style={{ display: 'none' }}
                                                                id={`file-${banner.id}`}
                                                            />
                                                            <label htmlFor={`file-${banner.id}`}>
                                                                <Button
                                                                    component="span"
                                                                    variant="outlined"
                                                                    startIcon={<CloudUpload />}
                                                                    size="small"
                                                                    className="btn secondary"
                                                                >
                                                                    Choose Image
                                                                </Button>
                                                            </label>
                                                            {editFile && (
                                                                <Chip
                                                                    label={`Selected: ${editFile.name || 'Current Image'}`}
                                                                    size="small"
                                                                    className="file-chip"
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Avatar
                                                            src={`${BASE_IMAGE_URL}${banner.image_path}`}
                                                            variant="rounded"
                                                            className="banner-image"
                                                            onClick={() => handlePreviewClick(banner)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <TextField
                                                            value={editTitle}
                                                            onChange={handleEditTitleChange}
                                                            placeholder="Enter banner title"
                                                            size="small"
                                                            fullWidth
                                                            className="form-input"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" className="table-text">
                                                            {banner.title || 'Untitled Banner'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <TextField
                                                            value={editSubTitle}
                                                            onChange={handleSubTitleChange}
                                                            placeholder="Enter banner subtitle"
                                                            size="small"
                                                            fullWidth
                                                            className="form-input"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" className="table-text">
                                                            {banner.subtitle || 'No Subtitle'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <TextField
                                                            select
                                                            value={editItemName}
                                                            onChange={handleItemNameChange}
                                                            size="small"
                                                            fullWidth
                                                            className="form-input"
                                                        >
                                                            <MenuItem value="">Select a festival category</MenuItem>
                                                            {itemNameAttributes.map((category) => (
                                                                <MenuItem key={category} value={category}>
                                                                    {category.replace(/_/g, ' ')}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    ) : (
                                                        <Typography variant="body2" className="table-text">
                                                            {banner.item_name ? banner.item_name.replace(/_/g, ' ') : 'No Category'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedId === banner.id ? (
                                                        <TextField
                                                            select
                                                            value={editSubItemName}
                                                            onChange={handleSubItemNameChange}
                                                            size="small"
                                                            fullWidth
                                                            className="form-input"
                                                        >
                                                        <MenuItem value="">Select a sub item category</MenuItem>
                                                            {festivalCategories.map((category) => (
                                                                <MenuItem key={category} value={category}>
                                                                    {category.replace(/_/g, ' ')}
                                                                </MenuItem>
                                                            ))}
                                                            </TextField>
                                                    ) : (
                                                        <Typography variant="body2" className="table-text">
                                                            {banner.sub_item_name || 'No Sub Item'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {selectedId === banner.id ? (
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => handleSaveEdit(banner.id)}
                                                                disabled={isUpdating}
                                                                className="btn primary"
                                                            >
                                                                {isUpdating ? <CircularProgress size={16} /> : 'Save'}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                                className="btn secondary"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Tooltip title="View Details">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handlePreviewClick(banner)}
                                                                    className="action-icon"
                                                                >
                                                                    <Visibility />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Banner">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(banner)}
                                                                    disabled={isDeleting}
                                                                    className="action-icon"
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Banner">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(banner.id)}
                                                                    disabled={isDeleting}
                                                                    className="action-icon"
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {isLoadingMore && (
                                <Box className="loading-more">
                                    <CircularProgress size={20} className="loading-spinner" />
                                    <Typography className="loading-text">
                                        Loading more...
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}

                    <Dialog
                        open={previewModal}
                        onClose={() => setPreviewModal(false)}
                        maxWidth="md"
                        fullWidth
                        className="preview-dialog"
                    >
                        <DialogTitle className="dialog-title">
                            Banner Details Preview
                        </DialogTitle>
                        <DialogContent className="dialog-content">
                            {selectedBanner && (
                                <Box>
                                    <Box className="preview-header">
                                        <Typography variant="h6" className="preview-title">
                                            {selectedBanner.title || 'Untitled Banner'}
                                        </Typography>
                                        <Typography variant="body1" className="preview-id">
                                            ID: #{selectedBanner.id}
                                        </Typography>
                                        <Typography variant="body2" className="preview-date">
                                            Created: {new Date(selectedBanner.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box className="preview-image-container">
                                        <img
                                            src={`${BASE_IMAGE_URL}${selectedBanner.image_path}`}
                                            alt={selectedBanner.title || 'Banner'}
                                            className="preview-image"
                                        />
                                        <Typography variant="body2" className="preview-image-url">
                                            {BASE_IMAGE_URL}{selectedBanner.image_path}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setPreviewModal(false)}
                                variant="contained"
                                className="btn primary"
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageFestivalBanner;