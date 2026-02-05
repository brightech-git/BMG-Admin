import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpdateBudgetBannerMutation, useBudgetBanner } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import { Switch } from '../../../components/ui/Switch';

const AddBudgetBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    // Get banner data from state when editing
    const isEdit = state?.mode === "edit" && state?.bannerData;
    const bannerData = state?.bannerData || null;

    console.log(bannerData ,'isEdit');

    // mutations
    const uploadMutation = useBudgetBanner();
    const updateMutation = useUpdateBudgetBannerMutation();
    
    const isUploading = uploadMutation.isPending || uploadMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;

    // form state - simplified to only needed fields
    const [categoryKey, setCategoryKey] = useState("");
    const [desktopLink, setDesktopLink] = useState("");
    const [mobileLink, setMobileLink] = useState("");
    const [imageDesktop, setImageDesktop] = useState(null);
    const [imageMobile, setImageMobile] = useState(null);
    const [mobileRatio ,setMobileRatio] = useState("");
    const [desktopRatio ,setDesktopRatio] = useState("");
    const [isSingle ,setIsSingle] = useState(false);

    const [existingDesktopImage, setExistingDesktopImage] = useState(null);
    const [existingMobileImage, setExistingMobileImage] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // pre-fill form when editing
   useEffect(() => {
    if (isEdit && bannerData && Array.isArray(bannerData.images) && bannerData.images.length > 0) {
        // Get first image safely
        const firstImage = bannerData.images[0] || {};

        // Set category key safely
        setCategoryKey(bannerData.categoryKey || "");

        // Set links safely
        setDesktopLink(bannerData.desktopLink || "");
        setMobileLink(bannerData.mobileLink || "");

        // Set boolean safely
        setIsSingle(!!bannerData.isSingle);

        // Set ratios safely
        setDesktopRatio(firstImage?.desktop?.ratio || "");
        setMobileRatio(firstImage?.mobile?.ratio || "");

        // Set existing images if they exist
        if (firstImage?.desktop?.url) {
            setExistingDesktopImage(firstImage.desktop.url);
        }
        if (firstImage?.mobile?.url) {
            setExistingMobileImage(firstImage.mobile.url);
        }
    }
}, [isEdit, bannerData]);


    const handleSwitchChange = (name, value) => {
        setIsSingle(prev => !prev);
    };

    // File input handlers
    const onDesktopFileChange = (e) => {
        setError("");
        const f = e.target.files?.[0] ?? null;
        if (!f) {
            setImageDesktop(null);
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
        setImageDesktop(f);
    };

    const onMobileFileChange = (e) => {
        setError("");
        const f = e.target.files?.[0] ?? null;
        if (!f) {
            setImageMobile(null);
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
        setImageMobile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // validation
        if (!categoryKey.trim()) {
            setError("Please enter a category key.");
            return;
        }
        if (!desktopLink.trim()) {
            setError("Please enter desktop link.");
            return;
        }
        if (!mobileLink.trim()) {
            setError("Please enter mobile link.");
            return;
        }

        // For Add: images required. For Edit: optional
        if (!isEdit) {
            if (!imageDesktop) {
                setError("Please choose a desktop image for the banner.");
                return;
            }
            if (!imageMobile) {
                setError("Please choose a mobile image for the banner.");
                return;
            }
        }

        // build payload (FormData)
        const payload = new FormData();
        payload.append("category_key", categoryKey);
        payload.append("desktop_link", desktopLink);
        payload.append("mobile_link", mobileLink);
        payload.append("desktop_ratio", desktopRatio);
        payload.append("mobile_ratio", mobileRatio);
        payload.append("is_single", isSingle);

        // For edit: use imageKey as identifier
        if (isEdit) {
            payload.append("id",bannerData.id);
            // only append images if user selected new ones
            if (imageDesktop instanceof File) payload.append("image_desktop", imageDesktop);
            if (imageMobile instanceof File) payload.append("image_mobile", imageMobile);
        } else {
            // Add - images are required
            if (imageDesktop instanceof File) payload.append("image_desktop", imageDesktop);
            if (imageMobile instanceof File) payload.append("image_mobile", imageMobile);
        }

        // call correct mutation
        if (isEdit) {
            updateMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner updated successfully.");
                    setTimeout(() => {
                        navigate("/budgetbanner/manage");
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Update failed.";
                    setError(msg);
                },
            });
        } else {
            console.log("uploading...", payload)
            uploadMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner uploaded successfully.");
                    // clear form
                    setCategoryKey("");
                    setDesktopLink("");
                    setMobileLink("");
                    setImageDesktop(null);
                    setImageMobile(null);
                    setExistingDesktopImage(null);
                    setExistingMobileImage(null);
                    setTimeout(() => {
                        navigate("/budgetbanner/manage");
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Upload failed.";
                    setError(msg);
                },
            });
        }
    };

    const handleClear = () => {
        setCategoryKey("");
        setDesktopLink("");
        setMobileLink("");
        setImageDesktop(null);
        setImageMobile(null);
        setExistingDesktopImage(null);
        setExistingMobileImage(null);
        setError("");
        setSuccess("");
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold mb-1">
                        {isEdit ? "Edit Budget Banner" : "Add New Budget Banner"}
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
                    {/* Category Key */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Category Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={categoryKey}
                            onChange={(e) => setCategoryKey(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter category key"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* Desktop Link */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Desktop Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={desktopLink}
                            onChange={(e) => setDesktopLink(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter desktop link"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* Mobile Link */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Mobile Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={mobileLink}
                            onChange={(e) => setMobileLink(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter mobile link"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* Desktop Link */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Desktop Ratio <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={desktopRatio}
                            onChange={(e) => setDesktopRatio(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter desktop link"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* Mobile Link */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Mobile Ratio <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={mobileRatio}
                            onChange={(e) => setMobileRatio(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter mobile link"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    <Switch checked={isSingle} onChange={(val) => handleSwitchChange('isSingle', val)} label="is Single" />

                    {/* Desktop Image */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                            Desktop Banner Image {isEdit ? "(optional - leave to keep current)" : "*"}
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-30 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border">
                                {imageDesktop ? (
                                    <img
                                        src={URL.createObjectURL(imageDesktop)}
                                        alt="desktop preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : existingDesktopImage ? (
                                    <img
                                        src={`https://app.bmgjewellers.com${existingDesktopImage}`}
                                        alt="current desktop"
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
                                    id="desktop-banner-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={onDesktopFileChange}
                                    disabled={isUploading || isUpdating}
                                    className="text-xs"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Accepts JPG, PNG or WEBP. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Image */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                            Mobile Banner Image {isEdit ? "(optional - leave to keep current)" : "*"}
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-30 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border">
                                {imageMobile ? (
                                    <img
                                        src={URL.createObjectURL(imageMobile)}
                                        alt="mobile preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : existingMobileImage ? (
                                    <img
                                        src={`https://app.bmgjewellers.com${existingMobileImage}`}
                                        alt="current mobile"
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
                                    id="mobile-banner-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={onMobileFileChange}
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
                                onClick={handleClear}
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
                                <span className="text-xs">{isEdit ? "Update Banner" : "Upload Banner"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddBudgetBanner;