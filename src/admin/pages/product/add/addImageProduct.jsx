import React, { useState, useCallback, useRef, useContext, useEffect } from 'react';
import { useProductContext } from '../../../context/product/productContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MyContext } from '../../../context/themeContext/themeContext';
import { getProductImages, getProductVideos } from '../../../../utils/mediaUtils/mediaUtils.js';
import { compressAndCollectFiles } from '../../../../utils/compress/compressAndCollectFiles.js';
import * as LucideIcons from 'lucide-react';

// Lucide icons
const {
    Upload,
    X,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Info,
    Image,
    Video,
    AlertTriangle,
    GripVertical,
    Plus,
    Loader2,
    Trash2,
    FileImage,
    FileVideo,
    Globe,
    FileText,
    Edit,
} = LucideIcons;

// -------------------------------------------------------------------------
// Media Item Interface
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Drag & Drop Media Component
// -------------------------------------------------------------------------


export function DragDropMedia({
    items,
    onItemsChange,
    maxItems = 10,
    accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/webm',
    type,
    onDeleteExisting,
}) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState  (null);
    const fileInputRef = useRef (null);
    const dragSourceRef = useRef (null);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) {
            setIsDragActive(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const processFiles = useCallback((files) => {
        if (!files) return;

        const newFiles = Array.from(files).filter((file) =>
            type === 'image' ? file.type.startsWith('image/') : file.type.startsWith('video/')
        );

        if (newFiles.length === 0) return;

        const newItems= newFiles.map((file) => ({
            id: `${Date.now()}-${Math.random()}-${file.name}`,
            src: URL.createObjectURL(file),
            alt: file.name,
            file,
            type,
            isExisting: false,
        }));

        const combined = [...items, ...newItems].slice(0, maxItems);
        onItemsChange(combined);
        setIsDragActive(false);
    }, [items, onItemsChange, maxItems, type]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileInput = useCallback(
        (e) => {
            processFiles(e.target.files);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [processFiles]
    );

    const handleRemoveItem = useCallback(
        (index) => {
            const item = items[index];

            // If it's an existing file, ask for confirmation
            if (item.isExisting && item.serverPath && onDeleteExisting) {
                const ok = window.confirm(`Delete this ${type}? This action cannot be undone.`);

                // ❌ If user CANCELS → stop here, do NOT delete from UI
                if (!ok) return;
                console.log(item.serverPath ,'serverPath');
                const baseUrl = 'https://app.bmgjewellers.com'
                // User accepted → call backend delete
                onDeleteExisting([`${baseUrl}${item.serverPath}`], type);
            }

            // Clean new file preview (only for newly added files)
            if (!item.isExisting && item.src.startsWith('blob:')) {
                URL.revokeObjectURL(item.src);
            }

            // Now remove from UI
            const updated = items.filter((_, i) => i !== index);
            onItemsChange(updated);
        },
        [items, onItemsChange, type, onDeleteExisting]
    );



    const handleDragStart = (index) => {
        dragSourceRef.current = index;
        setDraggedIndex(index);
    };

    const handleDragEndItem = useCallback(() => {
        dragSourceRef.current = null;
        setDraggedIndex(null);
    }, []);

    const handleDropItem = useCallback(
        (targetIndex) => {
            if (dragSourceRef.current === null || dragSourceRef.current === targetIndex) {
                handleDragEndItem();
                return;
            }

            const newItems = [...items];
            const [draggedItem] = newItems.splice(dragSourceRef.current, 1);
            newItems.splice(targetIndex, 0, draggedItem);
            onItemsChange(newItems);
            handleDragEndItem();
        },
        [items, onItemsChange, handleDragEndItem]
    );

    const canAddMore = items.length < maxItems;
    const typeName = type === 'image' ? 'Image' : 'Video';

    return (
        <div className="w-full">
            {/* Upload Area */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-all duration-200
          ${isDragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border-color bg-background-color hover:border-primary hover:bg-primary/10'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileInput}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-1">
                    {type === 'image' ? (
                        <FileImage className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-secondaryText'}`} />
                    ) : (
                        <FileVideo className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-secondaryText'}`} />
                    )}
                    <div className='m-0 p-0'>
                        <p className="font-semibold text-sm text-primaryText">
                            {isDragActive ? `Drop ${type}s here` : `Drag ${type}s here to upload`}
                        </p>
                        <p className="text-xs text-secondaryText ">
                            or click to select files
                        </p>
                    </div>
                    <p className="text-xs text-secondaryText">
                        {items.length}/{maxItems} {type}s •
                        {canAddMore ? ` ${maxItems - items.length} more allowed` : ' Max reached'}
                    </p>
                </div>
            </div>

            {/* Media Grid */}
            {items.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-primaryText font-primary">
                            {typeName}s ({items.length})
                        </h3>
                        <p className="text-xs text-secondaryText font-secondary">
                            Drag to reorder • Upload order: <span className="font-bold">#{items.findIndex(i => !i.isExisting) + 1 || 1}</span> onwards are new
                        </p>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragEnd={handleDragEndItem}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggedIndex !== null && draggedIndex !== index) {
                                        e.currentTarget.style.border = '2px dashed #3b82f6';
                                    }
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.style.border = '';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.border = '';
                                    handleDropItem(index);
                                }}
                                className={`
                  group relative aspect-square rounded-lg overflow-hidden cursor-move transition-all duration-200
                  ${draggedIndex === index
                                        ? 'opacity-50 scale-95 ring-2 ring-primary z-10'
                                        : 'hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-transparent'
                                    }
                `}
                            >
                                {/* Media Preview - FIXED: Use img/video tags directly */}
                                {type === 'image' ? (
                                    <img
                                        src={item.src}
                                        alt={item.alt}
                                        className="w-full h-full object-cover bg-gray-100"
                                        onError={(e) => {
                                            console.error('Image load error:', item.src);
                                            e.currentTarget.src = '/fallback.png';
                                        }}
                                    />
                                ) : (
                                    <div className="relative w-full h-full bg-gray-900">
                                        <video
                                            src={item.src}
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            preload="metadata"
                                            onError={(e) => {
                                                console.error('Video load error:', item.src);
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FileVideo className="w-8 h-8 text-white/70" />
                                        </div>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute z-59 inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent 
                transition-opacity duration-200">

                                    <div className="absolute top-1 left-1 bg-primary text-white p-1 rounded-full text-xs font-semibold">
                                        {index + 1}
                                    </div>

                                    {item.isExisting && (
                                        <div className="absolute bottom-2 left-2 bg-green-600 text-white p-1 rounded text-[6px] ">
                                            Exists
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveItem(index);
                                        }}
                                        className="absolute bottom-1 right-1  bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
                                        title={`Remove ${type}`}
                                    >
                                        <Trash2 className="w-2 h-2 " />
                                    </button>
                                </div>



                                {/* Loading indicator for new files */}
                                {!item.isExisting && (
                                    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                                            New
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add more button */}
                        {canAddMore && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-lg border-2 border-dashed border-border-color flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <Plus className="w-6 h-6 text-secondaryText group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-secondaryText group-hover:text-primary transition-colors">
                                        Add More
                                    </span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------
const AddImage = () => {
    // -------------------------------------------------------------------------
    // 1. STATE FROM ROUTE – determines CREATE vs UPDATE
    // -------------------------------------------------------------------------
    const location = useLocation();
    const {
        tagkey: initialTagkey,
        isUpdate = false
    } = location.state || {};

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

    // -------------------------------------------------------------------------
    // 3. LOCAL UI STATE
    // -------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        tagKey: initialTagkey || '',
        description: '',
    });

    // Combined media state for both existing and new files
    const [combinedMedia, setCombinedMedia] = useState({
        images: [],
        videos: []
    });

    const [isUpdateMode, setIsUpdateMode] = useState(isUpdate);

    const [uiState, setUiState] = useState({
        feedback: { error: '', success: '', info: '' },
        uploadProgress: 0,
        isUploading: false,
        snackbarOpen: false,
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
    // 5. FETCH EXISTING DATA (only in UPDATE mode) - UPDATED
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (isUpdate && initialTagkey) {
            const fetchExisting = async () => {
                try {
                    const [mediaRes, detailsRes] = await Promise.all([
                        getMedia(initialTagkey),
                        getProductDetails(initialTagkey)
                    ]);

                    const existingImages = mediaRes.images || [];
                    const existingVideos = mediaRes.videos || [];

                    // Convert existing media to MediaItem format
                    const imageItems = existingImages.map((path, index) => ({
                        id: `existing-image-${index}-${path}`,
                        src: getProductImages(path),
                        alt: `Existing image ${index + 1}`,
                        type: 'image' ,
                        isExisting: true,
                        serverPath: path,
                    }));

                    const videoItems = existingVideos.map((path, index) => ({
                        id: `existing-video-${index}-${path}`,
                        src: getProductVideos(path),
                        alt: `Existing video ${index + 1}`,
                        type: 'video' ,
                        isExisting: true,
                        serverPath: path,
                    }));

                    setCombinedMedia({
                        images: imageItems,
                        videos: videoItems,
                    });

                    setFormData(prev => ({
                        ...prev,
                        description: detailsRes.Description || detailsRes?.[0]?.Description || '',
                        tagKey: initialTagkey
                    }));

                    console.log("Loaded existing media:", {
                        images: imageItems.length,
                        videos: videoItems.length,
                        description: detailsRes.Description || detailsRes?.[0]?.Description
                    });
                } catch (err) {
                    console.error('Failed to load existing data:', err);
                    setFeedback('error', 'Failed to load existing product data');
                }
            };
            fetchExisting();
        }
    }, [isUpdate, initialTagkey, getMedia, getProductDetails]);

    // -------------------------------------------------------------------------
    // 6. FEEDBACK HELPERS
    
    // Replace the prepareMediaForUpload function with this:
    const prepareMediaForUpload = useCallback((mediaItems) => {
        // Create array of ALL items in their current order
        // For existing: serverPath, for new: null (will be uploaded separately)
        const pathsArray = mediaItems.map((item) => {
            if (item.isExisting) {
                return item.serverPath;  // Existing file path
            } else {
                return null;  // New file - will be uploaded separately
            }
        });

        // Filter out only new files for upload
        const newFiles = mediaItems
            .filter(item => !item.isExisting)
            .map(item => item.file)
            .filter(Boolean);

        console.log(`📋 Prepared media order:`, {
            totalItems: mediaItems.length,
            existingPaths: pathsArray.filter(p => p !== null).length,
            newFiles: newFiles.length,
            pathsArray: pathsArray  // This shows the exact order with null for new files
        });

        return {
            pathsArray,    // Array in current order: ['path1', null, 'path2', null, 'path3']
            newFiles,      // New file objects for upload
            totalCount: mediaItems.length,
            existingCount: pathsArray.filter(p => p !== null).length,
            newCount: newFiles.length,
        };
    }, []);
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
    // 8. MEDIA HANDLERS - UPDATED
    // -------------------------------------------------------------------------
    const handleImagesChange = useCallback((images) => {
        setCombinedMedia(prev => ({ ...prev, images }));
    }, []);

    const handleVideosChange = useCallback((videos ) => {
        setCombinedMedia(prev => ({ ...prev, videos }));
    }, []);

    // -------------------------------------------------------------------------
    // 9. DELETE EXISTING MEDIA HANDLER
    // -------------------------------------------------------------------------
    const handleDeleteExisting = useCallback(async (type, path) => {
        console.log(path , 'neededpath')
        try {
            await deleteMedia(formData.tagKey, path, type);

            // Remove from combined media
            setCombinedMedia(prev => ({
                ...prev,
                [type + 's']: prev[type + 's'].filter(item => item.serverPath !== path)
            }));

            setFeedback('success', `${type} deleted successfully`);
        } catch (err) {
            setFeedback('error', err.message || 'Failed to delete media');
        }
    }, [formData.tagKey, deleteMedia, setFeedback]);

    // -------------------------------------------------------------------------
    // 10. INPUT CHANGE
    // -------------------------------------------------------------------------
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearAllFeedback();
    }, [clearAllFeedback]);

    // -------------------------------------------------------------------------
    // 11. FORM VALIDATION - UPDATED
    // -------------------------------------------------------------------------
    // In validateForm - Update the images validation section:
    // Update your validateForm function:
    const validateForm = useCallback(() => {
        const errors = [];

        const { tagKey, description } = formData;
        const { images, videos } = combinedMedia;

        // 🔥 STEP 1: Clean valid image entries
        const cleanImages = images.filter(img =>
            (img.isExisting && img.serverPath) ||
            (img.file instanceof File)
        );

        // 🔥 STEP 2: Count valid images only
        const totalImages = cleanImages.length;

        // NEW images for validation
        const newImages = cleanImages.filter(img => !img.isExisting);

        // ── Tag Key ───────────────────────────
        if (!tagKey.trim()) {
            errors.push('Tag Key is required');
        } else if (tagKey.trim().length < CONFIG.minTagLength) {
            errors.push(`Tag Key must be ≥ ${CONFIG.minTagLength} chars`);
        }

        // ── Description optional ──────────────
        if (description.trim() && description.trim().length < CONFIG.minDescriptionLength) {
            errors.push(`Description must be ≥ ${CONFIG.minDescriptionLength} chars`);
        }

        // ── Images (min/max) ──────────────────
        if (totalImages < CONFIG.minImages) {
            errors.push(
                `You need at least ${CONFIG.minImages} images. Currently have ${totalImages}.`
            );
        }

        if (totalImages > CONFIG.maxImages) {
            errors.push(
                `Maximum ${CONFIG.maxImages} images allowed. Currently have ${totalImages}.`
            );
        }

        // ── Validate NEW image files only ─────
        const newImageFiles = newImages
            .filter(img => img.file instanceof File)
            .map(img => img.file);

        if (newImageFiles.length > 0) {
            const v = validateFiles(newImageFiles, "image");
            if (!v.isValid) errors.push(v.error);
        }

        // ── Videos (same logic) ───────────────
        const cleanVideos = videos.filter(v =>
            (v.isExisting && v.serverPath) ||
            (v.file instanceof File)
        );

        if (cleanVideos.length > CONFIG.maxVideos) {
            errors.push(`Maximum ${CONFIG.maxVideos} videos allowed.`);
        }

        const newVideoFiles = cleanVideos
            .filter(v => !v.isExisting && v.file instanceof File)
            .map(v => v.file);

        if (newVideoFiles.length > 0) {
            const v = validateFiles(newVideoFiles, 'video');
            if (!v.isValid) errors.push(v.error);
        }
        console.log("RAW IMAGES:", images);
        console.log("CLEAN IMAGES:", cleanImages);
        console.log("newImages:", newImages);
        return { isValid: errors.length === 0, errors };
    }, [formData, combinedMedia, validateFiles]);


    // -------------------------------------------------------------------------
    // 12. RESET FORM - UPDATED
    // -------------------------------------------------------------------------
    const resetForm = useCallback(() => {
        // Clean up object URLs for new files only
        [...combinedMedia.images, ...combinedMedia.videos].forEach(item => {
            if (!item.isExisting && item.src && item.src.startsWith('blob:')) {
                URL.revokeObjectURL(item.src);
            }
        });

        setFormData({
            tagKey: initialTagkey || '',
            description: '',
        });

        // Keep existing media in update mode, clear in create mode
        if (isUpdateMode && initialTagkey) {
            // Keep only existing media
            setCombinedMedia({
                images: combinedMedia.images.filter(img => img.isExisting),
                videos: combinedMedia.videos.filter(vid => vid.isExisting),
            });
        } else {
            setCombinedMedia({ images: [], videos: [] });
        }

        setUiState(prev => ({
            ...prev,
            feedback: { error: '', success: '', info: '' },
            uploadProgress: 0,
            isUploading: false,
            snackbarOpen: false,
        }));

        setFeedback('info', 'Form reset successfully', 2000);
    }, [initialTagkey, isUpdateMode, combinedMedia, setFeedback]);

    // -------------------------------------------------------------------------
    // 13. MAIN SUBMIT (CREATE or UPDATE) - UPDATED
    // -------------------------------------------------------------------------
    // In handleUpload function - replace lines 406-439:
    const handleUpload = useCallback(async () => {
        clearAllFeedback();
        // const validation = validateForm();
        // if (!validation.isValid) {
        //     setFeedback('error', `Fix: ${validation.errors.join(', ')}`);
        //     return;
        // }

        setUiState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

        try {
            // Prepare media data - returns paths array with nulls for new files
            const imagesData = prepareMediaForUpload(combinedMedia.images);
            const videosData = prepareMediaForUpload(combinedMedia.videos);

            


            const fd = createFormData(
                isUpdateMode,
                formData.tagKey.trim(),
                imagesData.newFiles,          // New images to upload
                videosData.newFiles,          // New videos to upload
                formData.description.trim(),
                {}, // trendingOptions
                {}, // productAttributes
                imagesData.pathsArray,        // Ordered array with paths & nulls
                videosData.pathsArray         // Ordered array with paths & nulls
            );

            // Log FormData
            console.log('📦 Final FormData:');
            for (let [key, value] of fd.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
                } else if (key === 'imageOrder' || key === 'videoOrder') {
                    console.log(`  ${key}: ${value.substring(0, 100)}...`); // Truncate long JSON
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // REAL PROGRESS CALLBACK
            const onProgress = (percent) => {
                setUiState(prev => ({ ...prev, uploadProgress: percent }));
            };

            let result;

            if (isUpdateMode) {
                result = await updateAllFields(fd, onProgress);
            } else {
                result = await uploadImages(fd, onProgress);
            }

            // Instantly 100% when done
            setUiState(prev => ({ ...prev, uploadProgress: 100, snackbarOpen: true }));
            setFeedback('success', isUpdateMode ? 'Product updated!' : 'Product uploaded!');

            localStorage.setItem('productTagkey', formData.tagKey);

            setTimeout(() => {
                navigate(`/admin/product/manage/single`, { state: { tagkey: formData.tagKey } });
            }, 1500);

        } catch (err) {
            console.error('❌ Upload Error:', err);
            setUiState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
            setFeedback('error', err.message || 'Operation failed');
        }
    }, [
        formData,
        isUpdateMode,
        combinedMedia,
        validateForm,
        createFormData,
        updateAllFields,
        uploadImages,
        clearAllFeedback,
        setFeedback,
        navigate,
        prepareMediaForUpload,
    ]);
    // -------------------------------------------------------------------------
    // 14. COMPLETION STATUS (for button) - UPDATED
    // -------------------------------------------------------------------------
    const getCompletionStatus = useCallback(() => {
        const { tagKey, description } = formData;
        const { images, videos } = combinedMedia;

        const required = [
            !!tagKey.trim() && tagKey.trim().length >= CONFIG.minTagLength,
            !!description.trim() && description.trim().length >= CONFIG.minDescriptionLength,
            images.length >= CONFIG.minImages,
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
    }, [formData, combinedMedia]);

    const completionStatus = getCompletionStatus();

    // -------------------------------------------------------------------------
    // 15. COMPONENT CLEANUP - UPDATED
    // -------------------------------------------------------------------------
    useEffect(() => {
        return () => {
            // Clean up object URLs for new files only
            [...combinedMedia.images, ...combinedMedia.videos].forEach(item => {
                if (!item.isExisting && item.src && item.src.startsWith('blob:')) {
                    URL.revokeObjectURL(item.src);
                }
            });
        };
    }, [combinedMedia]);

    // -------------------------------------------------------------------------
    // 16. UI HELPERS
    // -------------------------------------------------------------------------
    const getStatusStyles = (status) => {
        const base = "inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs border";
        switch (status) {
            case 'complete': return `${base} bg-green-100 text-green-800 border-green-200`;
            case 'incomplete': return `${base} bg-red-100 text-red-800 border-red-200`;
            case 'partial': return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`;
            default: return base;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'complete':
                return <CheckCircle className="w-4 h-4" />;
            case 'incomplete':
                return <AlertTriangle className="w-4 h-4" />;
            case 'partial':
                return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // -------------------------------------------------------------------------
    // 17. MAIN RENDER
    // -------------------------------------------------------------------------
    return (
        <div className="max-w-8xl mt-8 px-3">

            {/* Progress Overlay */}
            {uiState.isUploading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2">
                    <div className="bg-white  rounded-2xl p-3 text-center max-w-md w-full shadow-xl">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900  mb-4">
                            {isUpdateMode ? 'Updating Product...' : 'Uploading Product...'}
                        </h3>
                        <div className="w-full bg-gray-200  rounded-full h-2.5 mb-2 overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300 ease-out"
                                style={{ width: `${uiState.uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 ">
                            {uiState.uploadProgress}% Complete • Please don't close this window
                        </p>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-8xl">
                <div className="bg-white  rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 sm:p-3">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center  border-b border-gray-200 ">
                            <div className="flex items-center gap-2">
                               
                                <div>
                                    <h1 className="text-base font-bold text-gray-900">
                                        {isUpdateMode ? 'Update Product Media' : 'Add Product Media'}
                                    </h1>
                                    <p className="text-xs text-gray-600">
                                        {isUpdateMode
                                            ? `Editing: ${formData.tagKey || 'Product'} • Drag to reorder existing and new files`
                                            : 'Upload and arrange images and videos for your product'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className={getStatusStyles(completionStatus.status)}>
                                {getStatusIcon(completionStatus.status)}
                                <span className="text-xs font-semibold">
                                    {completionStatus.text} ({completionStatus.count})
                                </span>
                            </div>
                        </div>

                        {/* Feedback Messages */}
                        <div className="space-y-3 mb-2">
                            {uiState.feedback.error && (
                                <div className="bg-red-50  border border-red-200 rounded-lg p-2 flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <AlertCircle className="w-5 h-5 text-red-600 " />
                                        <div>
                                            <span className="text-red-800 text-xs font-medium">
                                                {uiState.feedback.error}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, error: '' } }))}
                                        className="text-red-600hover:text-red-800 "
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            {uiState.feedback.success && (
                                <div className="bg-green-50  border border-green-200  rounded-lg p-2 flex items-center gap-1">
                                    <CheckCircle className="w-5 h-5 text-green-600 " />
                                    <span className="text-green-800 text-xs font-medium">
                                        {uiState.feedback.success}
                                    </span>
                                </div>
                            )}
                            {uiState.feedback.info && (
                                <div className="bg-blue-50  border border-blue-200 rounded-lg p-2 flex items-center gap-1">
                                    <Info className="w-5 h-5 text-blue-600" />
                                    <span className="text-blue-800 text-xs  font-medium">
                                        {uiState.feedback.info}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Main Form Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">

                            {/* LEFT – Basic Information */}
                            <div className="space-y-2">
                                <div className="bg-gray-50  rounded-xl p-2 border border-gray-200 ">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <h2 className="text-sm mt-1.5 font-semibold text-gray-900">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Product Tag Key *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., PROD-001-2024"
                                                value={formData.tagKey}
                                                onChange={e => handleInputChange('tagKey', e.target.value)}
                                                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-gray-900  bg-white focus:outline-none focus:ring-2 text-sm focus:ring-primary focus:border-transparent transition-all"
                                                disabled={isUpdateMode}
                                            />
                                            <p className="text-xs text-gray-500  mt-2">
                                                Unique identifier for this product
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                                Product Description
                                            </label>
                                            <textarea
                                                placeholder="Describe your product in detail..."
                                                value={formData.description}
                                                onChange={e => handleInputChange('description', e.target.value)}
                                                rows={5}
                                                className="w-full px-2 py-2 text-sm border border-gray-300  rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                            />
                                            <p className="text-xs text-gray-500  mt-2">
                                                Optional but recommended for better product presentation
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT – Media Upload & Management */}
                            <div className="space-y-2">
                                {/* Images Section */}
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 ">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Image className="w-4 h-4 text-primary" />
                                        <h2 className="text-sm mt-1.5 font-semibold text-gray-900">
                                            Product Images *
                                        </h2>
                                        <span className="ml-auto text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                                            {combinedMedia.images.filter(img => !img.isExisting).length} new • {combinedMedia.images.filter(img => img.isExisting).length} existing
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-xs text-gray-600  mb-2">
                                            Minimum {CONFIG.minImages} images required • Maximum {CONFIG.maxImages} total • Drag to reorder
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 gap-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span>Existing files</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span>New uploads</span>
                                            </div>
                                        </div>
                                    </div>

                                    <DragDropMedia
                                        items={combinedMedia.images}
                                        onItemsChange={handleImagesChange}
                                        maxItems={CONFIG.maxImages}
                                        accept="image/jpeg,image/png,image/webp"
                                        type="image"
                                        onDeleteExisting={(path) => handleDeleteExisting('image', path)}
                                    />
                                </div>

                                {/* Videos Section */}
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 ">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Video className="w-4 h-4 text-primary" />
                                        <h2 className="text-sm mt-1.5 font-semibold text-gray-900 ">
                                            Product Videos
                                        </h2>
                                        <span className="ml-auto text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                                            {combinedMedia.videos.filter(vid => !vid.isExisting).length} new • {combinedMedia.videos.filter(vid => vid.isExisting).length} existing
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-600  mb-2">
                                        Optional • Maximum {CONFIG.maxVideos} total • Drag to reorder
                                    </p>

                                    <DragDropMedia
                                        items={combinedMedia.videos}
                                        onItemsChange={handleVideosChange}
                                        maxItems={CONFIG.maxVideos}
                                        accept="video/mp4,video/mov,video/avi,video/webm"
                                        type="video"
                                        onDeleteExisting={(path) => handleDeleteExisting('video', path)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 pt-2 ">
                            <div className="flex flex-col sm:flex-row gap-2 justify-between">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={resetForm}
                                        disabled={uiState.isUploading}
                                        className="px-2 py-1 border-2 border-gray-300  text-gray-700 rounded-lg font-semibold hover:bg-gray-50  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center gap-1"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reset Form
                                    </button>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="px-2 py-1 border-2 border-gray-300  text-gray-700 rounded-sm font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center text-sm justify-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={uiState.isUploading || completionStatus.status !== 'complete'}
                                    className={`
                                        px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-sm
                                        ${uiState.isUploading || completionStatus.status !== 'complete'
                                            ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl'
                                        }
                                    `}
                                >
                                    {uiState.isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {isUpdateMode ? 'Updating...' : 'Uploading...'}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            {isUpdateMode ? 'Update Product' : 'Upload Product'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Validation Summary */}
                        <div >
                            <h3 className="text-sm font-semibold text-gray-900  ">
                                Validation Summary
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    {
                                        label: 'Tag Key',
                                        valid: formData.tagKey.trim().length >= CONFIG.minTagLength,
                                        required: true,
                                        description: `≥ ${CONFIG.minTagLength} characters`,
                                    },
                                    {
                                        label: 'Description',
                                        valid: formData.description.trim().length >= CONFIG.minDescriptionLength,
                                        required: false,
                                        description: `Optional or ≥ ${CONFIG.minDescriptionLength} chars`,
                                    },
                                    {
                                        label: 'Images',
                                        valid: combinedMedia.images.length >= CONFIG.minImages,
                                        required: true,
                                        description: `${combinedMedia.images.length}/${CONFIG.minImages}+ (${CONFIG.maxImages} max)`,
                                    },
                                    {
                                        label: 'Videos',
                                        valid: combinedMedia.videos.length < CONFIG.maxVideos,
                                        required: false,
                                        description: `${combinedMedia.videos.length}/${CONFIG.maxVideos} max`,
                                    },
                                ].map(({ label, valid, required, description }, i) => (
                                    <div
                                        key={i}
                                        className={`
                                             rounded-lg border-2 p-2 transition-all
                                            ${valid
                                                ? required
                                                    ? 'bg-green-50 border-green-200 '
                                                    : 'bg-blue-50  border-blue-200 '
                                                : 'bg-red-50 border-red-200 '
                                            }
                                        `}
                                    >
                                        <div className="flex items-center m-0 justify-between">
                                            <span className="text-sm  text-gray-900">
                                                {label}
                                            </span>
                                            {valid ? (
                                                <CheckCircle className={`w-4 h-4 ${required ? 'text-green-600' : 'text-blue-600'}`} />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                        <p className="text-xs m-0 text-gray-600">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Snackbar */}
            {uiState.snackbarOpen && (
                <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        <div>
                            <span className="font-bold text-sm">
                                {isUpdateMode ? 'Product Updated!' : 'Product Uploaded!'}
                            </span>
                            <p className="text-xs text-green-100">
                                Redirecting to product management...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddImage;