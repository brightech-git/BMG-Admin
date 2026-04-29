import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    useGetAllFilterSettings,
    useCreateFilterSetting,
    useUpdateFilterSetting
} from '../../../hooks/filter/useFilterSetting';
import Snackbar from '../../../components/snackBar/Snackbar';
import { Switch } from '../../../components/ui/Switch';
import 'animate.css';

// Animated Card Component
const AnimatedCard = ({ children, delay = 0, className = "" }) => (
    <div
        className={`
            animate__animated animate__fadeInUp animate__faster
            bg-gradient-to-br from-white to-[var(--background-secondary)]/30
            rounded-xl p-2 border border-[var(--border-color)]
            hover:shadow-lg hover:shadow-[var(--primary-color)]/5
            transition-all duration-300
            ${className}
        `}
        style={{ animationDelay: `${delay}s` }}
    >
        {children}
    </div>
);

// Section Header Component
const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 mb-4">
        <i className={`fas ${icon} text-[var(--primary-color)] text-sm`}></i>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] m-0">
            {title}
        </h3>
    </div>
);

// Field Component
const FormField = ({ label, icon, name, value, onChange, placeholder, required, disabled, type = "text", helperText }) => (
    <div className="animate__animated animate__fadeInLeft">
        <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <i className={`fas ${icon} text-[var(--primary-color)] w-4`}></i>
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg 
                    bg-[var(--background-primary)] focus:border-[var(--primary-color)] 
                    focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none 
                    transition-all h-10 placeholder:text-[var(--text-tertiary)]"
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
       
    </div>
);

// Switch Field Component
const SwitchField = ({ checked, onChange, icon, label, helperText, disabled }) => (
    <div className="animate__animated animate__fadeInRight">
        <Switch
            checked={checked}
            onChange={onChange}
            label={
                <span className="flex text-sm items-center gap-2 text-[var(--text-primary)]">
                    <i className={`fas ${icon} text-[var(--primary-color)] w-4`}></i>
                    {label}
                </span>
            }
            disabled={disabled}
        />
        {helperText && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 ml-6 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                {helperText}
            </p>
        )}
    </div>
);

