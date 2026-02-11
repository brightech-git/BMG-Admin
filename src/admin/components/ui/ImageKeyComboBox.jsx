import React, { useState, useRef, useEffect } from "react";

const ImageKeyComboBox = ({ data, categoryKey, setCategoryKey, isUploading, isUpdating }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const containerRef = useRef(null);

    // Filter options based on search
    const filteredOptions = data.filter((item) =>
        item.imageKey.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setSearch(categoryKey || "");
    }, [categoryKey]);
    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setHighlightIndex(0);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) => (prev + 1) % filteredOptions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev === 0 ? filteredOptions.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = filteredOptions[highlightIndex];
            if (selected) handleSelect(selected.imageKey);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const handleSelect = (key) => {
        setCategoryKey(key);
        setSearch(key);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-xs font-medium mb-1">
                Category Key <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full border px-2 py-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Select or type category key"
                disabled={isUploading || isUpdating}
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border mt-1 max-h-40 overflow-auto text-xs shadow-lg rounded">
                    {filteredOptions.map((item, index) => (
                        <li
                            key={item.id}
                            onClick={() => handleSelect(item.imageKey)}
                            onMouseEnter={() => setHighlightIndex(index)}
                            className={`px-2 py-1 cursor-pointer ${index === highlightIndex ? "bg-blue-100" : "hover:bg-gray-100"
                                }`}
                        >
                            {item.imageKey}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ImageKeyComboBox;
