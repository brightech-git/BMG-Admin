
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MyContext } from "../../../context/themeContext/themeContext";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import { useCategoryUploadMutation, useCategoryUpdateMutation } from "../../../hooks/banners/categoryBanner/useCategoryBanner";
import { useBannersQuery } from "../../../hooks/banners/categoryBanner/useCategoryBannerQuery";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils";

const AddCategoryBanner = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { id: editId } = location.state || {};
    const isEdit = Boolean(editId);



    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [itemName, setItemName] = useState("");
    const [existingItemName, setExistingItemName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [progress, setProgress] = useState(0);
    const [openBackdrop, setOpenBackdrop] = useState(false);

    const uploadMutation = useCategoryUploadMutation();
    const updateMutation = useCategoryUpdateMutation();
    const { data: banners } = useBannersQuery();
    const { items:itemCrtName } =useItemNames();
    const bannerData = useMemo(()=>banners?.data|| [] ,[banners?.data])
    // const itemNames = itemCrtName.map((items) => items.itemName) ||  [];
    // console.log(itemNames, 'namesfor item')

    // Load existing banner data when editing
    console.log(banners ,'banners')
    useEffect(() => {
        if (isEdit && bannerData?.length) {
            const existing = bannerData.find((b) => b.id === editId);
            console.log(existing ,'existingBanner')
            if (existing) {

                setTitle(existing.title || "");
                setSubtitle(existing.subtitle || "");
                setItemName(existing.itemName || "");
                setExistingItemName(existing.itemName ?? "");
                setPreview(getProductImages(existing.image_path) || "");
            }
        }
    }, [isEdit, editId, banners]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            return setError("Only PNG, JPG, WEBP allowed");
        }
        if (file.size > 5 * 1024 * 1024) {
            return setError("File size cannot exceed 5MB");
        }
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        if (isEdit && bannerData?.length) {
            const existing = bannerData.find((b) => b.id === editId);
            setTitle(existing?.title || "");
            setSubtitle(existing?.subtitle || "");
            setItemName(existing?.itemName || "");
            setImage(null);
            setPreview(getProductImages(existing.image_path) || "");
        } else {
            setTitle("");
            setSubtitle("");
            setItemName("");
            setImage(null);
            setPreview("");
        }
        setError("");
        setSuccess("");
        navigate(-1)
    };
const handleClear = () =>{
    setTitle("");
    setSubtitle("");
    setItemName("");
    setImage(null);
    setPreview("");
}
    const handleSubmit = () => {
        if (!title.trim()) return setError("Please enter a title");
        if (!itemName) return setError("Please select an item category");
        if (!isEdit && !image) return setError("Please select an image");
        if (
            bannerData.some(b => b.itemName.toLowerCase() === itemName.toLowerCase()) &&
            itemName.toLowerCase() !== existingItemName.toLowerCase()
        ) {
            setError("This item category already exists.");
            return;
        }


        setOpenBackdrop(true);
        setProgress(0);

        const payload = new FormData();
        if (isEdit) {
            payload.append("id", editId);
            payload.append("title", title);
            // payload.append("subtitle", subtitle || "");
            payload.append("itemName", itemName);
            if (image instanceof File) payload.append("image", image);
        } else {
            payload.append("title", title);
            // payload.append("subtitle", subtitle || "");
            payload.append("itemName", itemName);
            payload.append("image", image);
        }
        for (const [key, value] of payload.entries()) {
            console.log(`${key}:`, value);
        }


        const mutation = isEdit ? updateMutation : uploadMutation;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        mutation.mutate(payload, {
            onSuccess: () => {
                setProgress(100);
                setTimeout(() => {
                    setOpenBackdrop(false);
                    setProgress(0);
                    setSuccess(isEdit ? "Banner updated successfully!" : "Banner uploaded successfully!");
                    navigate("/categorybanner/manage");
                }, 800);
            },
            onError: (err) => {
                setOpenBackdrop(false);
                setError(err?.message || "Upload failed");
            },
        });
    };

    return (
        <div className={`max-w-7xl  border mx-auto mt-8 p-2`}>
            <div className=" p-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold mb-1">
                        {isEdit ? "Edit Category Banner" : "Add New Category Banner"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                     
                    >
                        Back
                    </button>
                </div>

                {/* Title */}
                <label className="block text-xs font-medium mb-1">Banner Title <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs rounded-md border px-2 py-1.5 mb-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                />

                {/* Subtitle */}
                {/* <label className="block text-xs font-medium mb-1">Banner Subtitle (optional)</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full text-xs rounded-md border px-2 py-1.5 mb-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                /> */}

                {/* Item Category */}
                <label className="block text-xs font-medium mb-1">Item Category <span className="text-red-500">*</span></label>
                <select
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full text-xs rounded-md border px-2 py-1.5 mb-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="">Select an item category</option>
                    {itemCrtName?.map((b) => (
                        <option key={b.id} value={b.itemName} className="text-xs"> {b.itemName} </option>
                    ))}
                </select>

                {/* File Input */}
                <label className="block text-xs font-medium mb-1">Banner Image {isEdit ? "(leave empty to keep existing)" : <span className="text-red-500">*</span>}</label>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileSelect}
                    className="block w-full text-xs text-gray-700 dark:text-gray-200 border dark:border-gray-600 rounded-md p-2 cursor-pointer mb-2"
                />
                {preview && (
                    <div className="mt-2">
                        <p className="text-xs mb-1">Preview:</p>
                        <img src={preview} alt="Preview" className="w-full h-40 object-contain rounded-md border" />
                    </div>
                )}

                {/* Error / Success */}
                {error && <div className="bg-red-600 text-white text-xs p-2 rounded mb-2">{error}</div>}
                {success && <div className="bg-green-600 text-white text-xs p-2 rounded mb-2">{success}</div>}

                {/* Action Buttons */}
                <div className="flex justify-between gap-2 mt-3" > 
                <div className="flex justify-start gap-1">
                    <button onClick={handleCancel} className="px-3 py-1.5 border rounded text-xs hover:bg-gray-100 disabled:opacity-50">
                        Cancel
                    </button>
                        <button onClick={handleClear} className="px-3 py-1.5 border rounded text-xs hover:bg-gray-100 disabled:opacity-50">
                            Clear
                        </button>
                   
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={(isEdit ? updateMutation.isLoading : uploadMutation.isLoading)}
                    className="px-3 py-1.5 bg-indigo-600 text-xs text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isEdit ? (updateMutation.isLoading ? "Updating..." : "Update") : (uploadMutation.isLoading ? "Uploading..." : "Upload")}
                </button>
                </div>
                <BackdropProgress open={openBackdrop} title={isEdit ? "Updating Banner" : "Uploading Banner"} body="Please wait..." progress={progress} />
            </div>
        </div>
    );
};

export default AddCategoryBanner;
