import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "animate.css";

const SmartDateInput = ({
    value,            // accepts any format: yyyy-mm-dd or dd-mm-yyyy
    onChange,         // returns yyyy-mm-dd
    label,
    prevDisable = false,
    onClickOpen = () => { },
}) => {
    const [selectedDate, setSelectedDate] = useState(null);

    // parse incoming value
    useEffect(() => {
        if (!value) {
            setSelectedDate(null);
            return;
        }

        let parsedDate = null;
        const formats = ["yyyy-MM-dd", "dd-MM-yyyy", "dd/MM/yyyy", "yyyy/MM/dd"];

        for (const fmt of formats) {
            const date = parse(value, fmt, new Date());
            if (!isNaN(date)) {
                parsedDate = date;
                break;
            }
        }

        setSelectedDate(parsedDate);
    }, [value]);

    const handleChange = (date) => {
        setSelectedDate(date);
        onChange(format(date, "yyyy-MM-dd")); // send backend format
    };

    return (
        <div className="flex flex-col gap-1 w-full max-w-xs text-xs">
            {label && <label className="font-medium text-gray-700">{label}</label>}

            <DatePicker
                selected={selectedDate}
                onChange={handleChange}
                onCalendarOpen={onClickOpen}
                dateFormat="dd-MM-yyyy"
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                minDate={prevDisable ? new Date() : null}
                placeholderText="Select a date"
                showPopperArrow={false}
                /** 🔥 THIS FIXES EVERYTHING 🔥 */
                portalId="datepicker-portal"
                popperPlacement="bottom-start"
                calendarClassName="animate__animated animate__fadeInUp"
            />


        </div>
    );
};

export default SmartDateInput;
