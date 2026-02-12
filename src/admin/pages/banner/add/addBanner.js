import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUploadBannerMutation, useUpdateBannerMutation } from "../../../hooks/banners/mainBanner/useUploadBannerMutation";
import { useBannersQuery } from "../../../hooks/banners/mainBanner/useBannersQuery";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import FileUploadArea from "../../../components/banner/FileUploadArea";
import Snackbar from "../../../components/snackBar/Snackbar";
import ComboBox from "../../../components/ui/ComboBox";

const AddEditBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === "edit" && state?.id;
    const editId = state?.id ?? null;

    // queries / mutations
    const { data: bannersData, isLoading: bannersLoading } = useBannersQuery();
    const banners = useMemo(() => bannersData?.data || [], [bannersData]);
    const { items: itemNames = [] } = useItemNames();

    const uploadMutation = useUploadBannerMutation();
    const updateMutation = useUpdateBannerMutation();
    const isUploading = uploadMutation.isPending || uploadMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;

    // form state
    const [itemname, setItemname] = useState("");
    const [file, setFile] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState(null);
    const [fileError, setFileError] = useState("");
    const [existingItemName, setExistingItemName] = useState("");

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info",
        title: "",
    });

    // find banner for edit (if editing)
    const currentBanner = useMemo(() => {
        if (!isEdit) return null;
        return banners.find((b) => Number(b.id) === Number(editId)) || null;
    }, [isEdit, editId, banners]);

    // pre-fill on load when editing
    useEffect(() => {
        if (isEdit && currentBanner) {
            setItemname(currentBanner.itemname ?? "");
            setExistingItemName(currentBanner.itemname ?? "");
            setExistingImagePath(currentBanner.image_path ?? null);
        }
    }, [isEdit, currentBanner]);

    // Show snackbar helper
    const showSnackbar = useCallback((message, type = "info", title = "") => {
        setSnackbar({
            open: true,
            message,
            type,
            title,
        });
    }, []);

    // Close snackbar
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Reset form
    const handleClear = useCallback(() => {
        setItemname("");
        setFile(null);
        setFileError("");
        if (!isEdit) {
            setExistingImagePath(null);
            setExistingItemName("");
        }
        showSnackbar("Form cleared successfully", "info", "Cleared");
    }, [isEdit, showSnackbar]);

    // Handle file validation error
    const handleValidationError = useCallback((errorMsg) => {
        setFileError(errorMsg);
        showSnackbar(errorMsg, "error", "Validation Error");
    }, [showSnackbar]);

    // Check for duplicate item category
    const isDuplicateItem = useCallback((selectedItemName) => {
        if (!selectedItemName) return false;

        return banners.some(
            b => b.itemname?.toLowerCase() === selectedItemName.toLowerCase() &&
                selectedItemName.toLowerCase() !== existingItemName?.toLowerCase()
        );
    }, [banners, existingItemName]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!itemname) {
            showSnackbar("Please select an item category.", "error", "Validation Error");
            return;
        }

        if (isDuplicateItem(itemname)) {
            showSnackbar("This item category already exists.", "error", "Duplicate Entry");
            return;
        }

        // For Add: image required. For Edit: optional
        if (!isEdit && !file) {
            showSnackbar("Please choose an image for the banner.", "error", "Validation Error");
            return;
        }

        const payload = new FormData();

        if (isEdit) {
            payload.append("id", editId);
            if (file instanceof File) payload.append("image", file);
            payload.append("itemname", itemname);
        } else {
            payload.append("image", file);
            payload.append("itemname", itemname);
        }

        const mutation = isEdit ? updateMutation : uploadMutation;

        mutation.mutate(payload, {
            onSuccess: () => {
                showSnackbar(
                    `Banner ${isEdit ? 'updated' : 'uploaded'} successfully.`,
                    "success",
                    isEdit ? "Updated" : "Uploaded"
                );

                if (!isEdit) {
                    handleClear();
                }

                setTimeout(() => {
                    navigate("/admin/banner/manage");
                }, 1500);
            },
            onError: (err) => {
                const msg = err?.response?.data?.error || err?.message || `${isEdit ? 'Update' : 'Upload'} failed.`;
                showSnackbar(msg, "error", "Operation Failed");
            },
        });
    };

    const isLoading = isUploading || isUpdating || bannersLoading;

    // Find selected option object for ComboBox
    const selectedOption = useMemo(() => {
        return itemNames.find(item => item.ITEMCTRNAME === itemname) || null;
    }, [itemNames, itemname]);

    console.log(itemNames,'selectedOption');
    console.log(itemname,'selectedOption');

    return (
        <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                title={snackbar.title}
                onClose={handleCloseSnackbar}
                duration={4000}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate__animated animate__fadeInDown">
                <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {isEdit ? "✏️ Edit Banner" : "➕ Add New Banner"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {isEdit
                            ? "Update your existing banner configuration"
                            : "Create a new banner for your main section"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 text-xs font-medium
                             hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Category - ComboBox */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                            📦 CATEGORY
                        </span>
                        Item Category
                        <span className="text-red-500">*</span>
                    </label>

                    <ComboBox
                        options={itemNames}
                        value={selectedOption}
                        onChange={(option) => {
                            const value = option?.ITEMCTRNAME || '';
                            setItemname(value);
                        }}
                        getOptionLabel={(opt) => opt?.ITEMCTRNAME || ''}
                        getOptionValue={(opt) => opt?.ITEMCTRNAME || ''}
                        placeholder="Select or type to search..."
                        disabled={isLoading}
                        searchable={true}
                        clearable={true}
                        size="md"
                        variant="outlined"
                        error={isDuplicateItem(itemname) && itemname ? true : false}
                        helperText={isDuplicateItem(itemname) && itemname ? "This item category already exists" : ""}
                        noOptionsText="No categories available"
                        autoHighlight={true}
                        className="w-full"
                        inputClassName="text-sm"
                    />
                </div>

                {/* Banner Image */}
                <div className="animate__animated animate__fadeInUp animate__delay-1s">
                    <FileUploadArea
                        type="banner"
                        value={file}
                        onChange={setFile}
                        existingUrl={existingImagePath}
                        label="Banner Image"
                        required={!isEdit}
                        isLoading={isLoading}
                        error={fileError}
                        onValidationError={handleValidationError}
                        maxSizeKB={50}
                        hint="JPG, PNG, WEBP • Max 50KB"
                        isMobile={false}
                        showTooltip={true}
                        showProgressBar={true}
                        showSizeBadge={true}
                        uploadButtonText={isEdit ? "Change Image" : "Upload Image"}
                        changeButtonText="Change Image"
                    />
                    {isEdit && existingImagePath && !file && (
                        <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Leave empty to keep current image
                        </p>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 
                              animate__animated animate__fadeInUp animate__delay-2s">
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
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                            px-6 py-2.5 rounded-xl text-white text-sm font-medium
                            transition-all duration-300 transform flex items-center gap-2
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
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {isUploading ? "Uploading..." : "Updating..."}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {isEdit ? "Update Banner" : "Upload Banner"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditBanner;