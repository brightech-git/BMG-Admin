import { useState, useEffect ,useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpdateBudgetBannerMutation, useBudgetBanner } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import { useGetBannerSettings } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import ImageKeyComboBox from '../../../components/ui/ImageKeyComboBox';
import { Switch } from '../../../components/ui/Switch';
import 'animate.css';
import FileUploadArea from '../../../components/banner/FileUploadArea';
import ComboBox from '../../../components/ui/ComboBox';

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
    const [fileErrors, setFileErrors] = useState({ desktop: "", mobile: "" });

    const isLoading = uploadMutation.isPending || updateMutation.isPending;


     const selectedOption = useMemo(() => {
         return bannerSettingData?.data.find(item => item.imageKey === categoryKey) || null;
     }, [bannerSettingData, categoryKey]);

    useEffect(() => {
        if (!isEdit || !bannerData?.images?.[0]) return;
        console.log(bannerData, 'bannerData')
        const firstImage = bannerData.images[0];

        console.log(firstImage, 'firstImage')
        setCategoryKey(bannerData.categoryKey || "");
        setDesktopLink(bannerData.desktopLink || "");
        setMobileLink(bannerData.mobileLink || "");
        setIsSingle(bannerData.isSingle);
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

        setIsGrid(!!setting.isGrid);

        setImageDesktop(null);
        setImageMobile(null);
    }, [categoryKey, bannerSettingData]);

    const validateFile = (file) => {
        if (!file?.type?.startsWith("image/")) return "Only image files allowed (jpg, png, webp)";
        if (file.size > 50 * 1024) {
            const sizeInKB = (file.size / 1024).toFixed(1);
            return `File too large: ${sizeInKB}KB / 50KB maximum`;
        }
        return null;
    };

    const handleFileChange = (setter, type, e) => {
        setError("");
        setFileErrors(prev => ({ ...prev, [type]: "" }));

        const file = e.target.files?.[0];
        if (!file) return setter(null);

        const validationError = validateFile(file);
        if (validationError) {
            setFileErrors(prev => ({ ...prev, [type]: validationError }));
            e.target.value = '';
            return;
        }
        setter(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!categoryKey.trim()) {
            return setError("Category key is required");
        }

        if (!desktopLink.trim()) {
            return setError("Desktop link is required");
        }

        if (!isSingle && !mobileLink.trim()) {
            return setError("Mobile link is required for dual banner");
        }

        if (!isEdit) {
            if (!imageDesktop) {
                return setError("Desktop image is required");
            }

            if (!isSingle && !imageMobile) {
                return setError("Mobile image is required for dual banner");
            }
        }

        const payload = new FormData();
        payload.append("category_key", categoryKey);
        payload.append("desktop_link", desktopLink);
        payload.append("mobile_link", mobileLink);
        payload.append("desktop_ratio", desktopRatio);
        payload.append("mobile_ratio", mobileRatio);
        payload.append("is_single", isSingle);
        payload.append("rowSpan", rowSpan);

        if (isEdit) {
            payload.append("id", bannerData.id);

            if (imageDesktop instanceof File) {
                payload.append("image_desktop", imageDesktop);
            }

            if (!isSingle && imageMobile instanceof File) {
                payload.append("image_mobile", imageMobile);
            }
        } else {
            payload.append("image_desktop", imageDesktop);

            if (!isSingle && imageMobile) {
                payload.append("image_mobile", imageMobile);
            }
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
        setFileErrors({ desktop: "", mobile: "" });
    };


    return (
        <div className="max-w-7xl mx-auto bg-white mt-8 p-6">
            {/* Header */}
            <div className="flex items-center  justify-between mb-3 animate__animated animate__fadeInDown">
                <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {isEdit ? "✏️ Edit Budget Banner" : "➕ Add Budget Banner"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {isEdit ? 'Update your existing banner configuration' : 'Create a new banner for your budget section'}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 text-xs font-medium
                             hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Alerts */}
            {(error || success) && (
                <div className={`p-3 m-2 rounded-xl animate__animated animate__fadeIn
                    ${error
                        ? 'bg-gradient-to-r from-red-50 to-red-100'
                        : 'bg-gradient-to-r from-green-50 to-green-100'
                    }
                `}>
                    <div className="flex items-center gap-2">
                
                        <span>
                        {error ? (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                                    <svg className="w-4 h-4  text-green-600 animate__animated animate__bounceIn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        </span>
                       
                            <span className={`text-sm font-medium ${error ? 'text-red-800' : 'text-green-800'}`}>
                            {error || success}
                     
                        </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Key */}
                <div >
                    {/* <ImageKeyComboBox
                        data={bannerSettingData?.data || []}
                        categoryKey={categoryKey}
                        setCategoryKey={setCategoryKey}
                        disabled={isLoading}
                    /> */}
                    <ComboBox
                        options={bannerSettingData?.data || []}
                        value={selectedOption}
                                            onChange={(option) => {
                                                const value = option?.imageKey || '';
                                                setCategoryKey(value);
                                            }}
                        getOptionLabel={(opt) => opt?.imageKey || ''}
                        getOptionValue={(opt) => opt?.imageKey || ''}
                                            placeholder="Select or type to search..."
                                            disabled={isLoading}
                                            searchable={true}
                                            clearable={true}
                                            size="md"
                                            variant="outlined"
                                            noOptionsText="No categories available"
                                            autoHighlight={true}
                                            className="w-full"
                                            inputClassName="text-sm"
                                        />
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate__animated animate__fadeInUp animate__delay-1s">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            Desktop Link
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                </svg>
                            </div>
                            <input
                                value={desktopLink}
                                onChange={(e) => setDesktopLink(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                         transition-all duration-200 outline-none
                                         disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="https://example.com/desktop-banner"
                            />
                        </div>
                    </div>

                    {!isSingle && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                Mobile Link
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    value={mobileLink}
                                    onChange={(e) => setMobileLink(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                             transition-all duration-200 outline-none
                                             disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="https://example.com/mobile-banner"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Ratios or Row Span */}
                {!isGrid ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate__animated animate__fadeInUp animate__delay-2s">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Desktop Ratio</label>
                            <input
                                value={desktopRatio}
                                onChange={(e) => setDesktopRatio(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                         transition-all duration-200 outline-none"
                                placeholder="e.g., 16:9"
                            />
                        </div>
                        {!isSingle && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Mobile Ratio</label>
                                <input
                                    value={mobileRatio}
                                    onChange={(e) => setMobileRatio(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                             transition-all duration-200 outline-none"
                                    placeholder="e.g., 4:5"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5 animate__animated animate__fadeInUp animate__delay-2s">
                        <label className="text-xs font-semibold text-gray-700">Row Span</label>
                        <input
                            value={rowSpan}
                            onChange={(e) => setRowSpan(e.target.value)}
                            disabled={isLoading}
                            className="w-full md:w-64 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                     transition-all duration-200 outline-none"
                            placeholder="Enter row span (e.g., 2)"
                        />
                    </div>
                )}

                {/* Single Switch */}
                <div className="animate__animated animate__fadeInUp animate__delay-3s">
                    <Switch
                        checked={isSingle}
                        onChange={(val) => setIsSingle(val)}
                        label="Single Banner Mode"
                        disabled={isLoading}
                    />
                    <p className="text-[10px] text-gray-500 mt-1 ml-1">
                        {isSingle
                            ? '✓ Single mode: Only desktop banner will be used'
                            : '↔️ Dual mode: Both desktop and mobile banners required'
                        }
                    </p>
                </div>

                {/* Image Uploads */}
                <div className="flex flex-col sm:flex-row gap-2 animate__animated animate__fadeInUp animate__delay-4s">
                    <FileUploadArea
                        type="desktop"
                        value={imageDesktop}
                        onChange={setImageDesktop}
                        existingUrl={existingDesktopImage}
                        label="Desktop Banner"
                        required={!isEdit || !existingDesktopImage}
                        isMobile={false}
                        isLoading={isLoading}
                        error={fileErrors.desktop}
                        onFileSelect={(file) => console.log('Selected:', file)}
                        onFileRemove={() => console.log('Removed')}
                        onValidationError={(error, file) => console.log('Validation:', error)}
                        maxSizeKB={50}
                    />
                    {!isSingle && (
                        <FileUploadArea
                            type="mobile"
                            value={imageMobile}
                            onChange={setImageMobile}
                            existingUrl={existingMobileImage}
                            label="Mobile Banner"
                            required={!isEdit || !existingMobileImage}
                            isMobile={true}
                            isLoading={isLoading}
                            error={fileErrors.mobile}
                            showProgressBar={true}
                            showSizeBadge={true}
                            showTooltip={true}
                            hint="JPG, PNG, WEBP • Max 50KB"
                        />
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 animate__animated animate__fadeInUp animate__delay-5s">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-medium
                                     hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center gap-2 group"
                        >
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-medium
                                     hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                            px-6 py-2.5 rounded-xl text-white text-sm font-medium
                            transition-all duration-300 transform
                            flex items-center gap-2
                            ${isLoading
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'
                            }
                            animate__animated animate__pulse animate__infinite
                        `}
                    >
                        {isLoading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {isEdit ? 'Updating...' : 'Uploading...'}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {isEdit ? 'Update Banner' : 'Upload Banner'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddBudgetBanner;