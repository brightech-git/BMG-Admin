import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateHeaderKey , useUpdateHeaderKey, useHeaderKeys  } from "../../../hooks/navItems/useHeaderNavKey";
import { Switch } from "../../../components/ui/Switch";
import ComboBox from "../../../components/ui/ComboBox";
import { useGetAllFilterSettings } from '../../../hooks/filter/useFilterSetting';

const INITIAL_FORM = {
    name: "",
    active: true,
    order: "",
    dropdown:false,
    linkKey:"",
    linkValue:"",
    fitlerId:"",

};

const AddHeaderNav = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};



    const isEdit = state?.mode === "edit";
    const editingData = state?.rowData ?? null ; 

    console.log(editingData,'editingData');

    const { data: headerKeys = [] } = useHeaderKeys();

  
    const existingKeys = headerKeys?  headerKeys.map((item) => item.name?.toLowerCase()).filter(Boolean) : [];

    const { data: filterKeys } = useGetAllFilterSettings();

    const fitlerContents = useMemo(()=>{
        return Array.isArray(filterKeys?.data) ? filterKeys?.data?.map((item)=>({
            label:item.filterLabel,
            value:item.id
        })) : [];
    }, [filterKeys])

    console.log(fitlerContents,'fitlerContents');
    console.log(existingKeys,'existingKeys');

    const uploadMutation = useCreateHeaderKey();
    const updateMutation = useUpdateHeaderKey();

    const isSubmitting =
        uploadMutation.isPending ||
        uploadMutation.isLoading ||
        updateMutation.isPending ||
        updateMutation.isLoading;

    // ── single form state ──────────────────────────────────────
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    console.log(form ,'formName');


    const set = (field) => (val) =>
        setForm((prev) => ({ ...prev, [field]: val }));

    const handleChange = (field) => (e) =>
        set(field)(e.target.type === "checkbox" ? e.target.checked : e.target.value);

    const handleFilterChange = (options) =>{
        if(!options) return;
        setForm(prev=>({
            ...prev,
            fitlerId:options?.value
        }));
    }

    useEffect(()=>{
        if(editingData){
            setForm({
                name:editingData?.name ?? "",
                active:editingData?.active === "Y" ?? "",
                order:editingData?.order ?? "",
                dropdown:editingData?.dropdown === "Y" ?? "",
                linkKey:editingData?.linkKey ?? "",
                linkValue:editingData?.linkValue ?? "",
                fitlerId: Number(editingData?.filterId) ?? "",
            })
        }
    },[editingData]);


    useEffect(() => {
        if (form.dropdown) {
            setForm(prev => ({
                ...prev,
                linkKey: "",
                linkValue: "",
            }));
        }
    }, [form.dropdown]);

    // key duplicate check (skip own key in edit mode)
    const isDuplicateKey =
        form.name.trim()  &&
        existingKeys?.includes(form?.name.trim().toLowerCase()) &&
        (!isEdit || form?.name.trim().toLowerCase() !== editingData?.name?.toLowerCase());
    console.log(isDuplicateKey,'isDuplicateKey')

    // ── submit ─────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.name.trim()) return setError("Label is required");
        if (form.order === "") return setError("Order is required");

        // WHEN dropdown = false → link fields required
        if (!form.dropdown) {
            if (!form.linkKey.trim()) return setError("Link Key is required");
            if (!form.linkValue.trim()) return setError("Link Value is required");
          
        }
        

        const payload = {
            name: form.name,
            active: form.active,
            order: Number(form.order),
            dropdown: form.dropdown,
            filterId:form.fitlerId
        };

        // only send when dropdown = false
        if (!form.dropdown) {
            payload.linkKey = form.linkKey;
            payload.linkValue = form.linkValue;
        }

        console.log(payload,'payload');
       
        const mutation = isEdit ? updateMutation : uploadMutation;
        const args = isEdit ? { id: editingData?.id, payload } : payload;

        mutation.mutate(args, {
            onSuccess: () => {
                setSuccess(isEdit ? "Updated successfully" : "Created successfully");
                setTimeout(() => navigate("/header/setting/manage"), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || "Operation failed");
            },
        });
    };

    // ── ui ─────────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto mt-8">
            <div className="border rounded-lg overflow-hidden">

                {/* header */}
                <div className="flex justify-between items-center px-2 py-2 border-b bg-[var(--primary-color)] m-0 ">
                    <h2 className="text-sm font-medium text-white m-0">
                        {isEdit ? "Edit Header Nav" : "Add Header Nav"}
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
                <form onSubmit={handleSubmit} className="p-3 space-y-4">

                        <div>
                            <label className="text-xs font-medium text-gray-600">Label *</label>
                            <input
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="e.g. About"
                            className="mt-1 w-full border rounded px-2.5 py-2.5 text-xs focus:outline  focus:outline-[var(--primary-color)]"
                            />
                        </div>


                    {/* toggles */}
                    <div className="flex items-center gap-4 bg-gray-50 rounded-md px-2 py-2 border">

                        <Switch
                            checked={form.dropdown}
                            onChange={set("dropdown")}
                            label="DropDown"
                        />

                    </div>
                    {!form.dropdown && (
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600">LINK KEY *</label>
                                <input
                                    value={form.linkKey}
                                    onChange={handleChange("linkKey")}
                                    placeholder="e.g, itemCtrName"
                                    className="mt-1 w-full border rounded px-2.5 py-2.5 text-xs focus:outline focus:outline-[var(--primary-color)]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600">LINK VALUE *</label>
                                <input
                                    value={form.linkValue}
                                    onChange={handleChange("linkValue")}
                                    placeholder="e.g. RING"
                                    className="mt-1 w-full border rounded px-2.5 py-2.5 text-xs focus:outline focus:outline-[var(--primary-color)]"
                                />
                            </div>

                            
                        </>
                    )}
                    
                    {form.dropdown && (

                    <div className="flex-1 w-full">
                        <label className="text-xs font-medium text-gray-600">Filter Key </label>
                        <ComboBox
                            value={form.fitlerId}
                            options={fitlerContents}
                            onChange={handleFilterChange}
                            // disabled={isSubmitting || mode === 'edit'} // Disable in edit mode
                            placeholder="Select filter key"
                        />
                    </div>
                    )}

                    {/* order */}
                    <div>
                        <label className="text-xs font-medium text-gray-600"> Display order * </label>
                        <input
                            type="number"
                            value={form.order}
                            onChange={handleChange("order")}
                            className="mt-1 w-20 border rounded px-2.5 py-1.5 focus:outline focus:outline-[var(--primary-color)] text-xs"
                        />
                    </div>

                    {/* toggles */}
                    <div className="flex items-center gap-4 bg-gray-50 rounded-md px-2 py-2 border">
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
                            disabled={isSubmitting}
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