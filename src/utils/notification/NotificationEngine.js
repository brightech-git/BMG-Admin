export const ApplyNotification = (text, data = {}) => {
    if (!text) return text;

    return text.replace(/#\{(\w+)\}/g, (_, key) => data[key] ?? "");
};
