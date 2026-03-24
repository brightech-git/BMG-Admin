// ProductContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import productService from '../../service/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  
    // === GET FULL PRODUCT DETAILS (attributes, flags, etc.) ===
    const getProductDetails = useCallback(async (tagkey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getProductDetails(tagkey);
            if (response.error) throw new Error(response.error);
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
        return result;
    } catch (err) {
        const msg = err.error || err.message || 'Update failed';
        setError(msg);
        throw err;
    } finally {
        setLoading(false);
    }
}, []);

 

    // === CREATE FormData for update-all-fields ===
    const createFormData = useCallback((

        isUpdateMode,
        tagkey,
        images = [],        // New image files
        videos = [],        // New video files
        description = '',
        orderedImagePaths = [],  // Array: ['path1', null, 'path2'] - null for new files
        orderedVideoPaths = [],   // Array: ['path1', null, 'path2'] - null for new files,
        selectedFilters // <-- pass your grouped object here
    ) => {
        const formData = new FormData();

        formData.append('tagkey', tagkey?.trim() || '');

        if (description?.trim()) formData.append('description', description.trim());

        console.log(selectedFilters,'selectedFiltersinContext')

        // --- NEW: Append filterIds ---
        // if (selectedFilters && Object.keys(selectedFilters).length > 0) {
        //     console.log("Selected Filters (grouped):", selectedFilters);

        //     // Flatten all IDs into one array
        //     const filterIds = Object.values(selectedFilters)
        //         .flat()           // merge arrays like [28,27,26,32,31,...]
        //         .map(id => String(id)); // ensure string (optional)


        //     console.log(filterIds,'filterIds')
        //     // Append as JSON string or individual entries
        //     formData.append("filterIds", JSON.stringify(filterIds)); // Backend receives: ["28","27","26",...]
        // }
        if (selectedFilters && Object.keys(selectedFilters).length > 0) {
            console.log("Selected Filters (grouped):", selectedFilters);

            // Flatten all IDs into one array
            const filterIds = Object.values(selectedFilters).flat();

            console.log(filterIds, 'filterIds');

            // Append each ID separately for Spring to parse as List<Integer>
            filterIds.forEach(id => {
                formData.append("filterIds", Number(id)); // send as integer
            });
        }
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

                // Actions
                getProductDetails,
                deleteMedia,
                updateAllFields,
                uploadImages,
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