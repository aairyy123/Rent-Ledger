// src/utils/imageUtils.js
/**
 * Converts a File object to a Base64 string.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Returns a safe image URL, handling potential base64 or blob URL issues.
 * @param {string} url 
 * @returns {string}
 */
export const getSafeImageUrl = (url) => {
    // Check for base64, blob, or http URL. Use placeholder if invalid.
    if (url && (url.startsWith('data:image/') || url.startsWith('blob:') || url.startsWith('http'))) {
        return url;
    }
    // Fallback to a generic placeholder image
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
};

export default { convertFileToBase64, getSafeImageUrl };