// productService.js
import axiosInstance from '../api/axiosInstance';

const productService = {
    // Upload images and product details


    uploadImagesWithParams: async (formData, onProgress = null) => {
        try {
            console.log('Final FormData in service:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const response = await axiosInstance.post(
                'product_image/upload-record-images',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percent);
                        }
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
            throw error.response?.data || { error: error.message };
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
            const response = await axiosInstance.delete(`/product_image/delete-image`, {
                params: { tagkey, imagePath },
            });
            return response.data;
        } catch (error) {
            console.error('Delete image error:', error);
            throw error.response?.data || { error: error.message || 'Failed to delete image' };
        }
    },
    updateImage: async (tagkey, description, newImageFile) => {
        try {
            const formData = new FormData();
            formData.append("tagkey", tagkey);
            if (description) formData.append("newDescription", description);
            if (newImageFile) formData.append("newImage", newImageFile); 

            console.log()
            const response = await axiosInstance.put(
                `/product_image/update-image-description`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Update description error:", error);
            throw error.response?.data || { error: error.message || "Failed to update description" };
        }
    },

    updateDescription: async (tagkey, description, newImageFile) => {
        try {
            const formData = new FormData();
            formData.append("tagkey", tagkey);
            if (description) formData.append("newDescription", description);
            if (newImageFile) formData.append("newImage", newImageFile); // optional

            const response = await axiosInstance.put(
                `/product_image/update-image-description`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Update description error:", error);
            throw error.response?.data || { error: error.message || "Failed to update description" };
        }
    },

    getProductDetails: async (tagkey) => {
        try {
            const response = await axiosInstance.get('/product/getTagkeyFilter', {
                params: { tagkey }
            });
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
    // productService.js (add these two methods)

    updateAllFields: async (formData, onProgress = null) => {
    try {   

        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        const response = await axiosInstance.put('/product_image/update-all-fields', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: error.message };
    }
},
    

    deleteMedia: async (tagkey, mediaPathArray, type) => {

        console.log(mediaPathArray ,'mediapath')
        try {
            const response = await axiosInstance.delete('/product_image/delete-media',{
                params: { tagkey }, 
                data:mediaPathArray          // ✔ sent as URL params
              
            });

            return response.data;

        } catch (error) {
            console.error('Delete media error:', error);
            throw error.response?.data || { error: error.message };
        }
    },


    // 🔹 NEW: Filter products
    filterItems: async (filters = {}) => {
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
