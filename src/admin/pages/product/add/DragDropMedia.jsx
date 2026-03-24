// components/common/DragDropMedia.jsx
import React, { useState, useCallback, useRef, memo } from 'react';
import * as LucideIcons from 'lucide-react';
import MediaItem from './MediaItem';

const {
    FileImage,
    FileVideo,
    Plus,
    Trash2,
} = LucideIcons;


// -------------------------------------------------------------------------
// Main DragDropMedia Component
// -------------------------------------------------------------------------
const DragDropMedia = memo(({
    items = [],
    onItemsChange,
    maxItems = 10,
    accept = 'image/jpeg,image/png,image/webp,video/mp4,video/mov,video/avi,video/webm',
    type = 'image',
    onDeleteExisting,
    apiBase = 'https://app.bmgjewellers.com', // Make configurable
    showReorderInfo = true,
    className = '',
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);
    const dragSourceRef = useRef(null);

    // Process dropped/selected files
    const processFiles = useCallback((files) => {
        if (!files?.length) return;

        // Define size limits
        const MAX_IMAGE_SIZE = 200 * 1024; // 200KB
        const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

        const newItems = Array.from(files)
            .filter(file => {
                // Type validation
                if (type === 'image') {
                    return file.type.startsWith('image/');
                } else {
                    return file.type.startsWith('video/');
                }
            })
            .filter(file => {
                // Size validation
                if (type === 'image') {
                    return file.size <= MAX_IMAGE_SIZE;
                } else {
                    return file.size <= MAX_VIDEO_SIZE;
                }
            })
            .map(file => ({
                id: `${Date.now()}-${crypto.randomUUID?.() || Math.random()}-${file.name}`,
                src: URL.createObjectURL(file),
                alt: file.name,
                file,
                type,
                isExisting: false,
            }));

        if (!newItems.length) {
            alert(`Files too large. Max ${type === 'image' ? '200KB' : '10MB'} per file.`);
            return;
        }

        onItemsChange([...items, ...newItems].slice(0, maxItems));
        setIsDragActive(false);
    }, [items, onItemsChange, maxItems, type]);


    // Remove item with cleanup
    const handleRemoveItem = useCallback((index) => {
        const item = items[index];

        // Handle existing file deletion
        if (item.isExisting && item.serverPath && onDeleteExisting) {
            if (!window.confirm(`Delete this ${type}? This action cannot be undone.`)) return;
            onDeleteExisting([`${apiBase}${item.serverPath}`], type);
        }

        // Cleanup blob URL for new files
        if (!item.isExisting && item.src?.startsWith('blob:')) {
            URL.revokeObjectURL(item.src);
        }

        onItemsChange(items.filter((_, i) => i !== index));
    }, [items, onItemsChange, type, onDeleteExisting, apiBase]);

    // Handle drop reordering
    const handleDropItem = useCallback((targetIndex) => {
        const sourceIndex = dragSourceRef.current;
        if (sourceIndex === null || sourceIndex === targetIndex) {
            setDraggedIndex(null);
            dragSourceRef.current = null;
            return;
        }

        const newItems = [...items];
        const [draggedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        onItemsChange(newItems);
        setDraggedIndex(null);
        dragSourceRef.current = null;
    }, [items, onItemsChange]);

    // Drag event handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        if (e.currentTarget === e.target) {
            setIsDragActive(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileInput = useCallback((e) => {
        processFiles(e.target.files);
        e.target.value = ''; // Allow re-upload of same file
    }, [processFiles]);

    const canAddMore = items.length < maxItems;
    const typeName = type === 'image' ? 'Image' : 'Video';
    const firstNewIndex = items.findIndex(i => !i.isExisting) + 1 || 1;

    return (
        <div className={`w-full ${className}`}>
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
                        <FileImage className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-secondaryText'}`} />
                    ) : (
                        <FileVideo className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-secondaryText'}`} />
                    )}

                    <div>
                        <p className="font-semibold text-[var(--primary-text-color)] text-sm m-0">
                            {isDragActive ? `Drop ${type}s here` : `Drag & drop ${type}s here`} or click to browse
                        </p>
                      
                    </div>

                    {/* Add this line for file size info */}
                    <p className="text-xs text-gray-500 m-0">
                        Max {type === 'image' ? '200KB' : '10MB'} per file
                    </p>

                    <p className="text-xs text-secondaryText bg-gray-200 px-3 py-1 rounded-full">
                        {items.length}/{maxItems} • {canAddMore
                            ? `${maxItems - items.length} slot${maxItems - items.length !== 1 ? 's' : ''} left`
                            : 'Maximum reached'
                        }
                    </p>
                </div>
            </div>

            {/* Media Grid */}
            {items.length > 0 && (
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xs font-semibold text-primaryText m-0">
                            {typeName}s ({items.length})
                        </h3>

                        {showReorderInfo && (
                            <p className="text-xs text-secondaryText">
                                Drag to reorder • {firstNewIndex > items.length
                                    ? 'All existing'
                                    : `#${firstNewIndex} onwards are new`
                                }
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 m-0">
                        {items.map((item, index) => (
                            <MediaItem
                                key={item.id}
                                item={item}
                                index={index}
                                type={type}
                                isDragged={draggedIndex === index}
                                onDragStart={() => {
                                    dragSourceRef.current = index;
                                    setDraggedIndex(index);
                                }}
                                onDragEnd={() => {
                                    setDraggedIndex(null);
                                    dragSourceRef.current = null;
                                }}
                                onDropItem={handleDropItem}
                                onRemove={handleRemoveItem}
                            />
                        ))}

                        {canAddMore && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-lg border-2 border-dashed border-border-color flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                aria-label="Add more files"
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <Plus className="w-6 h-6 text-secondaryText group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-medium text-secondaryText group-hover:text-primary">
                                        Add
                                    </span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

DragDropMedia.displayName = 'DragDropMedia';

export default DragDropMedia;