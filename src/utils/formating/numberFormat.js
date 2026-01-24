export const numberFormatting = (
    val,
    decimal = 2) => {
    if (val === null || val === undefined || val === '') return '0';

    const num = Number(val);

    if (isNaN(num)) return '0';

    return num.toFixed(decimal);
};
