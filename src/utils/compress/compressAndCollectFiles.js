import imageCompression from 'browser-image-compression';

export const compressAndCollectFiles = async (files) => {
    const options = {
        maxSizeMB: 2,              // max 2 MB per image
        maxWidthOrHeight: 1920,
        useWebWorker: true,        // runs off main thread = no UI freeze
        fileType: 'image/webp',    // smaller + modern
    };

    const result = [];
    for (const file of files) {
        if (file.type.includes('image/') && file.size > 500 * 1024) { // > 500 KB
            try {
                const compressed = await imageCompression(file, options);
                result.push(new File([compressed], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' }));
            } catch (e) {
                result.push(file); // fallback
            }
        } else {
            result.push(file);
        }
    }
    return result;
};