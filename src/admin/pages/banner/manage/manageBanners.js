import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../context/themeContext/themeContext';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Chip, Tooltip, TextField, Avatar
} from '@mui/material';
import { Visibility, Edit, Delete, Add, Refresh, Search, CloudUpload } from '@mui/icons-material';
import { useBannersQuery } from '../../../hooks/banners/mainBanner/useBannersQuery';
import { useUpdateBannerMutation, useDeleteBannerMutation } from '../../../hooks/banners/mainBanner/useUploadBannerMutation';
import './ManageBanners.css';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

const ManageBanner = () => {
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const [selectedId, setSelectedId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubTitle, setEditSubTitle] = useState('');
    const [editItemName, setEditItemName] = useState('');
    const [editGender, setEditGender] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleItems, setVisibleItems] = useState(20);
    const [loadedData, setLoadedData] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const tableContainerRef = useRef(null);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });

    const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
    const { mutate: updateBanner, isLoading: isUpdating } = useUpdateBannerMutation();
    const { mutate: deleteBanner, isLoading: isDeleting } = useDeleteBannerMutation();

    const banners = useMemo(() => bannersData?.data || [], [bannersData?.data]);

    useEffect(() => {
        if (banners.length > 0) {
            const filtered = banners.filter(
                (banner) =>
                    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    banner.id.toString().includes(searchQuery)
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
                    setVisibleItems(prev => Math.min(prev + 20, loadedData.length));
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

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const handleRefreshClick = () => {
        refetch();
        setSearchQuery('');
    };

    const handleViewClick = (banner) => {
        setSelectedBanner(banner);
        setShowViewModal(true);
    };

    const handleEditClick = (banner) => {
        setSelectedId(banner.id);
        setEditFile(null);
        setEditTitle(banner.title || '');
        setEditSubTitle(banner.subtitle || '');
        setEditItemName(banner.itemname || '');
        setEditGender(banner.gender || '');
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

    const handleItemName = (e) => {
        setEditItemName(e.target.value);
        setErrorMessage('');
    };

    const handleGender = (e) => {
        setEditGender(e.target.value);
        setErrorMessage('');
    };

    const handleSaveEdit = (id) => {
        if (!editFile && !editTitle.trim()) {
            setErrorMessage('Please provide at least an image or a title.');
            return;
        }

        updateBanner(
            { id, image: editFile, title: editTitle, subtitle: editSubTitle, itemname: editItemName, gender: editGender },
            {
                onSuccess: () => {
                    setSuccessMessage('Banner updated successfully!');
                    setSelectedId(null);
                    setEditFile(null);
                    setEditTitle('');
                    setEditSubTitle('');
                    setEditItemName('');
                    setEditGender('');
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to update banner.');
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setSelectedId(null);
        setEditFile(null);
        setEditTitle('');
        setEditSubTitle('');
        setEditItemName('');
        setEditGender('');
        setErrorMessage('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteBanner(id, {
                onSuccess: () => {
                    setSuccessMessage('Banner deleted successfully!');
                    refetch();
                },
                onError: (error) => {
                    setErrorMessage(error.response?.data?.error || 'Failed to delete banner.');
                },
            });
        }
    };

    const renderMobileCards = () => (
        <div className="mobile-banner-grid">
            {loadedData.slice(0, visibleItems).map((banner) => (
                <motion.div
                    key={banner.id}
                    className="mobile-banner-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="mobile-banner-header">
                        <Typography variant="h6">{banner.title || 'Untitled Banner'}</Typography>
                        <Chip
                            label={`#${banner.id}`}
                            size="small"
                            className="banner-chip"
                        />
                    </div>
                    <Avatar
                        src={`${BASE_IMAGE_URL}${banner.image_path}`}
                        variant="rounded"
                        className="mobile-banner-image"
                        onClick={() => handleViewClick(banner)}
                    />
                    <div className="mobile-banner-details">
                        <Typography variant="body2"><strong>Sub Title:</strong> {banner.subtitle || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Item Name:</strong> {banner.itemname || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Gender:</strong> {banner.gender || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Created:</strong> {new Date(banner.created_at).toLocaleString()}</Typography>
                    </div>
                    <div className="mobile-banner-actions">
                        <IconButton onClick={() => handleViewClick(banner)} title="View Details">
                            <Visibility />
                        </IconButton>
                        <IconButton onClick={() => handleEditClick(banner)} disabled={isDeleting} title="Edit Banner">
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(banner.id)} disabled={isDeleting} title="Delete Banner">
                            <Delete />
                        </IconButton>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderViewModalContent = () => (
        <div className="modal-content">
            <h3>Banner Details: {selectedBanner?.title || 'Untitled Banner'}</h3>
            <div className="modal-image">
                <img
                    src={`${BASE_IMAGE_URL}${selectedBanner?.image_path}`}
                    alt={selectedBanner?.title || 'Banner'}
                    className="modal-banner-image"
                />
                <p className="image-url">{BASE_IMAGE_URL}{selectedBanner?.image_path}</p>
            </div>
            <div className="modal-banner-details">
                <p><strong>ID:</strong> #{selectedBanner?.id}</p>
                <p><strong>Title:</strong> {selectedBanner?.title || 'N/A'}</p>
                <p><strong>Sub Title:</strong> {selectedBanner?.subtitle || 'N/A'}</p>
                <p><strong>Item Name:</strong> {selectedBanner?.itemname || 'N/A'}</p>
                <p><strong>Gender:</strong> {selectedBanner?.gender || 'N/A'}</p>
                <p><strong>Created:</strong> {new Date(selectedBanner?.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedBanner?.status || 'N/A'}</p>
            </div>
            <div className="modal-actions">
                <button className="btn primary" onClick={() => setShowViewModal(false)}>
                    Close
                </button>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className={`manage-banner-container ${themeMode}`}>
                <div className="alert error">
                    Failed to load banners. Please try again.
                    <button className="btn small" onClick={() => refetch()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`manage-banner-container ${themeMode}`}>
            <div className="card">
                <div className="section-header">
                    <div>
                        <h3>Manage Banners</h3>
                        <p>View and manage all website banners with their associated images and details</p>
                    </div>
                    <div className="section-actions">
                        <button
                            className="btn success"
                            onClick={() => navigate('/admin/banner/add')}
                            title="Add Banner"
                        >
                            <span className="icon"><Add /></span>
                            {isSmallScreen ? '' : 'Add Banner'}
                        </button>
                        <button
                            className="btn secondary"
                            onClick={handleRefreshClick}
                            title="Refresh"
                        >
                            <span className="icon"><Refresh /></span>
                            {isSmallScreen ? '' : 'Refresh'}
                        </button>
                    </div>
                </div>

                <div className="banner-overview">
                    <div className="overview-icon">
                        <Add />
                    </div>
                    <div>
                        <h4>Banner Overview</h4>
                        <p>Total Banners: {loadedData.length} • Active Banners: {loadedData.filter(b => b.status === 'active').length}</p>
                    </div>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search banners by title or ID..."
                        className="search-input"
                    />
                    <span className="search-icon"><Search /></span>
                </div>

                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            className="alert error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="alert-icon">⚠️</span>
                            {errorMessage}
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            className="alert success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="alert-icon">✅</span>
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading banners...</p>
                    </div>
                ) : loadedData.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📜</div>
                        <h4>No Banners Found</h4>
                        <p>{searchQuery ? 'No banners match your search' : 'No banners available'}</p>
                        <button
                            className="btn primary"
                            onClick={handleRefreshClick}
                            disabled={isLoading}
                        >
                            <span className="icon"><Refresh /></span>
                            Refresh
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="results-count">
                            Showing {Math.min(visibleItems, loadedData.length)} of {loadedData.length} banners
                        </p>
                        {isMobile ? renderMobileCards() : (
                            <div className="table-responsive" ref={tableContainerRef}>
                                <table className="banner-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Title</th>
                                            <th>Sub Title</th>
                                            <th>Item Name</th>
                                            <th>Gender</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadedData.slice(0, visibleItems).map((banner) => (
                                            <motion.tr
                                                key={banner.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td>
                                                    <span className="banner-chip">#{banner.id}</span>
                                                </td>
                                                <td>
                                                    {selectedId === banner.id ? (
                                                        <div className="edit-image-container">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleEditFileChange}
                                                                className="edit-file-input"
                                                                id={`file-${banner.id}`}
                                                            />
                                                            <label htmlFor={`file-${banner.id}`} className="btn small secondary">
                                                                <span className="icon"><CloudUpload /></span>
                                                                Choose Image
                                                            </label>
                                                            {editFile && (
                                                                <span className="image-preview-text">
                                                                    Selected: {editFile.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Avatar
                                                            src={`${BASE_IMAGE_URL}${banner.image_path}`}
                                                            variant="rounded"
                                                            className="banner-image"
                                                            onClick={() => handleViewClick(banner)}
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    {selectedId === banner.id ? (
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={handleEditTitleChange}
                                                            placeholder="Enter banner title"
                                                            className="form-input inline-input"
                                                        />
                                                    ) : (
                                                        banner.title || 'Untitled Banner'
                                                    )}
                                                </td>
                                                <td>
                                                    {selectedId === banner.id ? (
                                                        <input
                                                            type="text"
                                                            value={editSubTitle}
                                                            onChange={handleSubTitleChange}
                                                            placeholder="Enter banner sub title"
                                                            className="form-input inline-input"
                                                        />
                                                    ) : (
                                                        banner.subtitle || 'N/A'
                                                    )}
                                                </td>
                                                <td>
                                                    {selectedId === banner.id ? (
                                                        <input
                                                            type="text"
                                                            value={editItemName}
                                                            onChange={handleItemName}
                                                            placeholder="Enter item name"
                                                            className="form-input inline-input"
                                                        />
                                                    ) : (
                                                        banner.itemname || 'N/A'
                                                    )}
                                                </td>
                                                <td>
                                                    {selectedId === banner.id ? (
                                                        <input
                                                            type="text"
                                                            value={editGender}
                                                            onChange={handleGender}
                                                            placeholder="Enter gender"
                                                            className="form-input inline-input"
                                                        />
                                                    ) : (
                                                        banner.gender || 'N/A'
                                                    )}
                                                </td>
                                                <td className="action-buttons">
                                                    {selectedId === banner.id ? (
                                                        <>
                                                            <button
                                                                className="btn small primary"
                                                                onClick={() => handleSaveEdit(banner.id)}
                                                                disabled={isUpdating}
                                                            >
                                                                {isUpdating ? (
                                                                    <>
                                                                        <span className="spinner-icon"></span>
                                                                        Save
                                                                    </>
                                                                ) : (
                                                                    'Save'
                                                                )}
                                                            </button>
                                                            <button
                                                                className="btn small danger"
                                                                onClick={handleCancelEdit}
                                                                disabled={isUpdating}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn small info"
                                                                onClick={() => handleViewClick(banner)}
                                                                title="View Details"
                                                            >
                                                                <span className="icon"><Visibility /></span>
                                                            </button>
                                                            <button
                                                                className="btn small warning"
                                                                onClick={() => handleEditClick(banner)}
                                                                disabled={isDeleting}
                                                                title="Edit Banner"
                                                            >
                                                                <span className="icon"><Edit /></span>
                                                            </button>
                                                            <button
                                                                className="btn small danger"
                                                                onClick={() => handleDelete(banner.id)}
                                                                disabled={isDeleting}
                                                                title="Delete Banner"
                                                            >
                                                                <span className="icon"><Delete /></span>
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {isLoadingMore && (
                            <div className="loading-more">
                                <div className="spinner small"></div>
                                <span>Loading more...</span>
                            </div>
                        )}
                    </>
                )}

                <AnimatePresence>
                    {showViewModal && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowViewModal(false)}
                        >
                            <motion.div
                                className="modal-content modal-view-content"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                {renderViewModalContent()}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManageBanner;