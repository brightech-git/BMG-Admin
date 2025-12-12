// ProductContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import productService from '../../service/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [images, setImages] = useState([]);           // current image URLs
    const [videos, setVideos] = useState([]);           // current video URLs
    const [description, setDescription] = useState('');
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // === GET MEDIA (images + videos) ===
    const getMedia = useCallback(async (tagkey) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productService.getImages(tagkey); // uses GET /record-images
            if (result.error) throw new Error(result.error);

            const imgs = result.images || [];
            const vids = result.videos || [];

            setImages(imgs);
            setVideos(vids);

            return { images: imgs, videos: vids };
        } catch (err) {
            const msg = err.error || err.message || 'Failed to fetch media';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // === GET FULL PRODUCT DETAILS (attributes, flags, etc.) ===
    const getProductDetails = useCallback(async (tagkey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getProductDetails(tagkey);
            if (response.error) throw new Error(response.error);

            setProductDetails(response);
            setDescription(response.description || '');

            return response;
        } catch (err) {
            const msg = err.error || err.message || 'Failed to fetch product details';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // === DELETE SINGLE IMAGE OR VIDEO ===
    const deleteMedia = useCallback(async (tagkey, mediaPath, type) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productService.deleteMedia(tagkey, mediaPath, type);
            if (result.error) throw new Error(result.error);

            if (type === 'image') {
                setImages(prev => prev.filter(p => p !== mediaPath));
            } else {
                setVideos(prev => prev.filter(p => p !== mediaPath));
            }

            return result;
        } catch (err) {
            const msg = err.error || err.message || `Failed to delete ${type}`;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // === UPDATE ALL FIELDS (PUT /update-all-fields) ===
   const updateAllFields = useCallback(async (formData, onProgress) => {
    setLoading(true);
    setError(null);
    try {
        const result = await productService.updateAllFields(formData, onProgress);
        if (result.images || result.videos) {
            setImages(result.images || []);
            setVideos(result.videos || []);
        }
        return result;
    } catch (err) {
        const msg = err.error || err.message || 'Update failed';
        setError(msg);
        throw err;
    } finally {
        setLoading(false);
    }
}, []);

    // === VALIDATE BEFORE SUBMIT ===
    const validateProductData = useCallback((tagkey, images, description) => {
        const errors = [];

        if (!tagkey?.trim()) errors.push('Tag key is required');
        if (!description?.trim()) errors.push('Description is required');
        if (!images || images.length < 3) errors.push('At least 3 images required');

        return { isValid: errors.length === 0, errors };
    }, []);

    // === CREATE FormData for update-all-fields ===
    const createFormData = useCallback((
        isUpdateMode,
        tagkey,
        images = [],        // New image files
        videos = [],        // New video files
        description = '',
        trendingOptions = {},
        productAttributes = {},
        orderedImagePaths = [],  // Array: ['path1', null, 'path2'] - null for new files
        orderedVideoPaths = []   // Array: ['path1', null, 'path2'] - null for new files
    ) => {
        const formData = new FormData();

        formData.append('tagkey', tagkey?.trim() || '');
        if (description?.trim()) formData.append('description', description.trim());

        // Marketing flags
        // formData.append('top_trending', trendingOptions.topTrending ?? false);
        // formData.append('featured_products', trendingOptions.featuredProducts ?? false);
        // formData.append('best_design', trendingOptions.bestDesign ?? false);

        // Product attributes
        // const attrMap = {
        //     gender: 'gender',
        //     occasion: 'occasion',
        //     collectionType: 'collection_type',
        //     materialFinish: 'material_finish',
        //     colorAccents: 'color_accents',
        // };

        // Object.entries(attrMap).forEach(([uiKey, backendKey]) => {
        //     const value = productAttributes[uiKey];
        //     if (value) formData.append(backendKey, value);
        // });

        // THE FIX: Use the correct parameter names!
        if (isUpdateMode) {
            // ✅ Append new files
           images.forEach((item) => {
    if (item instanceof File) {
        formData.append("newImages", item);
    }
    if (item?.file instanceof File) {
        formData.append("newImages", item.file);
    }
});


            videos.forEach((file, index) => {
                if (file instanceof File) {
                    formData.append('newVideos', file);
                }
            });

            // ✅ Send the ordered paths array (with nulls for new files)
            // Backend will understand null = new file being uploaded
            if (orderedImagePaths.length > 0) {
             
                const cleanImageOrder = orderedImagePaths.filter((p) => p !== null && p !== undefined && p !== "");
                formData.append("imageOrder", JSON.stringify(cleanImageOrder));

            }

            if (orderedVideoPaths.length > 0) {
                const cleanVideoOrder = orderedVideoPaths.filter((p) => p !== null && p !== undefined && p !== "");
                formData.append("videoOrder", JSON.stringify(cleanVideoOrder));
            }

            console.log('📤 Sending to backend:', {
                tagkey: tagkey,
                description: description.trim(),
                newImages: images.map(f => f?.name || 'N/A'),
                newVideos: videos.map(f => f?.name || 'N/A'),
                orderedImagePaths: orderedImagePaths,
                orderedVideoPaths: orderedVideoPaths
            });

        } else {
            // Create mode - just send files
            images.forEach(file => {
                if (file instanceof File) {
                    formData.append('images', file);
                }
            });

            videos.forEach(file => {
                if (file instanceof File) {
                    formData.append('videos', file);
                }
            });
        }

        return formData;
    }, []);

    // === UPLOAD NEW PRODUCT (first time) ===
    const uploadImages = useCallback(async (formData, onProgress) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productService.uploadImagesWithParams(formData, onProgress);
            return result;
        } catch (err) {
            const msg = err.error || err.message || 'Upload failed';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <ProductContext.Provider
            value={{
                // State
                images,
                videos,
                description,
                productDetails,
                loading,
                error,
                filteredProducts,
                setFilteredProducts,

                // Actions
                getMedia,
                getProductDetails,
                deleteMedia,
                updateAllFields,
                uploadImages,
                validateProductData,
                createFormData,
                setError,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};