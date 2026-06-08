import React, { useState, useEffect ,useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    useCreateBannerSetting,
    useUpdateBannerSetting
} from '../../../hooks/banners/bannerSetting/useBannerSettings';
import Snackbar from '../../../components/snackBar/Snackbar';
import ImageKeyInput from '../../../components/ui/Input';
import { Switch } from '../../../components/ui/Switch';
import { parseLayoutString } from '../../../../utils/banner/ParseLayout';
import 'animate.css';
import ComboBox from '../../../components/ui/ComboBox';

import { useGetAllFilterSettings } from '../../../hooks/filter/useFilterSetting';

// Visible Count Input Component with animations
const VisibleCountInput = ({ value, onChange, device, icon, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative animate__animated animate__fadeInUp" style={{ animationDelay: `${device === 'desktop' ? '0.1s' : device === 'tablet' ? '0.2s' : '0.3s'}` }}>
            <label className="block text-[10px] font-semibold text-[#7C2D12] mb-1 flex items-center gap-1">
                <i className={`fas fa-${icon} text-[#F97316] text-sm`}></i>
                {device.charAt(0).toUpperCase() + device.slice(1)}
            </label>
            <div className={`
                relative transition-all duration-300
                ${isFocused ? 'transform scale-105' : ''}
            `}>
                <select
                    value={value}
                    onChange={(e) => onChange(device, Number(e.target.value))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    className={`
                        w-full px-3 py-2.5 text-sm rounded-xl border-2 appearance-none cursor-pointer
                        ${disabled
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-[#FED7AA] text-[#7C2D12] hover:border-[#FDBA74] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20'
                        }
                        transition-all duration-300 outline-none
                    `}
                >
                    {[1, 2, 3, 4, 5, 6 , 8, 10].map(num => (
                        <option key={num} value={num} className="text-sm">
                            {num} {num === 1 ? 'Item' : 'Items'}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${isFocused ? 'rotate-180 text-[#F97316]' : 'text-[#9A3412]'}`}></i>
                </div>
            </div>
            <p className="text-[8px] text-[#9A3412] mt-1 flex items-center gap-1">
                <i className="fas fa-eye text-[#F97316]"></i>
                Visible on {device}
            </p>
        </div>
    );
};

// Scroll Interval Preset Component
const ScrollIntervalPreset = ({ value, onChange, disabled }) => {
    const presets = [
        { value: 1, label: '1s', ms: 1000 },
        { value: 2, label: '2s', ms: 2000 },
        { value: 3, label: '3s', ms: 3000 },
        { value: 4, label: '4s', ms: 4000 },
        { value: 5, label: '5s', ms: 5000 },
    ];

    // Convert ms to seconds for display
    const secondsValue = value ? Math.round(value / 1000) : 3;

    return (
        <div className="space-y-2 animate__animated animate__fadeInUp animate__faster">
            <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                <i className="fas fa-clock text-[#F97316] text-sm"></i>
                Auto Scroll Interval
            </label>
            <div className="grid grid-cols-5 gap-1.5">
                {presets.map((preset, index) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => onChange(preset.ms)}
                        disabled={disabled}
                        className={`
                            relative py-2 px-1 rounded-lg text-[10px] font-medium transition-all duration-300
                            animate__animated animate__fadeIn
                            ${secondsValue === preset.value
                                ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md shadow-[#F97316]/30 scale-105'
                                : disabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#FFF7ED] text-[#7C2D12] hover:bg-[#FFEDD5] hover:scale-105'
                            }
                        `}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <span className="relative z-10">{preset.label}</span>
                        {secondsValue === preset.value && (
                            <span className="absolute inset-0 rounded-lg bg-white/20 animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>
            <p className="text-[8px] text-[#9A3412] flex items-center gap-1">
                <i className="fas fa-info-circle text-[#F97316]"></i>
                Current: {secondsValue} second{secondsValue !== 1 ? 's' : ''} ({value}ms)
            </p>
        </div>
    );
};

// Animated Card Component
const AnimatedCard = ({ children, delay = 0, className = "" }) => (
    <div
        className={`
            animate__animated  animate__faster
            bg-gradient-to-br from-white to-[#FFF7ED]/30
            rounded-xl p-2 border-2 border-[#FED7AA]
            hover:shadow-lg hover:shadow-[#F97316]/5
            transition-all duration-300 z-[0]
            ${className}
        `}
        style={{ animationDelay: `${delay}s` }}
    >
        {children}
    </div>
);

// Main Component
const AddBannerSetting = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const mode = stateData.mode || 'add';
    const initialData = stateData.data || null;

    const [desktopColumnsText, setDesktopColumnsText] = useState("");
    const [mobileColumnsText, setMobileColumnsText] = useState("");
    const [activeTab, setActiveTab] = useState('general'); // general, layout, carousel

    const [form, setForm] = useState({
        imageKey: "",
        title: "",
        description: "",
        filterKey:"",
        gap: true,
        mobileGap: false,
        centered: true,
        full: false,
        backgroundColor: "#ffffff",
        defaultRatio: "",
        mobileRatio: "",
        mobileRowsDesktop: "",
        mobileRowsMobile: "",
        desktopColumns: "auto",
        isVisible: true,
        isGrid: false,
        isCategory :false,
        // Enhanced carousel settings
        autoscroll: false,
        scrollable: false,
        infinite: false,
        dots: false,
        visibleCount: {
            desktop: 3,
            tablet: 2,
            mobile: 2
        },
        scrollInterval: 3000,
        displayOrder: 0,
        desktopLayout: {
            columns: [],
            rows: "",
        },
        mobileLayout: {
            columns: [],
            rows: "",
        },
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    const createMutation = useCreateBannerSetting();
    const updateMutation = useUpdateBannerSetting();

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


    const handleFilterKeySelect = (option) => {

        if(!option){
            setForm(prev => ({
                ...prev,
                filterKey: ''
            }))
        } 
        else{
            setForm(prev => ({
                ...prev,
                filterKey: option.value
            }))
        }

       

    };

    useEffect(() => {
        if (mode === "edit" && initialData) {

            const parsedMobileRows = initialData?.mobileRows
                ? initialData.mobileRows.split(',').map(Number)
                : [];
            
                console.log(parsedMobileRows ,'parsedMobileRows');

            // Parse visibleCount if it exists
            let parsedVisibleCount = { desktop: 3, tablet: 2, mobile: 2 };
            try {
                if (initialData.visibleCount) {
                    parsedVisibleCount = typeof initialData.visibleCount === 'string'
                        ? JSON.parse(initialData.visibleCount)
                        : initialData.visibleCount;
                }
            } catch (e) {
                console.error('Error parsing visibleCount:', e);
            }

            setForm((prev) => ({
                ...prev,
                imageKey: initialData.imageKey || "",
                title: initialData.title || "",
                description: initialData.description || "",
                filterKey: initialData.filterKey || "",
                gap: initialData.gap ?? true,
                mobileGap: initialData.mobileGap ?? false,
                centered: initialData.centered ?? true,
                full: initialData.full ?? false,
                backgroundColor: initialData.backgroundColor || "#ffffff",
                defaultRatio: initialData.desktopRatio || "16/9",
                mobileRatio: initialData.mobileRatio || "4/3",
                isVisible: initialData.isVisible ?? true,
                isGrid: initialData.isGrid ?? false,
                desktopColumns: initialData?.desktopColumns ?? "auto",
                // Enhanced fields
                autoscroll: initialData.autoscroll ?? false,
                scrollable: initialData.scrollable ?? false,
                infinite: initialData.infinite ?? false,
                dots: initialData.dots ?? false,
                visibleCount: parsedVisibleCount,
                scrollInterval: initialData.scrollInterval || 3000,
                displayOrder: initialData.displayOrder || 0,
                desktopLayout: parseLayoutString(initialData.desktopLayout),
                mobileLayout: parseLayoutString(initialData.mobileLayout),
                mobileRowsDesktop: parsedMobileRows[0] || "",
                mobileRowsMobile: parsedMobileRows[1] || "",
                isCategory :initialData.isCategory || false ,
            }));

            setDesktopColumnsText(
                parseLayoutString(initialData.desktopLayout).columns.join(",")
            );

            setMobileColumnsText(
                parseLayoutString(initialData.mobileLayout).columns.join(",")
            );
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };


    console.log(form,'formChanged');
    const handleVisibleCountChange = (device, value) => {
        setForm(prev => ({
            ...prev,
            visibleCount: {
                ...prev.visibleCount,
                [device]: value
            }
        }));
    };

    const handleDesktopColumnsInput = (value) => {
        setDesktopColumnsText(value);
        const columnsArray = value
            .split(",")
            .map((v) => Number(v.trim()))
            .filter((v) => !isNaN(v));

        console.log(columnsArray, value,'desktopLayout');
        setForm((prev) => ({
            ...prev,
            desktopLayout: {
                ...prev.desktopLayout,
                columns: columnsArray,
            },
        }));
    };

    const handleMobileColumnsInput = (value) => {
        setMobileColumnsText(value);
        const columnsArray = value
            .split(",")
            .map((v) => Number(v.trim()))
            .filter((v) => !isNaN(v));
        setForm((prev) => ({
            ...prev,
            mobileLayout: {
                ...prev.mobileLayout,
                columns: columnsArray,
            },
        }));
    };

    const handleLayoutChange = (type, key, value) => {
        setForm((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: value,
            },
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
        if (!form.filterKey) {
            setSnackbar({ open: true, message: "FilterKey is required", type: "error", title: "Error" });
            return;
        }

        // if (!form.title.trim()) {
        //     setSnackbar({ open: true, message: "Title is required", type: "error", title: "Error" });
        //     return;
        // }
    

        // Prepare payload with JSON string for visibleCount
        const payload = {
            imageKey: form.imageKey.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            filterKey: form.filterKey,
            gap: form.gap,
            mobileGap: form.mobileGap,
            centered: form.centered,
            full: form.full,
            backgroundColor: form.backgroundColor,

            defaultRatio: form.defaultRatio,
            desktopRatio : form.defaultRatio,
            mobileRatio: form.mobileRatio,

            mobileRows: String ([Number(form.mobileRowsDesktop), Number(form.mobileRowsMobile)]),
            desktopColumns: form.desktopColumns,
            isVisible: form.isVisible,
            isGrid: form.isGrid,
            isCategory : form.isCategory,

            // // Enhanced fields
            autoscroll: form.autoscroll,
            scrollable: form.scrollable,
            infinite: form.infinite,
            dots: form.dots,
            visibleCount: JSON.stringify(form.visibleCount), // Send as JSON string
            scrollInterval: Number(form.scrollInterval),
            displayOrder: Number(form.displayOrder),
            desktopLayout: form.desktopLayout,
            mobileLayout: form.mobileLayout,
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
                    resetForm();
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

    const resetForm = () => {
        setForm({
            imageKey: "",
            title: "",
            description: "",
            filterKey:"",
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
            isVisible: true,
            isGrid: false,
            // Reset enhanced fields
            autoscroll: false,
            scrollable: false,
            infinite: false,
            dots: false,
            visibleCount: {
                desktop: 3,
                tablet: 2,
                mobile: 2
            },
            scrollInterval: 3000,
            displayOrder: 0,
            desktopLayout: {
                columns: [],
                rows: "",
            },
            mobileLayout: {
                columns: [],
                rows: "",
            },
        });
        setDesktopColumnsText("");
        setMobileColumnsText("");
        setActiveTab('general');
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
      
        <div className='mt-2'>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
                {/* Header Card */}
                <AnimatedCard delay={0}>
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97316]/30 animate__animated animate__pulse animate__infinite animate__slower">
                                <i className="fas fa-image text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-[#7C2D12] flex items-center gap-2">
                                    {mode === 'edit' ? 'Edit Hero Banner' : 'Create Hero Banner'}
                                    {mode === 'edit' && (
                                        <span className="bg-[#FFEDD5] text-[#F97316] text-[8px] px-2 py-1 rounded-full animate__animated animate__fadeIn">
                                            ID: {initialData?.id}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-[10px] text-[#9A3412]">Configure responsive banner settings</p>
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

                {/* Tabs */}
                <div className="flex gap-1 bg-[#FFF7ED]/50 p-1 rounded-xl border-2 border-[#FED7AA] animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
                    {[
                        { id: 'general', label: 'General', icon: 'cog' },
                        { id: 'layout', label: 'Layout', icon: 'grid' },
                        { id: 'carousel', label: 'Carousel', icon: 'sliders-h' }
                    ].map((tab, index) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 py-2 px-3 rounded-lg text-[10px] font-medium transition-all duration-300
                                flex items-center justify-center gap-1.5
                                animate__animated animate__fadeIn
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md'
                                    : 'text-[#7C2D12] hover:bg-[#FFEDD5]'}
                            `}
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            <i className={`fas fa-${tab.icon} text-sm`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content with Animations */}
                <div className="space-y-4">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <AnimatedCard delay={0.2}>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-[#FED7AA] pb-2">
                                    <i className="fas fa-info-circle text-[#F97316] text-sm"></i>
                                    <h3 className="text-sm font-semibold text-[#7C2D12]">Basic Information</h3>
                                </div>

                                <div className="space-y-3">
                                    <ImageKeyInput form={form} setForm={setForm} isSubmitting={isSubmitting} />
                                    {/* ComboBox for Filter Key */}
                                    <div className="flex items-center gap-2">
                                        <label className="min-w-[120px] font-semibold text-sm text-[#7C2D12]">
                                            Filter Key <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex-1">
                                            <ComboBox
                                                value={form.filterKey}
                                                options={filterOptions}
                                                onChange={handleFilterKeySelect}
                                                // disabled={isSubmitting || mode === 'edit'} // Disable in edit mode
                                                placeholder="Select filter key"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="animate__animated animate__fadeInLeft" style={{ animationDelay: '0.3s' }}>
                                            <label className="block text-[10px] font-semibold text-[#7C2D12] mb-1 flex items-center gap-1">
                                                <i className="fas fa-heading text-[#F97316]"></i>
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="title"
                                                value={form.title}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                placeholder="Enter banner title"
                                                // required
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="animate__animated animate__fadeInRight" style={{ animationDelay: '0.35s' }}>
                                            <label className="block text-[10px] font-semibold text-[#7C2D12] mb-1 flex items-center gap-1">
                                                <i className="fas fa-paint-bucket text-[#F97316]"></i>
                                                Background Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    name="backgroundColor"
                                                    value={form.backgroundColor}
                                                    onChange={handleChange}
                                                    className="w-10 h-10 rounded-xl border-2 border-[#FED7AA] cursor-pointer hover:scale-105 transition-transform"
                                                    disabled={isSubmitting}
                                                />
                                                <input
                                                    type="text"
                                                    name="backgroundColor"
                                                    value={form.backgroundColor}
                                                    onChange={handleChange}
                                                    className="flex-1 px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="#ffffff"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="animate__animated animate__fadeInUp" style={{ animationDelay: '0.4s' }}>
                                        <label className="block text-[10px] font-semibold text-[#7C2D12] mb-1 flex items-center gap-1">
                                            <i className="fas fa-align-left text-[#F97316]"></i>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all resize-none"
                                            rows={2}
                                            placeholder="Enter banner description"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                  
                                </div>
                            </div>
                        </AnimatedCard>
                    )}

                    {/* Layout Tab */}
                    {activeTab === 'layout' && (
                        <AnimatedCard delay={0.2}>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-[#FED7AA] pb-2">
                                    <i className="fas fa-grid text-[#F97316] text-sm"></i>
                                    <h3 className="text-sm font-semibold text-[#7C2D12]">Layout Configuration</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Switch
                                        checked={form.gap}
                                        onChange={(val) => handleSwitchChange('gap', val)}
                                        label="Gap between images"
                                    />
                                    <Switch
                                        checked={form.mobileGap}
                                        onChange={(val) => handleSwitchChange('mobileGap', val)}
                                        label="Mobile gap"
                                    />
                                    <Switch
                                        checked={form.centered}
                                        onChange={(val) => handleSwitchChange('centered', val)}
                                        label="Center content"
                                    />
                                    <Switch
                                        checked={form.full}
                                        onChange={(val) => handleSwitchChange('full', val)}
                                        label="Full width"
                                    />
                                    <Switch
                                        checked={form.isVisible}
                                        onChange={(val) => handleSwitchChange('isVisible', val)}
                                        label="Is Visible"
                                    />
                                    <Switch
                                        checked={form.isGrid}
                                        onChange={(val) => handleSwitchChange('isGrid', val)}
                                        label="Is Grid"
                                    />

                                    <Switch
                                        checked={form.isCategory}
                                        onChange={(val) => handleSwitchChange('isCategory', val)}
                                        label="Is Category"
                                    />
                                </div>

                                {!form.isGrid ? (
                                    <div className="space-y-4 mt-4 pt-4 border-t border-[#FED7AA]">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-desktop text-[#F97316]"></i>
                                                    Desktop Ratio
                                                </label>
                                                <input
                                                    name="defaultRatio"
                                                    value={form.defaultRatio}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="16/9"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-mobile-alt text-[#F97316]"></i>
                                                    Mobile Ratio
                                                </label>
                                                <input
                                                    name="mobileRatio"
                                                    value={form.mobileRatio}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="4/3"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-columns text-[#F97316]"></i>
                                                    Desktop Columns
                                                </label>
                                                <select
                                                    name="desktopColumns"
                                                    value={form.desktopColumns}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all appearance-none cursor-pointer"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="auto">Auto</option>
                                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                                        <option key={num} value={num}>{num} Columns</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-rows text-[#F97316]"></i>
                                                    Display Order
                                                </label>
                                                <input
                                                    type="number"
                                                    name="displayOrder"
                                                    value={form.displayOrder}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="0"
                                                    min="0"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-desktop text-[#F97316]"></i>
                                                    Desktop View Rows
                                                </label>
                                                <input
                                                    type="number"
                                                    name="mobileRowsDesktop"
                                                    value={form.mobileRowsDesktop}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="Enter number of rows"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-mobile-alt text-[#F97316]"></i>
                                                    Mobile View Rows
                                                </label>
                                                <input
                                                    type="number"
                                                    name="mobileRowsMobile"
                                                    value={form.mobileRowsMobile}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="Enter number of rows"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 mt-4 pt-4 border-t border-[#FED7AA]">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-desktop text-[#F97316]"></i>
                                                    Desktop Columns (comma separated)
                                                </label>
                                                <input
                                                    placeholder="15,11"
                                                    value={desktopColumnsText}
                                                    onChange={(e) => handleDesktopColumnsInput(e.target.value)}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-rows text-[#F97316]"></i>
                                                    Desktop Rows
                                                </label>
                                                <input
                                                    value={form.desktopLayout.rows}
                                                    onChange={(e) => handleLayoutChange("desktopLayout", "rows", (e.target.value))}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="Enter number of rows"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-mobile-alt text-[#F97316]"></i>
                                                    Mobile Columns (comma separated)
                                                </label>
                                                <input
                                                    placeholder="2, 1, 1"
                                                    value={mobileColumnsText}
                                                    onChange={(e) => handleMobileColumnsInput(e.target.value)}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                                    <i className="fas fa-rows text-[#F97316]"></i>
                                                    Mobile Rows
                                                </label>
                                                <input
                                                    value={form.mobileLayout.rows}
                                                    onChange={(e) => handleLayoutChange("mobileLayout", "rows", e.target.value)}
                                                    className="w-full px-3 py-2.5 text-sm border-2 border-[#FED7AA] rounded-xl bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                                                    placeholder="Enter number of rows"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatedCard>
                    )}

                    {/* Carousel Tab */}
                    {activeTab === 'carousel' && !form.isGrid && (
                        <AnimatedCard delay={0.2}>
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-[#FED7AA] pb-2">
                                    <i className="fas fa-sliders-h text-[#F97316] text-sm"></i>
                                    <h3 className="text-sm font-semibold text-[#7C2D12]">Carousel Settings</h3>
                                    <span className="bg-[#FFEDD5] text-[#F97316] text-[8px] px-2 py-1 rounded-full ml-auto">
                                        {form.autoscroll ? 'Auto-scroll ON' : 'Manual'}
                                    </span>
                                </div>

                                {/* Carousel Controls */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                   
                                    <Switch
                                        checked={form.scrollable}
                                        onChange={(val) => handleSwitchChange('scrollable', val)}
                                        label={
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-arrows-alt-h"></i>
                                                Scrollable
                                            </span>
                                        }
                                    />
                                    <Switch
                                        checked={form.autoscroll}
                                        onChange={(val) => handleSwitchChange('autoscroll', val)}
                                        label={
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-play-circle"></i>
                                                Auto Scroll
                                            </span>
                                        }
                                    />
                                    <Switch
                                        checked={form.infinite}
                                        onChange={(val) => handleSwitchChange('infinite', val)}
                                        label={
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-infinity"></i>
                                                Infinite Loop
                                            </span>
                                        }
                                    />
                                    <Switch
                                        checked={form.dots}
                                        onChange={(val) => handleSwitchChange('dots', val)}
                                        label={
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-ellipsis-h"></i>
                                                Show Dots
                                            </span>
                                        }
                                    />
                                </div>

                                {/* Visible Count per Device */}
                                <div className="space-y-3 pt-2">
                                    <label className="block text-[10px] font-semibold text-[#7C2D12] flex items-center gap-1">
                                        <i className="fas fa-eye text-[#F97316]"></i>
                                        Visible Items Per Device
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <VisibleCountInput
                                            device="desktop"
                                            icon="desktop"
                                            value={form.visibleCount.desktop}
                                            onChange={handleVisibleCountChange}
                                            disabled={isSubmitting}
                                        />
                                        <VisibleCountInput
                                            device="tablet"
                                            icon="tablet-alt"
                                            value={form.visibleCount.tablet}
                                            onChange={handleVisibleCountChange}
                                            disabled={isSubmitting}
                                        />
                                        <VisibleCountInput
                                            device="mobile"
                                            icon="mobile-alt"
                                            value={form.visibleCount.mobile}
                                            onChange={handleVisibleCountChange}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Scroll Interval Presets */}
                                {form.autoscroll && (
                                    <div className="space-y-3 pt-2 animate__animated animate__fadeIn">
                                        <ScrollIntervalPreset
                                            value={form.scrollInterval}
                                            onChange={(ms) => handleSwitchChange('scrollInterval', ms)}
                                            disabled={!form.autoscroll || isSubmitting}
                                        />
                                    </div>
                                )}
                            </div>
                        </AnimatedCard>
                    )}

                    {/* Grid Mode Message for Carousel Tab */}
                    {activeTab === 'carousel' && form.isGrid && (
                        <AnimatedCard delay={0.2}>
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-[#FFEDD5] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fas fa-grid text-[#F97316] text-xl"></i>
                                </div>
                                <h4 className="text-sm font-bold text-[#7C2D12] mb-1">Grid Mode Active</h4>
                                <p className="text-[10px] text-[#9A3412] mb-4">Carousel settings are disabled in grid mode</p>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchChange('isGrid', false)}
                                    className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-sm font-medium hover:bg-[#EA580C] transition-all"
                                >
                                    Switch to Carousel Mode
                                </button>
                            </div>
                        </AnimatedCard>
                    )}
                </div>

                {/* Action Buttons */}
                <AnimatedCard delay={0.3}>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2.5 border-2 border-[#FED7AA] text-[#7C2D12] text-sm font-medium rounded-xl hover:bg-[#FFF7ED] hover:border-[#FDBA74] transition-all duration-300 flex items-center justify-center gap-2 group"
                            disabled={isSubmitting}
                        >
                            <i className={`fas ${mode === 'edit' ? 'fa-arrow-left' : 'fa-eraser'} text-sm group-hover:-translate-x-1 transition-transform`}></i>
                            {mode === 'edit' ? 'Back' : 'Clear All'}
                        </button>
                        <button
                            type="submit"
                            className={`
                                flex-1 px-4 py-2.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-sm font-medium rounded-xl
                                flex items-center justify-center gap-2 relative overflow-hidden
                                transition-all duration-300 transform hover:scale-105 z-
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
                                    {mode === 'edit' ? 'Update Banner' : 'Create Banner'}
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

export default AddBannerSetting;