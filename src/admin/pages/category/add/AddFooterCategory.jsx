import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFooterEntries, useCreateFooterEntry, useUpdateFooterEntry } from "../../../hooks/footer/useFooter";
import { useItemNames } from "../../../hooks/itemName/useItemNames";

const AddFooterEntryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === "edit";
    const editId = state?.id ?? null;
console.log(editId,'state')
    // Queries / mutations
    const { data: footerData } = useFooterEntries();
    const createMutation = useCreateFooterEntry();
    const updateMutation = useUpdateFooterEntry();
    const { items: itemNames = [] } = useItemNames();

    // State
    const [itemCtrName, setItemCtrName] = useState("");
    const [file, setFile] = useState(null);
    // const [existingFile, setExistingFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
console.log(footerData ,'footerdata')
    // Pre-fill if editing
    const currentEntry = useMemo(() => {
        if (!isEdit || !footerData) return null;
        console.log(footerData ,'footerdata')
        return footerData.find((f) => f.id === editId) || null;
    }, [isEdit, editId, footerData]);
    console.log(currentEntry ,'currententery')
    useEffect(() => {
        if (isEdit && currentEntry) {
            setItemCtrName(currentEntry.itemCtrName);
            // setExistingFile(currentEntry.imageUrl || null);
        }
    }, [isEdit, currentEntry]);

    // File handler
    // const handleFileChange = (e) => {
    //     const f = e.target.files?.[0] || null;
    //     if (!f) {
    //         setFile(null);
    //         return;
    //     }
    //     if (!f.type.startsWith("image/")) {
    //         setError("Only images are allowed.");
    //         return;
    //     }
    //     if (f.size > 5 * 1024 * 1024) {
    //         setError("Image must be smaller than 5MB.");
    //         return;
    //     }
    //     setFile(f);
    //     setError("");
    // };

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!itemCtrName) {
            setError("Please select an item category.");
            return;
        }

        // Duplicate check for Add
        if (!isEdit && footerData?.some(f => f.itemCtrName === itemCtrName)) {
            setError("This item category already exists.");
            return;
        }

        const formData = new FormData();
        formData.append("itemCtrName", itemCtrName);
        formData.append("title", itemCtrName.toUpperCase());
        formData.append("link", `products-page?itemCtrName=${itemCtrName.toUpperCase()}`);
        // if (file) formData.append("image", file);

        const mutationPayload = isEdit
            ? { id: editId, payload: formData }   // UPDATE
            : formData;                           // CREATE

        const mutation = isEdit ? updateMutation : createMutation;

        mutation.mutate(mutationPayload, {
            onSuccess: () => {
                setSuccess(
                    isEdit
                        ? "Footer entry updated successfully."
                        : "Footer entry added successfully."
                );
                setTimeout(() => navigate("/admin/category/footer/manage"), 700);
            },
            onError: (err) => {
                setError(
                    err?.response?.data?.error ||
                    err?.message ||
                    "Operation failed."
                );
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-4 border rounded">

            <header className="flex justify-between items-center">
            <h2 className="text-sm font-semibold mb-4">{isEdit ? "Edit Footer Entry" : "Add Footer Entry"}</h2>
                <button className="p-1.5 border rounded text-xs" onClick={()=>navigate(-1)}>back</button>
            </header>
            {error && <div className="text-red-700 bg-red-100 p-2 mb-2 rounded">{error}</div>}
            {success && <div className="text-green-700 bg-green-100 p-2 mb-2 rounded">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">Item Category *</label>
                    <select
                        value={itemCtrName}
                        onChange={(e) => setItemCtrName(e.target.value)}
                        className="w-full border px-2 py-1 rounded text-sm"
                    >
                        <option value="">Select item category</option>
                        {itemNames.map((item) => (
                            <option key={item.ITEMCTRNAME} value={item.ITEMCTRNAME}>
                                {item.ITEMCTRNAME}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image */}
                {/* <div>
                    <label className="block text-sm font-medium mb-1">
                        Image {isEdit ? "(optional - leave to keep current)" : "*"}
                    </label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
                    {(file || existingFile) && (
                        <div className="mt-2 w-32 h-20 border rounded overflow-hidden">
                            <img
                                src={file ? URL.createObjectURL(file) : existingFile}
                                alt="preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div> */}

                {/* Actions */}
                <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                    <button
                        type="button"
                        className="px-2 py-1.5 border rounded text-xs"
                        onClick={() => {
                            setItemCtrName("");
                            setFile(null);
                            setError("");
                            setSuccess("");
                        }}
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1.5 border rounded text-xs"
                        onClick={() => {
                            setItemCtrName("");
                            setFile(null);
                            setError("");
                            setSuccess("");
                            navigate(-1)
                        }}
                    >
                        Cancel
                    </button>
                    </div>
                    <button type="submit" className="px-2 py-1.5 rounded bg-orange-600 text-white hover:bg-orange-700 text-xs">
                        {isEdit ? "Update Entry" : "Add Entry"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddFooterEntryPage;
