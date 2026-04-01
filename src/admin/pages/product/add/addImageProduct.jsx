import React, { useState, useCallback, useRef, useContext, useEffect, memo ,useMemo } from 'react';
import { useProductContext } from '../../../context/product/productContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProductImages, getProductVideos } from '../../../../utils/mediaUtils/mediaUtils.js';
import * as LucideIcons from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getProducts } from '../../../service/filterService.js';
import DragDropMedia from './DragDropMedia.jsx';
import { useGetActiveFilterContents } from '../../../hooks/filter/useFilterContent.js';
import Checkbox from '../../../components/ui/CheckBox.jsx';

const {
    Upload, X, RefreshCw, CheckCircle, AlertCircle, Info,
    Image, Video, AlertTriangle, GripVertical, Plus, Loader2,
    Trash2, FileImage, FileVideo, Globe, FileText, Edit,
} = LucideIcons;

// Constants
const CONFIG = {
    imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    videoTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
    maxImageSize: 200 * 1024,
    maxVideoSize: 10 * 1024 * 1024,
    maxImages: 10, maxVideos: 5, minImages: 3,
    minTagLength: 3, minDescriptionLength: 10,
};

const API_BASE = 'https://app.bmgjewellers.com';
const FEEDBACK_DURATION = 3000;


