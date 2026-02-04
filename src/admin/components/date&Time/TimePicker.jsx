// TimePicker.jsx
import React, { useState, useRef } from "react";
import { Clock } from "lucide-react";
import "animate.css";

const formatDisplayTime = (date) =>
    date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

const formatBackendTime = (date) => date.toTimeString().slice(0, 5); // HH:mm

const TimePicker = ({ value, onChange, placeholder = "Select time", minTime }) => {
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);

    const handleSelect = (e) => {
        const [h, m] = e.target.value.split(":");
        const date = new Date();
        date.setHours(h, m, 0);

        onChange({
            display: formatDisplayTime(date),
            backend: formatBackendTime(date),
            raw: date,
        });

        setOpen(false);
    };

    return (
        <div className="relative w-full" ref={pickerRef}>
            {/* Display Input */}
            <div
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 w-full border rounded-md px-3 py-2 cursor-pointer hover:border-blue-500 transition"
            >
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                    readOnly
                    value={value?.display || ""}
                    placeholder={placeholder}
                    className="flex-1 outline-none cursor-pointer text-xs bg-transparent"
                />
            </div>

            {/* Time Popover */}
            {open && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border rounded-md shadow-lg p-2 animate__animated animate__fadeIn">
                    <input
                        type="time"
                        min={minTime}  // <- use parent-provided minTime
                        autoFocus
                        onChange={handleSelect}
                        className="w-full border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                        onBlur={() => setOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default TimePicker;
