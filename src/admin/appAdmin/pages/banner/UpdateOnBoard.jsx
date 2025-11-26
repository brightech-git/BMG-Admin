import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllSliders, updateSlider } from "../../service/onBoardImages";

const UpdateOnBoard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const editId = state?.id;

    console.log(editId ,'edit id ')
    if (!editId) {
        navigate(-1);
    }

    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [file, setFile] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Fetch all sliders to pre-fill
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                setLoading(true);
                const res = await getAllSliders();
                setSliders(res?.banners || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSliders();
    }, []);

    console.log(sliders ,'sliders')

    // Pre-fill existing image
    useEffect(() => {
        if (sliders.length > 0 && editId) {
            const current = sliders.find((s) => Number(s.BannerId) === Number(editId));
            if (current) setExistingImagePath(current.image_path || null);
        }
    }, [sliders, editId]);

    console.log(existingImagePath ,'path')

    const onFileChange = (e) => {
        setError("");
        const f = e.target.files?.[0] ?? null;
        if (!f) return setFile(null);
        if (!f.type.startsWith("image/")) return setError("Only image files allowed.");
        if (f.size > 5 * 1024 * 1024) return setError("Image must be smaller than 5 MB.");
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData();
        if (file) formData.append("image", file);
        formData.append("BannerId", editId);

        try {
            setSubmitting(true);
            await updateSlider(editId, formData);
            setSuccess("Slider updated successfully.");
            setTimeout(() => navigate(-1), 1000);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.error || err?.message || "Update failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Edit OnBoard Banner</h2>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-2 py-1.5 rounded-md border text-xs bg-white"
                    disabled={submitting}
                >
                    Back
                </button>
            </div>

            {error && <div className="mb-1 text-xs text-red-700 bg-red-50 p-3 rounded">{error}</div>}
            {success && <div className="mb-1 text-xs text-green-700 bg-green-50 p-3 rounded">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-2">
                {/* Image */}
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Slider Image (optional - leave to keep current)
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="w-30 h-20 bg-slate-50 rounded overflow-hidden border">
                            {file ? (
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                            ) : existingImagePath ? (
                                <img
                                    src={`${existingImagePath.startsWith("http") ? "" : "https://scheme.bmgjewellers.com"}${existingImagePath}`}
                                    alt="current"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>
                        
                        <input
                            id="slider-file"
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            disabled={submitting}
                            className="text-xs flex-1"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setError("");
                                setSuccess("");
                            }}
                            className="px-2 py-1.5 rounded-md border text-xs bg-white"
                            disabled={submitting}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-2 py-1.5 rounded-md border text-xs bg-white"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 rounded-md text-white text-sm ${submitting ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        {submitting ? "Updating..." : "Update Slider"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateOnBoard;
