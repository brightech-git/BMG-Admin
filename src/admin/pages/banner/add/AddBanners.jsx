import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpdateBannerMutation, useCreateBanners } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import { useGetBannerSettings } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import { Switch } from '../../../components/ui/Switch';
import 'animate.css';
import FileUploadArea from '../../../components/banner/FileUploadArea';
import ComboBox from '../../../components/ui/ComboBox';
import InputField from '../../../components/ui/InputField';
import SelectComboBox from '../../../components/ui/ComboBoxField';
import { useGetAllFilterContents } from '../../../hooks/filter/useFilterContent';
import { useItemNames } from '../../../hooks/itemName/useItemNames';


// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    categoryKey: "",
    imageKeyId: "",
    filterKeyId: "",   
    filterId: "",  
    link: "",
    desktopRatio: "",
    mobileRatio: "",
    rowSpan: "",
    isSingle: false,
    isBothUsed: false,

   
};

const INITIAL_FILES = {
    imageDesktop: null,
    imageMobile: null,
    existingDesktopImage: null,
    existingMobileImage: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const validateFile = (file) => {
    if (!file?.type?.startsWith("image/")) return "Only image files allowed (jpg, png, webp)";
    if (file.size > 200 * 1024) {
        return `File too large: ${(file.size / 1024).toFixed(1)}KB / 200KB maximum`;
    }
    return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
const AddBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state = {} } = location;
    const isEdit = state?.mode === "edit" && state?.bannerData;
    const bannerData = state?.bannerData || null;



    const { items } = useItemNames();

    const itemNames = useMemo(() => {
        if (!items) return [];
        return items.map(item => ({
            label: item.ITEMNAME,
            value: item.ITEMID,
        }));
    }, [items]);


    console.log(itemNames,'itemNames');

    // ── remote data ──────────────────────────────────────────────────────────
    const { data: bannerSettingData } = useGetBannerSettings();
    const bannerKeyContent = bannerSettingData?.data || [];

    console.log(bannerKeyContent,'bannerKeyContent');


    const uploadMutation = useCreateBanners();
    const updateMutation = useUpdateBannerMutation();
    const isLoading = uploadMutation.isPending || updateMutation.isPending;

    // ── unified form state ────────────────────────────────────────────────────
    const [form, setForm] = useState(INITIAL_FORM);
    const [files, setFiles] = useState(INITIAL_FILES);
    const [fileErrors, setFileErrors] = useState({ desktop: "", mobile: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isGrid, setIsGrid] = useState(false);

    const [itemId ,setItemId] =useState('');

    // convenience setter – merges partial updates like setState in class components
    const setField = (key, value) =>
        setForm(prev => ({ ...prev, [key]: value }));


    useEffect(()=>{
        
        if (itemId){
            setField('link', `itemId=${itemId}`)
        }
        else{
            setField('link' , '');
        }
    },[itemId])

    useEffect(()=>{

        if(form.link){
            const val = form.link.split('=')[0];
            if(val === 'itemId'){
                const id = form.link.split('=')[1];
                setItemId(id);
            }

        }

    },[form.link])


    // ── derived: selected banner-setting option ───────────────────────────────
    const selectedOption = useMemo(
        () => bannerKeyContent.find(item => item.imageKey === form.categoryKey) || null,
        [bannerKeyContent, form.categoryKey]
    );

    // ── filter content from API ───────────────────────────────────────────────
    const { data: filterData } = useGetAllFilterContents({
        filterKeyId: form.filterKeyId,
        isActive: true,
        // isUsed: true,
    });
    console.log(filterData, 'filterData');

    const filterContent = useMemo(() => {
        if (!filterData?.filters) return [];
        return filterData.filters.map(item => ({
            label: item.filterValue,
            value: item.id,
        }));
    }, [filterData]);

    

    // ── decide which inputs to show ───────────────────────────────────────────
    // isBothUsed=true  → always show BOTH link and filter
    // isBothUsed=false → show filter if filterContent has items, else show link
    const showFilter = form.isBothUsed || filterContent.length > 0;
    const showLink = form.isBothUsed || filterContent.length === 0;

    // ── populate form in edit mode ────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit || !bannerData?.images?.[0]) return;
        const firstImage = bannerData.images[0];

        setForm({
            categoryKey: bannerData.categoryKey || "",
            imageKeyId: bannerData.imageKey || "",                          // will be resolved by selectedOption effect
            filterKeyId: bannerData.filterId || "",
            filterId: bannerData.bannerFilterId || "",
            link: bannerData.link || "",
            desktopRatio: bannerData.desktopRatio || "",
            mobileRatio: bannerData.mobileRatio || "",
            rowSpan: bannerData.rowSpan || "",
            isSingle: !!bannerData.isSingle,
            isBothUsed: !!bannerData.isBothUsed,
        });

        setFiles(prev => ({
            ...prev,
            existingDesktopImage: firstImage.desktop?.url || null,
            existingMobileImage: firstImage.mobile?.url || null,
        }));
    }, [isEdit, bannerData]);

    // ── sync isGrid & reset images when categoryKey changes ──────────────────
    useEffect(() => {
        if (!form.categoryKey || !bannerSettingData?.data) return;
        const setting = bannerSettingData.data.find(item => item.imageKey === form.categoryKey);
        if (!setting) return;
        setIsGrid(!!setting.isGrid);
        setFiles(prev => ({ ...prev, imageDesktop: null, imageMobile: null }));
    }, [form.categoryKey, bannerSettingData]);

    // ── file change handler ───────────────────────────────────────────────────
    const handleFileChange = (field, type, e) => {
        setError("");
        setFileErrors(prev => ({ ...prev, [type]: "" }));
        const file = e.target.files?.[0];
        if (!file) return setFiles(prev => ({ ...prev, [field]: null }));
        const validationError = validateFile(file);
        if (validationError) {
            setFileErrors(prev => ({ ...prev, [type]: validationError }));
            e.target.value = '';
            return;
        }
        setFiles(prev => ({ ...prev, [field]: file }));
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const { categoryKey, filterId, filterKeyId, link, isSingle, isBothUsed } = form;

        if (!categoryKey.trim()) return setError("Category key is required");

        if (showFilter && !filterId) return setError("Filter ID is required");
        if (showLink && !link.trim()) return setError("Link is required");

        if (!isSingle && showLink && !link.trim())
            return setError("Link is required for dual banner");

        if (!isEdit) {
            if (!files.imageDesktop) return setError("Desktop image is required");
            if (!isSingle && !files.imageMobile) return setError("Mobile image is required for dual banner");
        }
        console.log(form, 'form');

      

        const payload = new FormData();
        payload.append("filterId", filterKeyId);
        payload.append("category_key", categoryKey);
        payload.append("image_key", form.imageKeyId);
        payload.append("link", link);
        payload.append("desktop_ratio", form.desktopRatio);
        payload.append("mobile_ratio", form.mobileRatio);
        payload.append("is_single", isSingle);
        payload.append("rowSpan", form.rowSpan);
        payload.append("isBothUse", isBothUsed);

        if (showFilter && filterId) payload.append("bannerFilterId", filterId);

        if (isEdit) {
            // payload.append("id", bannerData.id);
            if (files.imageDesktop instanceof File) payload.append("image_desktop", files.imageDesktop);
            if (!isSingle && files.imageMobile instanceof File) payload.append("image_mobile", files.imageMobile);
        } else {
            payload.append("image_desktop", files.imageDesktop);
            if (!isSingle && files.imageMobile) payload.append("image_mobile", files.imageMobile);
        }

        console.log(payload,'bannerPayload');

        const mutation = isEdit ? updateMutation : uploadMutation;
        mutation.mutate(isEdit
            ? { id: bannerData.id, formData:payload }
            : payload , {
            onSuccess: () => {
                setSuccess(`Banner ${isEdit ? 'updated' : 'uploaded'} successfully`);
                setTimeout(() => navigate("/admin/banner/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || err?.message || "Operation failed");
            },
        });
    };

    // ── clear ─────────────────────────────────────────────────────────────────
    const handleClear = () => {
        setForm(INITIAL_FORM);
        setFiles(INITIAL_FILES);
        setFileErrors({ desktop: "", mobile: "" });
        setError("");
        setSuccess("");
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto m-1 bg-[var(--primary-card-color)] p-2 rounded-xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-2 animate__animated animate__fadeInDown p-2">
                <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {isEdit ? "✏️ Edit Banner" : "➕ Add Banner"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {isEdit
                            ? 'Update your existing banner configuration'
                            : 'Create a new banner for your budget section'}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 text-xs font-medium
                               hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    ${error ? 'bg-gradient-to-r from-red-50 to-red-100' : 'bg-gradient-to-r from-green-50 to-green-100'}`}>
                    <div className="flex items-center gap-2">
                        <span>
                            {error ? (
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-green-600 animate__animated animate__bounceIn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <form onSubmit={handleSubmit} className="space-y-2">

                {/* ── Category Key ── */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-2">
                        Category Key <span className="text-red-500">*</span>
                    </label>
                    <ComboBox
                        options={bannerKeyContent}
                        value={selectedOption}
                        onChange={(option) => {
                            setForm(prev => ({
                                ...prev,
                                categoryKey: option?.imageKey || '',
                                imageKeyId: option?.id || '',
                                filterKeyId: option?.filterKey || '',
                                // reset dependent fields when category changes
                                filterId: '',
                                link: '',
                            }));
                        }}
                        getOptionLabel={(opt) => opt?.imageKey || ''}
                        getOptionValue={(opt) => opt?.imageKey || ''}
                        placeholder="Select or type to search..."
                        disabled={isLoading}
                        searchable
                        clearable
                        size="md"
                        variant="outlined"
                        noOptionsText="No categories available"
                        autoHighlight
                        className="w-full"
                        inputClassName="text-sm"
                    />
                </div>

                {/* ── isBothUsed toggle (only relevant when a filterKey exists) ── */}
                {form.filterKeyId && (
                    <div className="animate__animated animate__fadeIn">
                        <Switch
                            checked={form.isBothUsed}
                            onChange={(val) => setField('isBothUsed', val)}
                            label="Use Both Link & Filter"
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-gray-500 mt-1 ml-1">
                            {form.isBothUsed
                                ? '⚡ Both mode: link and filter ID will be sent'
                                : '↔️ Auto mode: uses filter if available, otherwise link'}
                        </p>
                    </div>
                )}

                {/* ── Filter ComboBox ── */}
                {showFilter && (
                    <div className="">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-2">
                            Filter Key <span className="text-red-500">*</span>
                        </label>
                        <ComboBox
                            options={filterContent}
                            value={filterContent.find(o => o.value === form.filterId) || null}
                            onChange={(option) => setField('filterId', option?.value || '')}
                            getOptionLabel={(opt) => opt?.label || ''}
                            getOptionValue={(opt) => opt?.value || ''}
                            placeholder="Select or type to search..."
                            disabled={isLoading || !form.filterKeyId}
                            searchable
                            clearable
                            size="md"
                            variant="outlined"
                            noOptionsText="No filters available"
                            autoHighlight
                            className="w-full"
                            inputClassName="text-sm"
                        />
                    </div>
                )}

                {/* ── Link input ── */}
                {showLink && (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-2">
                            Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                </svg>
                            </div>
                            {/* <input
                                value={form.link}
                                onChange={(e) => setField('link', e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                           transition-all duration-200 outline-none
                                           disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="https://example.com/banner"
                            /> */}

                            <InputField
                                value={form.link}
                                field={"link"}
                                onChange={setField}
                                disabled={isLoading}
                                // className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                //            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                //            transition-all duration-200 outline-none
                                //            disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="https://example.com/banner"
                                type='text'
                            />
                            <SelectComboBox
                                options={itemNames}
                                value={itemId}
                                field="itemId"
                                onChange={(itemId,val) => {
                                    console.log(val, 'setValue');
                                    setItemId(val);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Ratios / Row Span ── */}
                {!isGrid ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate__animated animate__fadeInUp">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Desktop Ratio</label>
                            <InputField
                                value={form.desktopRatio}
                                field={"desktopRatio"}
                                onChange={setField}
                                disabled={isLoading}
                                // className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                //            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                //            transition-all duration-200 outline-none"
                                placeholder="e.g., 16 / 9"
                            />
                        </div>
                        {!form.isSingle && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Mobile Ratio</label>
                                <InputField
                                    value={form.mobileRatio}
                                    field={"mobileRatio"}
                                    onChange={setField}
                                    disabled={isLoading}
                                    // className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                                    //            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                                    //            transition-all duration-200 outline-none"
                                    placeholder="e.g., 4 / 5"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5 animate__animated animate__fadeInUp">
                        <label className="text-xs font-semibold text-gray-700">Row Span</label>
                        <InputField
                            value={form.rowSpan}
                            field={"rowSpan"}
                            onChange={setField}
                            disabled={isLoading}
                            // className="w-full md:w-64 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                            //            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                            //            transition-all duration-200 outline-none"
                            placeholder="Enter row span (e.g., 2)"
                        />
                    </div>
                )}

                {/* ── Single Banner Switch ── */}
                <div className="animate__animated animate__fadeInUp">
                    <Switch
                        checked={form.isSingle}
                        onChange={(val) => {
                            setField("isSingle", val);

                            if (val) {
                                setFiles(prev => ({
                                    ...prev,
                                    imageMobile: null,
                                    existingMobileImage: null,
                                }));
                            }
                        }}
                        label="Single Banner Mode"
                        disabled={isLoading}
                    />
                    <p className="text-[10px] text-gray-500 mt-1 ml-1">
                        {form.isSingle
                            ? '✓ Single mode: Only desktop banner will be used'
                            : '↔️ Dual mode: Both desktop and mobile banners required'}
                    </p>
                </div>

                {/* ── Image Uploads ── */}
                <div className="flex flex-col sm:flex-row gap-2 animate__animated animate__fadeInUp">
                    <FileUploadArea
                        type="desktop"
                        value={files.imageDesktop}
                        onChange={(file) => setFiles(prev => ({ ...prev, imageDesktop: file }))}
                        existingUrl={files.existingDesktopImage}
                        label="Desktop Banner"
                        required={!isEdit || !files.existingDesktopImage}
                        isMobile={false}
                        isLoading={isLoading}
                        error={fileErrors.desktop}
                        hint="JPG, PNG, WEBP • Max 200KB"
                        maxSizeKB={200}
                    />
                    {!form.isSingle && (
                        <FileUploadArea
                            type="mobile"
                            value={files.imageMobile}
                            onChange={(file) => setFiles(prev => ({ ...prev, imageMobile: file }))}
                            existingUrl={files.existingMobileImage}
                            label="Mobile Banner"
                            required={!isEdit || !files.existingMobileImage}
                            isMobile
                            isLoading={isLoading}
                            error={fileErrors.mobile}
                            showProgressBar
                            showSizeBadge
                            showTooltip
                            hint="JPG, PNG, WEBP • Max 200KB"
                            maxSizeKB={200}
                        />
                    )}
                </div>

                {/* ── Form Actions ── */}
                <div className="flex items-center justify-between pt-2 animate__animated animate__fadeInUp">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-medium
                                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
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
                            className="p-2 rounded-xl border-2 border-gray-200 text-xs font-medium
                                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        className={`px-2 py-2 rounded-xl text-white text-sm font-medium
                            transition-all duration-300 transform flex items-center gap-2
                            ${isLoading
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'
                            }
                            animate__animated animate__pulse animate__infinite`}
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

export default AddBanner;