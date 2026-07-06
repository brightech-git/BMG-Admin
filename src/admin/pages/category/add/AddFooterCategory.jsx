import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Hash, Link2, RotateCcw, Save, Search } from "lucide-react";
import PropTypes from "prop-types";
import { useFooterEntries, useCreateFooterEntry, useUpdateFooterEntry } from "../../../hooks/footer/useFooter";
import { useItemNames } from "../../../hooks/itemName/useItemNames";
import ComboBox from "../../../components/ui/ComboBox";
import { Switch } from "../../../components/ui/Switch";

const INITIAL_FORM = {
    itemId: "",
    title: "",
    link: "products-page?",
    displayOrder: "",
    active: true,
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

const InfoTile = ({ icon: Icon, label, value }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            <Icon size={13} />
            {label}
        </div>
        <p className="mt-1 truncate text-xs font-medium text-gray-700" title={value || "-"}>
            {value || "-"}
        </p>
    </div>
);

InfoTile.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const AddFooterEntryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === "edit";
    const editId = state?.id ?? null;

    const { data: footerData = [] } = useFooterEntries();
    const createMutation = useCreateFooterEntry();
    const updateMutation = useUpdateFooterEntry();
    const { items: itemNames = [] } = useItemNames();

    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isSubmitting =
        createMutation.isPending || createMutation.isLoading ||
        updateMutation.isPending || updateMutation.isLoading;

    const itemOptions = useMemo(() =>
        itemNames.map((item) => ({
            value: String(item.ITEMID ?? item.itemId ?? item.id ?? ""),
            label: item.ITEMNAME ?? item.itemName ?? item.name ?? "",
        })).filter((item) => item.value && item.label)
    , [itemNames]);

  

    const selectedItem = useMemo(() =>
        itemOptions.find((item) => String(item.value) === String(form.itemId)) || null
    , [form.itemId, itemOptions]);

    const currentEntry = useMemo(() => {
        if (!isEdit) return null;
        return footerData.find((entry) => Number(entry.id) === Number(editId)) || null;
    }, [isEdit, editId, footerData]);

    useEffect(() => {
        if (!isEdit || !currentEntry) return;

        const itemId = currentEntry.itemId ?? currentEntry.ITEMID ?? "";
        const itemTitle = currentEntry.title ?? currentEntry.itemName ?? "";

        setForm({
            itemId: itemId ? String(itemId) : "",
            title: itemTitle,
            link: currentEntry.link ?? (itemId ? `products-page?itemId=${itemId}` : "products-page?"),
            displayOrder: currentEntry.displayorder ?? currentEntry.displayOrder ?? "",
            active: currentEntry.active 
        });
    }, [isEdit, currentEntry]);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            title: selectedItem?.label ?? "",
            link: selectedItem ? `products-page?itemId=${selectedItem.value}` : "products-page?",
        }));
    }, [selectedItem]);

    const set = (field) => (value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (item) => {
        setForm((prev) => ({
            ...prev,
            itemId: item?.value ?? "",
        }));
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setError("");
        setSuccess("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.itemId) {
            setError("Please select an item.");
            return;
        }

        if (form.displayOrder === "") {
            setError("Display order is required.");
            return;
        }

        const isDuplicate = footerData.some((entry) =>
            Number(entry.itemId ?? entry.ITEMID) === Number(form.itemId) &&
            Number(entry.id) !== Number(editId)
        );

        if (isDuplicate) {
            setError("This item already exists in footer categories.");
            return;
        }

        const formData = new FormData();
        formData.append("itemId", form.itemId);
        formData.append("title", form.title);
        formData.append("link", form.link);
        formData.append("displayOrder", form.displayOrder);
        formData.append("active", form.active);

        const mutation = isEdit ? updateMutation : createMutation;
        const mutationPayload = isEdit ? { id: editId, payload: formData } : formData;

        mutation.mutate(mutationPayload, {
            onSuccess: () => {
                setSuccess(isEdit ? "Footer entry updated successfully." : "Footer entry added successfully.");
                setTimeout(() => navigate("/admin/category/footer/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || err?.message || "Operation failed.");
            },
        });
    };

    return (
        <div className="mx-auto mt-4 max-w-4xl px-3">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-[var(--primary-color)] px-3 py-2 ">
                    <div >
                        <h2 className="text-sm font-semibold text-white">
                            {isEdit ? "Edit Footer Category" : "Add Footer Category"}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-white/75">
                            Configure footer item link, order, and publishing status.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex  items-center gap-1.5 rounded-md border border-white/35 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                    >
                        <ArrowLeft size={14} />
                        Back
                    </button>
                </div>

                {(error || success) && (
                    <div className="px-4 pt-4">
                        <div className={`rounded-lg border px-3 py-2 text-xs ${
                            error
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-green-200 bg-green-50 text-green-700"
                        }`}>
                            {error || success}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
                        <FieldRow
                            label="Item"
                            required
                            hint="The selected item's name is used as the footer title."
                        >
                            <ComboBox
                                options={itemOptions}
                                value={selectedItem}
                                onChange={handleItemChange}
                                placeholder="Search and select item"
                                size="md"
                                renderOption={(option) => (
                                    <div className="flex items-center gap-2">
                                        <Search size={13} className="text-gray-400" />
                                        <span className="truncate">{option.label}</span>
                                        <span className="ml-auto text-[11px] text-gray-400">#{option.value}</span>
                                    </div>
                                )}
                            />
                        </FieldRow>

                        <FieldRow label="Display Order" required>
                            <input
                                type="number"
                                min="1"
                                value={form.displayOrder}
                                onChange={(e) => set("displayOrder")(e.target.value)}
                                placeholder="e.g. 1"
                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/15"
                            />
                        </FieldRow>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <InfoTile icon={Hash} label="Item ID" value={form.itemId} />
                        <InfoTile icon={CheckCircle2} label="Title" value={form.title} />
                        <InfoTile icon={Link2} label="Link" value={form.link} />
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <Switch
                            checked={form.active}
                            onChange={set("active")}
                            label="Active"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RotateCcw size={14} />
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-color)] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                        >
                            <Save size={14} />
                            {isSubmitting
                                ? (isEdit ? "Updating..." : "Saving...")
                                : (isEdit ? "Update Entry" : "Save Entry")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddFooterEntryPage;
