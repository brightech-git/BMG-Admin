import React from "react";

const Checkbox = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    multiple = true,     // true = checkbox, false = radio
    disabled = false,
    layout = "vertical",   // vertical or horizontal   
    minLabelWidth = "100px",
}) => {

    const handleChange = (value) => {
        if (disabled) return;

        if (multiple) {
            // multi select
            if (selectedValues.includes(value)) {
                onChange(selectedValues.filter((v) => v !== value));
            } else {
                onChange([...selectedValues, value]);
            }
        } else {
            // single select
            onChange([value]);
        }
    };

    return (
        <div className="mb-4">

            <div className={`${layout === "horizontal" ? "flex items-center gap-4" : "flex flex-col gap-2"}`}>
                {/* Label */}
                <h4 className={`text-sm font-semibold mb-2 text-[var(--primary-text-color)] min-w-[${minLabelWidth}]`}>
                    {label}
                </h4>

                {/* Options */}
                <div className="space-y-2">
                    {options.map((item) => {
                        const isChecked = selectedValues.includes(item.value);

                        return (
                            <label
                                key={item.value}
                                className={`flex  items-center gap-2 cursor-pointer 
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <input
                                    type={multiple ? "checkbox" : "radio"}
                                    name={label}
                                    value={item.value}
                                    checked={isChecked}
                                    onChange={() => handleChange(item.value)}
                                    disabled={disabled}
                                    className="w-4 h-4 accent-orange-600"
                                />

                                <span className="text-sm text-gray-600">
                                    {item.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
           
        </div>
    );
};

export default Checkbox;