// productService.js
import axiosInstance from '../api/axiosInstance';

const productService = {
    // Upload images and product details
    uploadImages: async (formData) => {
        try {
            const response = await axiosInstance.post('product_image/upload-record-images', formData);
            return response.data;
        } catch (error) {
            console.error('Upload images error:', error);
            throw error.response?.data || { error: error.message || 'Failed to upload images' };
        }
    },

    uploadImagesWithParams: async (tagkey, images, description, trendingOptions, productAttributes) => {
        try {
            const formData = new FormData();
            formData.append('tagkey', tagkey || '');
            formData.append('description', description || '');

            formData.append('top_trending', trendingOptions?.topTrending || false);
            formData.append('featured_products', trendingOptions?.featuredProducts || false);
            formData.append('best_design', trendingOptions?.bestDesign || false);

            formData.append('gender', productAttributes?.gender || '');
            formData.append('occasion', productAttributes?.occasion || '');
            formData.append('collection_type', productAttributes?.collectionType || '');
            formData.append('material_finish', productAttributes?.materialFinish || '');
            formData.append('color_accents', productAttributes?.colorAccents || '');

            if (images && images.length > 0) {
                images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await axiosInstance.post('product_image/upload-record-images', formData);
            return response.data;
        } catch (error) {
            console.error('Upload images with params error:', error);
            throw error.response?.data || { error: error.message || 'Failed to upload images' };
        }
    },

    getImages: async (tagkey) => {
        try {
            const response = await axiosInstance.get(`product_image/record-images?tagkey=${tagkey}`);
            return response.data;
        } catch (error) {
            console.error('Get images error:', error);
            throw error.response?.data || { error: error.message || 'Failed to fetch images' };
        }
    },

    deleteImage: async (tagkey, imagePath) => {
        try {
            const response = await axiosInstance.delete(`product_image/images/${tagkey}`, {
                data: { imagePath },
            });
            return response.data;
        } catch (error) {
            console.error('Delete image error:', error);
            throw error.response?.data || { error: error.message || 'Failed to delete image' };
        }
    },

    updateImage: async (tagkey, oldImagePath, newImageFile) => {
        try {
            const formData = new FormData();
            formData.append('tagkey', tagkey);
            formData.append('oldImagePath', oldImagePath);
            formData.append('newImage', newImageFile);

            const response = await axiosInstance.put(`product_image/images/${tagkey}/update`, formData);
            return response.data;
        } catch (error) {
            console.error('Update image error:', error);
            throw error.response?.data || { error: error.message || 'Failed to update image' };
        }
    },

    updateDescription: async (tagkey, description) => {
        try {
            const response = await axiosInstance.put(`/product_image/images/${tagkey}/description`, { description });
            return response.data;
        } catch (error) {
            console.error('Update description error:', error);
            throw error.response?.data || { error: error.message || 'Failed to update description' };
        }
    },

    getProductDetails: async (tagkey) => {
        try {
            const response = await axiosInstance.get(`/product_image/product-details/${tagkey}`);
            return response.data;
        } catch (error) {
            console.error('Get product details error:', error);
            throw error.response?.data || { error: error.message || 'Failed to fetch product details' };
        }
    },

    updateProductAttributes: async (tagkey, trendingOptions, productAttributes, description) => {
        try {
            const response = await axiosInstance.put(`/product_image/product-attributes/${tagkey}`, {
                description,
                top_trending: trendingOptions?.topTrending || false,
                featured_products: trendingOptions?.featuredProducts || false,
                best_design: trendingOptions?.bestDesign || false,
                gender: productAttributes?.gender || '',
                occasion: productAttributes?.occasion || '',
                collection_type: productAttributes?.collectionType || '',
                material_finish: productAttributes?.materialFinish || '',
                color_accents: productAttributes?.colorAccents || '',
            });
            return response.data;
        } catch (error) {
            console.error('Update product attributes error:', error);
            throw error.response?.data || { error: error.message || 'Failed to update product attributes' };
        }
    },

    // 🔹 NEW: Filter products
    filterItems : async (filters = {}) => {
        try {
            const response = await axiosInstance.get(`product/items/filter`, {
                params: filters,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered items:', error);
            throw error;
        }
    }
};

export default productService;
