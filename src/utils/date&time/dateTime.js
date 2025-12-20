export const formatDateTime = (iso) => {
    if (!iso) return "";
    console.log(iso ,'isoooo');

    
    const d = new Date(iso);
console.log(d,'datasss') 
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
