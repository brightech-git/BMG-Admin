import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpdateBudgetBannerMutation, useBudgetBanner } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import { useGetBannerSettings } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import ImageKeyComboBox from '../../../components/ui/ImageKeyComboBox';
import { Switch } from '../../../components/ui/Switch';

const AddBudgetBanner = () => {
    
    const navigate = useNavigate();
    const location = useLocation();
    const { state = {} } = location;
    const isEdit = state?.mode === "edit" && state?.bannerData;
    const bannerData = state?.bannerData || null;

    const { data: bannerSettingData } = useGetBannerSettings();
    const uploadMutation = useBudgetBanner();
    const updateMutation = useUpdateBudgetBannerMutation();

    const [categoryKey, setCategoryKey] = useState("");
    const [desktopLink, setDesktopLink] = useState("");
    const [mobileLink, setMobileLink] = useState("");
    const [imageDesktop, setImageDesktop] = useState(null);
    const [imageMobile, setImageMobile] = useState(null);
    const [mobileRatio, setMobileRatio] = useState("");
    const [desktopRatio, setDesktopRatio] = useState("");
    const [isSingle, setIsSingle] = useState(false);
    const [isGrid, setIsGrid] = useState(false);
    const [rowSpan, setRowSpan] = useState("");
    const [existingDesktopImage, setExistingDesktopImage] = useState(null);
    const [existingMobileImage, setExistingMobileImage] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isLoading = uploadMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (!isEdit || !bannerData?.images?.[0]) return;
        console.log(bannerData,'bannerData')
        const firstImage = bannerData.images[0];

        console.log(firstImage, 'firstImage')
        setCategoryKey(bannerData.categoryKey || "");
        setDesktopLink(bannerData.desktopLink || "");
        setMobileLink(bannerData.mobileLink || "");
        setIsSingle(!!bannerData.isSingle);
        setRowSpan(bannerData.rowSpan || "")
        setDesktopRatio(firstImage.desktop?.ratio || "");
        setMobileRatio(firstImage.mobile?.ratio || "");
        setExistingDesktopImage(firstImage.desktop?.url || null);
        setExistingMobileImage(firstImage.mobile?.url || null);
    }, [isEdit, bannerData]);

    useEffect(() => {
        if (!categoryKey || !bannerSettingData?.data) return;
        const setting = bannerSettingData.data.find(item => item.imageKey === categoryKey);

        console.log(setting, 'setting')
        if (!setting) return;

        setIsSingle(!!setting.isSingle);
        setIsGrid(!!setting.isGrid);

        setImageDesktop(null);
        setImageMobile(null);
    }, [categoryKey, bannerSettingData]);

    const validateFile = (file) => {
        if (!file?.type?.startsWith("image/")) return "Only image files allowed (jpg, png, webp)";
        if (file.size > 5 * 1024 * 1024) return "Image must be smaller than 5MB";
        return null;
    };

    const handleFileChange = (setter, e) => {
        setError("");
        const file = e.target.files?.[0];
        if (!file) return setter(null);

        const validationError = validateFile(file);
        if (validationError) return setError(validationError);
        setter(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!categoryKey.trim() || !desktopLink.trim() || !mobileLink.trim()) {
            return setError("Please fill all required fields");
        }

        if (!isEdit && (!imageDesktop || !imageMobile)) {
            return setError("Please select both desktop and mobile images");
        }

        const payload = new FormData();
        payload.append("category_key", categoryKey);
        payload.append("desktop_link", desktopLink);
        payload.append("mobile_link", mobileLink);
        payload.append("desktop_ratio", desktopRatio);
        payload.append("mobile_ratio", mobileRatio);
        payload.append("is_single", isSingle);
        payload.append("rowSpan" ,rowSpan);

        if (isEdit) {
            payload.append("id", bannerData.id);
            if (imageDesktop instanceof File) payload.append("image_desktop", imageDesktop);
            if (imageMobile instanceof File) payload.append("image_mobile", imageMobile);
        } else {
            payload.append("image_desktop", imageDesktop);
            payload.append("image_mobile", imageMobile);
        }

        const mutation = isEdit ? updateMutation : uploadMutation;
        mutation.mutate(payload, {
            onSuccess: () => {
                setSuccess(`Banner ${isEdit ? 'updated' : 'uploaded'} successfully`);
                setTimeout(() => navigate("/budgetbanner/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || err?.message || "Operation failed");
            }
        });
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
        setRowSpan("");
    };

    const ImagePreview = ({ image, existing, alt }) => (
        <div className="w-30 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border">
            {image ? (
                <img src={URL.createObjectURL(image)} alt={alt} className="w-full h-full object-cover" />
            ) : existing ? (
                <img src={`https://app.bmgjewellers.com${existing}`} alt={`current ${alt}`} className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">No image</div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">{isEdit ? "Edit Budget Banner" : "Add Budget Banner"}</h2>
                <button
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                >
                    Back
                </button>
            </div>

            {(error || success) && (
                <div className={`mb-4 text-xs p-3 rounded ${error ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'}`}>
                    {error || success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <ImageKeyComboBox
                    data={bannerSettingData?.data || []}
                    categoryKey={categoryKey}
                    setCategoryKey={setCategoryKey}
                    disabled={isLoading}
                />

                {/* Row: Desktop Link + Mobile Link */}
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-medium mb-1">Desktop Link <span className="text-red-500">*</span></label>
                        <input
                            value={desktopLink}
                            onChange={(e) => setDesktopLink(e.target.value)}
                            disabled={isLoading}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter desktop link"
                        />
                    </div>
                    {!isSingle && (
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-medium mb-1">Mobile Link <span className="text-red-500">*</span></label>
                            <input
                                value={mobileLink}
                                onChange={(e) => setMobileLink(e.target.value)}
                                disabled={isLoading}
                                className="w-full border px-2 py-1.5 text-xs"
                                placeholder="Enter mobile link"
                            />
                        </div>
                    )}
                </div>

                {/* Row: Desktop Ratio + Mobile Ratio */}
                {!isGrid && (
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-medium mb-1">Desktop Ratio <span className="text-red-500">*</span></label>
                            <input
                                value={desktopRatio}
                                onChange={(e) => setDesktopRatio(e.target.value)}
                                disabled={isLoading}
                                className="w-full border px-2 py-1.5 text-xs"
                                placeholder="Enter desktop ratio"
                            />
                        </div>
                        {!isSingle && (
                            <div className="flex-1 flex flex-col">
                                <label className="text-xs font-medium mb-1">Mobile Ratio <span className="text-red-500">*</span></label>
                                <input
                                    value={mobileRatio}
                                    onChange={(e) => setMobileRatio(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full border px-2 py-1.5 text-xs"
                                    placeholder="Enter mobile ratio"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Grid Row Span */}
                {isGrid && (
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-medium mb-1">Row Span <span className="text-red-500">*</span></label>
                            <input
                                value={rowSpan}
                                onChange={(e) => setRowSpan(e.target.value)}
                                disabled={isLoading}
                                className="w-full border px-2 py-1.5 text-xs"
                                placeholder="Enter row span"
                            />
                        </div>
                    </div>
                )}

                {/* isSingle Switch */}
                <Switch checked={isSingle} onChange={(val) => setIsSingle(val)} label="is Single" disabled={isLoading} />

                {/* Desktop & Mobile Images */}
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-medium mb-1">Desktop Banner Image {isEdit && "(optional)"}</label>
                        <div className="flex items-center gap-2">
                            <ImagePreview image={imageDesktop} existing={existingDesktopImage} alt="desktop preview" />
                            <div className="flex-1">
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(setImageDesktop, e)} disabled={isLoading} className="text-xs" />
                                <p className="text-xs text-slate-500 mt-1">Accepts JPG, PNG or WEBP. Max 5MB.</p>
                            </div>
                        </div>
                    </div>

                    {!isSingle && (
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-medium mb-1">Mobile Banner Image {isEdit && "(optional)"}</label>
                            <div className="flex items-center gap-2">
                                <ImagePreview image={imageMobile} existing={existingMobileImage} alt="mobile preview" />
                                <div className="flex-1">
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(setImageMobile, e)} disabled={isLoading} className="text-xs" />
                                    <p className="text-xs text-slate-500 mt-1">Accepts JPG, PNG or WEBP. Max 5MB.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                        <button type="button" onClick={handleClear} disabled={isLoading} className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700">
                            Clear
                        </button>
                        <button type="button" onClick={() => navigate(-1)} disabled={isLoading} className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700">
                            Cancel
                        </button>
                    </div>
                    <button type="submit" disabled={isLoading} className={`px-4 py-2 rounded-md text-white text-sm ${isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-2 h-2 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                {isEdit ? "Updating..." : "Uploading..."}
                            </span>
                        ) : (
                            <span className="text-xs">{isEdit ? "Update Banner" : "Upload Banner"}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

};

export default AddBudgetBanner;