import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUploadBannerMutation, useUpdateBannerMutation } from "../../../hooks/banners/mainBanner/useUploadBannerMutation";
import { useBannersQuery } from "../../../hooks/banners/mainBanner/useBannersQuery";
import { useItemNames } from "../../../hooks/itemName/useItemNames";

/**
 * Tailwind Add/Edit Banner
 *
 * Expects navigation for edit like:
 * navigate('/admin/banner/add', { state: { id: row.id, mode: 'edit' } })
 */

const AddEditBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === "edit" && state?.id;
    const editId = state?.id ?? null;

    // queries / mutations
    const { data: bannersData, isLoading: bannersLoading } = useBannersQuery();

    const banners = useMemo(() => bannersData?.data || [], [bannersData]);
    console.log(banners ,'bannerdata')

    const { items: itemNames = [] } = useItemNames();

    const uploadMutation = useUploadBannerMutation();
    const updateMutation = useUpdateBannerMutation();
    const isUploading = uploadMutation.isPending || uploadMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;

    // form state
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [itemname, setItemname] = useState("");
    const [existingItemName ,setExistingItemName] =useState("")
    const [file, setFile] = useState(null); // new File
    const [existingImagePath, setExistingImagePath] = useState(null); // show existing image for edit
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // find banner for edit (if editing)
    const currentBanner = useMemo(() => {
        if (!isEdit) return null;
        return banners.find((b) => Number(b.id) === Number(editId)) || null;
    }, [isEdit, editId, banners]);

    
    // pre-fill on load when editing
    useEffect(() => {
        if (isEdit && currentBanner) {
            setTitle(currentBanner.title ?? "");
            setSubtitle(currentBanner.subtitle ?? "");
            setItemname(currentBanner.itemname ?? "");
            setExistingItemName(currentBanner.itemname ?? "");
            setExistingImagePath(currentBanner.image_path ?? null);
        }
    }, [isEdit, currentBanner]);

    // File input handlers
    const onFileChange = (e) => {
        setError("");
        const f = e.target.files?.[0] ?? null;
        if (!f) {
            setFile(null);
            return;
        }
        if (!f.type.startsWith("image/")) {
            setError("Only image files are allowed (jpg, png, webp).");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // validation
       
        
        if (!itemname) {
            setError("Please select an item category.");
            return;
        }
        // For Add: image required. For Edit: optional
        if (!isEdit && !file) {
            setError("Please choose an image for the banner.");
            return;
        }
        if (
            banners.some(b => b.itemname.toLowerCase() === itemname.toLowerCase()) &&
            itemname.toLowerCase() !== existingItemName.toLowerCase()
        ) {
            setError("This item category already exists.");
            return;
        }

   
        const payload = new FormData();
        if (isEdit) {

            console.log(editId , title ,subtitle , itemname ,'formdata')
            payload.append("id", editId);
            // only append image if user selected a new one
            if (file instanceof File) payload.append("image", file);
            // payload.append("title", title);
            // payload.append("subtitle", subtitle);
            payload.append("itemname", itemname);
            // omit gender as requested
        } else {
            // Add
            payload.append("image", file);
            // payload.append("title", title);
            // payload.append("subtitle", subtitle);
            payload.append("itemname", itemname);
        }

        // call correct mutation
        if (isEdit) {
            updateMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner updated successfully.");
                    setTimeout(() => {
                        navigate("/admin/banner/manage"); // go back to list (change if needed)
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Update failed.";
                    setError(msg);
                },
            });
        } else {
            uploadMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner uploaded successfully.");
                    // clear form
                    setTitle("");
                    setSubtitle("");
                    setItemname("");
                    setFile(null);
                    setExistingImagePath(null);
                    setTimeout(() => {
                        navigate("/admin/banner/manage"); // go back to list
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Upload failed.";
                    setError(msg);
                },
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="">
                <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold mb-1">
                    {isEdit ? "Edit Banner" : "Add New Banner"}
                </h2>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                        disabled={isUploading || isUpdating}
                    >
                        Back
                    </button>
                </div>
                {/* messages */}
                {error && (
                    <div className="mb-1 text-xs text-red-700 bg-red-50 p-3 rounded">{error}</div>
                )}
                {success && (
                    <div className="mb-1 text-xs text-green-700 bg-green-50 p-3 rounded">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    {/* Title */}
                    {/* <div>
                        <label className="block text-xs font-medium  mb-1">
                            Banner Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter banner title"
                            disabled={isUploading || isUpdating}
                        />
                    </div> */}

                    {/* Subtitle */}
                    {/* <div>
                        <label className="block text-xs font-medium mb-1">
                            Banner Subtitle <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter banner subtitle"
                            disabled={isUploading || isUpdating}
                        />
                    </div> */}

                    {/* Item Category */}
                    <div>
                        <label className="block text-xs font-medium  mb-1">
                            Item Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={itemname}
                            onChange={(e) => setItemname(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            disabled={isUploading || isUpdating}
                        >
                            <option  value="" disabled>Select Item Category</option>
                            {itemNames.map((it) => (
                                <option key={it.ITEMCTRID} value={it.ITEMCTRNAME}>
                                    {it.ITEMCTRNAME}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                            Banner Image {isEdit ? "(optional - leave to keep current)" : "*"}
                        </label>

                        <div className="flex items-center gap-2">
                            {/* Preview */}
                            <div className="w-30 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border">
                                {file ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : existingImagePath ? (
                                    <img
                                        src={`${existingImagePath.startsWith("http") ? "" : "https://app.bmgjewellers.com"}${existingImagePath}`}
                                        alt="current"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                        No image
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    id="banner-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    disabled={isUploading || isUpdating}
                                    className="text-xs"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Accepts JPG, PNG or WEBP. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTitle("");
                                    setSubtitle("");
                                    setItemname("");
                                    setFile(null);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                                disabled={isUploading || isUpdating}
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                                disabled={isUploading || isUpdating}
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading || isUpdating}
                            className={`px-4 py-2 rounded-md text-white text-sm ${isUploading || isUpdating ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {(isUploading || isUpdating) ? (
                                <span className="flex items-center gap-2 ">
                                    <svg className="w-2 h-2 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                                    {isUploading ? "Uploading..." : "Updating..."}
                                </span>
                            ) : (
                                    <span className="text-xs" >{isEdit ? "Update Banner" : "Upload Banner"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditBanner;
