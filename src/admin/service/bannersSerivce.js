import axiosInstance from "../api/axiosInstance";

            /*----------------------Main Banner---------------------- */

export const bannersService = {
    getBanners: () => axiosInstance.get("/banner/list"),

    createBanner: (formData ) => {
       
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        return axiosInstance.post("/banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateBanner: async (formData
    ) => {
        const form = new FormData();

        // ✅ To log all FormData key-value pairs
        console.log('FormData contents:');
        for (const [key, value] of form.entries()) {
            console.log(`${key}:`, value);
        }

        return axiosInstance.put('/banner/update', formData, {
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

    createOccasionBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("occasion", occasion);
        // formData.append("gender", gender);

        return axiosInstance.post("/occasion_banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateOccasionBanner: (formData) => {
        for(const[key,values] of formData.entries()
         )
            console.log(key ,values)
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

    createOfferBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("item_name", item_name);
        // formData.append("sub_item_name", sub_item_name);
        

    
        // for (const [key, value] of formData.entries()) {
        //     console.log(`${key}:`, value);
        // }


        return axiosInstance.post("/offer_banner/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateOfferBanner: (formData,id) => {
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
    getBudgetBanners: async () => {
        const response = await axiosInstance.get("/budget-categories/all");
        return response.data;
    },
    getBannersByKey: async (category_key) =>{
        try{
            const response = await axiosInstance.get(`/budget-categories/getAll` , {
                params: {category_key}
            });
            return response.data;
        }
        catch(error){
            console.error("Error fetching banners:", error);
            throw error;
        }
    },
    createBudgetBanner: async(formData) => {
        const response = await axiosInstance.post("/budget-categories/upload", formData);
        return response.data;
    },


    updateBudgetBanner: async(formData) => {

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        const response = await axiosInstance.put("/budget-categories/update", formData);
        return response.data;
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

    createCategoryBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("itemName", itemName);
        // formData.append("subItemName", subItemName);

        // console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/category_banner/upload", formData);
    },


    updateCategoryBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("id", id);
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("itemName", itemName);
        // formData.append("subItemName", subItemName);


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

    createFestivalBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("item_name", itemname);
        // formData.append("sub_item_name", sub_item_name);

        console.log([...formData.entries()], 'Data for banner');

        return axiosInstance.post("/festival_banner/upload", formData);
    },


    updateFestivalBanner: (formData) => {
        // const formData = new FormData();
        // formData.append("image", image);
        // formData.append("id",id)
        // formData.append("title", title);
        // formData.append("subtitle", subtitle);
        // formData.append("item_name", item_name);
        // formData.append("sub_item_name", sub_item_name);


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

    createBreadCrumbBanner: (formData) => {
     

        return axiosInstance.post("/category_image/upload", formData);
    },


    updateBreadCrumbBanner: (formData, id) => {
        return axiosInstance.put(`/category_image/update-details/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteBreadCrumbBanner: (id) => {
        return axiosInstance.delete(`/category_image/delete/${id}`
        );
    },
};
