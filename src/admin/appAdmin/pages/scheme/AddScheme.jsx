import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateScheme, useUpdateScheme } from "../../hooks/scheme/useScheme";
import Snackbar from "../../../components/snackBar/Snackbar";


const AddSchemeDetails = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const isEdit = state?.id;
    const [schemeImagePreview, setSchemeImagePreview] = useState(
        state?.schemeImage || ""
    );

    const [bigSchemeImagePreview, setBigSchemeImagePreview] = useState(
        state?.bigschemeImage || ""
    );
    const createScheme = useCreateScheme();
    const updateScheme = useUpdateScheme();
    // ---------------- Snackbar ----------------
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info", // success | error | info
        title: ""
    });

    const showSnackbar = ({ message, type = "info", title = "" }) => {
        setSnackbar({
            open: true,
            message,
            type,
            title
        });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };
    // ---------------- Form State ----------------
    const [form, setForm] = useState({
        schemeId: state?.schemeId ?? "",
        schemeName: state?.schemeName ?? "",
        schemeDescription: state?.schemeDescription ?? "",
        schemeLink: state?.schemeLink ?? "",
        androidLink: state?.androidLink ?? "",
        iosLink: state?.iosLink ?? "",
        language: state?.language ?? "",
        keyvalue: state?.keyvalue ?? "",
       
    });
    const [schemeImage, setSchemeImage] = useState(null);
    const [bigSchemeImage, setBigSchemeImage] = useState(null);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const langOptions = [
        { label: "English", value: "EN" }, 
        { label: "Tamil", value: "TM" } 
    ];

    // ---------------- Handlers ----------------
    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showSnackbar({
                type: "error",
                title: "Invalid file",
                message: "Only image files are allowed"
            });
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (type === "small") {
            setSchemeImage(file);
            setSchemeImagePreview(previewUrl);
        } else {
            setBigSchemeImage(file);
            setBigSchemeImagePreview(previewUrl);
        }
    };
    // ---------------- Validation ----------------

    const validateForm = () => {
        if (!form.schemeId) {
            showSnackbar({
                type: "error",
                title: "Validation Error",
                message: "Scheme Id is required"
            });
            return false;
        }

        if (!form.schemeName.trim()) {
            showSnackbar({
                type: "error",
                title: "Validation Error",
                message: "Scheme Name is required"
            });
            return false;
        }

        // Images required only while creating
        if (!isEdit) {
            if (!schemeImage) {
                showSnackbar({
                    type: "error",
                    title: "Validation Error",
                    message: "Scheme Image is required"
                });
                return false;
            }

            if (!bigSchemeImage) {
                showSnackbar({
                    type: "error",
                    title: "Validation Error",
                    message: "Big Scheme Image is required"
                });
                return false;
            }
        }

        return true;
    };

    // ---------------- Submit ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Frontend validation
        if (!validateForm()) return;

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (value !== "") {
                formData.append(key, String(value));
            }
        });

        if (schemeImage) formData.append("schemeImage", schemeImage);
        if (bigSchemeImage) formData.append("bigschemeImage", bigSchemeImage);

        try {
            setSubmitting(true);
            if (isEdit) {
                formData.append("id", state.id);
                await updateScheme.mutateAsync(formData);

                showSnackbar({
                    type: "success",
                    title: "Success",
                    message: "Scheme updated successfully",
                });
            

            } else {
                await createScheme.mutateAsync(formData);

                showSnackbar({
                    type: "success",
                    title: "Success",
                    message: "Scheme created successfully"
                });
            }

            // ⏳ Small delay so user sees success message
            setTimeout(() => {
                navigate(-1);
            }, 800);

        } catch (err) {
            showSnackbar({
                type: "error",
                title: "Operation Failed",
                message:
                    err?.response?.data?.message ||
                    "Something went wrong. Please try again."
            });
        } finally {
            setSubmitting(false);
        }
    };


    // ---------------- UI ----------------
    return (
        <div className="max-w-6xl mx-auto mt-6">
            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                title={snackbar.title}
                onClose={closeSnackbar}
            />
            <div className="bg-white border rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Edit Scheme" : "Create Scheme"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Scheme Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Scheme Id
                                </label>
                                <input
                                    name="schemeId"
                                    value={form.schemeId}
                                    onChange={onChange}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Scheme Name
                                </label>
                                <input
                                    name="schemeName"
                                    value={form.schemeName}
                                    onChange={onChange}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Key Value
                                </label>
                                <input
                                    name="keyvalue"
                                    value={form.keyvalue}
                                    onChange={onChange}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Language
                                </label>

                                <select
                                    name="language"
                                    value={form.language}
                                    onChange={onChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="" disabled>
                                        Select language
                                    </option>

                                    {langOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Description
                            </label>
                            <textarea
                                name="schemeDescription"
                                value={form.schemeDescription}
                                onChange={onChange}
                                rows={3}
                                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div> */}
                    </div>

                    {/* Links */}
                    {/* <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Links
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                name="schemeLink"
                                value={form.schemeLink}
                                onChange={onChange}
                                placeholder="Website URL"
                                className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <input
                                name="androidLink"
                                value={form.androidLink}
                                onChange={onChange}
                                placeholder="Android App URL"
                                className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <input
                                name="iosLink"
                                value={form.iosLink}
                                onChange={onChange}
                                placeholder="iOS App URL"
                                className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div> */}

                    {/* Images */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Scheme Images
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Small Image */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Scheme Image
                                </label>

                                <div className="flex items-center gap-3">
                                    <div className="w-40 aspect-[5/4] border rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {schemeImagePreview ? (
                                            <img
                                                src={schemeImagePreview}
                                                alt="Scheme Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">Preview</span>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, "small")}
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            {/* Big Image */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Big Scheme Image
                                </label>

                                <div className="flex items-center gap-3">
                                    <div className="w-80 aspect-[16/5] border rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {bigSchemeImagePreview ? (
                                            <img
                                                src={bigSchemeImagePreview}
                                                alt="Big Scheme Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">Preview</span>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, "big")}
                                        className="text-xs"
                                        value={form.bigSchemeImage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2 rounded-lg text-sm text-white ${submitting
                                    ? "bg-indigo-300 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {submitting
                                ? "Saving..."
                                : isEdit
                                    ? "Update Scheme"
                                    : "Create Scheme"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default AddSchemeDetails;
