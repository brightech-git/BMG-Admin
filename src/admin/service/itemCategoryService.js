import axiosInstance from '../api/axiosInstance';

const baseUrl = '/mainCategory_images';

export const getCategories = async () => {
    try {
        const response = await axiosInstance.get(  `${baseUrl}/list`); // wait for the request
        return response.data; // return only the data
    } catch (error) {
        console.error('Error fetching categories:', error.response?.data || error.message || error);
        return null; // return null if something goes wrong
    }
};


export const uploadCategory = async ({image, itemName}) => {
    try {
        const formData = new FormData();
        formData.append('image', image);       // 'image' must match backend @RequestParam name
        formData.append('itemName', itemName); // 'itemName' must match backend @RequestParam name

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const response = await axiosInstance.post(`${baseUrl}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // important for file upload
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading category:', error.response?.data || error.message || error);
        return null;
    }
};
export const updateCategory = async ({ id, itemName, image }) => {
    try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("itemName", itemName);

        if (image) {
            formData.append("image", image); // only append if selected
        }

        const response = await axiosInstance.put(`${baseUrl}/update`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            "Error updating category:",
            error.response?.data || error.message || error
        );
        return null;
    }
};



export const deleteCategory = async (id) => {
    try {
        // id must be a number, not an object
        const response = await axiosInstance.delete(`${baseUrl}/delete`, {
            params: { id } // sends ?id=1
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error.response?.data || error.message || error);
        return null;
    }
};

