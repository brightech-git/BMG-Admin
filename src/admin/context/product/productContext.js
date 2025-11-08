// ProductContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import productService from '../../service/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [description, setDescription] = useState('');
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]); // 🔹 new state

    const getImages = useCallback(async (tagkey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getImages(tagkey);
            setImages(response.images || []);
            setDescription(response.description || '');
            return response;
        } catch (err) {
            const errorMessage = err.error || err.message || 'Failed to fetch images';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadImages = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productService.uploadImagesWithParams(formData);

            if (result.error) throw new Error(result.error);

            const tagkey = formData.get('tagkey');
            if (tagkey) {
                return await getImages(tagkey);
            }
            return result;
        } catch (err) {
            const errorMessage = err.error || err.message || 'Failed to upload images';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [getImages]);

    const deleteImage = useCallback(
        async (tagkey, imagePath) => {
            setLoading(true);
            setError(null);
            try {
                const result = await productService.deleteImage(tagkey, imagePath);
                if (result.error) {
                    setError(result.error);
                    throw new Error(result.error);
                }
                const updatedData = await getImages(tagkey);
                return updatedData;
            } catch (err) {
                const errorMessage = err.error || err.message || 'Failed to delete image';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [getImages]
    );

    const updateImage = useCallback(
        async (tagkey, oldImagePath, newImageFile) => {
            setLoading(true);
            setError(null);
            try {
                const result = await productService.updateImage(tagkey, oldImagePath, newImageFile);
                if (result.error) {
                    setError(result.error);
                    throw new Error(result.error);
                }
                const updatedData = await getImages(tagkey);
                return updatedData;
            } catch (err) {
                const errorMessage = err.error || err.message || 'Failed to update image';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [getImages]
    );

    const updateDescription = useCallback(
        async (tagkey, newDescription) => {
            setLoading(true);
            setError(null);
            try {
                const result = await productService.updateDescription(tagkey, newDescription);
                if (result.error) {
                    setError(result.error);
                    throw new Error(result.error);
                }
                const updatedData = await getImages(tagkey);
                return updatedData;
            } catch (err) {
                const errorMessage = err.error || err.message || 'Failed to update description';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [getImages]
    );

    const getProductDetails = useCallback(async (tagkey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getProductDetails(tagkey);
            if (response.error) {
                setError(response.error);
                throw new Error(response.error);
            }
            setProductDetails(response);
            setImages(response.images || []);
            setDescription(response.description || '');
            return response;
        } catch (err) {
            const errorMessage = err.error || err.message || 'Failed to fetch product details';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProductAttributes = useCallback(
        async (tagkey, trendingOptions, productAttributes, description) => {
            setLoading(true);
            setError(null);
            try {
                const result = await productService.updateProductAttributes(tagkey, trendingOptions, productAttributes, description);
                if (result.error) {
                    setError(result.error);
                    throw new Error(result.error);
                }
                const updatedData = await getProductDetails(tagkey);
                return updatedData;
            } catch (err) {
                const errorMessage = err.error || err.message || 'Failed to update product attributes';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [getProductDetails]
    );

    const validateProductData = useCallback((tagkey, images, description, productAttributes) => {
        const errors = [];

        if (!tagkey || !tagkey.trim()) {
            errors.push('Product tag key is required');
        }

        if (!images || images.length < 3 || images.length > 5) {
            errors.push('Please select between 3 to 5 images');
        }

        if (!description || !description.trim()) {
            errors.push('Product description is required');
        }

        const requiredAttributes = ['gender', 'occasion', 'collectionType', 'materialFinish', 'colorAccents'];
        const missingAttributes = requiredAttributes.filter((attr) => !productAttributes[attr]);

        if (missingAttributes.length > 0) {
            errors.push(`Please select: ${missingAttributes.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }, []);

    const createFormData = useCallback((tagkey, images, description, trendingOptions, productAttributes) => {
        const formData = new FormData();

        // Required fields
        formData.append('tagkey', tagkey?.trim() || '');
        if (description?.trim()) formData.append('description', description.trim());

        // Marketing flags
        formData.append('top_trending', trendingOptions?.topTrending ?? false);
        formData.append('featured_products', trendingOptions?.featuredProducts ?? false);
        formData.append('best_design', trendingOptions?.bestDesign ?? false);

        // === EXACT MAPPING: UI Key → Backend @RequestParam ===
        const SPEC_MAPPING = {
            // UI key (from attributes.description) → backend param name
            'Gender': 'gender',
            'Occasion': 'occasion',
            'Collection Type': 'collection_type',
            'Material Finish': 'material_finish',
            'Color Accents': 'color_accents',
            // Add more if needed: 'Size': 'size', etc.
        };

        Object.entries(productAttributes).forEach(([uiKey, value]) => {
            const backendKey = SPEC_MAPPING[uiKey];
            if (backendKey && value) {
                formData.append(backendKey, value);
            }
        });

        // Images
        images?.forEach(file => formData.append('images', file));

        return formData;
    }, []);


   



    return (
        <ProductContext.Provider
            value={{
                images,
                description,
                productDetails,
                loading,
                error,
                getImages,
                uploadImages,
                deleteImage,
                updateImage,
                updateDescription,
                getProductDetails,
                updateProductAttributes,
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