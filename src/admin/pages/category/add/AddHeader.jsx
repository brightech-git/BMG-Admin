import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUploadMenuItem, useUpdateMenuItem, useMenu } from "../../../hooks/navItems/useHeaderNavItems";
import { useHeaderKeys } from "../../../hooks/navItems/useHeaderNavKey";
import { Switch } from "../../../components/ui/Switch";
import ComboBox from '../../../components/ui/ComboBox';
import { useGetAllFilterContents } from "../../../hooks/filter/useFilterContent";
import { useGetAllFilterSettings } from "../../../hooks/filter/useFilterSetting";
import { useItemNames } from "../../../hooks/itemName/useItemNames";

const INITIAL_FORM = {
    headerKey: "",
    label: "",
    link: "products-page?",
    isCategory: false,
    isActive: true,
    order: "",
    selectedFilterIds: [],
    filterContentId: "",
    selectedItemId: "",
};

const FieldRow = ({ label, required, children, hint }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
);

const AddMenuItemPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    const [filterKeyId, setFilterKeyId] = useState(null);
    const [selectedHeaderData, setSelectedHeaderData] = useState(null);

    console.log(selectedHeaderData,'selectedHeaderData')

    const isEdit = state?.mode === "edit";
    const editingData = state?.rowData ?? null;

    console.log(editingData,'editingData');

    const { data: menuItems = [] } = useMenu();
    const { data: filterContents = [] } = useGetAllFilterContents({ filterKeyId });
    const { items } = useItemNames();

    const filterContentList = useMemo(() =>
        Array.isArray(filterContents?.filters)
            ? filterContents.filters.map(item => ({ value: String(item.id), label: item.filterTitle }))
            : []
    , [filterContents]);

    const itemNameList = useMemo(() =>
        Array.isArray(items)
            ? items.map(item => ({ label: item.ITEMNAME, value: item.ITEMID }))
            : []
    , [items]);

    const { data: filterKeyContents = [] } = useGetAllFilterSettings();

    const filterKeyList = useMemo(() =>
        Array.isArray(filterKeyContents?.data)
            ? filterKeyContents.data.map(item => ({ value: String(item.id), label: item.filterLabel }))
            : []
    , [filterKeyContents]);

    const { data: headerKeys = [] } = useHeaderKeys({ isActive: true, isDropdown: true });

    const headerFilterOptions = useMemo(() =>
        headerKeys.map(key => ({
            value: String(key.id),
            label: key.name,
            filterKeyId: key.filterId,
            isDropdown: key.isDropdown === "Y",
            filterLabel: key.filterLabel,
        }))
    , [headerKeys]);



    const isCategoryDisabled = selectedHeaderData?.isDropdown && !selectedHeaderData?.filterKeyId;

    const uploadMutation = useUploadMenuItem();
    const updateMutation = useUpdateMenuItem();

    const isSubmitting =
        uploadMutation.isPending || uploadMutation.isLoading ||
        updateMutation.isPending || updateMutation.isLoading;

    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const set = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));
    const handleChange = (field) => (e) =>
        set(field)(e.target.type === "checkbox" ? e.target.checked : e.target.value);

    useEffect(() => {
        if (!editingData) return;
        setForm({
            headerKey: String(editingData?.menu_key_id ?? ""),
            label: editingData?.label ?? "",
            link: editingData?.link ?? "",
            isCategory: editingData?.category === "Y" || editingData?.category === true,
            isActive: editingData?.active === "Y" || editingData?.active === true,
            order: editingData?.displayorder ?? "",
            selectedFilterIds: (() => {
                const ids = editingData?.filterids;
                if (!ids) return [];
                if (Array.isArray(ids)) return ids.map(Number);
                if (typeof ids === "string") return ids.split(",").map(id => Number(id.trim()));
                return [];
            })(),
            filterContentId: String(editingData?.filterContentID ?? ""),
            selectedItemId: editingData.itemId
        });

        if (editingData?.menu_key_id) {
            const selectedKey = headerFilterOptions.find(k => k.value === String(editingData.menu_key_id));
            if (selectedKey) {
                setSelectedHeaderData(selectedKey);
                setFilterKeyId(selectedKey.filterKeyId);
            }
        }
    }, [editingData, headerFilterOptions]);

    // Derived show conditions
    const shouldShowFilterKeysSelector = selectedHeaderData?.isDropdown && form.isCategory;
    const shouldShowFilterContentSelector =
        selectedHeaderData?.isDropdown && !form.isCategory && selectedHeaderData?.filterKeyId;
    const showItemSelector = !!selectedHeaderData;

    console.log(shouldShowFilterKeysSelector, shouldShowFilterContentSelector,'shouldShowFilterKeysSelector')
    // Auto-generate link from selections
    useEffect(() => {
        const params = [];

        // if (shouldShowFilterKeysSelector && form.selectedFilterIds.length > 0) {
        //     params.push(`filterid=${form.selectedFilterIds.join(",")}`);
        // } else
        if (shouldShowFilterContentSelector && form.filterContentId) {
            const id =
                typeof form.filterContentId === "object"
                    ? form.filterContentId.value
                    : form.filterContentId;

            params.push(`filterIds=${id}`);
        }

        if (form.selectedItemId) {
            params.push(`itemId=${form.selectedItemId}`);
        }

        setForm(prev => ({
            ...prev,
            link: `products-page?${params.join("&")}`
        }));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        form.selectedFilterIds,
        form.filterContentId,
        form.selectedItemId,
        shouldShowFilterKeysSelector,
        shouldShowFilterContentSelector,
    ]);


    const selectedFilterIdOptions = useMemo(() =>
        filterKeyList.filter(opt => form.selectedFilterIds?.includes(opt?.value))
    , [form.selectedFilterIds, filterKeyList]);

    const selectedItemOption = useMemo(() =>
        itemNameList.find(opt => String(opt.value) === String(form.selectedItemId)) || null
    , [form.selectedItemId, itemNameList]);

    const handleHeaderKeySelect = (selectedValue) => {
        if (!selectedValue) {
            setForm(prev => ({ ...prev, headerKey: "", selectedFilterIds: [], filterContentId: "", selectedItemId: "", link: "products-page?" }));
            setFilterKeyId(null);
            setSelectedHeaderData(null);
        } else {
            const selectedKey = headerFilterOptions.find(k => Number(k.value) === Number(selectedValue.value));
            setSelectedHeaderData(selectedKey);
            setForm(prev => ({ ...prev, headerKey: selectedValue.value, selectedFilterIds: [], filterContentId: "", selectedItemId: "", link: "products-page?" }));
            setFilterKeyId(selectedKey?.filterKeyId);
        }
    };

    const handleFilterKeysChange = (selectedOptions) => {
        setForm(prev => ({ ...prev, selectedFilterIds: selectedOptions?.map(opt => opt.value) || [] }));
    };

    const handleFilterContentChange = (selectedValue) => {
        setForm(prev => ({ ...prev, filterContentId: selectedValue || "" }));
    };

    const handleItemChange = (selectedValue) => {
        setForm(prev => ({ ...prev, selectedItemId: selectedValue?.value || "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.headerKey) return setError("Header Key is required.");
        if (!form.label.trim()) return setError("Label is required.");
        if (form.order === "") return setError("Display Order is required.");

        const payload = {
            headerKey: Number(form.headerKey),
            label: form.label,
            link: form.link,
            isCategory: form.isCategory,
            isActive: form.isActive,
            order: Number(form.order),
            filterId: selectedHeaderData?.filterKeyId,
            isItem: !!form.selectedItemId,
        };



        if (shouldShowFilterKeysSelector) {
            payload.filterIds = form.selectedFilterIds.map(id => Number(id));
        }
        if (shouldShowFilterContentSelector && form.filterContentId) {
            payload.filterContentId = Number(
                typeof form.filterContentId === "object" ? form.filterContentId.value : form.filterContentId
            );
        }
        if (form.selectedItemId) {
            payload.itemId = form.selectedItemId;
        }

        console.log(payload,'payload')
        const mutation = isEdit ? updateMutation : uploadMutation;
        const args = isEdit ? { id: editingData?.id, payload } : payload;

        mutation.mutate(args, {
            onSuccess: () => {
                setSuccess(isEdit ? "Menu item updated." : "Menu item created.");
                setTimeout(() => navigate("/admin/header/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || (isEdit ? "Update failed." : "Create failed."));
            },
        });
    };

    const handleClear = () => {
        setForm(INITIAL_FORM);
        setSelectedHeaderData(null);
        setFilterKeyId(null);
        setError("");
        setSuccess("");
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 px-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                {/* Page header */}
                <div className="flex items-center  justify-between p-2 bg-[var(--primary-color)]">
                    <div>
                        <h2 className="text-sm font-semibold text-white tracking-wide">
                            {isEdit ? "Edit Header Menu Item" : "Add Header Menu Item"}
                        </h2>
                        <p className="text-[11px] text-white/70 mt-0.5">
                            {isEdit ? "Update the details below" : "Fill in the details to create a new menu item"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-xs px-3 py-1.5 border border-white/40 rounded-md text-white hover:bg-white/10 transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mx-6 mt-4 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-6 mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-3 py-2 space-y-2">

                    {/* Section: Basic Info */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-1">
                            Basic Information
                        </p>

                        <FieldRow label="Header Key" required>
                            <ComboBox
                                value={form.headerKey}
                                options={headerFilterOptions}
                                onChange={handleHeaderKeySelect}
                                placeholder="Select a header key"
                            />
                        </FieldRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldRow label="Label" required>
                                <input
                                    value={form.label}
                                    onChange={handleChange("label")}
                                    placeholder="e.g. About Us"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition"
                                />
                            </FieldRow>

                            <FieldRow label="Display Order" required>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={handleChange("order")}
                                    placeholder="e.g. 1"
                                    min="1"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition"
                                />
                            </FieldRow>
                        </div>

                        {selectedHeaderData && (
                            <FieldRow label="Link" hint="Auto-filled based on your selections below — you can edit it manually.">
                                <input
                                    value={form.link}
                                    onChange={handleChange("link")}
                                    placeholder="products-page?..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition bg-gray-50"
                                />
                            </FieldRow>
                        )}
                    </div>

                    {/* Section: Filter / Item Selectors */}
                    {selectedHeaderData && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-1">
                                Content Selection
                            </p>

                            {shouldShowFilterKeysSelector && (
                                <FieldRow
                                    label="Filter Keys"
                                    hint="Select one or more filter keys for this category."
                                >
                                    <ComboBox
                                        value={selectedFilterIdOptions}
                                        options={filterKeyList}
                                        onChange={handleFilterKeysChange}
                                        placeholder="Select filter keys"
                                        multiple={true}
                                    />
                                </FieldRow>
                            )}
                            {showItemSelector && (
                                <FieldRow label="Select Item" hint="Choose a single item to link to.">
                                    <ComboBox
                                        value={selectedItemOption}
                                        options={itemNameList}
                                        onChange={handleItemChange}
                                        placeholder="Search and select an item"
                                    />
                                </FieldRow>
                            )}

                            {shouldShowFilterContentSelector && (
                                <FieldRow label={selectedHeaderData?.filterLabel || "Filter Option"}>
                                    <ComboBox
                                        value={form.filterContentId}
                                        options={filterContentList}
                                        onChange={handleFilterContentChange}
                                        placeholder="Select filter option"
                                        loading={!!filterKeyId && filterContentList.length === 0}
                                        loadingText="Loading options..."
                                    />
                                </FieldRow>
                            )}

                           
                        </div>
                    )}

                    {/* Section: Settings */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-1">
                            Settings
                        </p>

                        <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                            <Switch
                                checked={form.isActive}
                                onChange={set("isActive")}
                                label="Active"
                            />

                            {isCategoryDisabled && (
                                <Switch
                                    checked={form.isCategory}
                                    onChange={(checked) => {
                                        setForm(prev => ({
                                            ...prev,
                                            isCategory: checked,
                                            selectedFilterIds: [],
                                            // filterContentId: "",
                                            // selectedItemId: "",
                                        }));
                                    }}
                                    label="Is Category"
                                />
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="text-xs px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium shadow-sm"
                        >
                            {isSubmitting
                                ? (isEdit ? "Updating..." : "Creating...")
                                : (isEdit ? "Update Item" : "Create Item")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMenuItemPage;
