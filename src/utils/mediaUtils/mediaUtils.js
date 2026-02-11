// src/utils/mediaUtils.js

/**
 * Parse and normalize product images
 */
export const getProductImages = (imageData, fallbackImage = "/fallback.png") => {
    try {
        if (!imageData) return [fallbackImage];

        const parsed = typeof imageData === "string" && imageData.trim().startsWith("[")
            ? JSON.parse(imageData)
            : Array.isArray(imageData) ? imageData : [imageData];

        return parsed.length
            ? parsed.map(img =>
                img.startsWith("http") ? img : `https://app.bmgjewellers.com${img}`
            )
            : [fallbackImage];
    } catch (error) {
        console.error("Error parsing product images:", error);
        return [fallbackImage];
    }
};

/**
 * Parse and normalize product videos
 */
export const getProductVideos = (videoData, fallbackVideo = "/fallback-video.mp4") => {
    try {
        if (!videoData) return [];

        const parsed = typeof videoData === "string" && videoData.trim().startsWith("[")
            ? JSON.parse(videoData)
            : Array.isArray(videoData) ? videoData : [videoData];

        return parsed.length
            ? parsed.map(vid =>
                vid.startsWith("http") ? vid : `https://app.bmgjewellers.com${vid}`
            )
            : [];
    } catch (error) {
        console.error("Error parsing product videos:", error);
        return [];
    }
};

export const getImage = (imageData, fallbackImage = "/fallback.png") => {
    try {
        if (!imageData) return fallbackImage;

        let image = imageData;

        // JSON string array
        if (typeof image === "string" && image.trim().startsWith("[")) {
            const parsed = JSON.parse(image);
            image = Array.isArray(parsed) ? parsed[0] : null;
        }

        // Array
        if (Array.isArray(image)) {
            image = image[0];
        }

        if (!image || typeof image !== "string") return fallbackImage;

        // ✅ Backend-relative images ONLY
        if (image.startsWith("/uploads") || image.startsWith("/images")) {
            return `https://app.bmgjewellers.com${image}`;
        }

        // ✅ Everything else (Vite imports, CDN, assets)
        return image;
    } catch (e) {
        console.error("getImage error:", e);
        return fallbackImage;
    }
};