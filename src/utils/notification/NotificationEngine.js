export const ApplyNotification = (text, data = {}) => {
    if (!text) return text;

    // normalize data keys to lowercase once
    const normalizedData = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = data[key];
        return acc;
    }, {});

    return text.replace(/#\{(\w+)\}/g, (_, key) => {
        const value = normalizedData[key.toLowerCase()];

        if (value === undefined) {
            console.warn(`⚠️ Missing notification key: ${key}`);
            return "";
        }

        return String(value);
    });
};
