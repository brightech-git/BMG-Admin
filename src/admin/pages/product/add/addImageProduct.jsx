import React, { useState, useCallback, useRef, useContext, useEffect } from 'react';
import { useProductContext } from '../../../context/product/productContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MyContext } from '../../../context/themeContext/themeContext';
import { getProductImages, getProductVideos } from '../../../../utils/mediaUtils/mediaUtils.js.js';

const AddImage = () => {
    // -------------------------------------------------------------------------
    // 1. STATE FROM ROUTE – determines CREATE vs UPDATE
    // -------------------------------------------------------------------------
    const location = useLocation();
    const {
        tagkey: initialTagkey,
        itemName,
        subItemName,
        isUpdate = false          // <-- NEW: true = UPDATE, false = CREATE
    } = location.state || {};

    console.log("Received:", { initialTagkey, itemName, subItemName, isUpdate });

    // -------------------------------------------------------------------------
    // 2. CONTEXT
    // -------------------------------------------------------------------------
    const {
        uploadImages,
        updateAllFields,
        getMedia,
        getProductDetails,
        deleteMedia,
        createFormData,
        loading: contextLoading,
        error: contextError,
        setError
    } = useProductContext();

    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // -------------------------------------------------------------------------
    // 3. LOCAL UI STATE
    // -------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        tagKey: initialTagkey || '',
        description: '',
        selectedImages: [],
        selectedVideos: [],
    });

    console.log(formData ,'datain get')

    const [existingMedia, setExistingMedia] = useState({ images: [], videos: [] });

    console.log(existingMedia, 'datain get media')
    const [isUpdateMode, setIsUpdateMode] = useState(isUpdate);   // <-- from state

    const [uiState, setUiState] = useState({
        feedback: { error: '', success: '', info: '' },
        showAllImages: false,
        showAllVideos: false,
        isDragOver: false,
        snackbarOpen: false,
        uploadProgress: 0,
        isUploading: false,
        dragType: null,
    });

    // -------------------------------------------------------------------------
    // 4. CONFIG
    // -------------------------------------------------------------------------
    const CONFIG = {
        imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        videoTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
        maxSize: 50 * 1024 * 1024,
        maxImages: 10,
        maxVideos: 5,
        minImages: 3,
        minTagLength: 3,
        minDescriptionLength: 10,
    };

    // -------------------------------------------------------------------------
    // 5. FETCH EXISTING DATA (only in UPDATE mode)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (isUpdate && initialTagkey) {
            const fetchExisting = async () => {
                try {
                    const [mediaRes, detailsRes] = await Promise.all([
                        getMedia(initialTagkey),
                        getProductDetails(initialTagkey)
                    ]);

                    // FIX 1: Use utils to parse raw image/video strings
                    const images = mediaRes.images;
                    const videos = mediaRes.videos;

                    setExistingMedia({ images, videos });

                    console.log(detailsRes ,'details')

                    // Set description & tag key
                    setFormData(prev => ({
                        ...prev,
                        description: detailsRes.Description || detailsRes?.[0]?.Description || '',
                        tagKey: initialTagkey
                    }));

                    console.log("Loaded for update:", { images, videos, description: detailsRes.Description || detailsRes?.[0]?.Description });
                } catch (err) {
                    console.error('Failed to load existing data:', err);
                }
            };
            fetchExisting();
        }
    }, [isUpdate, initialTagkey, getMedia, getProductDetails, ]);

    // -------------------------------------------------------------------------
    // 6. FEEDBACK HELPERS
    // -------------------------------------------------------------------------
    const clearAllFeedback = useCallback(() => {
        setUiState(prev => ({ ...prev, feedback: { error: '', success: '', info: '' } }));
        setError(null);
    }, [setError]);

    const setFeedback = useCallback((type, message, duration = 3000) => {
        clearAllFeedback();
        setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: message } }));
        if (type === 'success' || type === 'info') {
            setTimeout(() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: '' } })), duration);
        }
    }, [clearAllFeedback]);

    // -------------------------------------------------------------------------
    // 7. FILE VALIDATION
    // -------------------------------------------------------------------------
    const validateFiles = useCallback((files, type = 'image') => {
        if (!files || files.length === 0) return { isValid: false, error: `Select at least one ${type}.` };

        const validTypes = type === 'image' ? CONFIG.imageTypes : CONFIG.videoTypes;
        const maxFiles = type === 'image' ? CONFIG.maxImages : CONFIG.maxVideos;
        const minFiles = type === 'image' ? CONFIG.minImages : 0;
        const typeName = type === 'image' ? 'image' : 'video';

        if (files.length > maxFiles) return { isValid: false, error: `Maximum ${maxFiles} ${typeName} files allowed.` };
        if (minFiles > 0 && files.length < minFiles) return { isValid: false, error: `Minimum ${minFiles} ${typeName} files required.` };

        for (let file of files) {
            if (!validTypes.includes(file.type)) {
                const allowed = type === 'image' ? 'JPG, PNG, WEBP' : 'MP4, MOV, AVI, WEBM';
                return { isValid: false, error: `Invalid format: ${file.name}. Only ${allowed} allowed.` };
            }
            if (file.size > CONFIG.maxSize) return { isValid: false, error: `${file.name} exceeds 50MB limit.` };
        }
        return { isValid: true };
    }, []);

    // -------------------------------------------------------------------------
    // 8. DRAG & DROP
    // -------------------------------------------------------------------------
    const handleDragEnter = useCallback((e, type) => {
        e.preventDefault();
        setUiState(prev => ({ ...prev, isDragOver: true, dragType: type }));
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setUiState(prev => ({ ...prev, isDragOver: false, dragType: null }));
    }, []);

    const handleDragOver = useCallback((e) => { e.preventDefault(); }, []);

    const handleDrop = useCallback((e, type) => {
        e.preventDefault();
        setUiState(prev => ({ ...prev, isDragOver: false, dragType: null }));
        processFiles(Array.from(e.dataTransfer.files), type);
    }, []);

    // -------------------------------------------------------------------------
    // 9. PROCESS SELECTED FILES
    // -------------------------------------------------------------------------
    const processFiles = useCallback((files, type) => {
        clearAllFeedback();
        const validation = validateFiles(files, type);
        if (!validation.isValid) {
            setFeedback('error', validation.error);
            return;
        }

        const field = type === 'image' ? 'selectedImages' : 'selectedVideos';
        setFormData(prev => ({ ...prev, [field]: files }));
        setFeedback('success', `${files.length} ${type}(s) selected.`, 2000);
    }, [validateFiles, clearAllFeedback, setFeedback]);

    const handleFileChange = useCallback((e, type) => {
        processFiles(Array.from(e.target.files || []), type);
    }, [processFiles]);

    const removeFile = useCallback((index, type) => {
        const field = type === 'image' ? 'selectedImages' : 'selectedVideos';
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
        setFeedback('info', `${type} removed.`, 1500);
    }, [setFeedback]);

    // -------------------------------------------------------------------------
    // 10. DELETE EXISTING MEDIA
    // -------------------------------------------------------------------------
    const deleteExistingMedia = useCallback(async (path, type) => {
        if (!window.confirm(`Delete this ${type}?`)) return;

        try {
            await deleteMedia(formData.tagKey, path, type);
            setExistingMedia(prev => ({
                ...prev,
                [type + 's']: prev[type + 's'].filter(p => p !== path)
            }));
            setFeedback('success', `${type} deleted`);
        } catch (err) {
            setFeedback('error', err.message || 'Delete failed');
        }
    }, [formData.tagKey, deleteMedia, setFeedback]);

    // -------------------------------------------------------------------------
    // 11. INPUT CHANGE
    // -------------------------------------------------------------------------
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearAllFeedback();
    }, [clearAllFeedback]);

    // -------------------------------------------------------------------------
    // 12. FORM VALIDATION
    // -------------------------------------------------------------------------
    // ────────────────────────────────────────────────────────────────────────
    // 12. FORM VALIDATION – now counts existing + new media
    // ────────────────────────────────────────────────────────────────────────
    const validateForm = useCallback(() => {
        const errors = [];

        const { tagKey, description, selectedImages, selectedVideos } = formData;

        // ── Tag Key ────────────────────────────────────────────────────────
        if (!tagKey.trim()) errors.push('Tag Key is required');
        else if (tagKey.trim().length < CONFIG.minTagLength)
            errors.push(`Tag Key must be ≥ ${CONFIG.minTagLength} chars`);

        // ── Description (optional) ────────────────────────────────────────
        if (description.trim() && description.trim().length < CONFIG.minDescriptionLength)
            errors.push(`Description must be ≥ ${CONFIG.minDescriptionLength} chars`);

        // ── Images ────────────────────────────────────────────────────────
        const totalImages = existingMedia.images.length + selectedImages.length;
        if (totalImages < CONFIG.minImages) {
            errors.push(`You need at least ${CONFIG.minImages} images in total.`);
        }
        if (totalImages > CONFIG.maxImages) {
            errors.push(`Maximum ${CONFIG.maxImages} images allowed (old + new).`);
        }

        // Validate the **new** files only (type, size, etc.)
        if (selectedImages.length > 0) {
            const v = validateFiles(selectedImages, 'image');
            if (!v.isValid) errors.push(v.error);
        }

        // ── Videos (optional) ─────────────────────────────────────────────
        const totalVideos = existingMedia.videos.length + selectedVideos.length;
        if (totalVideos > CONFIG.maxVideos) {
            errors.push(`Maximum ${CONFIG.maxVideos} videos allowed.`);
        }
        if (selectedVideos.length > 0) {
            const v = validateFiles(selectedVideos, 'video');
            if (!v.isValid) errors.push(v.error);
        }

        return { isValid: errors.length === 0, errors };
    }, [
        formData,
        existingMedia.images.length,
        existingMedia.videos.length,
        validateFiles,
    ]);

    // -------------------------------------------------------------------------
    // 13. RESET FORM
    // -------------------------------------------------------------------------
    const resetForm = useCallback(() => {
        setFormData({
            tagKey: initialTagkey || '',
            description: '',
            selectedImages: [],
            selectedVideos: [],
        });
        setUiState({
            feedback: { error: '', success: '', info: '' },
            showAllImages: false,
            showAllVideos: false,
            isDragOver: false,
            snackbarOpen: false,
            uploadProgress: 0,
            isUploading: false,
            dragType: null,
        });
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    }, [initialTagkey]);

    // -------------------------------------------------------------------------
    // 14. MAIN SUBMIT (CREATE or UPDATE)
    // -------------------------------------------------------------------------
    const handleUpload = useCallback(async () => {
        clearAllFeedback();
        const validation = validateForm();
        if (!validation.isValid) {
            setFeedback('error', `Fix: ${validation.errors.join(', ')}`);
            return;
        }

        setUiState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
        let progressInterval;

        try {
            const fd = createFormData(
                formData.tagKey.trim(),
                formData.selectedImages,
                formData.selectedVideos,
                formData.description.trim()
            );

            progressInterval = setInterval(() => {
                setUiState(prev => ({
                    ...prev,
                    uploadProgress: Math.min(prev.uploadProgress + 10, 90)
                }));
            }, 200);

            let result;
            if (isUpdateMode) {
                result = await updateAllFields(fd);   // PUT
            } else {
                result = await uploadImages(fd);      // POST
            }

            clearInterval(progressInterval);
            setUiState(prev => ({ ...prev, uploadProgress: 100, snackbarOpen: true }));
            setFeedback('success', isUpdateMode ? 'Product updated!' : 'Product uploaded!');
            localStorage.setItem('productTagkey', formData.tagKey);

            resetForm();

            setTimeout(() => {
                navigate(`/admin/product/manage/single`, { state: { tagkey: formData.tagKey } });
            }, 1500);

        } catch (err) {
            if (progressInterval) clearInterval(progressInterval);
            setUiState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
            setFeedback('error', err.message || 'Operation failed');
        }
    }, [
        formData,
        isUpdateMode,
        validateForm,
        createFormData,
        existingMedia,
        updateAllFields,
        uploadImages,
        clearAllFeedback,
        setFeedback,
        navigate,
        resetForm
    ]);

    // -------------------------------------------------------------------------
    // 15. COMPLETION STATUS (for button)
    // -------------------------------------------------------------------------
    const getCompletionStatus = useCallback(() => {
        const { tagKey, description, selectedImages, selectedVideos } = formData;

        const totalImages = existingMedia.images.length + selectedImages.length;
        const totalVideos = existingMedia.videos.length + selectedVideos.length;

        const required = [
            !!tagKey.trim() && tagKey.trim().length >= CONFIG.minTagLength,
            !!description.trim() && description.trim().length >= CONFIG.minDescriptionLength,
            totalImages >= CONFIG.minImages,
            // videos are optional → always true
            true,
        ];

        const completed = required.filter(Boolean).length;
        const total = required.length;

        return {
            status: completed === total ? 'complete' : completed === 0 ? 'incomplete' : 'partial',
            text: completed === total ? 'Ready' : completed === 0 ? 'Not Started' : 'In Progress',
            count: `${completed}/${total}`,
        };
    }, [formData, isUpdateMode, existingMedia.images.length, existingMedia.videos.length]);

    const completionStatus = getCompletionStatus();

    // -------------------------------------------------------------------------
    // 16. UI HELPERS (unchanged from your original)
    // -------------------------------------------------------------------------
    const getStatusStyles = (status) => {
        const base = "inline-flex items-center gap-1 px-1 py-1 rounded-full text-xs border";
        switch (status) {
            case 'complete': return `${base} bg-status-completed/10 text-status-completed border-status-completed/20`;
            case 'incomplete': return `${base} bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20`;
            case 'partial': return `${base} bg-status-pending/10 text-status-pending border-status-pending/20`;
            default: return base;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'complete':
                return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
            case 'incomplete':
                return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
            case 'partial':
                return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
            default: return null;
        }
    };

    const FileList = ({ files, type, showAll, onToggleShowAll, onRemove }) => {
        if (files.length === 0) return null;
        const display = showAll ? files : files.slice(0, 8);
        const hasMore = files.length > 8;

        return (
            <div className="mt-2">
                <h4 className="text-xs font-semibold text-primaryText mb-spacing-xs font-primary">
                    Selected {type === 'image' ? 'Images' : 'Videos'} ({files.length})
                </h4>
                <div className={`flex flex-wrap gap-spacing-sm ${showAll ? '' : 'max-h-48 overflow-y-auto'}`}>
                    {display.map((file, i) => (
                        <div key={i} className="flex items-center justify-between px-spacing-sm py-spacing-xs border border-border-color rounded-lg bg-background-color">
                            <span className="text-xs text-primaryText truncate max-w-[120px] sm:max-w-[200px] font-primary">{file.name}</span>
                            <button onClick={() => onRemove(i, type)} className="text-error hover:text-error/80 ml-spacing-sm p-1">
                                <svg className="w-3 h-3" style={{ color: 'var(--error-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                {hasMore && (
                    <button onClick={onToggleShowAll} className="text-primary hover:text-primary/80 text-xs font-medium mt-spacing-sm font-primary">
                        {showAll ? 'Show Less' : `View All ${files.length} Files`}
                    </button>
                )}
            </div>
        );
    };

    const ExistingMediaGrid = ({ items, type }) => {
        if (!items || items.length === 0) return null;

        const isImage = type === 'image';
        const fallbackSrc = isImage ? '/fallback.png' : '/fallback-video.mp4';

        return (
            <div className="mt-4">
                <h4 className="text-xs font-semibold text-primaryText mb-2 font-primary">
                    Existing {isImage ? 'Images' : 'Videos'} ({items.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((url, i) => (
                        <div
                            key={i}
                            className="relative group rounded-lg overflow-hidden border border-border-color bg-gray-100"
                        >
                            {isImage ? (
                                <img
                                    src={getProductImages(url)}  // ← Already full URL
                                    alt={`Existing ${type} ${i + 1}`}
                                    className="w-full h-28 object-cover"
                                    onError={(e) => { e.currentTarget.src = fallbackSrc; }}
                                />
                            ) : (
                                <video
                                    src={getProductVideos(url)}
                                    className="w-full h-28 object-cover"
                                    controls={true}  // ← play button
                                    onError={(e) => { e.currentTarget.src = fallbackSrc; }}
                                />
                            )}

                            {/* Delete Overlay – fixed hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete this ${type}?`)) {
                                        deleteExistingMedia(url, type);
                                    }
                                }}
                                className="absolute top-1 right-1 bg-[var(--error-color)] text-white p-1.5 rounded-full hover:scale-110 transition-transform shadow-md z-10"
                                title="Delete"
                            >
                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const UploadArea = ({ type, files, inputRef, onFileChange, onDragEnter, onDragLeave, onDragOver, onDrop }) => {
        const isActive = uiState.isDragOver && uiState.dragType === type;
        const hasFiles = files.length > 0;
        const typeName = type === 'image' ? 'Image' : 'Video';
        const accept = type === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/mov,video/avi,video/webm';
        const fileTypes = type === 'image' ? 'JPG, PNG, WEBP' : 'MP4, MOV, AVI, WEBM';
        const maxFiles = type === 'image' ? CONFIG.maxImages : CONFIG.maxVideos;
        const minFiles = type === 'image' ? CONFIG.minImages : 0;

        return (
            <div
                className={`border-1 border-solid rounded-lg p-1 text-center cursor-pointer transition-all duration-300 ${isActive
                    ? 'border-primary bg-primary/10'
                    : hasFiles
                        ? 'border-success bg-success/10'
                        : 'border-border-color bg-background-color hover:border-primary hover:bg-primary/10'
                    }`}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => onDragEnter(e, type)}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, type)}
            >
                <input ref={inputRef} type="file" accept={accept} multiple onChange={(e) => onFileChange(e, type)} className="hidden" />
                {hasFiles ? (
                    <>
                        <svg className="w-5 h-5 text-success mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-semibold text-primaryText mb-1 font-primary">{files.length} {typeName}{files.length !== 1 ? 's' : ''} Selected</h3>
                        <p className="text-secondaryText text-xs font-secondary">Click or drag to add more</p>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 text-primary mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-sm font-semibold text-primaryText mb-1 font-primary">
                            {isUpdateMode ? `Add New ${typeName}s` : `Upload Product ${typeName}s`}
                        </h3>
                        <p className="text-secondaryText text-xs font-secondary">
                            {fileTypes} • {minFiles > 0 ? `${minFiles}-${maxFiles}` : `Max ${maxFiles}`} files • Max 50MB each
                        </p>
                    </>
                )}
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // 17. RENDER
    // -------------------------------------------------------------------------
    return (
        <div className="py-8 max-w-8xl px-3 bg-[var(--background-color)]">

            {/* Progress Overlay */}
            {uiState.isUploading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--card-background-color)] rounded-2xl p-8 text-center max-w-md w-full">
                        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-[var(--primary-text-color)] mb-4">
                            {isUpdateMode ? 'Updating...' : 'Uploading...'}
                        </h3>
                        <div className="w-full bg-[var(--border-color)] rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-[var(--primary-color)] h-full transition-all duration-300" style={{ width: `${uiState.uploadProgress}%` }}></div>
                        </div>
                        <p className="text-sm text-[var(--secondary-text-color)]">{uiState.uploadProgress}% Complete</p>
                    </div>
                </div>
            )}

            <div className=" mx-auto">
                <div className="border overflow-hidden">
                    <div className="p-2 lg:p-1">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-1">
                            <div>
                                <h1 className="text-lg font-bold text-[var(--primary-text-color)] font-[var(--font-primary)]">
                                    {isUpdateMode ? 'Update Product Media' : 'Add Product Media'}
                                </h1>
                                <p className="text-sm text-[var(--secondary-text-color)] font-[var(--font-secondary)] mt-1">
                                    {isUpdateMode ? `Tagkey: ${formData.tagKey}` : 'Upload images and videos for your product'}
                                </p>
                            </div>
                            <div className={getStatusStyles(completionStatus.status)}>
                                {getStatusIcon(completionStatus.status)}
                                <span className="text-xs font-medium">
                                    {completionStatus.text} ({completionStatus.count})
                                </span>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2 mb-2">
                            {uiState.feedback.error && (
                                <div className="bg-[var(--error-color)]/10 border border-[var(--error-color)]/20 rounded-lg p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3 text-[var(--error-color)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[var(--error-color)] text-sm font-medium font-[var(--font-primary)]">
                                            {uiState.feedback.error}
                                        </span>
                                    </div>
                                    <button onClick={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, error: '' } }))} className="text-[var(--error-color)] hover:opacity-80">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {uiState.feedback.success && (
                                <div className="bg-[var(--success-color)]/10 border border-[var(--success-color)]/20 rounded-lg p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3 text-[var(--success-color)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[var(--success-color)] text-sm font-medium font-[var(--font-primary)]">
                                            {uiState.feedback.success}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {uiState.feedback.info && (
                                <div className="bg-[var(--info-color)]/10 border border-[var(--info-color)]/20 rounded-lg p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3 h-3 text-[var(--info-color)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[var(--info-color)] text-sm font-medium font-[var(--font-primary)]">
                                            {uiState.feedback.info}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

                            {/* LEFT – Basic Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 mb-2">
                                    <svg className="w-3 h-3 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2 className="text-sm mt-1.5 font-semibold text-[var(--primary-text-color)] font-[var(--font-primary)]">
                                        Basic Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--primary-text-color)] mb-2 font-[var(--font-primary)]">
                                            Product Tag Key *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 125612"
                                            value={formData.tagKey}
                                            onChange={e => handleInputChange('tagKey', e.target.value)}
                                            className="w-full px-2 py-2 border border-[var(--border-color)] rounded-md text-[var(--primary-text-color)] bg-[var(--card-background-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all text-sm font-[var(--font-primary)]"
                                            disabled={isUpdateMode}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--primary-text-color)] mb-2 font-[var(--font-primary)]">
                                            Product Description
                                        </label>
                                        <textarea
                                            placeholder="Provide a detailed description..."
                                            value={formData.description}
                                            onChange={e => handleInputChange('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-2 py-2 border border-[var(--border-color)] rounded-md text-[var(--primary-text-color)] bg-[var(--card-background-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all text-sm font-[var(--font-primary)] resize-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    {isUpdateMode && <ExistingMediaGrid items={existingMedia.images} type="image" />}
                                </div>
                               
                            </div>

                            {/* RIGHT – Media */}
                            <div className="space-y-4">

                                {/* Images */}
                                <div>
                                    <div className="flex items-center gap-1 mb-2">
                                        <svg className="w-3 h-3 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <h2 className="text-sm mt-1.5 font-semibold text-[var(--primary-text-color)] font-[var(--font-primary)]">
                                            Product Images *
                                        </h2>
                                    </div>



                                    <UploadArea
                                        type="image"
                                        files={formData.selectedImages}
                                        inputRef={imageInputRef}
                                        onFileChange={handleFileChange}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    />
                                    <FileList
                                        files={formData.selectedImages}
                                        type="image"
                                        showAll={uiState.showAllImages}
                                        onToggleShowAll={() => setUiState(prev => ({ ...prev, showAllImages: !prev.showAllImages }))}
                                        onRemove={removeFile}
                                    />
                                </div>

                                {/* Videos */}
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <svg className="w-3 h-3 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <h2 className="text-sm mt-1.5 font-semibold text-[var(--primary-text-color)] font-[var(--font-primary)]">
                                            Product Videos
                                        </h2>
                                    </div>



                                    <UploadArea
                                        type="video"
                                        files={formData.selectedVideos}
                                        inputRef={videoInputRef}
                                        onFileChange={handleFileChange}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    />
                                    <FileList
                                        files={formData.selectedVideos}
                                        type="video"
                                        showAll={uiState.showAllVideos}
                                        onToggleShowAll={() => setUiState(prev => ({ ...prev, showAllVideos: !prev.showAllVideos }))}
                                        onRemove={removeFile}
                                    />
                                </div>
                                <div>
                                    {isUpdateMode && <ExistingMediaGrid items={existingMedia.videos} type="video" />}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
                            <button
                                onClick={resetForm}
                                disabled={uiState.isUploading}
                                className="w-full sm:w-auto px-2 py-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg font-semibold hover:bg-[var(--primary-color)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-[var(--font-primary)]"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset Form
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uiState.isUploading || completionStatus.status !== 'complete'}
                                className="w-full sm:w-auto px-2 py-1.5 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-[var(--font-primary)]"
                            >
                                {uiState.isUploading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {isUpdateMode ? 'Updating...' : 'Uploading...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        {isUpdateMode ? 'Update Product' : 'Upload Product'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Validation Status */}
                        <div className="mt-4 text-center">
                            <h3 className="text-sm font-semibold text-[var(--primary-text-color)] mb-2 font-[var(--font-primary)]">
                                Validation Status
                            </h3>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {[
                                    {
                                        label: 'Tag Key',
                                        valid: formData.tagKey.trim().length >= CONFIG.minTagLength,
                                    },
                                    {
                                        label: 'Description',
                                        valid: formData.description.trim().length >= CONFIG.minDescriptionLength,
                                    },
                                    {
                                        label: `Images (${existingMedia.images.length + formData.selectedImages.length}/${CONFIG.minImages}+)`,
                                        valid: (existingMedia.images.length + formData.selectedImages.length) >= CONFIG.minImages,
                                    },
                                    {
                                        label: `Videos (${existingMedia.videos.length + formData.selectedVideos.length})`,
                                        valid: true,
                                        optional: true,
                                    },
                                ].map(({ label, valid, optional }, i) => (
                                    <span
                                        key={i}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-[var(--font-primary)]
                    ${valid
                                                ? optional
                                                    ? 'bg-[var(--info-color)]/10 text-[var(--info-color)] border border-[var(--info-color)]/20'
                                                    : 'bg-[var(--success-color)]/10 text-[var(--success-color)] border border-[var(--success-color)]/20'
                                                : 'bg-[var(--background-color)] text-[var(--secondary-text-color)] border border-[var(--border-color)]'
                                            }`}
                                    >
                                        {valid && !optional && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Snackbar */}
            {uiState.snackbarOpen && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[var(--success-color)] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{isUpdateMode ? 'Product updated!' : 'Product uploaded!'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddImage;