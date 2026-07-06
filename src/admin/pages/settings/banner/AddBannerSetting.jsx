import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
    ArrowLeft,
    Check,
    Eye,
    Grid3X3,
    Image,
    Images,
    Layers3,
    LayoutTemplate,
    Monitor,
    RotateCcw,
    Save,
    Settings2,
    Smartphone,
    Tablet,
} from "lucide-react";
import {
    useCreateBannerSetting,
    useUpdateBannerSetting,
} from "../../../hooks/banners/bannerSetting/useBannerSettings";
import { useGetAllFilterSettings } from "../../../hooks/filter/useFilterSetting";
import Snackbar from "../../../components/snackBar/Snackbar";
import ComboBox from "../../../components/ui/ComboBox";
import { Switch } from "../../../components/ui/Switch";
import { parseLayoutString } from "../../../../utils/banner/ParseLayout";

const BANNER_TYPES = [
    {
        id: "normal",
        label: "Normal Banner",
        icon: Image,
        description: "Single-row banner section without carousel controls.",
    },
    {
        id: "carousel",
        label: "Carousel",
        icon: Images,
        description: "Scrollable banner strip with optional auto play.",
    },
    {
        id: "grid",
        label: "Grid",
        icon: Grid3X3,
        description: "Structured desktop and mobile layouts.",
    },
    {
        id: "category",
        label: "Category Banner",
        icon: Layers3,
        description: "Banner collection connected with a filter key.",
    },
];

const INITIAL_FORM = {
    bannerType: "",
    imageKey: "",
    title: "",
    description: "",
    filterKey: "",
    backgroundColor: "#ffffff",
    defaultRatio: "16/9",
    mobileRatio: "4/3",
    gap: true,
    mobileGap: false,
    centered: true,
    full: false,
    isVisible: true,
    displayOrder: 0,
    desktopLayout: { columns: [], rows: "" },
    mobileLayout: { columns: [], rows: "" },
    autoscroll: false,
    scrollable: true,
    infinite: false,
    dots: false,
    visibleCount: {
        desktop: 3,
        tablet: 2,
        mobile: 1,
    },
    scrollInterval: 3000,
};

const FieldRow = ({ label, required, children, hint }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
);

FieldRow.propTypes = {
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    children: PropTypes.node.isRequired,
    hint: PropTypes.string,
};

const Section = ({ icon: Icon, title, children }) => (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--active-bg)] text-[var(--primary-color)]">
                <Icon size={16} />
            </span>
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        {children}
    </section>
);

Section.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

const DeviceCountInput = ({ icon: Icon, label, value, onChange, disabled }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
            <Icon size={13} />
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15 disabled:opacity-60"
        >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                <option key={count} value={count}>
                    {count} {count === 1 ? "item" : "items"}
                </option>
            ))}
        </select>
    </div>
);

DeviceCountInput.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

const parseVisibleCount = (value) => {
    if (!value) return INITIAL_FORM.visibleCount;
    try {
        let parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        return {
            desktop: Number(parsed.desktop ?? 3),
            tablet: Number(parsed.tablet ?? 2),
            mobile: Number(parsed.mobile ?? 1),
        };
    } catch {
        return INITIAL_FORM.visibleCount;
    }
};

const columnsToText = (columns) => Array.isArray(columns) ? columns.join(",") : "";

const textToColumns = (value) =>
    value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !Number.isNaN(item) && item > 0);

const getTypeFromData = (data) => {
    if (data?.isCategory) return "category";
    if (data?.isGrid) return "grid";
    if (data?.scrollable || data?.autoscroll || data?.dots || data?.infinite) return "carousel";
    return "normal";
};

const AddBannerSetting = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const mode = stateData.mode || "add";
    const initialData = stateData.data || null;

    const [form, setForm] = useState(INITIAL_FORM);
    const [activeTab, setActiveTab] = useState("type");
    const [desktopColumnsText, setDesktopColumnsText] = useState("");
    const [mobileColumnsText, setMobileColumnsText] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info", title: "" });

    const createMutation = useCreateBannerSetting();
    const updateMutation = useUpdateBannerSetting();
    const { data: filterSettings } = useGetAllFilterSettings();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isGridType = form.bannerType === "grid" || form.bannerType === "category";
    const isCarouselType = form.bannerType === "carousel";
    const usesVisibleItems = form.bannerType === "normal" || form.bannerType === "carousel";
    const needsFilterKey = form.bannerType === "category";
    const canUseDetailTabs = !!form.bannerType;

    const filterOptions = useMemo(() => {
        const list = Array.isArray(filterSettings?.data) ? filterSettings.data : [];
        return list.map((item) => ({
            label: item.filterKey || item.filterLabel || `Key ${item.id}`,
            value: item.id,
        }));
    }, [filterSettings?.data]);

    const selectedFilterOption = useMemo(() =>
        filterOptions.find((item) => String(item.value) === String(form.filterKey)) || null
    , [filterOptions, form.filterKey]);

    useEffect(() => {
        if (mode !== "edit" || !initialData) return;

        const desktopLayout = parseLayoutString(initialData.desktopLayout);
        const mobileLayout = parseLayoutString(initialData.mobileLayout);
        const bannerType = getTypeFromData(initialData);

        setForm({
            ...INITIAL_FORM,
            bannerType,
            imageKey: initialData.imageKey || "",
            title: initialData.title || "",
            description: initialData.description || "",
            filterKey: initialData.filterKey || "",
            backgroundColor: initialData.backgroundColor || "#ffffff",
            defaultRatio: initialData.desktopRatio || initialData.defaultRatio || "16/9",
            mobileRatio: initialData.mobileRatio || "4/3",
            gap: initialData.gap ?? true,
            mobileGap: initialData.mobileGap ?? false,
            centered: initialData.centered ?? true,
            full: initialData.full ?? false,
            isVisible: initialData.isVisible ?? true,
            displayOrder: initialData.displayOrder || 0,
            desktopLayout,
            mobileLayout,
            autoscroll: initialData.autoscroll ?? false,
            scrollable: initialData.scrollable ?? bannerType === "carousel",
            infinite: initialData.infinite ?? false,
            dots: initialData.dots ?? false,
            visibleCount: parseVisibleCount(initialData.visibleCount),
            scrollInterval: initialData.scrollInterval || 3000,
        });
        setDesktopColumnsText(columnsToText(desktopLayout.columns));
        setMobileColumnsText(columnsToText(mobileLayout.columns));
        setActiveTab("general");
    }, [mode, initialData]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleTypeSelect = (bannerType) => {
        setForm((prev) => ({
            ...prev,
            bannerType,
            filterKey: bannerType === "category" ? prev.filterKey : "",
            scrollable: bannerType === "carousel" ? true : false,
            autoscroll: bannerType === "carousel" ? prev.autoscroll : false,
            infinite: bannerType === "carousel" ? prev.infinite : false,
            dots: bannerType === "carousel" ? prev.dots : false,
            desktopLayout: bannerType === "grid" || bannerType === "category" ? prev.desktopLayout : INITIAL_FORM.desktopLayout,
            mobileLayout: bannerType === "grid" || bannerType === "category" ? prev.mobileLayout : INITIAL_FORM.mobileLayout,
        }));
        setActiveTab("general");
    };

    const handleVisibleCountChange = (device, value) => {
        setForm((prev) => ({
            ...prev,
            visibleCount: {
                ...prev.visibleCount,
                [device]: value,
            },
        }));
    };

    const handleColumnsTextChange = (device, value) => {
        const columns = textToColumns(value);
        if (device === "desktop") {
            setDesktopColumnsText(value);
            setForm((prev) => ({ ...prev, desktopLayout: { ...prev.desktopLayout, columns } }));
        } else {
            setMobileColumnsText(value);
            setForm((prev) => ({ ...prev, mobileLayout: { ...prev.mobileLayout, columns } }));
        }
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setDesktopColumnsText("");
        setMobileColumnsText("");
        setActiveTab("type");
    };

    const showError = (message) => {
        setSnackbar({ open: true, message, type: "error", title: "Error" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.bannerType) return showError("Please choose a banner type.");
        if (!form.imageKey.trim()) return showError("Image key is required.");
        if (needsFilterKey && !form.filterKey) return showError("Filter key is required for category banner.");
        if (isGridType && form.desktopLayout.columns.length === 0) return showError("Desktop layout columns are required for grid banners.");
        if (isGridType && form.mobileLayout.columns.length === 0) return showError("Mobile layout columns are required for grid banners.");

        const payload = {
            imageKey: form.imageKey.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            filterKey: needsFilterKey ? form.filterKey : "",
            gap: form.gap,
            mobileGap: form.mobileGap,
            centered: form.centered,
            full: form.full,
            backgroundColor: form.backgroundColor,
            defaultRatio: form.defaultRatio,
            desktopRatio: form.defaultRatio,
            mobileRatio: form.mobileRatio,
            mobileRows: "",
            desktopColumns: "auto",
            isVisible: form.isVisible,
            isGrid: isGridType,
            isCategory: form.bannerType === "category",
            autoscroll: isCarouselType ? form.autoscroll : false,
            scrollable: isCarouselType ? form.scrollable : false,
            infinite: isCarouselType ? form.infinite : false,
            dots: isCarouselType ? form.dots : false,
            visibleCount: JSON.stringify(form.visibleCount),
            scrollInterval: Number(form.scrollInterval),
            displayOrder: Number(form.displayOrder),
            desktopLayout: isGridType ? form.desktopLayout : INITIAL_FORM.desktopLayout,
            mobileLayout: isGridType ? form.mobileLayout : INITIAL_FORM.mobileLayout,
        };

        const mutation = mode === "edit" ? updateMutation : createMutation;
        const mutationPayload = mode === "edit" && initialData
            ? { id: initialData.id, formData: payload }
            : payload;

        mutation.mutate(mutationPayload, {
            onSuccess: () => {
                setSnackbar({
                    open: true,
                    message: mode === "edit" ? "Banner updated successfully." : "Banner created successfully.",
                    type: "success",
                    title: "Success",
                });
                if (mode === "add") resetForm();
                setTimeout(() => navigate(-1), 900);
            },
            onError: (err) => {
                showError(err?.message || "Failed to save banner setting.");
            },
        });
    };

    const tabs = [
        { id: "type", label: "Type", icon: LayoutTemplate, disabled: false },
        { id: "general", label: "General", icon: Settings2, disabled: !canUseDetailTabs },
        { id: "layout", label: "Layout", icon: Grid3X3, disabled: !canUseDetailTabs },
        { id: "carousel", label: "Carousel", icon: Images, disabled: !isCarouselType },
    ];

    return (
        <div className="mx-auto mt-4 max-w-5xl px-3">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between bg-[var(--primary-color)] px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                {mode === "edit" ? "Edit Banner Setting" : "Add Banner Setting"}
                            </h2>
                            <p className="mt-0.5 text-[11px] text-white/75">
                                Choose the banner type first, then configure only the settings it needs.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/35 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                        >
                            <ArrowLeft size={14} />
                            Back
                        </button>
                    </div>

                    <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        disabled={tab.disabled}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                            isActive
                                                ? "border-[var(--primary-color)] bg-white text-[var(--primary-color)] shadow-sm"
                                                : "border-gray-200 bg-white text-gray-500 hover:text-gray-700"
                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {activeTab === "type" && (
                    <Section icon={LayoutTemplate} title="Choose Banner Type">
                        <div className="grid gap-3 md:grid-cols-4">
                            {BANNER_TYPES.map((type) => {
                                const Icon = type.icon;
                                const selected = form.bannerType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleTypeSelect(type.id)}
                                        className={`min-h-32 rounded-xl border p-3 text-left transition ${
                                            selected
                                                ? "border-[var(--primary-color)] bg-[var(--active-bg)] shadow-sm"
                                                : "border-gray-200 bg-white hover:border-[var(--primary-color)]/40 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                                                selected ? "bg-[var(--primary-color)] text-white" : "bg-gray-100 text-gray-500"
                                            }`}>
                                                <Icon size={17} />
                                            </span>
                                            {selected && <Check size={16} className="text-[var(--primary-color)]" />}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700">{type.label}</p>
                                        <p className="mt-1 text-[11px] leading-4 text-gray-400">{type.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {activeTab === "general" && canUseDetailTabs && (
                    <Section icon={Settings2} title="General Settings">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FieldRow label="Image Key" required>
                                <input
                                    value={form.imageKey}
                                    onChange={(e) => updateField("imageKey", e.target.value)}
                                    placeholder="e.g. home-main-banner"
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                />
                            </FieldRow>

                            <FieldRow label="Display Order" required>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.displayOrder}
                                    onChange={(e) => updateField("displayOrder", e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                />
                            </FieldRow>

                            <FieldRow label="Title" hint="Optional">
                                <input
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="Optional banner title"
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                />
                            </FieldRow>

                            <FieldRow label="Background">
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={form.backgroundColor}
                                        onChange={(e) => updateField("backgroundColor", e.target.value)}
                                        disabled={isSubmitting}
                                        className="h-9 w-12 rounded-lg border border-gray-200 bg-white p-1"
                                    />
                                    <input
                                        value={form.backgroundColor}
                                        onChange={(e) => updateField("backgroundColor", e.target.value)}
                                        disabled={isSubmitting}
                                        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </div>
                            </FieldRow>

                            <div className="md:col-span-2">
                                <FieldRow label="Description" hint="Optional">
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                        placeholder="Optional banner description"
                                        rows={3}
                                        disabled={isSubmitting}
                                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </FieldRow>
                            </div>

                            {needsFilterKey && (
                                <div className="md:col-span-2">
                                    <FieldRow label="Filter Key" required>
                                        <ComboBox
                                            options={filterOptions}
                                            value={selectedFilterOption}
                                            onChange={(option) => updateField("filterKey", option?.value || "")}
                                            placeholder="Select filter key"
                                            disabled={isSubmitting}
                                        />
                                    </FieldRow>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.isVisible} onChange={(val) => updateField("isVisible", val)} label="Visible" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.gap} onChange={(val) => updateField("gap", val)} label="Gap" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.centered} onChange={(val) => updateField("centered", val)} label="Centered" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.full} onChange={(val) => updateField("full", val)} label="Full Width" />
                            </div>
                        </div>
                    </Section>
                )}

                {activeTab === "layout" && canUseDetailTabs && (
                    <Section icon={Grid3X3} title={isGridType ? "Grid Layout" : "Display Layout"}>
                        {isGridType ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <FieldRow label="Desktop Columns" required hint="Comma separated, for example: 2,1,1">
                                    <input
                                        value={desktopColumnsText}
                                        onChange={(e) => handleColumnsTextChange("desktop", e.target.value)}
                                        placeholder="2,1,1"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </FieldRow>

                                <FieldRow label="Mobile Columns" required hint="Comma separated, for example: 1,1">
                                    <input
                                        value={mobileColumnsText}
                                        onChange={(e) => handleColumnsTextChange("mobile", e.target.value)}
                                        placeholder="1,1"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </FieldRow>

                                <FieldRow label="Desktop Ratio">
                                    <input
                                        value={form.defaultRatio}
                                        onChange={(e) => updateField("defaultRatio", e.target.value)}
                                        placeholder="16/9"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </FieldRow>

                                <FieldRow label="Mobile Ratio">
                                    <input
                                        value={form.mobileRatio}
                                        onChange={(e) => updateField("mobileRatio", e.target.value)}
                                        placeholder="4/3"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    />
                                </FieldRow>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FieldRow label="Desktop Ratio">
                                        <input
                                            value={form.defaultRatio}
                                            onChange={(e) => updateField("defaultRatio", e.target.value)}
                                            placeholder="16/9"
                                            disabled={isSubmitting}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                        />
                                    </FieldRow>

                                    <FieldRow label="Mobile Ratio">
                                        <input
                                            value={form.mobileRatio}
                                            onChange={(e) => updateField("mobileRatio", e.target.value)}
                                            placeholder="4/3"
                                            disabled={isSubmitting}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                        />
                                    </FieldRow>
                                </div>

                                {usesVisibleItems && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                            <Eye size={14} />
                                            Visible Items Per Device
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <DeviceCountInput
                                                icon={Monitor}
                                                label="Desktop"
                                                value={form.visibleCount.desktop}
                                                onChange={(value) => handleVisibleCountChange("desktop", value)}
                                                disabled={isSubmitting}
                                            />
                                            <DeviceCountInput
                                                icon={Tablet}
                                                label="Tablet"
                                                value={form.visibleCount.tablet}
                                                onChange={(value) => handleVisibleCountChange("tablet", value)}
                                                disabled={isSubmitting}
                                            />
                                            <DeviceCountInput
                                                icon={Smartphone}
                                                label="Mobile"
                                                value={form.visibleCount.mobile}
                                                onChange={(value) => handleVisibleCountChange("mobile", value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                )}

                {activeTab === "carousel" && isCarouselType && (
                    <Section icon={Images} title="Carousel Settings">
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.scrollable} onChange={(val) => updateField("scrollable", val)} label="Scrollable" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.autoscroll} onChange={(val) => updateField("autoscroll", val)} label="Auto Scroll" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.infinite} onChange={(val) => updateField("infinite", val)} label="Infinite" />
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                                <Switch checked={form.dots} onChange={(val) => updateField("dots", val)} label="Dots" />
                            </div>
                        </div>

                        {form.autoscroll && (
                            <div className="mt-4">
                                <FieldRow label="Auto Scroll Interval">
                                    <select
                                        value={form.scrollInterval}
                                        onChange={(e) => updateField("scrollInterval", Number(e.target.value))}
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                                    >
                                        {[1000, 2000, 3000, 4000, 5000].map((ms) => (
                                            <option key={ms} value={ms}>{ms / 1000}s</option>
                                        ))}
                                    </select>
                                </FieldRow>
                            </div>
                        )}
                    </Section>
                )}

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={mode === "edit" ? () => navigate(-1) : resetForm}
                            disabled={isSubmitting}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RotateCcw size={14} />
                            {mode === "edit" ? "Back" : "Clear"}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-color)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                        >
                            <Save size={14} />
                            {isSubmitting
                                ? (mode === "edit" ? "Updating..." : "Creating...")
                                : (mode === "edit" ? "Update Banner" : "Create Banner")}
                        </button>
                    </div>
                </div>
            </form>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                title={snackbar.title}
                duration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                persistent={false}
            />
        </div>
    );
};

export default AddBannerSetting;
