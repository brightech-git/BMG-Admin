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