// Main Component
const AddFilterSetting = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const mode = stateData.mode || 'add';
    const initialData = stateData.filterData || null;

    console.log(initialData ,'initialData');

    const [form, setForm] = useState({
        filterLabel: "",
        filterKey: "",
        order: "",
        isActive: true,
        isUsed: false,
        range: false,
        isHome: false,
        isDirect: false
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info",
        title: ""
    });

    const { data: filterSettings } = useGetAllFilterSettings();

    const filterSettingsList = useMemo(() => {
        return Array.isArray(filterSettings?.data) ? filterSettings?.data : [];
    }, [filterSettings?.data]);

    const isDuplicate = filterSettingsList.some(item =>
        item.filterKey.toLowerCase() === form.filterKey.trim().toLowerCase() &&
        item.id !== initialData?.id
    );

    const createMutation = useCreateFilterSetting();
    const updateMutation = useUpdateFilterSetting();

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                filterLabel: initialData.filterLabel || "",
                filterKey: initialData.filterKey || "",
                order: initialData.displayOrder || "",
                isActive: initialData.isActive ?? true,
                isUsed: initialData.isUsed ?? false,
                range: initialData.isRange ?? false,
                isHome: initialData.isHomeFitler ?? false,
                isDirect: initialData.directUse ?? false
            });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };


   


    const validateForm = useCallback(() => {
        if (!form.filterLabel?.trim()) {
            setSnackbar({
                open: true,
                message: "Filter label is required",
                type: "error",
                title: "Error"
            });
            return false;
        }

        if (!form.filterKey?.trim()) {
            setSnackbar({
                open: true,
                message: "Filter key is required",
                type: "error",
                title: "Error"
            });
            return false;
        }

        if (form.filterKey.includes(' ')) {
            setSnackbar({
                open: true,
                message: "Filter key cannot contain spaces",
                type: "error",
                title: "Error"
            });
            return false;
        }

        if (isDuplicate) {
            setSnackbar({
                open: true,
                message: "Filter key already exists",
                type: "error",
                title: "Error"
            });
            return false;
        }

        if (!form.order) {
            setSnackbar({
                open: true,
                message: "Display order is required",
                type: "error",
                title: "Error"
            });
            return false;
        }

        return true;
    }, [form.filterKey, form.filterLabel, form.order, isDuplicate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            ...form,
            filterKey: form.filterKey.replace(/\s+/g, '')
        };

        console.log(payload, 'payload')

        if (mode === "add") {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: "Filter setting created successfully!",
                        type: "success",
                        title: "Success"
                    });
                    resetForm();
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500);
                },
                onError: (err) => {
                    setSnackbar({
                        open: true,
                        message: err.message || "Failed to create filter setting",
                        type: "error",
                        title: "Error"
                    });
                }
            });
        } else if (mode === "edit" && initialData) {
            updateMutation.mutate({
                id: initialData.id,
                data: payload
            }, {
                onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: "Filter setting updated successfully!",
                        type: "success",
                        title: "Success"
                    });
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500);
                },
                onError: (err) => {
                    setSnackbar({
                        open: true,
                        message: err.message || "Failed to update filter setting",
                        type: "error",
                        title: "Error"
                    });
                }
            });
        }
    };

    const resetForm = () => {
        setForm({
            filterLabel: "",
            filterKey: "",
            order: "",
            isActive: true,
            isUsed: false,
            range: false,
            isHome: false,
            isDirect: false
        });
    };

    const handleCancel = () => {
        if (mode === 'edit') {
            navigate(-1);
        } else {
            resetForm();
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className='mt-2 p-2'>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
                {/* Header Card */}
                <AnimatedCard delay={0}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1 ">
                            <div className="w-6 h-6 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] 
                                rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary-color)]">
                                <i className="fas fa-filter text-white text-sm"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                                    {mode === 'edit' ? 'Edit Filter Setting' : 'Add Filter Setting'}
                                    {mode === 'edit' && (
                                        <span className="bg-[var(--background-secondary)] text-[var(--primary-color)] 
                                            text-xs px-3 py-1 rounded-full ml-2 font-medium">
                                            #{initialData?.id}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] m-0 mt-1">
                                    Configure filter properties and settings
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg hover:bg-[var(--background-secondary)] 
                                text-[var(--text-secondary)] hover:text-[var(--primary-color)] 
                                transition-all duration-300 hover:rotate-90"
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </AnimatedCard>

                {/* General Settings Card */}
                <AnimatedCard delay={0.1}>
                    <SectionHeader icon="fa-cog" title="General Settings" />
                    <div className="space-y-2">
                        <FormField
                            label="Filter Label"
                            icon="fa-tag"
                            name="filterLabel"
                            value={form.filterLabel}
                            onChange={handleChange}
                            placeholder="Enter filter label (e.g., Category, Price)"
                            required
                            disabled={isSubmitting}
                            helperText="Display name shown to users in the filter interface"
                        />

                        <FormField
                            label="Filter Key"
                            icon="fa-key"
                            name="filterKey"
                            value={form.filterKey}
                            onChange={handleChange}
                            placeholder="Enter filter key (e.g., category, price)"
                            required
                            disabled={isSubmitting}
                            helperText="Unique identifier used in API calls. To enable range filter, use 'min' and 'max' in key naming"
                        />

                        <FormField
                            label="Display Order"
                            icon="fa-sort-numeric-down"
                            name="order"
                            value={form.order}
                            onChange={handleChange}
                            placeholder="Enter display order (e.g., 1, 2, 3)"
                            required
                            disabled={isSubmitting}
                            helperText="Controls the position of this filter in the UI"
                        />
                    </div>
                </AnimatedCard>

                {/* Layout & Display Settings Card */}
                <AnimatedCard delay={0.2}>
                    <SectionHeader icon="fa-sliders-h" title="Layout & Display" />
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SwitchField
                                checked={form.isActive}
                                onChange={(val) => handleSwitchChange('isActive', val)}
                                icon="fa-toggle-on"
                                label="Active Status"
                                helperText={form.isActive ? 'Filter is visible to users' : 'Filter is hidden from view'}
                                disabled={isSubmitting}
                            />

                         
                                <SwitchField
                                    checked={form.isUsed}
                                    onChange={(val) => handleSwitchChange('isUsed', val)}
                                    icon="fa-keyboard"
                                    label="Input Field"
                                    helperText={'select while image upload'}
                                    disabled={isSubmitting}
                                />
                            
                                    
                   

                            <SwitchField
                                checked={form.isHome}
                                onChange={(val) => handleSwitchChange('isHome', val)}
                                icon="fa-home"
                                label="Home Page"
                                helperText={form.isHome ? 'Filter displayed on homepage' : 'Filter hidden on homepage'}
                                disabled={isSubmitting}
                            />

                          
                                <SwitchField
                                    checked={form.range}
                                    onChange={(val) => handleSwitchChange('range', val)}
                                    icon="fa-arrows-left-right"
                                    label="Range Type"
                                    helperText={form.range ? 'Filter accepts range values (min ,max and range )' : 'Filter uses single value selection'}
                                    disabled={isSubmitting}
                                />
                            
                            

                           
                     

                          
                                <SwitchField
                                    checked={form.isDirect}
                                    onChange={(val) => handleSwitchChange('isDirect', val)}
                                    icon="fa-bolt"
                                    label="Direct Filter"
                                    helperText={'Directly use the filter key instead of filter Id'}
                                    disabled={isSubmitting}
                                />
                            
                           
                       </div>
                    </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <AnimatedCard delay={0.3}>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-2 py-2 border border-[var(--border-color)] 
                                text-[var(--text-primary)] text-sm font-medium rounded-lg 
                                hover:bg-[var(--background-secondary)] transition-all duration-300 
                                flex items-center justify-center gap-2 group"
                            disabled={isSubmitting}
                        >
                            <i className={`fas ${mode === 'edit' ? 'fa-arrow-left' : 'fa-eraser'} text-sm group-hover:-translate-x-1 transition-transform`}></i>
                            {mode === 'edit' ? 'Back' : 'Clear All'}
                        </button>
                        <button
                            type="submit"
                            className={`
                                flex-1 px-2 py-2 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] 
                                text-white text-sm font-medium rounded-lg
                                flex items-center justify-center gap-2 relative overflow-hidden
                                transition-all duration-300 transform hover:scale-[1.02]
                                ${isSubmitting ? 'opacity-90 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[var(--primary-color)]'}
                            `}
                            disabled={isSubmitting}
                        >
                            <span className="absolute inset-0 bg-white/20 transform -translate-x-full hover:translate-x-0 transition-transform duration-500"></span>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${mode === 'edit' ? 'fa-save' : 'fa-plus'}`}></i>
                                    {mode === 'edit' ? 'Update Filter' : 'Create Filter'}
                                </>
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
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                persistent={false}
            />
        </div>
    );
};

export default AddFilterSetting;