export const getProductImages = (imageData, fallbackImage = "/fallback.png") => {
    try {
        if (!imageData) return [fallbackImage];

        const parsedImages = typeof imageData === "string" && imageData.startsWith("[")
            ? JSON.parse(imageData)
            : Array.isArray(imageData) ? imageData : [imageData];

        return parsedImages.length
            ? parsedImages.map(img => img.startsWith("http") ? img : `https://app.bmgjewellers.com${img}`)
            : [fallbackImage];
    } catch (error) {
        console.error("Error parsing product images:", error);
        return [fallbackImage];
    }
};
