// stringUtils.js

/**
 * Formats a string safely:
 * - Replaces underscores with spaces
 * - Converts to lowercase
 * - Capitalizes the first letter of each word
 * 
 * @param {string} str The string to format
 * @returns {string} Formatted string
 */
function formatLabel(str) {
    if (!str) return ''; // safe handling of null/undefined
    return str
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Export the function for use in other files
module.exports = { formatLabel };
