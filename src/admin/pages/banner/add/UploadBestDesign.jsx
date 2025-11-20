
import React, { useState, useEffect } from "react";
import BackdropProgress from "../../../components/backDrop/BackdropProgress";
import { useUploadBestDesignMutation, useUpdateBestDesignMutation, useBestDesignsQuery } from "../../../hooks/banners/BestDesignedProductsBanner/useBestDesign";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils";

const UploadBestDesign = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: editId } = location.state || {};
    const isEdit = Boolean(editId);

    console.log(editId ,isEdit ,'edit')


    const [name, setName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [progress, setProgress] = useState(0);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", severity: "error" });

    const uploadMutation = useUploadBestDesignMutation();
    const updateMutation = useUpdateBestDesignMutation();
    const { data: bestDesigns } = useBestDesignsQuery();

    // Load existing banner data if editing
    useEffect(() => {
        if (isEdit && bestDesigns?.length) {
            const existingBanner = bestDesigns.find((b) => b.id === editId);
            if (existingBanner) {
                setName(existingBanner.Name || "");
                setPreview(getProductImages(existingBanner.Image) || "" );
            }
        }
    }, [isEdit, editId, bestDesigns]);

    const showToast = (message, severity = "error") => setToast({ open: true, message, severity });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return showToast("Only PNG, JPG, WEBP allowed");
        if (file.size > 5 * 1024 * 1024) return showToast("Max file size 5MB");
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleCancel = () => {
        if (isEdit && bestDesigns?.length) {
            const existingBanner = bestDesigns.find((b) => b.id === editId);
    
            setName("");
            setSelectedFile(null);
            setPreview("");
        } else {
            setName("");
            setSelectedFile(null);
            setPreview("");
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) return showToast("Please enter a design name");
        if (!isEdit && !selectedFile) return showToast("Please select an image");

        setOpenBackdrop(true);
        setProgress(0);

        const payload = new FormData();
        if (isEdit) {
            payload.append("id", editId);
            payload.append("name", name);
            if (selectedFile instanceof File) payload.append("image", selectedFile);
        } else {
            payload.append("name", name);
            payload.append("image", selectedFile);
        }

        const mutation = isEdit ? updateMutation : uploadMutation;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        mutation.mutate(payload, {
            onSuccess: () => {
                setProgress(100);
                setTimeout(() => {
                    setOpenBackdrop(false);
                    setProgress(0);
                    setToast({ open: true, message: isEdit ? "Banner updated!" : "Banner uploaded!", severity: "success" });
                    navigate("/bestbanner/manage");
                }, 800);
            },
            onError: (err) => {
                setOpenBackdrop(false);
                showToast(err?.message || "Upload failed");
            },
        });
    };

    useEffect(() => {
        if (toast.open) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, open: false }));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [toast.open]);

    return (
        <div className="max-w-xl mx-auto mt-6 p-4">
            <div className="border p-2 shadow-sm">
                <div className="flex items-center justify-between mb-1 ">
                    <h2 className="text-sm font-semibold ">
                        {isEdit ? "Edit BestDesigned Banner" : "Add New BestDesigned Banner"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                    >
                        Back
                    </button>
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-xs font-medium">Design Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs rounded-md border px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1 text-xs font-medium">Banner Image</label>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileSelect}
                        className="block w-full text-xs text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2 cursor-pointer"
                    />
                    {preview && (
                        <div className="mt-2">
                            <p className="text-xs mb-1">Preview:</p>
                            <img src={preview} alt="Preview" className="w-full h-40 object-contain rounded-md border" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={handleCancel}
                        disabled={uploadMutation.isLoading || updateMutation.isLoading}
                        className="px-2 py-1.5 border text-xs rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                     Clear
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploadMutation.isLoading || updateMutation.isLoading}
                        className="px-2 py-1.5 bg-indigo-600 text-xs text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {uploadMutation.isLoading || updateMutation.isLoading ? (isEdit ? "Updating..." : "Uploading...") : isEdit ? "Update" : "Upload"}
                    </button>
                </div>

                <BackdropProgress open={openBackdrop} title={isEdit ? "Updating Banner" : "Uploading Banner"} body="Please wait..." progress={progress} />
            </div>

            {toast.open && (
                <div className="fixed top-15 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-2 text-xs rounded-md ${toast.severity === "error" ? "bg-red-600" : "bg-green-600"} text-white`}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadBestDesign;