// Loading Skeleton Component
const LoadingSkeleton = () => {
    return (
        <div className="max-w-8xl mt-2 p-2 animate-pulse">
            <div className="mx-auto max-w-8xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 sm:p-3">
                        {/* Header Skeleton */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-2 mb-2">
                            <div className="space-y-2">
                                <div className="h-7 bg-gray-200 rounded-lg w-48"></div>
                                <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded-full w-32 mt-2 sm:mt-0"></div>
                        </div>

                        {/* Main Form Grid Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-1 mb-2">
                            {/* Left Column Skeleton */}
                            <div className="space-y-2">
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                                    <div className="flex items-center gap-1 mb-4">
                                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                                        <div className="h-5 bg-gray-300 rounded w-32"></div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Tag Key Field Skeleton */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                                <div className="h-3 bg-gray-300 rounded w-40"></div>
                                            </div>
                                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                                        </div>

                                        {/* Description Field Skeleton */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="h-4 bg-gray-300 rounded w-40"></div>
                                                <div className="h-3 bg-gray-300 rounded w-32"></div>
                                            </div>
                                            <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column Skeleton */}
                            <div className="flex flex-col gap-2">
                                {/* Images Section Skeleton */}
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-1">
                                            <div className="h-4 w-4 bg-gray-300 rounded"></div>
                                            <div className="h-5 bg-gray-300 rounded w-32"></div>
                                            <div className="h-5 bg-gray-300 rounded w-16"></div>
                                        </div>
                                        <div className="h-8 bg-gray-200 rounded-lg w-28"></div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Videos Section Skeleton */}
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-1">
                                            <div className="h-4 w-4 bg-gray-300 rounded"></div>
                                            <div className="h-5 bg-gray-300 rounded w-32"></div>
                                            <div className="h-5 bg-gray-300 rounded w-16"></div>
                                        </div>
                                        <div className="h-8 bg-gray-200 rounded-lg w-28"></div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkboxes Grid Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                                        <div className="h-4 bg-gray-200 rounded w-36"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons Skeleton */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                        </div>

                        {/* Validation Summary Skeleton */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                            <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-64"></div>
                                <div className="h-4 bg-gray-200 rounded w-56"></div>
                                <div className="h-4 bg-gray-200 rounded w-72"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// -------------------------------------------------------------------------
// Main Component - Optimized
// -------------------------------------------------------------------------
const AddImage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { tagkey: initialTagkey, isUpdate = false } = location.state || {};


    const {
        uploadImages, updateAllFields, getProductDetails,
        deleteMedia, createFormData, setError ,loading,error
    } = useProductContext();


    const { data: filters } = useGetActiveFilterContents();
    console.log(filters,'filters')

    const [formData, setFormData] = useState({
        tagKey: initialTagkey || '',
        description: '',
    });

    const [combinedMedia, setCombinedMedia] = useState({ images: [], videos: [] });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [feedback, setFeedbackState] = useState({ error: '', success: '', info: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});



    // Optimized feedback setters
    const setFeedback = useCallback((type, message, autoClear = true) => {
        setFeedbackState({ error: '', success: '', info: '', [type]: message });
        setError?.(null);

        if (autoClear && (type === 'success' || type === 'info')) {
            setTimeout(() => setFeedbackState(prev => ({ ...prev, [type]: '' })), FEEDBACK_DURATION);
        }
    }, [setError]);


    const transformFilters = (data) => {
        const result = {};

        Object.entries(data).forEach(([key, items]) => {
            result[key] = items.map((item) => ({
                label: item.filterValue,
                value: item.id, // ✅ use ID (best practice)
            }));
        });

        return result;
    };

    const handleFilterChange = useCallback((key, values) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [key]: values,
        }));
    }, []);

    const checkboxData = useMemo(() => {
        if (!filters) return {};
        return transformFilters(filters);
    }, [filters]);

    const safeParse = (val) => {
        try {
            return val ? JSON.parse(val) : [];
        } catch {
            return [];
        }
    };

    // Fetch existing data
    useEffect(() => {
        console.log('Fetching existing data...' ,isUpdate ,initialTagkey);
        if (!isUpdate || !initialTagkey) return;

        const fetchData = async () => {
            try {
                const detailsRes = await getProductDetails(initialTagkey);
                console.log(detailsRes, 'detailsRes');

                const mapToItems = (pathsStr, type) => {
                    const pathsArray = safeParse(pathsStr);
                    return pathsArray.map((path, index) => ({
                        id: `existing-${type}-${index}-${path}`,
                        src: type === 'image'
                            ? getProductImages(path)
                            : getProductVideos(path),
                        alt: `Existing ${type} ${index + 1}`,
                        type,
                        isExisting: true,
                        serverPath: path,
                    }));
                };

                setCombinedMedia({
                    images: mapToItems(detailsRes?.ImagePath , 'image'),
                    videos: mapToItems(detailsRes?.VideoPath, 'video'),
                });


                setFormData(prev => ({
                    ...prev,
                    tagKey: initialTagkey,
                    description: detailsRes.Description ?? '',
                }));

            } catch (err) {
                console.error('Failed to load product details:', err);
                setFeedback('error', 'Failed to load existing data');
            }
        };

        fetchData();
    }, [isUpdate, initialTagkey]);

    console.log(combinedMedia, 'combinedMedia')
    // Cleanup object URLs
    useEffect(() => {
        return () => {
            [...combinedMedia.images, ...combinedMedia.videos].forEach(item => {
                if (!item.isExisting && item.src?.startsWith('blob:')) {
                    URL.revokeObjectURL(item.src);
                }
            });
        };
    }, [combinedMedia]);

    // Optimized media preparation
    const prepareMediaForUpload = useCallback((mediaItems) => ({
        pathsArray: mediaItems.map(item => item.isExisting ? item.serverPath : null),
        newFiles: mediaItems.filter(item => !item.isExisting).map(item => item.file).filter(Boolean),
    }), []);

    // Optimized validation
    const validateForm = useCallback(() => {
        const errors = [];
        const { tagKey, description } = formData;
        const cleanImages = combinedMedia.images.filter(img =>
            (img.isExisting && img.serverPath) || img.file instanceof File
        );
        const totalImages = cleanImages.length;
        const newImages = cleanImages.filter(img => !img.isExisting);

        if (!tagKey.trim()) errors.push('Tag Key is required');
        else if (tagKey.trim().length < CONFIG.minTagLength) errors.push(`Tag Key must be ≥ ${CONFIG.minTagLength} chars`);

        if (description.trim() && description.trim().length < CONFIG.minDescriptionLength) {
            errors.push(`Description must be ≥ ${CONFIG.minDescriptionLength} chars`);
        }

        if (totalImages < CONFIG.minImages) errors.push(`Need at least ${CONFIG.minImages} images (have ${totalImages})`);
        if (totalImages > CONFIG.maxImages) errors.push(`Maximum ${CONFIG.maxImages} images allowed (have ${totalImages})`);

        // Validate new files
        if (newImages.length) {
            const invalidFile = newImages.find(img => !CONFIG.imageTypes.includes(img.file.type) || img.file.size > CONFIG.maxImageSize);
            if (invalidFile) errors.push(`Invalid image: ${invalidFile.file.name}`);
        }

        const cleanVideos = combinedMedia.videos.filter(v =>
            (v.isExisting && v.serverPath) || v.file instanceof File
        );

        if (cleanVideos.length > CONFIG.maxVideos) errors.push(`Maximum ${CONFIG.maxVideos} videos allowed`);

        const newVideos = cleanVideos.filter(v => !v.isExisting && v.file instanceof File);
        if (newVideos.length) {
            const invalidVideo = newVideos.find(v => !CONFIG.videoTypes.includes(v.file.type) || v.file.size > CONFIG.maxVideoSize);
            if (invalidVideo) errors.push(`Invalid video: ${invalidVideo.file.name}`);
        }

        return { isValid: !errors.length, errors };
    }, [formData, combinedMedia]);

    // Optimized submit handler
    const handleSubmit = useCallback(async () => {
        const validation = validateForm();
        if (!validation.isValid) {
            setFeedback('error', validation.errors.join(', '));
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const imagesData = prepareMediaForUpload(combinedMedia.images);
            const videosData = prepareMediaForUpload(combinedMedia.videos);

            console.log(selectedFilters,'selectedFiltersinPage')

            const fd = createFormData(
                isUpdate,
                formData.tagKey.trim(),
                imagesData.newFiles,
                videosData.newFiles,
                formData.description.trim(),
                imagesData.pathsArray,
                videosData.pathsArray,
                selectedFilters
            );

            const onProgress = (percent) => setUploadProgress(percent);

            const result = isUpdate
                ? await updateAllFields(fd, onProgress)
                : await uploadImages(fd, onProgress);

          
                await getProducts();
                queryClient.invalidateQueries(['filter-items', result?.filters]);

                setUploadProgress(100);
                setSnackbarOpen(true);
                setFeedback('success', isUpdate ? 'Product updated!' : 'Product uploaded!', false);

                localStorage.setItem('productTagkey', formData.tagKey);

                setTimeout(() => {
                    navigate('/admin/product/manage/single', { state: { tagkey: formData.tagKey } });
                }, 1500);
            

            
        } catch (err) {
            console.error('Upload error:', err);
            setFeedback('error', err.message || 'Operation failed');
        } finally {
            setIsUploading(false);
        }
    }, [formData, isUpdate, combinedMedia, validateForm, prepareMediaForUpload, createFormData,
        updateAllFields, uploadImages, queryClient, navigate, setFeedback ,selectedFilters]);

    // Optimized completion status
    const completionStatus = useCallback(() => {
        const { tagKey, description } = formData;
        const { images } = combinedMedia;

        const checks = [
            tagKey.trim().length >= CONFIG.minTagLength,
            !description.trim() || description.trim().length >= CONFIG.minDescriptionLength,
            images.length >= CONFIG.minImages,
            true // videos optional
        ];

        const completed = checks.filter(Boolean).length;
        const total = checks.length;

        return {
            status: completed === total ? 'complete' : completed === 0 ? 'incomplete' : 'partial',
            text: completed === total ? 'Ready' : completed === 0 ? 'Not Started' : 'In Progress',
            count: `${completed}/${total}`,
        };
    }, [formData, combinedMedia]);

    const status = completionStatus();

    
    if (loading) {
        return <LoadingSkeleton />;
    }

    // Show loading skeleton specifically for update operations
    if (isUpdate && !formData.tagKey && initialTagkey) {
        return (
            <div className="max-w-8xl mt-2 p-2">
                <div className="mx-auto max-w-8xl">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Product Details</h3>
                            <p className="text-sm text-gray-600">Please wait while we fetch your product information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="max-w-8xl mt-2 p-2">
            {/* Progress Overlay */}
            {isUploading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2">
                    <div className="bg-white rounded-2xl p-3 text-center max-w-md w-full shadow-xl">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isUpdate ? 'Updating Product...' : 'Uploading Product...'}
                        </h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-sm text-gray-600">{uploadProgress}% Complete • Please don't close this window</p>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-8xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 sm:p-3">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-2 mb-2">
                            <div>
                                <h1 className="text-lg font-bold text-[var(--primary-text-color)] m-0">
                                    {isUpdate ? 'Update Product Media' : 'Add Product Media'}
                                </h1>
                                <p className="text-xs text-gray-600 m-0">
                                    {isUpdate ? `Editing: ${formData.tagKey || 'Product'}` : 'Upload and arrange images and videos'}
                                </p>
                            </div>
                            <StatusBadge status={status.status} text={status.text} count={status.count} />
                        </div>

                        {/* Feedback Messages */}
                        <FeedbackMessages feedback={feedback} setFeedback={setFeedbackState} />

                        {/* Main Form Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-1 mb-2">
                            {/* Left Column - Basic Info */}
                            <div className="space-y-2">
                                <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                                    <div className="flex items-center gap-1 mb-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <InputField
                                            label="Product Tag Key *"
                                            value={formData.tagKey}
                                            onChange={(v) => setFormData(prev => ({ ...prev, tagKey: v }))}
                                            placeholder="e.g., PROD-001-2024"
                                            disabled={isUpdate}
                                            hint="Unique identifier for this product"
                                            minWidthLabel="150px"
                                            
                                        />

                                        <TextAreaField
                                            label="Product Description :"
                                            value={formData.description}
                                            onChange={(v) => setFormData(prev => ({ ...prev, description: v }))}
                                            placeholder="Describe your product in detail..."
                                            rows={3}
                                            hint="Optional but recommended"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Media Upload */}
                            <div className="flex flex-col flex-row gap-2">
                                <MediaSection
                                    title="Product Images *"
                                    type="image"
                                    media={combinedMedia.images}
                                    onChange={(images) => setCombinedMedia(prev => ({ ...prev, images }))}
                                    onDelete={(path) => deleteMedia(formData.tagKey, path, 'image')}
                                    config={CONFIG}
                                />

                                <MediaSection
                                    title="Product Videos"
                                    type="video"
                                    media={combinedMedia.videos}
                                    onChange={(videos) => setCombinedMedia(prev => ({ ...prev, videos }))}
                                    onDelete={(path) => deleteMedia(formData.tagKey, path, 'video')}
                                    config={CONFIG}
                                />
                            </div>
                            
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4'>
                            {Object.entries(checkboxData).map(([key, options]) => (
                                <Checkbox
                                    key={key}
                                    label={key}
                                    options={options}
                                    selectedValues={selectedFilters[key] || []}
                                    onChange={(values) => handleFilterChange(key, values)}
                                    multiple={true}
                                    disabled={false}
                                    layout='vertical'
                                />

                            ))}

                        </div>
                       
                        {/* Action Buttons */}
                        <ActionButtons
                            isUploading={isUploading}
                            isUpdate={isUpdate}
                            status={status.status}
                            onReset={() => {
                                // Cleanup and reset
                                [...combinedMedia.images, ...combinedMedia.videos].forEach(item => {
                                    if (!item.isExisting && item.src?.startsWith('blob:')) URL.revokeObjectURL(item.src);
                                });
                                setFormData({ tagKey: initialTagkey || '', description: '' });
                                if (!isUpdate || !initialTagkey) setCombinedMedia({ images: [], videos: [] });
                                setFeedback('info', 'Form reset successfully');
                            }}
                            onCancel={() => navigate(-1)}
                            onSubmit={handleSubmit}
                        />

                        {/* Validation Summary */}
                        <ValidationSummary
                            tagKey={formData.tagKey}
                            description={formData.description}
                            images={combinedMedia.images}
                            videos={combinedMedia.videos}
                            config={CONFIG}
                        />
                    </div>
                </div>
            </div>

            {/* Success Snackbar */}
            {snackbarOpen && (
                <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        <div>
                            <span className="font-bold text-sm">{isUpdate ? 'Product Updated!' : 'Product Uploaded!'}</span>
                            <p className="text-xs text-green-100">Redirecting to product management...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------------------------
// Extracted Subcomponents
// -------------------------------------------------------------------------
const StatusBadge = ({ status, text, count }) => {
    const styles = {
        complete: 'bg-green-100 text-green-800 border-green-200',
        incomplete: 'bg-red-100 text-red-800 border-red-200',
        partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    const icons = {
        complete: <CheckCircle className="w-4 h-4" />,
        incomplete: <AlertTriangle className="w-4 h-4" />,
        partial: <AlertCircle className="w-4 h-4" />,
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs border ${styles[status]}`}>
            {icons[status]}
            <span className="text-xs font-semibold">{text} ({count})</span>
        </div>
    );
};

const FeedbackMessages = ({ feedback, setFeedback }) => {
    if (!feedback.error && !feedback.success && !feedback.info) return null;

    return (
        <div className="space-y-3 mb-2">
            {Object.entries(feedback).map(([type, message]) => message && (
                <div key={type} className={`
                    rounded-lg p-2 flex items-center justify-between
                    ${type === 'error' ? 'bg-red-50 border border-red-200' : ''}
                    ${type === 'success' ? 'bg-green-50 border border-green-200' : ''}
                    ${type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
                `}>
                    <div className="flex items-center gap-1">
                        {type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        {type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                        <span className={`text-xs font-medium ${type === 'error' ? 'text-red-800' :
                                type === 'success' ? 'text-green-800' : 'text-blue-800'
                            }`}>{message}</span>
                    </div>
                    <button onClick={() => setFeedback(prev => ({ ...prev, [type]: '' }))}>
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            ))}
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, disabled, hint ,layout="horizontal",minWidthLabel }) => (
    <>
    <div className={`${layout === "horizontal" ? "flex items-center justify-between gap-2" :""} `}>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${minWidthLabel ? `min-w-[${minWidthLabel}]` : "min-w-[90px]"} sm:${minWidthLabel ? `min-w-[${minWidthLabel}]` : "min-w-[110px]"}`}>{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 text-sm focus:ring-primary focus:border-transparent transition-all"
        />
        
    </div>
    { hint && <p className="text-xs text-gray-500 mt-2">{hint}</p> }
    </>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows, hint }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
        />
        {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
    </div>
);

const MediaSection = ({ title, type, media, onChange, onDelete, config }) => {
    const newCount = media.filter(m => !m.isExisting).length;
    const existingCount = media.filter(m => m.isExisting).length;

    return (
        <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 w-full">
            <div className="flex items-center gap-1 mb-1">
                {type === 'image' ? <Image className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-primary" />}
                <h2 className="text-sm font-semibold text-gray-900 m-0 ">{title}</h2>
                <span className="ml-auto text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full ">
                    {newCount} new • {existingCount} existing
                </span>
            </div>

            {type === 'image' && (
                <>
                    <p className="text-xs text-gray-600 mb-2">
                        Minimum {config.minImages} images required • Maximum {config.maxImages} total • Drag to reorder
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-4 mb-2">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Existing</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>New</span></div>
                    </div>
                </>
            )}

            {type === 'video' && (
                <p className="text-xs text-gray-600 mb-2">Optional • Maximum {config.maxVideos} total • Drag to reorder</p>
            )}

            <DragDropMedia
                items={media}
                onItemsChange={onChange}
                maxItems={type === 'image' ? config.maxImages : config.maxVideos}
                accept={type === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/mov,video/avi,video/webm'}
                type={type}
                onDeleteExisting={onDelete}
            />
        </div>
    );
};

const ActionButtons = ({ isUploading, isUpdate, status, onReset, onCancel, onSubmit }) => (
    <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={onReset}
                    disabled={isUploading}
                    className="px-2 py-1 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs flex items-center justify-center gap-1"
                >
                    <RefreshCw className="w-4 h-4" /> Reset Form
                </button>
                <button
                    onClick={onCancel}
                    className="px-2 py-1 text-gray-100 bg-red-500 rounded-sm font-semibold transition-all duration-200 flex items-center text-sm justify-center gap-1"
                >
                    <X className="w-4 h-4" /> Cancel
                </button>
            </div>

            <button
                onClick={onSubmit}
                disabled={isUploading || status !== 'complete'}
                className={`
                    px-2 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1 text-sm
                    ${isUploading || status !== 'complete'
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange/100 text-white shadow-lg hover:shadow-xl'}
                `}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isUpdate ? 'Updating...' : 'Uploading...'}
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        {isUpdate ? 'Update Product' : 'Upload Product'}
                    </>
                )}
            </button>
        </div>
    </div>
);

const ValidationSummary = ({ tagKey, description, images, videos, config }) => {
    const items = [
        { label: 'Tag Key', valid: tagKey.trim().length >= config.minTagLength, required: true, desc: `≥ ${config.minTagLength} chars` },
        { label: 'Description', valid: !description.trim() || description.trim().length >= config.minDescriptionLength, required: false, desc: `Optional or ≥ ${config.minDescriptionLength} chars` },
        { label: 'Images', valid: images.length >= config.minImages, required: true, desc: `${images.length}/${config.minImages}+ (${config.maxImages} max)` },
        { label: 'Videos', valid: videos.length <= config.maxVideos, required: false, desc: `${videos.length}/${config.maxVideos} max` },
    ];

    return (
        <div className="mt-2">
            <h3 className="text-sm font-semibold text-gray-900 ">Validation Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {items.map(({ label, valid, required, desc }, i) => (
                    <div key={i} className={`
                        rounded-lg border-2 p-2 transition-all m-0
                        ${valid ? (required ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200') : 'bg-red-50 border-red-200'}
                    `}>
                        <div className="flex items-center justify-between m-0">
                            <span className="text-sm text-gray-900">{label}</span>
                            {valid ?
                                <CheckCircle className={`w-4 h-4 ${required ? 'text-green-600' : 'text-blue-600'}`} /> :
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            }
                        </div>
                        <p className="text-xs text-gray-600 m-0">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddImage;