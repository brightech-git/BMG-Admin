import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    useGetAllFilterContents,
    useCreateFilterContent,
    useUpdateFilterContent
} from '../../hooks/filter/useFilterContent';
import Snackbar from '../../components/snackBar/Snackbar';
import { Switch } from '../../components/ui/Switch';
import 'animate.css';
import { useGetAllFilterSettings } from '../../hooks/filter/useFilterSetting';
import ComboBox from '../../components/ui/ComboBox';

// Animated Card Component
const AnimatedCard = ({ children, delay = 0, className = "" }) => (
    <div
        className={`
            animate__animated animate__fadeInUp animate__faster
            bg-gradient-to-br from-white to-[#FFF7ED]/30
            rounded-xl p-2 border-2 border-[#FED7AA]
            hover:shadow-lg hover:shadow-[#F97316]/5
            transition-all duration-300
            ${className}
        `}
        style={{ animationDelay: `${delay}s` }}
    >
        {children}
    </div>
);

const AddFilterContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const mode = stateData.mode || 'add';
    const initialData = stateData.filterData || null;

    const [form, setForm] = useState({
        filterTitle: "",
        filterValue: "",
        filterKeyId: null,
        isActive: true,
        isUsed: false,
        min: null,
        max: null,
        step: null,
        displayOrder: 1,
    });

    const [selectedKey, setSelectedKey] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    // Fetch filter settings for ComboBox
    const { data: filterSettings } = useGetAllFilterSettings();
    const filterSettingsList = useMemo(() => Array.isArray(filterSettings?.data) ? filterSettings.data : [], [filterSettings?.data]);

    const filterOptions = useMemo(() => {
        return filterSettingsList.map(item => ({
            label: item.filterKey,
            value: item.id,
        }));
    }, [filterSettingsList]);

    console.log(filterSettingsList, 'filterSettingsList');
    
    // Fetch existing filter contents
    const { data: filterContent } = useGetAllFilterContents();
    const filterContentList = useMemo(() => Array.isArray(filterContent?.data) ? filterContent.data : [], [filterContent?.data]);

    const isDuplicate = filterContentList.some(item =>
        item.filterKeyId === form.filterKeyId && item.id !== initialData?.id
    );

    const createMutation = useCreateFilterContent();
    const updateMutation = useUpdateFilterContent();

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                filterTitle: initialData.filterTitle || "",
                filterValue: initialData.filterValue || "",
                filterKeyId: initialData.filterKeyId || null,
                isActive: initialData.isActive ?? true,
                isUsed: initialData.isUsed ?? false,
                min: initialData.min || null,
                max: initialData.max || null,
                step: initialData.step || null,
                displayOrder: initialData.displayOrder || 1,
            });

            // set selectedKey from settings
            const keyObj = filterSettingsList.find(k => k.filterKeyId === initialData.filterKeyId);
            setSelectedKey(keyObj || null);
        }
    }, [mode, initialData, filterSettingsList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterKeySelect = (key) => {
        setSelectedKey(key);
        setForm(prev => ({
            ...prev,
            filterKeyId: key.filterKeyId,
            filterTitle: key.filterTitle || "",
            min: key.min || null,
            max: key.max || null,
            step: key.step || null,
            filterValue: "", // reset for non-range keys
        }));
    };

    const validateForm = useCallback(() => {
        if (!form.filterKeyId) {
            setSnackbar({ open: true, message: "Filter key is required", type: "error", title: "Error" });
            return false;
        }
        if (!form.filterTitle?.trim()) {
            setSnackbar({ open: true, message: "Filter title is required", type: "error", title: "Error" });
            return false;
        }
        if (isDuplicate) {
            setSnackbar({ open: true, message: "Duplicate filter content for this key", type: "error", title: "Error" });
            return false;
        }
        return true;
    }, [form, isDuplicate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = { ...form };
        if (mode === "add") {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setSnackbar({ open: true, message: "Filter content created!", type: "success", title: "Success" });
                    resetForm();
                    setTimeout(() => navigate(-1), 1500);
                },
                onError: (err) => setSnackbar({ open: true, message: err.message || "Failed to create", type: "error", title: "Error" })
            });
        } else if (mode === "edit" && initialData) {
            updateMutation.mutate({ id: initialData.id, data: payload }, {
                onSuccess: () => {
                    setSnackbar({ open: true, message: "Filter content updated!", type: "success", title: "Success" });
                    setTimeout(() => navigate(-1), 1500);
                },
                onError: (err) => setSnackbar({ open: true, message: err.message || "Failed to update", type: "error", title: "Error" })
            });
        }
    };

    const resetForm = () => {
        setForm({
            filterTitle: "",
            filterValue: "",
            filterKeyId: null,
            isActive: true,
            isUsed: false,
            min: null,
            max: null,
            step: null,
            displayOrder: 1,
        });
        setSelectedKey(null);
    };

    const handleCancel = () => mode === 'edit' ? navigate(-1) : resetForm();
    const handleClose = () => navigate(-1);
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="mt-4 p-4">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">

                {/* Header */}
                <AnimatedCard delay={0}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97316]/30 animate__animated animate__pulse animate__infinite animate__slower">
                                <i className="fas fa-filter text-white text-sm"></i>
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-lg font-bold text-[#7C2D12] flex items-center gap-2">
                                    {mode === 'edit' ? 'Edit Filter Content' : 'Add Filter Content'}
                                    {mode === 'edit' && <span className="bg-[#FFEDD5] text-[#F97316] text-[8px] px-2 py-1 rounded-full">ID: {initialData?.id}</span>}
                                </h2>
                                <p className="text-xs sm:text-sm text-[#9A3412]">Configure filter content</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-[#FFF7ED] text-[#9A3412] hover:text-[#F97316] transition-all duration-300 hover:rotate-90">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </AnimatedCard>

                {/* Form */}
                <AnimatedCard delay={0.2}>
                    <div className="space-y-4">

                        {/* ComboBox for Filter Key */}
                        <div className="flex items-center gap-2">
                            <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">Filter Key</label>
                            <ComboBox
                                value={form.filterKeyId}
                                options={filterOptions}
                                onChange={handleFilterKeySelect}
                                disabled={isSubmitting}
                                placeholder="Select filter key"
                            />
                        </div>

                        {/* Dynamic fields based on range */}
                        {selectedKey?.min || selectedKey?.max || selectedKey?.step ? (
                            <div className="space-y-2">
                                <label className="font-semibold text-sm text-[#7C2D12]">Filter Title</label>
                                <input type="text" name="filterTitle" value={form.filterTitle} onChange={handleChange} className="w-full border-2 border-[#FED7AA] rounded-xl px-2 py-2" disabled={isSubmitting} />
                                <div className="flex gap-2 mt-2">
                                    <input type="number" placeholder="Min" value={form.min || ""} onChange={e => setForm(prev => ({ ...prev, min: e.target.value }))} className="flex-1 border-2 border-[#FED7AA] rounded-xl px-2 py-2" />
                                    <input type="number" placeholder="Max" value={form.max || ""} onChange={e => setForm(prev => ({ ...prev, max: e.target.value }))} className="flex-1 border-2 border-[#FED7AA] rounded-xl px-2 py-2" />
                                    <input type="number" placeholder="Step" value={form.step || ""} onChange={e => setForm(prev => ({ ...prev, step: e.target.value }))} className="flex-1 border-2 border-[#FED7AA] rounded-xl px-2 py-2" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="font-semibold text-sm text-[#7C2D12]">Filter Title</label>
                                <input type="text" name="filterTitle" value={form.filterTitle} onChange={handleChange} className="w-full border-2 border-[#FED7AA] rounded-xl px-2 py-2" disabled={isSubmitting} />
                                <label className="font-semibold text-sm text-[#7C2D12]">Filter Value</label>
                                <input type="text" name="filterValue" value={form.filterValue} onChange={handleChange} className="w-full border-2 border-[#FED7AA] rounded-xl px-2 py-2" disabled={isSubmitting} />
                            </div>
                        )}

                        {/* Active & Input Switch */}
                        <div className="flex gap-4 mt-2">
                            <Switch checked={form.isActive} onChange={val => handleSwitchChange('isActive', val)} label="Active" disabled={isSubmitting} />
                            <Switch checked={form.isUsed} onChange={val => handleSwitchChange('isUsed', val)} label="Input Used" disabled={isSubmitting} />
                        </div>
                    </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <AnimatedCard delay={0.3}>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleCancel} className="flex-1 p-2 border-2 border-[#FED7AA] text-[#7C2D12] rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 p-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')}
                        </button>
                    </div>
                </AnimatedCard>
            </form>

            <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} title={snackbar.title} duration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} />
        </div>
    );
};

export default AddFilterContent;