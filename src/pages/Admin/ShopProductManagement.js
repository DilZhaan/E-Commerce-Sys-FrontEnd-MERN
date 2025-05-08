import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { FiDownload, FiPlus, FiArrowLeft } from "react-icons/fi";
import {
  getAllShopProducts,
  searchShopProducts,
  getInventoryForDropdown,
  addShopProduct,
  updateShopProduct,
  deleteShopProduct,
  toggleProductActive
} from '../../services/shopProductServices';

// Base URL for API
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// CSV Export function
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        
        if (Array.isArray(cell)) {
          cell = cell.join('; ');
        }
        
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        
        return cell;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ShopProductManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    inventoryItem: '',
    salePrice: '',
    discount: 0,
    description: '',
    shopWarranty: 0,
    images: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (sortOption) {
        const [field, order] = sortOption.split('-');
        params.sortBy = field;
        params.sortOrder = order;
      }
      
      // Make API request - only use getAllShopProducts regardless of search
      const response = await getAllShopProducts(params);
      
      if (response.success) {
        const allProducts = response.products || [];
        setProducts(allProducts);
        
        // Apply frontend filtering if there's a search query
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const results = allProducts.filter(
            (product) => 
              product.name.toLowerCase().includes(query) || 
              product.description.toLowerCase().includes(query) ||
              product.inventoryItem?.modelName?.toLowerCase().includes(query) ||
              product.inventoryItem?.brandName?.toLowerCase().includes(query) ||
              formatCurrency(product.salePrice).toLowerCase().includes(query)
          );
          setFilteredProducts(results);
        } else {
          setFilteredProducts(allProducts);
        }
        
        // Update pagination if available
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError("Failed to load products. Please try again later.");
        setProducts([]);
        setFilteredProducts([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      setError(null);
      const response = await getInventoryForDropdown();
      if (response.success) {
        setInventoryItems(response.inventoryItems || []);
      } else {
        setError(response.message || "Failed to load inventory items");
        console.error("Failed to load inventory items:", response.message);
      }
    } catch (err) {
      console.error("Error fetching inventory items:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to load inventory items. Authentication may be required.");
      
      // If it's an authentication error, show a specific message
      if (err.response?.status === 401) {
        setError("Authentication required. Please ensure you're logged in as an admin.");
      }
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredProducts([...products]);
    } else {
      const results = products.filter(
        (product) => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.inventoryItem?.modelName?.toLowerCase().includes(query) ||
          product.inventoryItem?.brandName?.toLowerCase().includes(query) ||
          formatCurrency(product.salePrice).toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    }
    
    // Reset to first page when searching
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProducts([...products]);
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Open modal for adding new product
  const openAddModal = () => {
    setFormData({
      name: '',
      inventoryItem: '',
      salePrice: '',
      discount: 0,
      description: '',
      shopWarranty: 0,
      images: []
    });
    setImagePreview([]);
    setIsEditing(false);
    setError(null);
    setModalOpen(true);
    
    // Fetch inventory items
    fetchInventoryItems().catch(error => {
      console.error("Failed to fetch inventory items:", error);
      setError("Failed to load inventory items. Please make sure you've added inventory items first.");
    });
  };

  // Open modal for editing product
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      inventoryItem: product.inventoryItem._id,
      salePrice: product.salePrice,
      discount: product.discount,
      description: product.description,
      shopWarranty: product.shopWarranty,
      images: []
    });
    
    // Set image previews for existing images
    const imagePreviews = product.images.map(img => ({
      url: `${BASE_URL}/${img}`,
      isExisting: true,
      path: img
    }));
    setImagePreview(imagePreviews);
    
    setIsEditing(true);
    setModalOpen(true);
    fetchInventoryItems();
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setImagePreview([]);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  // Handle file/image selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    console.log("Selected files:", files.map(f => `${f.name} (${f.size} bytes, type: ${f.type})`));
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        console.error(`File ${file.name} is not an image`);
        setError(`File ${file.name} is not an image. Only image files are allowed.`);
        return false;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error(`File ${file.name} is too large (${file.size} bytes)`);
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      // Check if file is empty
      if (file.size === 0) {
        console.error(`File ${file.name} is empty`);
        setError(`File ${file.name} is empty and cannot be uploaded.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) {
      console.error("No valid files selected");
      if (!error) setError("No valid files were selected. Please select valid image files.");
      return;
    }
    
    // Create fresh copies of the file objects to avoid potential reference issues
    const fileCopies = validFiles.map(file => {
      // Create a new File object with the same data
      try {
        const fileSlice = file.slice(0, file.size, file.type);
        return new File([fileSlice], file.name, { type: file.type });
      } catch (err) {
        console.error("Error creating file copy:", err);
        return file; // Fall back to original if copy fails
      }
    });
    
    // Add to form data
    setFormData(prevFormData => {
      console.log("Adding files to formData.images:", 
        "Current count:", prevFormData.images.length,
        "Adding count:", fileCopies.length);
      
      // Implement deduplication mechanism
      const existingFileNames = new Set();
      const uniqueFiles = [];
      
      // Track existing file names
      prevFormData.images.forEach(existingFile => {
        existingFileNames.add(existingFile.name);
      });
      
      // Filter out duplicates
      fileCopies.forEach(file => {
        if (existingFileNames.has(file.name)) {
          console.log(`Skipping duplicate file: ${file.name}`);
        } else {
          existingFileNames.add(file.name);
          uniqueFiles.push(file);
          console.log(`Adding unique file: ${file.name} (${file.size} bytes)`);
        }
      });
      
      console.log(`After deduplication: ${uniqueFiles.length} new unique files will be added`);
      
      return {
        ...prevFormData,
        images: [...prevFormData.images, ...uniqueFiles]
      };
    });
    
    // Create image previews (only for unique files)
    setImagePreview(prevPreviews => {
      // Track existing preview file names
      const existingPreviewNames = new Set();
      prevPreviews.forEach(preview => {
        if (preview.file) {
          existingPreviewNames.add(preview.file.name);
        }
      });
      
      // Only create previews for non-duplicate files
      const newPreviews = fileCopies
        .filter(file => !existingPreviewNames.has(file.name))
        .map(file => ({
          url: URL.createObjectURL(file),
          isExisting: false,
          file
        }));
      
      return [...prevPreviews, ...newPreviews];
    });
  };

  // Image upload component
  const ImageUploader = () => (
    <div className="mt-2">
      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors py-2 px-4 rounded-md inline-block">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          // Important: Clear the value to allow selecting the same file again
          onClick={(e) => e.target.value = null}
        />
        Upload Images
      </label>
      <span className="text-xs text-gray-500 ml-2">
        {isEditing && imagePreview.some(img => img.isExisting) 
          ? "(New images will replace existing ones)" 
          : ""}
      </span>
    </div>
  );

  // Remove image from preview
  const removeImage = (index) => {
    const isExistingImage = imagePreview[index].isExisting;
    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
    
    // If it's not an existing image, also remove from formData
    if (!isExistingImage) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData({
        ...formData,
        images: newImages
      });
    } 
    // If it is an existing image, we need to make sure it gets removed on the server
    // This is handled by the replaceImages flag in handleSubmit
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.salePrice || !formData.description) {
        setError("Please fill in all required fields (name, price, description)");
        return;
      }
      
      // Specifically validate inventory item
      if (!formData.inventoryItem) {
        setError("Please select an inventory item. If no items are available, you need to add inventory items first.");
        return;
      }
      
      // Validate product name
      if (formData.name.trim().length < 3) {
        setError("Product name must be at least 3 characters long");
        return;
      }
      
      // Validate sale price
      if (isNaN(formData.salePrice) || formData.salePrice <= 0) {
        setError("Sale price must be a positive number");
        return;
      }
      
      // Validate discount
      if (formData.discount && (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100)) {
        setError("Discount must be a number between 0 and 100");
        return;
      }
      
      // Validate shop warranty
      if (formData.shopWarranty && (isNaN(formData.shopWarranty) || formData.shopWarranty < 0)) {
        setError("Shop warranty must be a positive number");
        return;
      }
      
      // Validate description length
      if (formData.description.trim().length < 10) {
        setError("Description must be at least 10 characters long");
        return;
      }
      
      // Make a copy of form data to ensure we can modify it safely
      const submissionData = {...formData};
      
      // Verify images array contains valid File objects
      if (submissionData.images && submissionData.images.length > 0) {
        console.log("Image types check:", submissionData.images.map(img => 
          img instanceof File ? `File: ${img.name}, Size: ${img.size}` : `Not a File: ${typeof img}`
        ));
        
        // Filter out any non-File objects (could happen due to state issues)
        const validImages = submissionData.images.filter(img => img instanceof File && img.size > 0);
        if (validImages.length !== submissionData.images.length) {
          console.warn(`Filtered out ${submissionData.images.length - validImages.length} invalid images`);
          submissionData.images = validImages;
        }
      }
      
      console.log("Form data before submission:", {
        ...submissionData,
        images: submissionData.images ? `${submissionData.images.length} images` : 'no images'
      });
      
      setError(null);
      setLoading(true);
      
      if (isEditing) {
        // Determine if we're replacing all images
        // Check if any images were added or if the number of existing images has changed
        const existingImageCount = selectedProduct.images.length;
        const currentExistingImageCount = imagePreview.filter(img => img.isExisting).length;
        const hasNewImages = submissionData.images && submissionData.images.length > 0;
        const replaceImages = hasNewImages || (currentExistingImageCount !== existingImageCount);
        
        console.log("Image update info:", {
          existingImageCount,
          currentExistingImageCount,
          hasNewImages,
          replaceImages,
          imageCount: submissionData.images ? submissionData.images.length : 0
        });
        
        const response = await updateShopProduct(selectedProduct._id, submissionData, replaceImages);
        setLoading(false);
        if (response.success) {
          closeModal();
          fetchProducts();
        } else {
          setError(response.message || "Failed to update product. Please try again.");
        }
      } else {
        const response = await addShopProduct(submissionData);
        setLoading(false);
        if (response.success) {
          closeModal();
          fetchProducts();
        } else {
          setError(response.message || "Failed to add product. Please try again.");
        }
      }
    } catch (err) {
      setLoading(false);
      console.error("Error saving product:", err);
      const errorMessage = err.response?.data?.message || "Failed to save product. Please try again.";
      setError(errorMessage);
    }
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const response = await deleteShopProduct(productId);
        if (response.success) {
          fetchProducts();
        } else {
          setError("Failed to delete product. Please try again.");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product. Please try again.");
      }
    }
  };

  // Handle toggling product active status
  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const response = await toggleProductActive(productId);
      if (response.success) {
        // Update the product in the list
        const updatedProducts = products.map(product => 
          product._id === productId 
            ? { ...product, active: !currentStatus } 
            : product
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      } else {
        setError("Failed to update product status. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
      setError("Failed to update product status. Please try again.");
    }
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  // Export current products to CSV
  const handleExportCSV = () => {
    const dataToExport = filteredProducts.map(product => ({
      ID: product._id,
      Name: product.name,
      InventoryItem: product.inventoryItem?.modelName || '',
      Brand: product.inventoryItem?.brandName || '',
      SalePrice: product.salePrice,
      Discount: product.discount,
      NetPrice: product.salePrice - (product.salePrice * product.discount / 100),
      ShopWarranty: `${product.shopWarranty} months`,
      Status: product.active ? 'Active' : 'Inactive',
      CreatedAt: new Date(product.createdAt).toLocaleDateString(),
      UpdatedAt: new Date(product.updatedAt).toLocaleDateString()
    }));
    
    exportToCSV(dataToExport, 'shop_products');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <FiArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Shop Product Management</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        {/* Search */}
        <div className="w-full md:w-1/3">
          <div className="flex justify-between mb-4">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-2 border rounded"
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            <FiPlus />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-10 w-10 object-cover rounded-md"
                              src={`${BASE_URL}/${product.images[0]}`}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.inventoryItem?.brandName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.salePrice)}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-green-600">{product.discount}% off</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.inventoryItem?.modelName}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.inventoryItem?.quantity || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleActive(product._id, product.active)}
                          className={`text-gray-600 hover:text-gray-900 ${product.active ? 'text-green-500' : 'text-red-500'}`}
                          title={product.active ? 'Deactivate' : 'Activate'}
                        >
                          {product.active ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Prev
            </button>
            
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-1 rounded ${
                pagination.page === pagination.pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Inventory Item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Inventory Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="inventoryItem"
                      value={formData.inventoryItem}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select an inventory item</option>
                      {inventoryItems.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.modelName} ({item.brandName}) - Stock: {item.quantity}
                        </option>
                      ))}
                    </select>
                    {inventoryItems.length === 0 && (
                      <p className="mt-1 text-sm text-red-500">
                        No inventory items available. You need to add inventory items first in the Inventory Management section.
                      </p>
                    )}
                  </div>
                  
                  {/* Price Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sale Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Shop Warranty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shop Warranty (months)
                    </label>
                    <input
                      type="number"
                      name="shopWarranty"
                      value={formData.shopWarranty}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    
                    {/* Image Preview */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview.url}
                              alt={`Preview ${index}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                              disabled={loading}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Image Upload */}
                    <ImageUploader />
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mr-3 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        isEditing ? 'Update Product' : 'Add Product'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProductManagement; 