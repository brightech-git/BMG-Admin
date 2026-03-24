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

    console.log(initialData,'initialData')

    const [form, setForm] = useState({

        filterTitle: "",
        filterValue: "",
        filterKeyId: null,
        isActive: true,
        min: null,
        max: null,
        step: null,
        displayOrder: 1,
    });

   
    const [selectedKeyOption, setSelectedKeyOption] = useState(null); // Store the selected option object
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    // Fetch filter settings for ComboBox
    // const filter={
    //     isActive:true
    // }
    
    const { data: filterSettings } = useGetAllFilterSettings();
    const filterSettingsList = useMemo(() => Array.isArray(filterSettings?.data) ? filterSettings.data : [], [filterSettings?.data]);

    // Prepare options for ComboBox
    const filterOptions = useMemo(() => {
        return filterSettingsList.map(item => ({
            label: item.filterKey || item.filterLabel || `Key ${item.id}`,
            value: item.id,
            isRange:item.isRange,
            // ...item
        }));
    }, [filterSettingsList]);

    console.log(form,'formform')
  


    // Fetch existing filter contents
    const { data: filterContent } = useGetAllFilterContents();
    const filterContentList = useMemo(() => Array.isArray(filterContent?.data) ? filterContent.data : [], [filterContent?.data]);

    // Check for duplicate (same filterKeyId)
    const isDuplicate = filterContentList.some(item =>
        item.filterKeyId === form.filterKeyId &&
        item.id !== initialData?.id
    );

    const createMutation = useCreateFilterContent();
    const updateMutation = useUpdateFilterContent();



    // Initialize form for edit mode
    useEffect(() => {
        if (mode === "edit" && initialData) {
            const filterKeyId = initialData.filterId ?? null;

            setForm({
                filterTitle: initialData.filterTitle || "",
                filterValue: initialData.filterValue || "",
                filterKeyId: filterKeyId,
                isActive: initialData.isActive ?? true,
                min: initialData.min || null,
                max: initialData.max || null,
                step: initialData.step || null,
                displayOrder: initialData.displayOrder || 1,
            });

            const option = filterOptions.find(
                opt => Number(opt.value) === Number(filterKeyId)
            );

            console.log("Setting selected key option:", option);
            setSelectedKeyOption(option || null);
        }
    }, [mode, initialData, filterOptions]);

    // Determine if the selected key is a range type
    const isRangeType = useMemo(() => {
        if (!selectedKeyOption) return false;

        return selectedKeyOption.isRange || false;
    }, [selectedKeyOption]);
    console.log(isRangeType,'isRangeType')

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
        }));
    };

    const handleNumberChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value === '' ? null : Number(value)
        }));
    };

    const handleSwitchChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterKeySelect = (option) => {
        console.log('Selected option:', option);
        setSelectedKeyOption(option);

        if (option) {
            setForm(prev => ({
                ...prev,
                filterKeyId: option.value,
                // Reset range-specific fields
                min: option.min || null,
                max: option.max || null,
                step: option.step || null,
                filterValue: "", // Reset value field
            }));
        } else {
            setForm(prev => ({
                ...prev,
                filterKeyId: null,
                min: null,
                max: null,
                step: null,
                filterValue: "",
            }));
        }
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

        // Validate based on type
        if (isRangeType) {
            if (form.min === null || form.max === null) {
                setSnackbar({ open: true, message: "Min and Max values are required for range type", type: "error", title: "Error" });
                return false;
            }
            if (form.min >= form.max) {
                setSnackbar({ open: true, message: "Min must be less than Max", type: "error", title: "Error" });
                return false;
            }
        } else {
            if (!form.filterValue?.trim()) {
                setSnackbar({ open: true, message: "Filter value is required", type: "error", title: "Error" });
                return false;
            }
        }

        if (isDuplicate) {
            setSnackbar({ open: true, message: "Duplicate filter content for this key", type: "error", title: "Error" });
            return false;
        }
        return true;
    }, [form, isDuplicate, isRangeType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Prepare payload based on type
        const payload = {
            filterTitle: form.filterTitle,
            filterKeyId: form.filterKeyId,
            isActive: form.isActive,
            displayOrder: form.displayOrder || 1,
        };

        if (isRangeType) {
            payload.min = form.min;
            payload.max = form.max;
            payload.step = form.step || 1;

            // Optionally create a string representation
            payload.filterValue = `${form.min}-${form.max}`;
        } else {
            payload.filterValue = form.filterValue;
        }

        console.log('Submitting payload:', payload);

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
            min: null,
            max: null,
            step: null,
            displayOrder: 1,
        });
        setSelectedKeyOption(null);
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
                    <div className="space-y-4 p-2">

                        {/* ComboBox for Filter Key */}
                        <div className="flex items-center gap-2">
                            <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                Filter Key <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1">
                                <ComboBox
                                    value={selectedKeyOption}
                                    options={filterOptions}
                                    onChange={handleFilterKeySelect}
                                    // disabled={isSubmitting || mode === 'edit'} // Disable in edit mode
                                    placeholder="Select filter key"
                                />
                            </div>
                        </div>

                        {/* Filter Title - Always visible */}
                        <div className="flex items-center gap-2">
                            <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                Filter Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="filterTitle"
                                value={form.filterTitle}
                                onChange={handleChange}
                                className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                placeholder="Enter filter title"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Dynamic fields based on range type */}
                        {isRangeType ? (
                            <>
                                {/* Range Fields */}
                                <div className="flex items-center gap-2">
                                    <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                        Min Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={form.min ?? ''}
                                        onChange={e => handleNumberChange('min', e.target.value)}
                                        className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                        min={0.00}
                                        step="any"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                        Max Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={form.max ?? ''}
                                        onChange={e => handleNumberChange('max', e.target.value)}
                                        className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                        step="any"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                        Step
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Step (default: 1)"
                                        value={form.step ?? ''}
                                        onChange={e => handleNumberChange('step', e.target.value)}
                                        className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                        min={0.00}
                                        step="any"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </>
                        ) : (
                            /* Single Value Field */
                            <div className="flex items-center gap-2">
                                <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                    Filter Value <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="filterValue"
                                    value={form.filterValue}
                                    onChange={handleChange}
                                    className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                    placeholder="Enter filter value"
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}

                        {/* Display Order */}
                        <div className="flex items-center gap-2">
                            <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                Display Order
                            </label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={form.displayOrder}
                                onChange={handleChange}
                                className="flex-1 border-2 border-[#FED7AA] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                                min="1"
                                step="1"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Active & Input Switch */}
                        <div className="flex gap-4 mt-2">
                            <Switch
                                checked={form.isActive}
                                onChange={val => handleSwitchChange('isActive', val)}
                                label={
                                    <span className="flex items-center gap-2 text-sm">
                                        <i className="fas fa-power-off text-[#F97316]"></i>
                                        Active
                                    </span>
                                }
                                disabled={isSubmitting}
                            />
                      
                        </div>
                    </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <AnimatedCard delay={0.3}>
                    <div className="flex gap-3 p-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 p-3 border-2 border-[#FED7AA] text-[#7C2D12] text-sm font-medium rounded-xl hover:bg-[#FFF7ED] hover:border-[#FDBA74] transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {mode === 'edit' ? 'Back' : 'Clear All'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 p-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#F97316]/30 transition-all duration-300 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Saving...
                                </span>
                            ) : (
                                mode === 'edit' ? 'Update Content' : 'Create Content'
                            )}
                        </button>
                    </div>
                </AnimatedCard>
            </form>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                title={snackbar.title}
                duration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default AddFilterContent;