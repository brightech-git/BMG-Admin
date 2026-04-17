import React, { useState } from "react";

const ImageKeyInput = ({ form, setForm, isSubmitting }) => {
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;

        // Allow only letters and numbers
        const regex = /^[a-zA-Z0-9]*$/;

        if (!regex.test(value)) {
            setError("Spaces and special characters are not allowed");
            return;
        } else {
            setError("");
        }

        setForm({ ...form, imageKey: value });
    };

    return (
        <div>
            <label className="min-w-[110px] font-semibold text-sm text-[#7C2D12]">
                Image Key <span className="text-red-500">*</span>
            </label>
            <input
                name="imageKey"
                value={form.imageKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Enter image key"
                required
                disabled={isSubmitting}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default ImageKeyInput;
