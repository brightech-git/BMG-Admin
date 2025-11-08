import { Form } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

            /*----------------------Main Banner---------------------- */

export const bannersService = {
    getBanners: () => axiosInstance.get("/banner/list"),

    createBanner: (image, title,itemname,subtitle ,gender ) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("itemname", itemname);
        formData.append("subtitle", subtitle);
        formData.append("gender",gender);

        console.log(formData,'data for banner')
        

        return axiosInstance.post("/banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateBanner: async (
        id,
        image, // can be File, null or undefined
        title,
        subtitle,
        itemname,
        gender
    ) => {
        const form = new FormData();

        form.append('id', id);
        form.append('title', title);
        form.append('subtitle', subtitle);
        form.append('itemname', itemname); // string
        if (gender) form.append('gender', gender); // string

        // Only send a new image if the user selected one
        if (image instanceof File) {
            form.append('image', image);
        }

        // ✅ To log all FormData key-value pairs
        console.log('FormData contents:');
        for (const [key, value] of form.entries()) {
            console.log(`${key}:`, value);
        }

        return axiosInstance.put('/banner/update', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },



    deleteBanner: (id) => {
        return axiosInstance.delete("/banner/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};

            /*------------------------------Occasion Banner --------------------------------*/

export const occasionBannersService = {
    getOccasionBanners: () => axiosInstance.get("/occasion_banner/list"),

    createOccasionBanner: (image, title ,subtitle,occasion,gender) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("occasion", occasion);
        formData.append("gender", gender);

        return axiosInstance.post("/occasion_banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateOccasionBanner: ( formData) => {
        return axiosInstance.put(`/occasion_banner/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteOccasionBanner: (id) => {
        return axiosInstance.delete("/occasion_banner/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};


/*----------------------OfferBanner Banner---------------------- */

export const offerBannersService = {
    getOfferBanners: () => axiosInstance.get("/offer_banner/list"),

    createOfferBanner: (image, title, subtitle, item_name,sub_item_name) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("item_name", item_name);
        formData.append("sub_item_name", sub_item_name);
        

    
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }


        return axiosInstance.post("/offer_banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateOfferBanner: (id,formData) => {
        return axiosInstance.put(`/offer_banner/update/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteOfferBanner: (id) => {
        return axiosInstance.delete("/offer_banner/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};


/*----------------------BugetCategory Banner---------------------- */

export const BudgetBannersService = {
    getBudgetBanners: () => axiosInstance.get("/budget-categories/all"),

    createBudgetBanner: (image, title, subtitle, min_price, max_price) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("min_price", Number(min_price)); // ensure number
        formData.append("max_price", Number(max_price));
        formData.append("isPremium", "true");
        formData.append("alt", "Glorious");

        console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/budget-categories/upload", formData);
    },


    updateBudgetBanner: (formData) => {

        return axiosInstance.put("/budget-categories/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteBudgetBanner: (id) => {
        return axiosInstance.delete("/budget-categories/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};


/*----------------------Category Banner---------------------- */

export const CategoryBannersService = {
    getCategoryBanners: () => axiosInstance.get("/category_banner/list"),

    createCategoryBanner: (image, title, subtitle, itemName, subItemName) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("itemName", itemName);
        formData.append("subItemName", subItemName);

        console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/category_banner/upload", formData);
    },


    updateCategoryBanner: (image, id, title, subtitle, itemName, subItemName) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("id", id);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("itemName", itemName);
        formData.append("subItemName", subItemName);


        return axiosInstance.put("/category_banner/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteCategoryBanner: (id) => {
        return axiosInstance.delete("/category_banner/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};


/*----------------------Festival Banner---------------------- */

export const FestivalBannersService = {
    getFestivalBanners: () => axiosInstance.get("/festival_banner/list"),

    createFestivalBanner: (image, title, subtitle, itemname, sub_item_name) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("item_name", itemname);
        formData.append("sub_item_name", sub_item_name);

        console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/festival_banner/upload", formData);
    },


    updateFestivalBanner: (image, id, title, subtitle, item_name, sub_item_name) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("id",id)
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("item_name", item_name);
        formData.append("sub_item_name", sub_item_name);


        return axiosInstance.put("/festival_banner/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteFestivalBanner: (id) => {
        return axiosInstance.delete("/festival_banner/delete", {
            params: { id }, // Send id as query parameter
        });
    },
};







/*----------------------BreadCrumb Banner---------------------- */

export const BreadCrumbBannersService = {
    getBreadCrumbBanners: () => axiosInstance.get("/category_image/getAll" ),

    createBreadCrumbBanner: (image, title, subtitle, itemname, subItemName, pages, occasion ,gender) => {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("itemName", itemname);
        formData.append("subItemName", subItemName);
        formData.append("pages", pages);
        formData.append("occasion", occasion);
        formData.append("gender", gender);

        console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/category_image/upload", formData);
    },


    updateBreadCrumbBanner: (formData) => {
        return axiosInstance.put("/category_image/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteBreadCrumbBanner: (id) => {
        return axiosInstance.delete(`/category_image/delete/${id}`
        );
    },
};
