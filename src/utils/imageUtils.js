/**
 * Gets the display URL for an image, handling both Cloudinary and local storage formats
 * @param {string|object|array} image - The image data from the API
 * @param {string} defaultImage - Optional default image URL if no image is provided
 * @returns {string} The URL to display the image
 */
export const getImageUrl = (image, defaultImage = 'https://via.placeholder.com/400') => {
  // If image is an array, use the first image
  if (Array.isArray(image)) {
    image = image[0];
  }

  // If no image provided, return default
  if (!image) {
    return defaultImage;
  }

  // Handle Cloudinary object format
  if (typeof image === 'object' && image.url) {
    return image.url;
  }

  // Handle string format (could be Cloudinary URL or local path)
  if (typeof image === 'string') {
    // If it's already a full URL, return it
    if (image.startsWith('http')) {
      return image;
    }
    // Otherwise, assume it's a local path and prepend the API URL
    return `${process.env.REACT_APP_API_URL}/${image}`;
  }

  return defaultImage;
};

/**
 * Gets display URLs for multiple images
 * @param {Array} images - Array of image data
 * @param {string} defaultImage - Optional default image URL if no images are provided
 * @returns {Array<string>} Array of image URLs
 */
export const getImageUrls = (images, defaultImage = 'https://via.placeholder.com/400') => {
  if (!Array.isArray(images) || images.length === 0) {
    return [defaultImage];
  }

  return images.map(image => getImageUrl(image, defaultImage));
}; 