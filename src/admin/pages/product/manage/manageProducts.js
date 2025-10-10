import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useProductContext } from '../../../context/product/productContext';

import { motion, AnimatePresence } from 'framer-motion';

import 'jspdf-autotable';
import { useFilterItemsQuery } from '../../../hooks/products/useProductsQuery';
import { MyContext } from '../../../context/themeContext/themeContext';
import { useFilters } from '../../../context/product/FilterContext';
import './ManageProduct.css';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const ManageProduct = ({ baseUrl = 'https://app.bmgjewellers.com' }) => {
    const navigate = useNavigate();
    const { filters, updateFilter, resetFilters } = useFilters();

    const { tagkey } = useParams();
    const { themeMode } = useContext(MyContext);
    const { images, description, getImages, updateImage, deleteImage, updateDescription } = useProductContext();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [itemName, setItemName] = useState('');
    const [subItemName, setSubItemName] = useState('');
    console.log(searchInput,itemName,subItemName ,' filter')

    const { data: productdata, isLoading } = useFilterItemsQuery(filters);
    console.log(productdata,'product data')

    // State management
    const [selectedImages, setSelectedImages] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [sno, setSno] = useState(tagkey || localStorage.getItem('tagKey') || '');
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const fetchAttempts = useRef(0);
    const printRef = useRef();
    const [imageToUpdate, setImageToUpdate] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewProduct, setViewProduct] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [newDescription, setNewDescription] = useState('');
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoized derived values
    const hasImages = useMemo(() => images && images.length > 0, [images]);
    const allSelected = useMemo(
        () => hasImages && selectedImages.length === images.length,
        [hasImages, selectedImages, images]
    );

    // Fetch images with retry logic
    const fetchImages = useCallback(async () => {
        if (!sno) {
            setFeedback({ error: 'No serial number provided.', success: '' });
            setIsInitialLoad(false);
            return;
        }
        if (fetchAttempts.current >= MAX_RETRIES) {
            setFeedback({ error: 'Maximum retry attempts reached. Please check your connection.', success: '' });
            return;
        }

        try {
            fetchAttempts.current += 1;
            await getImages(sno);
            fetchAttempts.current = 0;
            setSelectedImages([]);
        } catch (err) {
            console.error('Error fetching images:', err);
            if (fetchAttempts.current < MAX_RETRIES) {
                const delay = Math.min(RETRY_DELAY_MS * fetchAttempts.current, 5000);
                setTimeout(fetchImages, delay);
            } else {
                setFeedback({ error: 'Failed to load product data. Please try again later.', success: '' });
            }
        } finally {
            setIsInitialLoad(false);
        }
    }, [getImages, sno]);

    // Initial data fetch
    useEffect(() => {
        const controller = new AbortController();
        fetchImages();
        return () => controller.abort();
    }, [fetchImages]);

    // Handle search
    const handleSearch = async () => {
        if (!searchInput.trim() && !itemName.trim() && !subItemName.trim()) {
            setFeedback({ error: 'Please enter at least one search criterion (Item ID, Tag Number, Item Name, or Sub Item Name)', success: '' });
            return;
        }

        setLoading(true);
        try {
            let itemId = '';
            let tagNo = '';
            if (searchInput.includes('-')) {
                [itemId, tagNo] = searchInput.split('-').map(s => s.trim());
            } else if (searchInput.trim()) {
                tagNo = searchInput.trim();
            }

            setSno(tagNo);
            if (tagNo) {
                localStorage.setItem('sno', tagNo);
                await getImages(tagNo);
            }
            setFeedback({ error: '', success: 'Product details loaded successfully' });
        } catch (err) {
            console.error('Error fetching product:', err);
            setFeedback({
                error: err.response?.data?.error || 'Failed to load product details. Please check the input and try again.',
                success: ''
            });
        } finally {
            setLoading(false);
        }
    };

    // Listen for localStorage changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'tagkey' && !tagkey) setSno(e.newValue || '');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [tagkey]);

    // Clear feedback after timeout
    useEffect(() => {
        if (feedback.success || feedback.error) {
            const timer = setTimeout(() => setFeedback({ error: '', success: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // Navigation and modal handlers
    const handleNew = useCallback(() => navigate('/admin/product/add'), [navigate]);
    const handleExit = useCallback(() => navigate('/admin'), [navigate]);

    const handleViewClick = (product) => {
        setViewProduct(product);
        setShowViewModal(true);
    };

    const handleEditClick = (product) => {
        setEditProduct(product);
        setNewDescription(product.Description || '');
        setNewImages([]);
        setShowEditModal(true);
    };

    const handleEditFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (!file.type.match('image.*')) {
                setFeedback({ error: 'Only image files are allowed', success: '' });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setFeedback({ error: 'Image size must be less than 5MB', success: '' });
                return false;
            }
            return true;
        });
        setNewImages(validFiles);
    };

    const handleEditSubmit = async () => {
        if (!newDescription.trim() && newImages.length === 0) {
            setFeedback({ error: 'Please provide a description or select images to update', success: '' });
            return;
        }

        setLoading(true);
        try {
            if (newDescription.trim() && newDescription !== editProduct.Description) {
                await updateDescription(editProduct.TAGKEY, newDescription);
            }
            for (const image of newImages) {
                await updateImage(editProduct.TAGKEY, null, image);
            }
            setFeedback({ error: '', success: 'Product updated successfully' });
            setShowEditModal(false);
            await fetchImages();
        } catch (err) {
            console.error('Error updating product:', err);
            setFeedback({
                error: err.response?.data?.error || 'Failed to update product. Please try again.',
                success: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateImageClick = (imagePath) => {
        setImageToUpdate(imagePath);
        setNewImageFile(null);
        setShowUpdateModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setFeedback({ error: 'Only image files are allowed', success: '' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFeedback({ error: 'Image size must be less than 5MB', success: '' });
            return;
        }

        setNewImageFile(file);
    };

    const handleImageUpdate = async () => {
        if (!newImageFile) {
            setFeedback({ error: 'Please select a new image file', success: '' });
            return;
        }

        setLoading(true);
        try {
            await updateImage(sno, imageToUpdate, newImageFile);
            setFeedback({ error: '', success: 'Image updated successfully' });
            setShowUpdateModal(false);
            await fetchImages();
        } catch (err) {
            console.error('Error updating image:', err);
            setFeedback({
                error: err.response?.data?.error || 'Failed to update image. Please try again.',
                success: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = useCallback(async (tagkey,imagePath) => {
        console.log(tagkey,imagePath,'data for delete')
        if (!window.confirm('Are you sure you want to permanently delete this image?')) return;
        try {
            
            await deleteImage(tagkey, imagePath);
            setFeedback({ error: '', success: 'Image deleted successfully' });
        } catch (err) {
            console.error('Error deleting image:', err);
            setFeedback({ error: 'Failed to delete image. Please try again.', success: '' });
        }
    }, [deleteImage, tagkey]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedImages.length === 0) {
            setFeedback({ error: 'Please select one or more images to delete.', success: '' });
            return;
        }
        if (!window.confirm(`This will permanently delete ${selectedImages.length} image(s). Continue?`)) return;
        try {
            await Promise.all(selectedImages.map(img => deleteImage(sno, img)));
            setSelectedImages([]);
            setFeedback({ error: '', success: `Successfully deleted ${selectedImages.length} image(s)` });
        } catch (err) {
            console.error('Error deleting images:', err);
            setFeedback({ error: 'Failed to delete some images. Please try again.', success: '' });
        }
    }, [deleteImage, sno, selectedImages]);

    const toggleImageSelection = useCallback((imagePath) => {
        setSelectedImages(prev =>
            prev.includes(imagePath) ? prev.filter(img => img !== imagePath) : [...prev, imagePath]
        );
    }, []);

    const selectAllImages = useCallback(() => {
        setSelectedImages(allSelected ? [] : [...images]);
    }, [allSelected, images]);

    const constructImageUrls = (imagePath) => {
        if (!imagePath) return [];
        try {
            const images = JSON.parse(imagePath);
            return images.map(img => (img.startsWith('http') ? img : `${baseUrl}${img}`));
        } catch {
            return [];
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < (productdata?.totalPages || 1)) setPage(newPage);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setPage(0);
    };

    const renderProductTable = () => (
        <div className="table-responsive">
            <table className="custom-table product-table" ref={printRef}>
                <thead>
                    <tr>
                        <th scope="col" style={{ width: '10%' }}>Product</th>
                        <th scope="col" style={{ width: '10%' }}>Product Key</th>
                        <th scope="col" style={{ width: '20%' }}>Images</th>
                        <th scope="col" style={{ width: '20%' }}>Description</th>
                        <th scope="col" style={{ width: '30%' }}>Details</th>
                        <th scope="col" style={{ width: '10%' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {productdata?.data?.map((product, index) => (
                        <motion.tr
                            key={product.TAGKEY}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                            <td>{product.ITEMNAME} - {product.SUBITEMNAME}</td>
                            <td>{product.TAGKEY}</td>
                            <td>
                                <div className="image-gallery">
                                    {constructImageUrls(product.ImagePath).map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${product.ITEMNAME} - Image ${idx + 1}`}
                                            className="thumbnail"
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.src = 'https://via.placeholder.com/80?text=Image+Not+Available';
                                                e.currentTarget.alt = 'Image not available';
                                            }}
                                        />
                                    ))}
                                </div>
                            </td>
                            <td>{product.Description || 'No description'}</td>
                            <td>
                                <div className="product-details">
                                    <p><strong>Occasion:</strong> {product.Occasion || 'N/A'}</p>
                                    <p><strong>Gender:</strong> {product.Gender || 'N/A'}</p>
                                    <p><strong>Collection:</strong> {product.CollectionType || 'N/A'}</p>
                                    <p><strong>Material:</strong> {product.MaterialFinish || 'N/A'}</p>
                                    <p><strong>Net Weight:</strong> {product.NETWT || 'N/A'} g</p>
                                    <p><strong>Gross Amount:</strong> ₹{product.GrossAmount || 'N/A'}</p>
                                    <p><strong>GST:</strong> {product.GSTPer || 'N/A'} (₹{product.GSTAmount || 'N/A'})</p>
                                    <p><strong>Grand Total:</strong> ₹{product.GrandTotal || 'N/A'}</p>
                                    <p><strong>Size:</strong> {product.SIZENAME || 'N/A'}</p>
                                    <p><strong>Color:</strong> {product.ColorAccents || 'N/A'}</p>
                                    {product.Best_Design && <p><strong>Best Design:</strong> Yes</p>}
                                    {product.Top_Trending && <p><strong>Top Trending:</strong> Yes</p>}
                                    {product.NewArrival && <p><strong>New Arrival:</strong> Yes</p>}
                                    {product.Featured_Products && <p><strong>Featured:</strong> Yes</p>}
                                </div>
                            </td>
                            <td className="action-buttons">
                                <button
                                    className="btn small info"
                                    onClick={() => handleViewClick(product)}
                                    aria-label={`View details for ${product.ITEMNAME}`}
                                    title="View Product Details"
                                >
                                    <span className="icon" aria-hidden="true">👁️</span>
                                    {isMobileView ? '' : 'View'}
                                </button>
                                <button
                                    className="btn small warning"
                                    onClick={() => handleEditClick(product)}
                                    aria-label={`Edit ${product.ITEMNAME}`}
                                    title="Edit Product"
                                >
                                    <span className="icon" aria-hidden="true">✏️</span>
                                    {isMobileView ? '' : 'Edit'}
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderMobileProductCards = () => (
        <div className="mobile-product-grid">
            {productdata?.data?.map((product, index) => (
                <motion.div
                    key={product.TAGKEY}
                    className="mobile-product-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                    <div className="mobile-product-header">
                        <h4>{product.ITEMNAME} - {product.SUBITEMNAME}</h4>
                        <span className="product-key">Key: {product.TAGKEY}</span>
                    </div>
                    <div className="mobile-image-gallery">
                        {constructImageUrls(product.ImagePath).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${product.ITEMNAME} - Image ${idx + 1}`}
                                className="mobile-thumbnail"
                                loading="lazy"
                                onError={e => {
                                    e.currentTarget.src = 'https://via.placeholder.com/80?text=Image+Not+Available';
                                    e.currentTarget.alt = 'Image not available';
                                }}
                            />
                        ))}
                    </div>
                    <div className="mobile-product-details">
                        <p><strong>Description:</strong> {product.Description || 'No description'}</p>
                        <p><strong>Occasion:</strong> {product.Occasion || 'N/A'}</p>
                        <p><strong>Gender:</strong> {product.Gender || 'N/A'}</p>
                        <p><strong>Collection:</strong> {product.CollectionType || 'N/A'}</p>
                        <p><strong>Material:</strong> {product.MaterialFinish || 'N/A'}</p>
                        <p><strong>Net Weight:</strong> {product.NETWT || 'N/A'} g</p>
                        <p><strong>Gross Amount:</strong> ₹{product.GrossAmount || 'N/A'}</p>
                    </div>
                    <div className="mobile-product-actions">
                        <button
                            className="btn small info"
                            onClick={() => handleViewClick(product)}
                            aria-label={`View details for ${product.ITEMNAME}`}
                            title="View Product Details"
                        >
                            <span className="icon" aria-hidden="true">👁️</span>
                            View Details
                        </button>
                        <button
                            className="btn small warning"
                            onClick={() => handleEditClick(product)}
                            aria-label={`Edit ${product.ITEMNAME}`}
                            title="Edit Product"
                        >
                            <span className="icon" aria-hidden="true">✏️</span>
                            Edit
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderViewModalContent = () => (
        <div className="modal-content">
            <h3>Product Details: {viewProduct?.ITEMNAME} - {viewProduct?.SUBITEMNAME}</h3>
            <div className="modal-image-gallery">
                {constructImageUrls(viewProduct?.ImagePath).map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`${viewProduct?.ITEMNAME} - Image ${idx + 1}`}
                        className="modal-thumbnail"
                        loading="lazy"
                        onError={e => {
                            e.currentTarget.src = 'https://via.placeholder.com/100?text=Image+Not+Available';
                            e.currentTarget.alt = 'Image not available';
                        }}
                    />
                ))}
            </div>
            <div className="modal-product-details">
                <p><strong>Description:</strong> {viewProduct?.Description || 'No description'}</p>
                <p><strong>Product Key:</strong> {viewProduct?.TAGKEY || 'N/A'}</p>
                <p><strong>Occasion:</strong> {viewProduct?.Occasion || 'N/A'}</p>
                <p><strong>Gender:</strong> {viewProduct?.Gender || 'N/A'}</p>
                <p><strong>Collection:</strong> {viewProduct?.CollectionType || 'N/A'}</p>
                <p><strong>Material:</strong> {viewProduct?.MaterialFinish || 'N/A'}</p>
                <p><strong>Net Weight:</strong> {viewProduct?.NETWT || 'N/A'} g</p>
                <p><strong>Gross Amount:</strong> ₹{viewProduct?.GrossAmount || 'N/A'}</p>
                <p><strong>GST:</strong> {viewProduct?.GSTPer || 'N/A'} (₹{viewProduct?.GSTAmount || 'N/A'})</p>
                <p><strong>Grand Total:</strong> ₹{viewProduct?.GrandTotal || 'N/A'}</p>
                <p><strong>Size:</strong> {viewProduct?.SIZENAME || 'N/A'}</p>
                <p><strong>Color:</strong> {viewProduct?.ColorAccents || 'N/A'}</p>
                {viewProduct?.Best_Design && <p><strong>Best Design:</strong> Yes</p>}
                {viewProduct?.Top_Trending && <p><strong>Top Trending:</strong> Yes</p>}
                {viewProduct?.NewArrival && <p><strong>New Arrival:</strong> Yes</p>}
                {viewProduct?.Featured_Products && <p><strong>Featured:</strong> Yes</p>}
            </div>
            <div className="modal-actions">
                <button
                    className="btn primary"
                    onClick={() => setShowViewModal(false)}
                    aria-label="Close product details"
                >
                    Close
                </button>
            </div>
        </div>
    );

    return (
        <div className={`manage-product-container ${themeMode}`} role="main">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Manage Product Images
                    </li>
                </ol>
            </nav>

            <motion.div
                className="card search-section"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                    <h3>Manage Product Images</h3>
                    <div className="section-actions">
                        <span className="results-count">
                            {productdata?.data?.length || 0} product{productdata?.data?.length !== 1 ? 's' : ''} • Page {page + 1} of {productdata?.totalPages || 1}
                        </span>
                    </div>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Item ID-Tag No (e.g., 1-124) or Tag No (e.g., 1234)"
                        className="search-input"
                        disabled={loading}
                    />
                    <input
                        type="text"
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        placeholder="Item Name"
                        className="search-input"
                        disabled={loading}
                    />
                    <input
                        type="text"
                        value={subItemName}
                        onChange={e => setSubItemName(e.target.value)}
                        placeholder="Sub Item Name"
                        className="search-input"
                        disabled={loading}
                    />
                    <button
                        className="btn primary search-button"
                        onClick={handleSearch}
                        disabled={loading || (!searchInput.trim() && !itemName.trim() && !subItemName.trim())}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-icon" aria-hidden="true"></span>
                                Searching...
                            </>
                        ) : (
                            <>
                                <span className="icon" aria-hidden="true">🔍</span>
                                Search
                            </>
                        )}
                    </button>
                    <div className="pagination-controls">
                       
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="page-size-select"
                            disabled={loading}
                            aria-label="Select items per page"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                       
                    </div>
                    <div className="action-button">
                        <button className="btn success" onClick={handleNew} aria-label="Add new product">
                            <span className="icon" aria-hidden="true">✨</span>
                            {isMobileView ? '' : 'New '}
                        </button>
                        <button className="btn danger" onClick={handleExit} aria-label="Exit to dashboard">
                            <span className="icon" aria-hidden="true">❌</span>
                            {isMobileView ? '' : 'Exit'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* <AnimatePresence>
                {feedback.error && (
                    <motion.div
                        className="alert error"
                        role="alert"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        aria-live="assertive"
                    >
                        <span className="alert-icon" aria-hidden="true">⚠️</span>
                        <span className="alert-message">{feedback.error}</span>
                        <button onClick={fetchImages} className="btn small" aria-label="Retry loading data">
                            Retry
                        </button>
                    </motion.div>
                )}
                {feedback.success && (
                    <motion.div
                        className="alert success"
                        role="alert"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        aria-live="polite"
                    >
                        <span className="alert-icon" aria-hidden="true">✅</span>
                        <span className="alert-message">{feedback.success}</span>
                    </motion.div>
                )}
            </AnimatePresence> */}

            <motion.div
                className="products-section card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                aria-labelledby="products-section-title"
            >
                {isLoading ? (
                    <motion.div
                        className="loading-state"
                        aria-live="polite"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="spinner" aria-hidden="true"></div>
                        <p>Loading products...</p>
                    </motion.div>
                ) : productdata?.data?.length > 0 ? (
                    <>{isMobileView ? renderMobileProductCards() : renderProductTable()}</>
                ) : (
                    <motion.div
                        className="empty-state"
                        aria-live="polite"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="empty-state-icon">📦</div>
                        <h4>No Products Found</h4>
                        <p>No products are currently available.</p>
                        <button
                            onClick={fetchImages}
                            className="btn primary"
                            disabled={loading}
                            aria-label="Refresh product data"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-icon" aria-hidden="true"></span>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <span className="icon" aria-hidden="true">🔄</span>
                                    Refresh Data
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showUpdateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUpdateModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3>Update Image</h3>
                            <p>Replacing: {imageToUpdate}</p>
                            <div className="form-group">
                                <label htmlFor="newImageFile">Select New Image:</label>
                                <input
                                    type="file"
                                    id="newImageFile"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                {newImageFile && (
                                    <div className="image-preview">
                                        <p>Preview:</p>
                                        <img
                                            src={URL.createObjectURL(newImageFile)}
                                            alt="Preview of new image"
                                            className="modal-thumbnail"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn primary"
                                    onClick={handleImageUpdate}
                                    disabled={!newImageFile || loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-icon" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Image'
                                    )}
                                </button>
                                <button
                                    className="btn danger"
                                    onClick={() => setShowUpdateModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="modal-content modal-edit-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3>Edit Product: {editProduct?.ITEMNAME} - {editProduct?.SUBITEMNAME}</h3>
                            <div className="modal-image-gallery">
                                {constructImageUrls(editProduct?.ImagePath).map((img, idx) => (
                                    <div key={idx} className="image-container">
                                        <img
                                            src={img}
                                            alt={`${editProduct?.ITEMNAME} - Image ${idx + 1}`}
                                            className="modal-thumbnail"
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.src = 'https://via.placeholder.com/100?text=Image+Not+Available';
                                                e.currentTarget.alt = 'Image not available';
                                            }}
                                        />
                                        <button
                                            className="btn small danger delete-image-btn"
                                            onClick={() => handleDeleteImage(editProduct?.TAGKEY , img)}
                                            aria-label={`Delete image ${idx + 1}`}
                                        >
                                            <span className="icon" aria-hidden="true">🗑️</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="form-group">
                                <label htmlFor="editDescription">Description</label>
                                <textarea
                                    id="editDescription"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    placeholder="Enter product description"
                                    className="form-textarea"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editImages">Add New Images</label>
                                <input
                                    type="file"
                                    id="editImages"
                                    accept="image/*"
                                    multiple
                                    onChange={handleEditFileChange}
                                    disabled={loading}
                                />
                                {newImages.length > 0 && (
                                    <div className="image-preview">
                                        <p>New Image Previews:</p>
                                        <div className="modal-image-gallery">
                                            {newImages.map((image, idx) => (
                                                <img
                                                    key={idx}
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="modal-thumbnail"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn primary"
                                    onClick={handleEditSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-icon" aria-hidden="true"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                                <button
                                    className="btn danger"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ManageProduct.propTypes = {
    baseUrl: PropTypes.string,
};

export default React.memo(ManageProduct);