import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import {
    useCreateBannerSetting,
    useUpdateBannerSetting
} from '../../../hooks/banners/bannerSetting/useBannerSettings';
import Snackbar from '../../../components/snackBar/Snackbar';

const Switch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between my-2">
        <span className="text-xs font-medium">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}>
                {checked ? (
                    <i className="fas fa-check text-[10px] text-[var(--primary-color)] flex items-center justify-center h-full"></i>
                ) : (
                    <i className="fas fa-times text-[10px] text-gray-400 flex items-center justify-center h-full"></i>
                )}
            </span>
        </button>
    </div>
);

const BannerSetting = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Added navigate hook
    const stateData = location.state || {};
    const mode = stateData.mode || 'add';
    const initialData = stateData.data || null;

    console.log(initialData, 'initialData')

    const [form, setForm] = useState({
        imageKey: "",
        title: "",
        description: "",
        gap: true,
        mobileGap: false,
        centered: true,
        full: false,
        backgroundColor: "#ffffff",
        defaultRatio: "16/9",
        mobileRatio: "4/3",
        mobileRowsDesktop: "",
        mobileRowsMobile: "",
        desktopColumns: "auto",
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    const createMutation = useCreateBannerSetting();
    const updateMutation = useUpdateBannerSetting();

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setForm({
                imageKey: initialData.imageKey || "",
                title: initialData.title || "",
                description: initialData.description || "",
                gap: initialData.gap ?? true,
                mobileGap: initialData.mobileGap ?? false,
                centered: initialData.centered ?? true,
                full: initialData.full ?? false,
                backgroundColor: initialData.backgroundColor || "#ffffff",
                defaultRatio: initialData.defaultRatio || "16/9",
                mobileRatio: initialData.mobileRatio || "4/3",
                desktopColumns: initialData.desktopColumns || "auto",
                mobileRowsDesktop: Array.isArray(initialData.mobileRows)
                    ? String(initialData.mobileRows[0] || 2)
                    : "2",
                mobileRowsMobile: Array.isArray(initialData.mobileRows)
                    ? String(initialData.mobileRows[1] || 1)
                    : "1",
            });
        }
    }, [initialData, mode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSwitchChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.imageKey.trim()) {
            setSnackbar({ open: true, message: "ImageKey is required", type: "error", title: "Error" });
            return;
        }

        if (!form.title.trim()) {
            setSnackbar({ open: true, message: "Title is required", type: "error", title: "Error" });
            return;
        }

        const payload = {
            imageKey: form.imageKey.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            gap: form.gap,
            mobileGap: form.mobileGap,
            centered: form.centered,
            full: form.full,
            backgroundColor: form.backgroundColor,
            defaultRatio: form.defaultRatio,
            mobileRatio: form.mobileRatio,
            mobileRows: [Number(form.mobileRowsDesktop), Number(form.mobileRowsMobile)],
            desktopColumns: form.desktopColumns,
        };

        if (mode === "add") {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: "Banner created successfully!",
                        type: "success",
                        title: "Success"
                    });
                    // Clear form after successful creation
                    resetForm();
                    // Navigate back after a short delay
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500);
                },
                onError: (err) => {
                    setSnackbar({ open: true, message: err.message || "Failed to create banner", type: "error", title: "Error" });
                }
            });
        } else if (mode === "edit" && initialData) {
            updateMutation.mutate({ id: initialData.id, formData: payload }, {
                onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: "Banner updated successfully!",
                        type: "success",
                        title: "Success"
                    });
                    // Navigate back after successful update
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500);
                },
                onError: (err) => {
                    setSnackbar({ open: true, message: err.message || "Failed to update banner", type: "error", title: "Error" });
                }
            });
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setForm({
            imageKey: "",
            title: "",
            description: "",
            gap: true,
            mobileGap: false,
            centered: true,
            full: false,
            backgroundColor: "#ffffff",
            defaultRatio: "16/9",
            mobileRatio: "4/3",
            mobileRowsDesktop: "",
            mobileRowsMobile: "",
            desktopColumns: "auto",
        });
    };

    // Handle cancel button click
    const handleCancel = () => {
        // If in edit mode, navigate back without clearing form
        if (mode === 'edit') {
            navigate(-1);
        } else {
            // If in add mode, clear the form
            resetForm();
        }
    };

    // Handle close (X) button click
    const handleClose = () => {
        // Always navigate back when X button is clicked
        navigate(-1);
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className='mt-4 p-2'>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                <div className="border-b pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-image text-[var(--primary-color)] text-lg"></i>
                            <h2 className="text-sm font-semibold">
                                {mode === 'edit' ? 'Edit Hero Banner' : 'Create Hero Banner'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Configure responsive banner settings</p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold mb-1">
                            Image Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="imageKey"
                            value={form.imageKey}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Enter image key"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Enter banner title"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded text-sm"
                            rows={2}
                            placeholder="Enter banner description"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold">Layout Options</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Switch checked={form.gap} onChange={(val) => handleSwitchChange('gap', val)} label="Gap between images" />
                        <Switch checked={form.mobileGap} onChange={(val) => handleSwitchChange('mobileGap', val)} label="Mobile gap" />
                        <Switch checked={form.centered} onChange={(val) => handleSwitchChange('centered', val)} label="Center content" />
                        <Switch checked={form.full} onChange={(val) => handleSwitchChange('full', val)} label="Full width" />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold">Aspect Ratios & Colors</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Background Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" name="backgroundColor" value={form.backgroundColor} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer" disabled={isSubmitting} />
                                <input type="text" name="backgroundColor" value={form.backgroundColor} onChange={handleChange} className="flex-1 px-3 py-2 border rounded text-sm" placeholder="#ffffff" disabled={isSubmitting} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Desktop Ratio</label>
                            <input name="defaultRatio" value={form.defaultRatio} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" placeholder="16/9" disabled={isSubmitting} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Mobile Ratio</label>
                            <input name="mobileRatio" value={form.mobileRatio} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" placeholder="4/3" disabled={isSubmitting} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Desktop Columns</label>
                            <select name="desktopColumns" value={form.desktopColumns} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" disabled={isSubmitting}>
                                <option value="auto">Auto</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold">Mobile Rows Configuration</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Desktop View Rows</label>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                name="mobileRowsDesktop"
                                value={form.mobileRowsDesktop}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded text-sm"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Mobile View Rows</label>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                name="mobileRowsMobile"
                                value={form.mobileRowsMobile}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded text-sm"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Example: [Desktop: {form.mobileRowsDesktop}, Mobile: {form.mobileRowsMobile}] = {form.mobileRowsDesktop} images on first row, {form.mobileRowsMobile} on second
                    </p>
                </div>

                <div className="pt-3 border-t flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        {mode === 'edit' ? 'Back' : 'Clear'}
                    </button>
                    <button type="submit" className={`flex-1 px-4 py-2 bg-[var(--primary-color)] text-white text-xs rounded flex items-center justify-center ${isSubmitting ? 'opacity-70' : ''}`} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                {mode === 'edit' ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <i className={`fas ${mode === 'edit' ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                                {mode === 'edit' ? 'Update Banner' : 'Create Banner'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                title={snackbar.title}
                duration={3000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                persistent={false}
            />
        </div>
    );
};

export default BannerSetting;