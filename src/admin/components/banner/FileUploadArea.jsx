// components/common/FileUploadArea.jsx
import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import 'animate.css';

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------
const API_BASE = 'https://app.bmgjewellers.com';
const MAX_FILE_SIZE = 50 * 1024; // 50KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// -------------------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------------------
const validateFile = (file) => {
    if (!file) return null;
    if (!file.type?.startsWith('image/')) return 'Only image files allowed (jpg, png, webp)';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid format. Only JPG, PNG, WEBP allowed';
    if (file.size > MAX_FILE_SIZE) {
        const sizeInKB = (file.size / 1024).toFixed(1);
        return `File too large: ${sizeInKB}KB / 50KB maximum`;
    }
    return null;
};

const getFileSizeColor = (size) => {
    if (size > 40) return 'red';
    if (size > 30) return 'yellow';
    return 'green';
};

// -------------------------------------------------------------------------
// ImagePreview Subcomponent
// -------------------------------------------------------------------------
const ImagePreview = memo(({
    image,
    existingUrl,
    alt,
    maxSizeKB = 50,
    showSizeBadge = true,
    showProgressBar = true,
    showTooltip = true,
    apiBase = API_BASE,
    onError
}) => {
    const fileSize = image ? (image.size / 1024).toFixed(1) : null;
    const isOverLimit = fileSize > maxSizeKB;
    const sizeColor = fileSize ? getFileSizeColor(parseFloat(fileSize)) : null;

    // Cleanup object URL on unmount
    React.useEffect(() => {
        return () => {
            if (image && image.preview) {
                URL.revokeObjectURL(image.preview);
            }
        };
    }, [image]);

    const previewSrc = image?.preview || (image && URL.createObjectURL(image));
    const existingSrc = existingUrl ? `${apiBase}${existingUrl}` : null;

    const handleImageError = useCallback((e) => {
        e.currentTarget.src = '/fallback-image.png';
        onError?.(e);
    }, [onError]);

    return (
        <div className="relative group">
            <div className={`
                w-32 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300
                ${image ? 'border-indigo-200 shadow-lg' : existingUrl ? 'border-gray-300' : 'border-gray-200'}
                ${isOverLimit ? 'border-red-300 bg-red-50' : ''}
                group-hover:shadow-xl group-hover:scale-105
            `}>
                {image ? (
                    <div className="relative w-full h-full">
                        <img
                            src={previewSrc}
                            alt={alt || 'Preview'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={handleImageError}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* File size badge */}
                        {showSizeBadge && fileSize && (
                            <div className={`
                                absolute top-1 right-1 px-2 py-1 rounded-full text-[10px] font-bold
                                animate__animated animate__fadeIn
                                bg-${sizeColor}-500 text-white
                            `}>
                                {fileSize}KB
                            </div>
                        )}

                        {/* Progress bar */}
                        {showProgressBar && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                <div
                                    className={`h-full transition-all duration-500 bg-${sizeColor}-500`}
                                    style={{ width: `${Math.min((fileSize / maxSizeKB) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                ) : existingUrl ? (
                    <img
                        src={existingSrc}
                        alt={alt || 'Existing'}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-xs text-gray-400">No image</span>
                    </div>
                )}
            </div>

            {/* File name tooltip */}
            {showTooltip && image?.name && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ">
                    <span className="text-[10px] bg-gray-800 text-white px-2 py-1 rounded-full shadow-lg">
                        {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
                    </span>
                </div>
            )}
        </div>
    );
});

ImagePreview.displayName = 'ImagePreview';

ImagePreview.propTypes = {
    image: PropTypes.shape({
        name: PropTypes.string,
        size: PropTypes.number,
        type: PropTypes.string,
        preview: PropTypes.string
    }),
    existingUrl: PropTypes.string,
    alt: PropTypes.string,
    maxSizeKB: PropTypes.number,
    showSizeBadge: PropTypes.bool,
    showProgressBar: PropTypes.bool,
    showTooltip: PropTypes.bool,
    apiBase: PropTypes.string,
    onError: PropTypes.func
};

// -------------------------------------------------------------------------
// Main FileUploadArea Component
// -------------------------------------------------------------------------
const FileUploadArea = memo(({
    // Core props
    type,
    value,
    onChange,
    existingUrl,

    // UI props
    label,
    required = false,
    isMobile = false,
    isLoading = false,
    error,

    // File validation props
    maxSizeKB = 50,
    allowedTypes = ALLOWED_TYPES,
    customValidator,

    // Image preview props
    showSizeBadge = true,
    showProgressBar = true,
    showTooltip = true,

    // API props
    apiBase = API_BASE,

    // Event props
    onFileSelect,
    onFileRemove,
    onError,
    onValidationError,

    // Styling props
    className = '',
    previewClassName = '',
    uploadButtonClassName = '',
    labelClassName = '',

    // Other props
    disabled = false,
    accept = 'image/*',
    id,
    name,
    alt="image",
    placeholder = 'Upload Image',
    changeButtonText = 'Change Image',
    uploadButtonText = 'Upload Image',
    hint = 'JPG, PNG, WEBP • Max 50KB',
    'aria-label': ariaLabel,
}) => {
    const [fileError, setFileError] = useState('');
    const [internalImage, setInternalImage] = useState(null);
    const fileInputRef = React.useRef(null);

    // Use either controlled or uncontrolled mode
    const currentImage = value !== undefined ? value : internalImage;
    const setCurrentImage = onChange || setInternalImage;

    // Validate file
    const validateFileInternal = useCallback((file) => {
        // Built-in validation
        if (!file) return 'No file selected';
        if (!file.type?.startsWith('image/')) return 'Only image files allowed';
        if (!allowedTypes.includes(file.type)) {
            const formats = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
            return `Invalid format. Only ${formats} allowed`;
        }
        if (file.size > maxSizeKB * 1024) {
            const sizeInKB = (file.size / 1024).toFixed(1);
            return `File too large: ${sizeInKB}KB / ${maxSizeKB}KB maximum`;
        }

        // Custom validator
        if (customValidator) {
            const customError = customValidator(file);
            if (customError) return customError;
        }

        return null;
    }, [allowedTypes, maxSizeKB, customValidator]);

    // Handle file change - FIXED
    const handleFileChange = useCallback((e) => {
        // Clear error FIRST - before doing anything else
        setFileError('');

        const file = e.target.files?.[0];
        if (!file) return;

        // Add preview property
        file.preview = URL.createObjectURL(file);

        const validationError = validateFileInternal(file);

        if (validationError) {
            setFileError(validationError);
            onValidationError?.(validationError, file);

            // Clean up preview
            URL.revokeObjectURL(file.preview);

            // Reset input
            e.target.value = '';
            return;
        }

        // Clear error again to be sure
        setFileError('');
        setCurrentImage(file);
        onFileSelect?.(file);

        // Clean up previous preview
        if (currentImage?.preview) {
            URL.revokeObjectURL(currentImage.preview);
        }
    }, [setCurrentImage, onFileSelect, onValidationError, validateFileInternal, currentImage]);




    // Handle remove
    const handleRemove = useCallback(() => {
        if (currentImage?.preview) {
            URL.revokeObjectURL(currentImage.preview);
        }
        setCurrentImage(null);
        setFileError(''); // Clear error on remove
        onFileRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [currentImage, setCurrentImage, onFileRemove]);

    
    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (currentImage?.preview) {
                URL.revokeObjectURL(currentImage.preview);
            }
        };
    }, [currentImage]);

    const inputId = id || `file-upload-${type}`;
    const displayError = error !== undefined ? error : fileError;
    const isDesktop = !isMobile;
    const showRequired = required && !currentImage && !existingUrl;

    return (
        <div className={`
            flex-1 flex flex-col p-4 rounded-xl border-2 transition-all duration-300
            animate__animated animate__fadeIn
            ${currentImage || existingUrl
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-transparent'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20'
            }
            ${displayError ? 'border-red-300 bg-red-50/30' : ''}
            ${disabled || isLoading ? 'opacity-60 pointer-events-none' : ''}
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <label
                    htmlFor={inputId}
                    className={`
                        text-xs font-semibold text-gray-700 flex items-center gap-1.5
                        ${labelClassName}
                    `}
                >
                    <span className={`
                        px-2 py-0.5 rounded-full text-[10px] font-medium
                        ${isMobile ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                    `}>
                        {isMobile ? '📱 MOBILE' : '💻 DESKTOP'}
                    </span>
                    {label}
                    {showRequired && (
                        <span className="text-red-500 animate__animated animate__pulse animate__infinite">*</span>
                    )}
                </label>

                {currentImage && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled || isLoading}
                        className="p-1 rounded-full hover:bg-red-100 transition-all duration-200 group
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove image"
                    >
                        <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
                <ImagePreview
                    image={currentImage}
                    existingUrl={existingUrl}
                    alt={alt || `${type} preview`}
                    maxSizeKB={maxSizeKB}
                    showSizeBadge={showSizeBadge}
                    showProgressBar={showProgressBar}
                    showTooltip={showTooltip}
                    apiBase={apiBase}
                    onError={onError}
                    className={previewClassName}
                />

                <div className="flex-1 space-y-2">
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            id={inputId}
                            name={name}
                            accept={accept}
                            onChange={handleFileChange}
                            disabled={disabled || isLoading}
                            className="hidden"
                            aria-label={ariaLabel || `Upload ${type} image`}
                            aria-invalid={!!displayError}
                            aria-describedby={displayError ? `${inputId}-error` : undefined}
                        />

                        <label
                            htmlFor={inputId}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                                transition-all duration-300 cursor-pointer
                                ${disabled || isLoading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105'
                                }
                                animate__animated animate__fadeIn
                                ${uploadButtonClassName}
                            `}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {currentImage ? changeButtonText : uploadButtonText}
                        </label>

                        {hint && (
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {hint}
                            </p>
                        )}
                    </div>

                    {/* Error message */}
                    {/* {displayError && (
                        <div id={`${inputId}-error`} className="animate__animated animate__headShake">
                            <p className="text-[10px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {displayError}
                            </p>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
});

FileUploadArea.displayName = 'FileUploadArea';

// -------------------------------------------------------------------------
// PropTypes
// -------------------------------------------------------------------------
FileUploadArea.propTypes = {
    // Core props
    type: PropTypes.oneOf(['desktop', 'mobile', 'image', 'banner', 'avatar', 'thumbnail']).isRequired,
    value: PropTypes.object, // File object (controlled)
    onChange: PropTypes.func, // For controlled component
    existingUrl: PropTypes.string, // Existing image URL path

    // UI props
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    isMobile: PropTypes.bool,
    isLoading: PropTypes.bool,
    error: PropTypes.string, // External error

    // File validation props
    maxSizeKB: PropTypes.number,
    allowedTypes: PropTypes.arrayOf(PropTypes.string),
    customValidator: PropTypes.func,

    // Image preview props
    showSizeBadge: PropTypes.bool,
    showProgressBar: PropTypes.bool,
    showTooltip: PropTypes.bool,

    // API props
    apiBase: PropTypes.string,

    // Event props
    onFileSelect: PropTypes.func,
    onFileRemove: PropTypes.func,
    onError: PropTypes.func,
    onValidationError: PropTypes.func,

    // Styling props
    className: PropTypes.string,
    previewClassName: PropTypes.string,
    uploadButtonClassName: PropTypes.string,
    labelClassName: PropTypes.string,

    // Other props
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    alt: PropTypes.string,
    placeholder: PropTypes.string,
    changeButtonText: PropTypes.string,
    uploadButtonText: PropTypes.string,
    hint: PropTypes.string,
    'aria-label': PropTypes.string,
};

FileUploadArea.defaultProps = {
    required: false,
    isMobile: false,
    isLoading: false,
    maxSizeKB: 50,
    allowedTypes: ALLOWED_TYPES,
    showSizeBadge: true,
    showProgressBar: true,
    showTooltip: true,
    apiBase: API_BASE,
    disabled: false,
    accept: 'image/*',
    changeButtonText: 'Change Image',
    uploadButtonText: 'Upload Image',
    hint: 'JPG, PNG, WEBP • Max 50KB',
};

// -------------------------------------------------------------------------
// Export
// -------------------------------------------------------------------------
export default FileUploadArea;