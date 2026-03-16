import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    useCreateFilterSetting,
    useUpdateFilterSetting
} from '../../../hooks/filter/useFilterSetting';
import Snackbar from '../../../components/snackBar/Snackbar';
import { Switch } from '../../../components/ui/Switch';
import 'animate.css';

// Animated Card Component (reused from your code)
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

// Main Component
const AddFilterSetting = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const mode = stateData.mode || 'add';
    const initialData = stateData.data || null;

    const [form, setForm] = useState({
        key: "",
        active: true,
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    const createMutation = useCreateFilterSetting();
    const updateMutation = useUpdateFilterSetting();

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                key: initialData.key || "",
                active: initialData.active ?? true,
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.key.trim()) {
            setSnackbar({
                open: true,
                message: "Filter key is required",
                type: "error",
                title: "Error"
            });
            return;
        }

        const payload = {
            key: form.key.trim(),
            active: form.active,
        };

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
            updateMutation.mutate({ id: initialData.id, formData: payload }, {
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
            key: "",
            active: true,
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
        <div className='mt-4 p-4'>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
                {/* Header Card */}
                <AnimatedCard delay={0}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97316]/30 animate__animated animate__pulse animate__infinite animate__slower">
                                <i className="fas fa-filter text-white text-sm"></i>
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-lg font-bold text-[#7C2D12] flex items-center gap-2">
                                    {mode === 'edit' ? 'Edit Filter Setting' : 'Add Filter Setting'}
                                    {mode === 'edit' && (
                                        <span className="bg-[#FFEDD5] text-[#F97316] text-[8px] px-2 py-1 rounded-full animate__animated animate__fadeIn">
                                            ID: {initialData?.id}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs sm:text-sm text-[#9A3412]">Configure filter settings</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg hover:bg-[#FFF7ED] text-[#9A3412] hover:text-[#F97316] transition-all duration-300 hover:rotate-90"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </AnimatedCard>

                {/* Form Fields */}
                <AnimatedCard delay={0.2}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-[#FED7AA] pb-2">
                            <i className="fas fa-cog text-[#F97316] text-sm"></i>
                            <h3 className="text-sm font-semibold text-[#7C2D12]">Filter Configuration</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Key Field */}
                            <div className="animate__animated animate__fadeInLeft">

                           
                            <div className="flex items-center " style={{ animationDelay: '0.1s' }}>
                                <label className="block text-sm font-semibold text-[#7C2D12]  flex items-center gap-1 min-w-[120px]">
                                    <i className="fas fa-key text-[#F97316]"></i>
                                    Filter Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="key"
                                    value={form.key}
                                    onChange={handleChange}
                                    className="w-full px-2 py-2 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all h-10"
                                    placeholder="Enter filter key (e.g., category, price, brand)"
                                    required
                                    disabled={isSubmitting}
                                />
                               
                            </div>
                            <p className="text-xs text-[#9A3412] mt-1 flex items-center gap-2">
                                <i className="fas fa-info-circle text-[#F97316]"></i>
                                Unique identifier for the filter
                            </p>
                            </div>
                            {/* Active Switch */}
                            <div className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.2s' }}>
                                <Switch
                                    checked={form.active}
                                    onChange={(val) => handleSwitchChange('active', val)}
                                    label={
                                        <span className="flex text-sm items-center gap-2">
                                            <i className="fas fa-power-off text-[#F97316]"></i>
                                            Active Status
                                        </span>
                                    }
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-[#9A3412] mt-1 flex items-center gap-2">
                                    <i className="fas fa-toggle-on text-[#F97316]"></i>
                                    {form.active ? 'Filter is active and visible' : 'Filter is inactive and hidden'}
                                </p>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <AnimatedCard delay={0.3}>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 p-2 sm:p-3 border-2 border-[#FED7AA] text-[#7C2D12] text-sm font-medium rounded-xl hover:bg-[#FFF7ED] hover:border-[#FDBA74] transition-all duration-300 flex items-center justify-center gap-2 group"
                            disabled={isSubmitting}
                        >
                            <i className={`fas ${mode === 'edit' ? 'fa-arrow-left' : 'fa-eraser'} text-sm group-hover:-translate-x-1 transition-transform`}></i>
                            {mode === 'edit' ? 'Back' : 'Clear All'}
                        </button>
                        <button
                            type="submit"
                            className={`
                                flex-1 p-2 sm:p-3  bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-sm font-medium rounded-xl
                                flex items-center justify-center gap-2 relative overflow-hidden
                                transition-all duration-300 transform hover:scale-105
                                ${isSubmitting ? 'opacity-90' : 'hover:shadow-lg hover:shadow-[#F97316]/30'}
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