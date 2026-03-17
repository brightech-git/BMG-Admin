
import { parse, isValid, format } from "date-fns";

export const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
};

export const toLocalISO = (date) => {
    const pad = (n) => String(n).padStart(2, "0");

    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());

    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
};

export const toFormDate = (date) => {
    console.log(date ,'datefromutil');
    
    if (!date) return "";
    const pad = (n) => String(n).padStart(2, "0");

    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());


    return `${yyyy}-${mm}-${dd}`;
};

export const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

  
    return `${dd}-${mm}-${yyyy}`;
};


const INPUT_FORMATS = [
    "yyyy-MM-dd",
    "dd-MM-yyyy",
    "dd/MM/yyyy",
    "yyyy/MM/dd",
];

export const parseAnyDate = (value) => {
    if (!value) return null;

    for (const fmt of INPUT_FORMATS) {
        const parsed = parse(value, fmt, new Date());
        if (isValid(parsed)) return parsed;
    }

    return null;
};
