import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUploadMenuItem, useUpdateMenuItem, useMenu } from "../../../hooks/navItems/useHeaderNavItems";
import { useHeaderKeys } from "../../../hooks/navItems/useHeaderNavKey";
import { Switch } from "../../../components/ui/Switch";
import ComboBox from '../../../components/ui/ComboBox';
import { useGetAllFilterContents } from "../../../hooks/filter/useFilterContent";
import { useGetAllFilterSettings } from "../../../hooks/filter/useFilterSetting";

const INITIAL_FORM = {
    headerKey: "",
    label: "",
    key: "",
    value: "",
    isCategory: false,
    isActive: true,
    order: "",
    selectedFilterIds: [], // For multiple filter keys when category is true
    filterContentId: "", // For single filter content when category is false
};

const AddMenuItemPage = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    /*--------------------- LOCAL STATE --------------------*/

    const [filterKeyId, setFilterKeyId] = useState(null);
    const [selectedHeaderData, setSelectedHeaderData] = useState(null);



    const isEdit = state?.mode === "edit";
    const editingData = state?.rowData ?? null;


    console.log(editingData,'editingData');

    const { data: menuItems = [] } = useMenu();

    // Fetch filter contents only when needed (for category false case)
    const { data: filterContents = [] } = useGetAllFilterContents(
        { filterKeyId: filterKeyId },
    );

    const filterContentList = useMemo(() => {
        return Array.isArray(filterContents?.filters)
            ? filterContents?.filters?.map(item => ({
                value: String(item.id),
                label: item.filterTitle,
            }))
            : [];
    }, [filterContents]);

    const { data: filterKeyContents = [] } = useGetAllFilterSettings();

    const filterKeyList =useMemo(()=>{
        return Array.isArray(filterKeyContents?.data) ? filterKeyContents?.data.map(item=>({
                value:String(item.id),
                label:item.filterLabel
            })) : []
    },[filterKeyContents]);

    const { data: headerKeys = [] } = useHeaderKeys(
        { isActive: true , isDropdown : true }
    );
    console.log(headerKeys, 'headerKeys');

    const headerFilterOptions = useMemo(() => {
        return headerKeys.map((key) => ({
            value: String(key.id),
            label: key.name,
            filterKeyId: key.FILTERID,
            isDropdown: key.ISDROPDOWN === "Y",
            linkKey: key.LINK_KEY,
            linkValue: key.LINK_VALUE,
            filterLabel: key.filter_label
        }));
    }, [headerKeys]);
    console.log(selectedHeaderData,'selectedHeaderData');
    
    const isCategoryDisabled = (selectedHeaderData?.isDropdown && !selectedHeaderData?.filterKeyId) ;
   

    // Get list of filter keys for selection when category is true
    const filterKeyOptions = useMemo(() => {
        return headerKeys
            .filter(key => key.FILTERID) // Only keys that have FILTERID
            .map((key) => ({
                value: String(key.FILTERID),
                label: key.filter_label || key.name,
            }));
    }, [headerKeys]);

    // derived flags from API shape
    const isCategoryDone = menuItems.some((item) =>
        item.CATEGORY === "Y" && !(item.id === editingData?.id)
    );

    const existingKeys = menuItems
        .map((item) => item.MENU_KEY?.toLowerCase())
        .filter(Boolean);

    const uploadMutation = useUploadMenuItem();
    const updateMutation = useUpdateMenuItem();

    const isSubmitting =
        uploadMutation.isPending ||
        uploadMutation.isLoading ||
        updateMutation.isPending ||
        updateMutation.isLoading;

    // ── single form state ──────────────────────────────────────
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const set = (field) => (val) =>
        setForm((prev) => ({ ...prev, [field]: val }));

    const handleChange = (field) => (e) =>
        set(field)(e.target.type === "checkbox" ? e.target.checked : e.target.value);

           console.log(form, 'formvalues');

    useEffect(() => {
        if (editingData) {
            setForm({
                headerKey: String(editingData?.menu_key_id) ?? "",
                label: editingData?.label ?? "",
                key: editingData?.menu_key ?? "",
                value: editingData?.value ?? "",
                isCategory: editingData?.category === "Y" || editingData?.category === true,
                isActive: editingData?.active === "Y" || editingData?.active === true,
                order: editingData?.displayorder ?? "",
                selectedFilterIds: (() => {
                    const ids = editingData?.filterids;

                    if (!ids) return [];

                    if (Array.isArray(ids)) return ids.map(Number);

                    if (typeof ids === "string") {
                        return ids.split(",").map(id => Number(id.trim()));
                    }

                    return [];
                })(),
                filterContentId: String(editingData?.filterContentID) ?? "",
            });
    
            

            // Set selected header data for edit mode
            if (editingData?.menu_key_id) {
                const selectedKey = headerFilterOptions.find(
                    k => k.value === String(editingData.menu_key_id)
                );
                if (selectedKey) {
                    setSelectedHeaderData(selectedKey);
                    setFilterKeyId(selectedKey.filterKeyId);
                }
            }
        }
    }, [editingData, headerFilterOptions]);

    const handleHeaderKeySelect = (selectedValue) => {
        if (!selectedValue) {
            setForm(prev => ({
                ...prev,
                headerKey: '',
                selectedFilterIds: [],
                filterContentId: ''
            }));
            setFilterKeyId(null);
            setSelectedHeaderData(null);
        } else {

            console.log(selectedValue , 'headervalues');
            const selectedKey = headerFilterOptions.find(k => Number(k.value) === Number(selectedValue.value));
            setSelectedHeaderData(selectedKey);

            setForm(prev => ({
                ...prev,
                headerKey: selectedValue.value,
                selectedFilterIds: [], // Reset selections when header changes
                filterContentId: ''
            }));

            setFilterKeyId(selectedKey?.filterKeyId);
        }
    };

    const handleFilterKeysChange = (selectedOptions) => {
        const ids = selectedOptions?.map(opt => opt.value) || [];

        setForm(prev => ({
            ...prev,
            selectedFilterIds: ids // ✅ only numbers stored
        }));
    };

    const handleFilterContentChange = (selectedValue) => {
        setForm(prev => ({
            ...prev,
            filterContentId: selectedValue || ''
        }));
    };

    // key duplicate check (skip own key in edit mode)
    const isDuplicateKey =
        form.key.trim() &&
        existingKeys.includes(form.key.toLowerCase()) &&
        (!isEdit || form?.key.toLowerCase() !== editingData?.menu_key?.toLowerCase());

    console.log(selectedHeaderData, 'selectedHeaderData');
    // Determine what to show based on conditions
    const shouldShowKeyValueFields =
        selectedHeaderData && !selectedHeaderData.filterKeyId 
      

    const shouldShowFilterKeysSelector =
        selectedHeaderData?.isDropdown &&
        form.isCategory

    const shouldShowFilterContentSelector =
        selectedHeaderData?.isDropdown &&
        !form.isCategory &&
        selectedHeaderData?.filterKeyId;

    const selectedOptions = useMemo(() => {

        console.log(filterKeyList, form.selectedFilterIds,'selectedOptions')
        return filterKeyList.filter(opt =>
            
            String(form.selectedFilterIds)?.includes(String(opt?.value))
        );
    }, [form.selectedFilterIds, filterKeyList]);

    console.log(selectedOptions,'selectedOptions');
    // ── submit ─────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        console.log(form,'formValues');

        // Basic validation
        if (!form.headerKey) return setError("Header Key is required");
        if (!form.label.trim()) return setError("Label is required");

        // Conditional validation based on dropdown status
        if (shouldShowKeyValueFields) {
            if (!form.key.trim()) return setError("Key is required");
            if (isDuplicateKey) return setError("This key already exists");
            if (!form.value.trim()) return setError("Value is required");
        }

        if (shouldShowFilterKeysSelector) {
            if (!form.selectedFilterIds || form.selectedFilterIds.length === 0) {
                return setError("Please select at least one filter key");
            }
        }

        if (shouldShowFilterContentSelector) {
            if (!form.filterContentId) {
                return setError("Please select a filter content");
            }
        }

        if (form.order === "") return setError("Order is required");

        const payload = {
            headerKey: Number(form.headerKey),
            label: form.label,
            isCategory: form.isCategory,
            isActive: form.isActive,
            order: Number(form.order),
            filterId : selectedHeaderData?.filterKeyId
        };

        // Add conditional fields to payload
        if (shouldShowKeyValueFields) {
            payload.key = form.key;
            payload.value = form.value;
        }

        if (shouldShowFilterKeysSelector) {
            payload.filterIds = form.selectedFilterIds.map(id => Number(id));
        }

        if (shouldShowFilterContentSelector) {
            payload.filterContentId = Number(form.filterContentId.value);
        }

        console.log('Submitting payload:', payload); // For debugging


        const mutation = isEdit ? updateMutation : uploadMutation;
        const args = isEdit ? { id: editingData?.id, payload } : payload;
       
        mutation.mutate(args, {
            onSuccess: () => {
                setSuccess(isEdit ? "Menu updated successfully" : "Menu created successfully");
                setTimeout(() => navigate("/header/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || (isEdit ? "Update failed" : "Upload failed"));
            },
        });
    };

    // ── ui ─────────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto mt-8">
            <div className="border rounded-lg overflow-hidden">
                {/* header */}
                <div className="flex justify-between items-center m-0 px-2 py-2 border-b bg-[var(--primary-color)]">
                    <h2 className="text-sm font-medium m-0">
                        {isEdit ? "Edit Header Menu item" : "Add Header Menu item"}
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs px-2.5 py-1 border rounded text-white"
                    >
                        Back
                    </button>
                </div>

                {/* messages */}
                {error && (
                    <div className="mx-5 mt-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-5 mt-4 text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
                        {success}
                    </div>
                )}

                {/* form */}
                <form onSubmit={handleSubmit} className="p-2 space-y-4">
                    {/* Header Key Selector */}
                    <div className="flex items-center gap-2">
                        <label className="min-w-[90px] font-semibold text-sm text-[#7C2D12]">
                            Header Key <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-full">
                            <ComboBox
                                value={form.headerKey}
                                options={headerFilterOptions}
                                onChange={handleHeaderKeySelect}
                                placeholder="Select header key"
                            />
                        </div>
                    </div>

                    {/* Label - Always show */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600 min-w-[90px]">Label *</label>
                        <input
                            value={form.label}
                            onChange={handleChange("label")}
                            placeholder="e.g. About"
                            className="mt-1 w-full border rounded px-2.5 py-2.5 text-xs"
                        />
                    </div>

                    {/* Conditional: Key-Value fields (when dropdown is 'N' or no filterId) */}
                    {shouldShowKeyValueFields && (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-gray-600 min-w-[90px]">
                                    {selectedHeaderData?.linkKey || "Key"} *
                                </label>
                                <input
                                    value={form.key}
                                    onChange={handleChange("key")}
                                    placeholder={`e.g. ${selectedHeaderData?.linkValue || "value"}`}
                                    className={`mt-1 w-full border rounded px-2.5 py-2.5 text-xs ${isDuplicateKey ? "border-red-400 bg-red-50" : ""
                                        }`}
                                />
                                {isDuplicateKey && (
                                    <p className="text-xs text-red-500 mt-0.5">Key already exists</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-gray-600 min-w-[90px]">
                                    {selectedHeaderData?.linkValue || "Value"} *
                                </label>
                                <input
                                    value={form.value}
                                    onChange={handleChange("value")}
                                    placeholder="e.g. /route"
                                    className="mt-1 w-full border rounded px-2.5 py-2.5 text-xs"
                                />
                            </div>
                        </>
                    )}

                    {/* Conditional: Filter Keys Selector (when dropdown is 'Y', category is true, and filterId exists) */}
                    {shouldShowFilterKeysSelector && (
                        <div className="flex items-start gap-2">
                            <label className="text-xs font-medium text-gray-600 min-w-[90px] pt-0.5">
                                Select Filter Keys *
                            </label>
                            <div className="flex-1">
                                <ComboBox
                                    value={selectedOptions} // ✅ correct format
                                    options={filterKeyList}
                                    onChange={handleFilterKeysChange}
                                    placeholder="Select filter keys"
                                    multiple={true}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    You can select multiple filter keys
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Conditional: Filter Content Selector (when dropdown is 'Y', category is false, and filterId exists) */}
                    {shouldShowFilterContentSelector && (
                        <div className="flex items-start gap-2">
                            <label className="text-xs font-medium text-gray-600 min-w-[90px] pt-0.5">
                                {selectedHeaderData?.filterLabel || "Filter Option"} *
                            </label>
                            <div className="flex-1">
                                <ComboBox
                                    value={form.filterContentId}
                                    options={filterContentList}
                                    onChange={handleFilterContentChange}
                                    placeholder="Select filter option"
                                    loading={filterKeyId && filterContentList.length === 0}
                                    loadingText="Loading filter options..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Order - Always show */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 min-w-[90px]">Display order *</label>
                        <input
                            type="number"
                            value={form.order}
                            onChange={handleChange("order")}
                            className="mt-1 w-28 border rounded px-2.5 py-2 text-xs"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-5 bg-gray-50 rounded-md px-2 py-2 border">
                        <Switch
                            checked={form.isActive}
                            onChange={set("isActive")}
                            label="Active"
                        />

                        {/* Show isCategory toggle only if no category exists yet */}
                        {isCategoryDisabled && (
                            <Switch
                                checked={form.isCategory}
                                onChange={(checked) => {
                                    set("isCategory")(checked);
                                    // Reset selections when category changes
                                    setForm(prev => ({
                                        ...prev,
                                        selectedFilterIds: [],
                                        filterContentId: ''
                                    }));
                                }}
                                label="Is category"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setForm(INITIAL_FORM);
                                setSelectedHeaderData(null);
                                setFilterKeyId(null);
                                setError("");
                                setSuccess("");
                            }}
                            className="text-xs px-3 py-1.5 border rounded text-gray-500 hover:bg-gray-50"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || isDuplicateKey}
                            className="text-xs px-5 py-1.5 bg-indigo-600 text-white rounded disabled:opacity-50"
                        >
                            {isSubmitting
                                ? (isEdit ? "Updating..." : "Creating...")
                                : (isEdit ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMenuItemPage;