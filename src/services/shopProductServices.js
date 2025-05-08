import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_BASE_URL = `${BASE_URL}/api/shop-products`;

// Get all products with pagination, sorting, and filtering
export const getAllShopProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list`, { 
      params,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop products:', error);
    throw error;
  }
};

// Search products
export const searchShopProducts = async (searchTerm, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, { 
      params: { q: searchTerm, ...params },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error searching shop products:', error);
    throw error;
  }
};

// Get product by ID
export const getShopProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/detail/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching shop product with ID ${id}:`, error);
    throw error;
  }
};

// Get inventory items for dropdown
export const getInventoryForDropdown = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory-dropdown`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory items for dropdown:', error);
    throw error;
  }
};

// Add a new shop product
export const addShopProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Add basic product data
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add images if present
    if (productData.images && productData.images.length > 0) {
      console.log(`Adding ${productData.images.length} images to formData`);
      
      // Deduplicate files to prevent multiple uploads of the same file
      const fileNames = new Set();
      const uniqueFiles = [];
      
      // Log more details about the files
      productData.images.forEach((image, index) => {
        if (image instanceof File) {
          // Check if we've already added this file name
          if (fileNames.has(image.name)) {
            console.log(`Skipping duplicate file: ${image.name}`);
            return; // Skip to next iteration
          }
          
          // Track unique files
          fileNames.add(image.name);
          uniqueFiles.push(image);
          
          console.log(`Image ${index}: File: ${image.name}, Type: ${image.type}, Size: ${image.size} bytes`);
          
          // Check if the image is valid
          if (image.size === 0) {
            console.warn(`Image ${index} (${image.name}) has zero size, may be corrupted`);
          }
        } else {
          console.error(`Image ${index} is not a File object:`, typeof image, image);
        }
      });
      
      console.log(`Found ${uniqueFiles.length} unique files after deduplication`);
      
      // Append only unique files to FormData
      uniqueFiles.forEach(image => {
        // CRITICAL: The key name 'images' is what the server will look for
        // Make sure we're appending with the correct field name
        formData.append('images', image, image.name);
        console.log(`Appended file to FormData with key 'images': ${image.name}`);
      });
    } else {
      console.log('No images to add to formData');
    }
    
    // Dump the raw FormData entries to debug
    console.log("FormData entries:");
    let imageCount = 0;
    for (let pair of formData.entries()) {
      if (pair[0] === 'images') {
        imageCount++;
        const file = pair[1];
        console.log(`images[${imageCount-1}] ->`, file instanceof File ? `File: ${file.name}, Size: ${file.size} bytes` : 'Not a file');
      } else {
        console.log(pair[0], '->', pair[1]);
      }
    }
    
    if (productData.images && productData.images.length > 0 && imageCount === 0) {
      console.error("WARNING: Images were supposed to be added but weren't found in FormData");
    }
    
    // Make request with proper debugging
    try {
      console.log("Sending request to:", `${API_BASE_URL}/add`);
      
      // Important: DO NOT manually set Content-Type for multipart/form-data
      // Let the browser handle this with the correct boundary
      const response = await axios.post(`${API_BASE_URL}/add`, formData, {
        withCredentials: true
      });
      
      return response.data;
    } catch (requestError) {
      console.error("Request error:", requestError.message);
      if (requestError.response) {
        console.error("Response status:", requestError.response.status);
        console.error("Response data:", requestError.response.data);
      }
      throw requestError;
    }
  } catch (error) {
    console.error('Error adding shop product:', error);
    // Log more detailed information about the error
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// Update an existing shop product
export const updateShopProduct = async (id, productData, replaceImages = false) => {
  try {
    const formData = new FormData();
    
    // Add basic product data
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add flag to indicate if we should replace all images
    formData.append('replaceImages', replaceImages);
    
    // Add images if present
    if (productData.images && productData.images.length > 0) {
      console.log(`Adding ${productData.images.length} images to formData`);
      
      // Deduplicate files to prevent multiple uploads of the same file
      const fileNames = new Set();
      const uniqueFiles = [];
      
      // Track unique files
      productData.images.forEach(image => {
        if (image instanceof File) {
          if (fileNames.has(image.name)) {
            console.log(`Skipping duplicate file: ${image.name}`);
          } else {
            fileNames.add(image.name);
            uniqueFiles.push(image);
            console.log(`Adding unique file: ${image.name} (${image.size} bytes)`);
          }
        } else {
          console.error(`Image is not a File object:`, typeof image, image);
        }
      });
      
      console.log(`Found ${uniqueFiles.length} unique files after deduplication`);
      
      // Append only unique files to FormData
      uniqueFiles.forEach(image => {
        formData.append('images', image, image.name);
      });
    }
    
    console.log("Updating product with ID:", id, "replaceImages:", replaceImages);
    
    // Make request with proper debugging
    try {
      console.log("Sending request to:", `${API_BASE_URL}/update/${id}`);
      
      // Important: DO NOT manually set Content-Type for multipart/form-data
      // Let the browser handle this with the correct boundary
      const response = await axios.put(`${API_BASE_URL}/update/${id}`, formData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log("Product update successful:", response.data.message);
      } else {
        console.error("Product update failed:", response.data.message);
      }
      
      return response.data;
    } catch (requestError) {
      console.error("Request error:", requestError.message);
      if (requestError.response) {
        console.error("Response status:", requestError.response.status);
        console.error("Response data:", requestError.response.data);
      }
      throw requestError;
    }
  } catch (error) {
    console.error(`Error updating shop product with ID ${id}:`, error);
    // Log more detailed information about the error
    console.error("Error details:", {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response',
      request: error.request ? 'Request was made but no response received' : 'No request'
    });
    throw error;
  }
};

// Delete a shop product
export const deleteShopProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting shop product with ID ${id}:`, error);
    throw error;
  }
};

// Toggle product active status
export const toggleProductActive = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/toggle-active/${id}`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error toggling active status for product with ID ${id}:`, error);
    throw error;
  }
}; 