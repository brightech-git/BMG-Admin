import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUploadMenuItem, useUpdateMenuItem, useMenu } from "../../../hooks/navItems/useHeaderNavItems";
import { Switch } from "../../../components/ui/Switch";

const INITIAL_FORM = {
    name: "",
    active: true,
    order: "",
};

const AddHeaderNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    console.log(state, 'state');

    const isEdit = state?.mode === "edit";
    const editingData = state?.rowData ?? null ; 
    console.log(editingData,'editingData');

    const { data: menuItems = [] } = useMenu();

    // derived flags from API shape
    const isCategoryDone = menuItems.some((item) => item.CATEGORY === "Y" && !( item.id === editingData?.id) );

    console.log(isCategoryDone, menuItems,'isCategoryDone')
    const existingKeys = menuItems.map((item) => item.MENU_KEY?.toLowerCase()).filter(Boolean);

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

    useEffect(()=>{
        if(editingData){
            setForm({
                name:editingData?.LABEL ?? "",
                active:editingData?.ACTIVE === "Yes" ?? "",
                order:editingData?.ORDER ?? "",
            })
        }
    },[editingData])

    // key duplicate check (skip own key in edit mode)
    const isDuplicateKey =
        form.key.trim() &&
        existingKeys.includes(form.key.trim().toLowerCase()) &&
        (!isEdit || form?.key.trim().toLowerCase() !== editingData?.KEY?.toLowerCase());

    // ── submit ─────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.name.trim()) return setError("Label is required");
        if (isDuplicateKey) return setError("This key already exists");
        if (form.order === "") return setError("Order is required");

        const payload = {
            name: form.name,
            active: form.active,
            order: Number(form.order),
        };

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
                <div className="flex justify-between items-center px-5 py-3 border-b">
                    <h2 className="text-sm font-medium">
                        {isEdit ? "Edit menu item" : "Add menu item"}
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs px-2.5 py-1 border rounded text-gray-500 hover:bg-gray-50"
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
                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    
            
                        <div>
                            <label className="text-xs font-medium text-gray-600">Label *</label>
                            <input
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="e.g. About"
                                className="mt-1 w-full border rounded px-2.5 py-1.5 text-xs"
                            />
                        </div>

                        
              

                 

                    {/* order */}
                    <div>
                        <label className="text-xs font-medium text-gray-600">Display order *</label>
                        <input
                            type="number"
                            value={form.order}
                            onChange={handleChange("order")}
                            className="mt-1 w-28 border rounded px-2.5 py-1.5 text-xs"
                        />
                    </div>

                    {/* toggles */}
                    <div className="flex items-center gap-6 bg-gray-50 rounded-md px-4 py-3 border">
                        <Switch
                            checked={form.active}
                            onChange={set("active")}
                            label="Active"
                        />

                
                    </div>

                    {/* actions */}
                    <div className="flex justify-between pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setForm(INITIAL_FORM);
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

export default AddHeaderNav;