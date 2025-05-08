import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaSearch, FaDownload, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { FiDownload, FiUpload, FiPlus, FiSearch, FiFilter, FiChevronLeft, FiArrowLeft } from "react-icons/fi";

// Add this function to export data to CSV
const exportToCSV = (data, filename) => {
  // Get headers from the first item's keys
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        // Handle special cases for CSV formatting
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        
        // Convert arrays to string
        if (Array.isArray(cell)) {
          cell = cell.join('; ');
        }
        
        // Escape quotes and wrap in quotes if contains commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        
        return cell;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
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

// Add this function to export data to Excel (XLSX)
const exportToExcel = async (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  try {
    // Dynamically import xlsx library
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Items');
    
    // Save workbook to file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. CSV format is still available.');
  }
};

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [allInventoryItems, setAllInventoryItems] = useState([]); // Store all items for export
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    modelName: '',
    purchasedPrice: '0',
    warranty: '0',
    quantity: '0',
    reorderLevel: '5',
    brandName: '',
    supplierName: '',
    supplierContact: '',
    supplierAddress: '',
    billImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // We don't need the categories and types for the new inventory management
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [sortOption, setSortOption] = useState('');

  const API_BASE_URL = 'http://localhost:4000/api/inventory';

  useEffect(() => {
    fetchInventoryItems();
  }, [pagination.page, sortOption]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      if (sortOption) {
        // Handle sort cases for inventory fields
        if (sortOption === 'purchasedPrice-asc' || sortOption === 'purchasedPrice-desc') {
          params.append('sortBy', 'purchasedPrice');
          params.append('sortOrder', sortOption === 'purchasedPrice-asc' ? 'asc' : 'desc');
        } else if (sortOption === 'quantity-asc' || sortOption === 'quantity-desc') {
          params.append('sortBy', 'quantity');
          params.append('sortOrder', sortOption === 'quantity-asc' ? 'asc' : 'desc');
        } else if (sortOption === 'warranty-asc' || sortOption === 'warranty-desc') {
          params.append('sortBy', 'warranty');
          params.append('sortOrder', sortOption === 'warranty-asc' ? 'asc' : 'desc');
        } else if (sortOption === 'modelName-asc' || sortOption === 'modelName-desc') {
          params.append('sortBy', 'modelName');
          params.append('sortOrder', sortOption === 'modelName-asc' ? 'asc' : 'desc');
        } else if (sortOption === 'brandName-asc' || sortOption === 'brandName-desc') {
          params.append('sortBy', 'brandName');
          params.append('sortOrder', sortOption === 'brandName-asc' ? 'asc' : 'desc');
        } else {
          // For other sort options
          const [field, order] = sortOption.split('-');
          params.append('sortBy', field);
          params.append('sortOrder', order);
        }
      }
      
      if (searchTerm) {
        params.append('q', searchTerm);
      }
      
      // Make API request
      const response = await axios.get(
        searchTerm ? `${API_BASE_URL}/search?${params.toString()}` : `${API_BASE_URL}?${params.toString()}`
      );
      
      // Handle empty response - set empty array instead of null
      setInventoryItems(response.data.products || []);
      
      // Update pagination if available
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError("Failed to load inventory items. Please try again later.");
      setInventoryItems([]); // Set empty array when there's an error
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination({
      ...pagination,
      page: 1
    });
    fetchInventoryItems();
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setPagination({
      ...pagination,
      page: 1
    });
    // Use setTimeout to ensure state is updated before fetching
    setTimeout(() => fetchInventoryItems(), 0);
  };
 
  // Function to determine if additional fields should be shown
  const shouldShowSolutionType = () => formData.category === 'Software Solution' || formData.category === 'Hardware Solution';
  const shouldShowDeploymentType = () => formData.category === 'Software Solution';
  const shouldShowSupportLevel = () => formData.category !== 'Training Program';
  const shouldShowLicenseType = () => formData.category === 'Software Solution';

  // Modal functions
  const openAddModal = () => {
    // Reset form to initial state
    setModalOpen(true);
    setSelectedProduct(null);
    setFormData({
      modelName: '',
      purchasedPrice: '0',
      warranty: '0',
      quantity: '0',
      reorderLevel: '5',
      brandName: '',
      supplierName: '',
      supplierContact: '',
      supplierAddress: '',
      billImage: null
    });
    setIsEditing(false);
    setError(null); // Clear any previous errors
  };
  
  const openEditModal = (product) => {
    setFormData({
      modelName: product.modelName || product.name || '',
      purchasedPrice: product.purchasedPrice || product.buyPrice || '',
      warranty: product.warranty || '',
      quantity: product.quantity || 0,
      reorderLevel: product.reorderLevel || 5,
      brandName: product.brandName || '',
      supplierName: product.supplierName || '',
      supplierContact: product.supplierContact || '',
      supplierAddress: product.supplierAddress || '',
      replaceBillImage: false
    });
    setSelectedProduct(product);
    setIsEditing(true);
    setModalOpen(true);
    setError(null); // Clear any previous errors
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null); // Clear errors when closing modal
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Validate fields as user types
    const errors = { ...formErrors };
    
    // Field-specific validations
    if (name === 'supplierName' && /\d/.test(value)) {
      errors.supplierName = "Supplier name cannot contain numbers";
    } else if (name === 'supplierName') {
      delete errors.supplierName;
    }
    
    if (name === 'supplierContact' && !/^\d*$/.test(value)) {
      errors.supplierContact = "Contact number can only contain numeric digits";
    } else if (name === 'supplierContact') {
      delete errors.supplierContact;
    }
    
    setFormErrors(errors);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      // Store the file objects for upload
      setFormData({
        ...formData,
        billImage: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First validate that all required fields are present
      const requiredFields = ['modelName', 'brandName', 'purchasedPrice', 'warranty', 'quantity', 'reorderLevel', 'supplierName', 'supplierContact', 'supplierAddress'];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Validate that supplier name doesn't contain numbers
      if (/\d/.test(formData.supplierName)) {
        setError("Supplier name cannot contain numbers");
        return;
      }
      
      // Validate that contact number only contains numbers
      if (!/^\d+$/.test(formData.supplierContact)) {
        setError("Contact number can only contain numeric digits");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Create form data for file upload
      const inventoryFormData = new FormData();
      
      // Debug log of formData before submission
      console.log("Form data before submission:", formData);
      
      // Add text fields - ensure all required fields are added explicitly
      inventoryFormData.append('modelName', formData.modelName);
      inventoryFormData.append('brandName', formData.brandName);
      inventoryFormData.append('purchasedPrice', formData.purchasedPrice);
      inventoryFormData.append('warranty', formData.warranty);
      inventoryFormData.append('quantity', formData.quantity);
      inventoryFormData.append('reorderLevel', formData.reorderLevel);
      inventoryFormData.append('supplierName', formData.supplierName);
      inventoryFormData.append('supplierContact', formData.supplierContact);
      inventoryFormData.append('supplierAddress', formData.supplierAddress);
      
      // Add any remaining fields
      Object.keys(formData).forEach(key => {
        if (!requiredFields.includes(key) && 
            key !== 'billImage' && 
            key !== 'replaceBillImage' && 
            formData[key] !== undefined) {
          inventoryFormData.append(key, formData[key]);
        }
      });
      
      // Add bill image if available
      if (formData.billImage) {
        inventoryFormData.append('billImage', formData.billImage);
        
        // If replacing image is checked and we're in edit mode, set the flag
        if (isEditing && formData.replaceBillImage) {
          inventoryFormData.append('replaceBillImage', 'true');
        }
      }
      
      // Debug log the formData entries
      for (let pair of inventoryFormData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      let response;
      
      if (isEditing && selectedProduct) {
        // Update existing inventory item
        response = await axios.put(
          `${API_BASE_URL}/${selectedProduct._id}`,
          inventoryFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }
        );
        
        // Update local state
        setInventoryItems(inventoryItems.map(p => 
          p._id === selectedProduct._id ? response.data.product : p
        ));
      } else {
        // Add new inventory item
        response = await axios.post(
          API_BASE_URL,
          inventoryFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }
        );
        
        // Update local state with new item
        setInventoryItems([...inventoryItems, response.data.product]);
      }
      
      setLoading(false);
      closeModal();
      
      // Refetch to ensure data is up to date
      fetchInventoryItems();
    } catch (err) {
      console.error("Error saving inventory item:", err);
      
      // Display more detailed error message if available
      if (err.response?.data?.error) {
        setError(`Failed to save inventory item: ${err.response.data.error}`);
      } else {
        setError(err.response?.data?.message || 'Failed to save inventory item');
      }
      
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${productId}`,
          { withCredentials: true }
        );
        
        // Update local state
        setInventoryItems(inventoryItems.filter(p => p._id !== productId));
        setLoading(false);
      } catch (err) {
        console.error("Error deleting inventory item:", err);
        setError(err.response?.data?.message || 'Failed to delete inventory item');
        setLoading(false);
      }
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Fetch all inventory items for export
  const fetchAllInventoryItems = async () => {
    try {
      setExportLoading(true);
      
      // Make API request with limit=-1 to get all items
      const response = await axios.get(`${API_BASE_URL}?limit=-1`, {
        withCredentials: true
      });

      if (response.data.products) {
        // Process data for export
        const processedData = response.data.products.map(item => ({
          ID: item._id,
          'Model Name': item.modelName || item.name,
          'Brand Name': item.brandName,
          'Purchase Price': item.purchasedPrice || item.buyPrice,
          'Warranty (months)': item.warranty,
          'Quantity': item.quantity,
          'Reorder Level': item.reorderLevel,
          'Supplier Name': item.supplierName,
          'Supplier Contact': item.supplierContact,
          'Supplier Address': item.supplierAddress,
          'Created At': new Date(item.createdAt).toLocaleString(),
          'Updated At': new Date(item.updatedAt).toLocaleString()
        }));
        
        setAllInventoryItems(processedData);
        setExportLoading(false);
        return processedData;
      }
      
      setExportLoading(false);
      return [];
    } catch (err) {
      console.error("Error fetching all inventory items for export:", err);
      setExportLoading(false);
      alert('Failed to fetch inventory items for export. You may not have admin privileges.');
      return [];
    }
  };

  // Export handlers
  const handleExportCSV = async () => {
    const data = await fetchAllInventoryItems();
    if (data.length > 0) {
      exportToCSV(data, `inventory-report-${new Date().toISOString().split('T')[0]}`);
    }
  };
  
  const handleExportExcel = async () => {
    const data = await fetchAllInventoryItems();
    if (data.length > 0) {
      exportToExcel(data, `inventory-report-${new Date().toISOString().split('T')[0]}`);
    }
  };
  
  // Add function to export only the current filtered inventory items
  const exportCurrentItems = (format) => {
    if (!inventoryItems.length) {
      alert('No inventory items to export');
      return;
    }
    
    // Process the current items for export
    const processedData = inventoryItems.map(item => ({
      ID: item._id,
      'Model Name': item.modelName || item.name,
      'Brand Name': item.brandName,
      'Purchase Price': item.purchasedPrice || item.buyPrice,
      'Warranty (months)': item.warranty,
      'Quantity': item.quantity,
      'Reorder Level': item.reorderLevel,
      'Supplier Name': item.supplierName,
      'Supplier Contact': item.supplierContact,
      'Supplier Address': item.supplierAddress,
      'Created At': new Date(item.createdAt).toLocaleString(),
      'Updated At': new Date(item.updatedAt).toLocaleString()
    }));
    
    const filename = `filtered-inventory-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      exportToCSV(processedData, filename);
    } else {
      exportToExcel(processedData, filename);
    }
  };

  // Add a click handler to close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdown when clicking outside
      if (exportDropdownOpen && !event.target.closest('.dropdown')) {
        setExportDropdownOpen(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportDropdownOpen]);

  // Add function to toggle dropdown
  const toggleExportDropdown = () => {
    setExportDropdownOpen(!exportDropdownOpen);
  };

  if (loading && inventoryItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && inventoryItems === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={fetchInventoryItems}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium group"
        >
          <div className="bg-white p-2 rounded-full shadow-md mr-3 group-hover:bg-blue-50 transition-colors duration-200">
            <FiArrowLeft className="text-blue-600" />
          </div>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Inventory Management</h1>
              
              <div className="flex flex-wrap gap-3">
                <div className="dropdown relative">
                  <button
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 border border-white border-opacity-30"
                    disabled={exportLoading}
                    onClick={toggleExportDropdown}
                  >
                    {exportLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <FiDownload className="mr-2" />
                    )}
                    Export
                  </button>
                  <div className={`dropdown-menu absolute right-0 mt-2 bg-white rounded-xl shadow-xl z-10 ${exportDropdownOpen ? '' : 'hidden'} w-52 overflow-hidden border border-gray-100 transform transition-all duration-200`}>
                    <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-800 bg-gray-50">All Inventory Items</div>
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setExportDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center transition-colors duration-150"
                    >
                      <FaFileCsv className="mr-3 text-green-600" /> Export All as CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setExportDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center transition-colors duration-150"
                    >
                      <FaFileExcel className="mr-3 text-green-600" /> Export All as Excel
                    </button>
                    
                    <div className="px-4 py-3 border-b border-t border-gray-100 text-sm font-medium text-gray-800 bg-gray-50">Current View</div>
                    <button
                      onClick={() => {
                        exportCurrentItems('csv');
                        setExportDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center transition-colors duration-150"
                    >
                      <FaFileCsv className="mr-3 text-blue-600" /> Export Filtered as CSV
                    </button>
                    <button
                      onClick={() => {
                        exportCurrentItems('excel');
                        setExportDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center transition-colors duration-150"
                    >
                      <FaFileExcel className="mr-3 text-blue-600" /> Export Filtered as Excel
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={openAddModal}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 border border-white border-opacity-30"
                  disabled={loading}
                >
                  <FiPlus className="mr-2" /> Add Inventory Item
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Product Search and Filters */}
            <div className="mb-8 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search by model name, brand, or supplier..."
                        className="w-full p-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                      />
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                    </div>
                    {searchTerm && (
                      <button 
                        type="button"
                        onClick={clearSearch}
                        className="ml-2 bg-gray-200 hover:bg-gray-300 p-3 rounded-xl flex items-center text-gray-600"
                        title="Clear search"
                        disabled={loading}
                      >
                        ×
                      </button>
                    )}
                  </form>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="relative">
                    <select 
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Sort by</option>
                      <option value="modelName-asc">Model Name: A to Z</option>
                      <option value="modelName-desc">Model Name: Z to A</option>
                      <option value="brandName-asc">Brand: A to Z</option>
                      <option value="brandName-desc">Brand: Z to A</option>
                      <option value="purchasedPrice-asc">Purchase Price: Low to High</option>
                      <option value="purchasedPrice-desc">Purchase Price: High to Low</option>
                      <option value="quantity-asc">Quantity: Low to High</option>
                      <option value="quantity-desc">Quantity: High to Low</option>
                      <option value="warranty-asc">Warranty: Low to High</option>
                      <option value="warranty-desc">Warranty: High to Low</option>
                    </select>
                    <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Table */}
            <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-white backdrop-blur-sm bg-opacity-90">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider w-24">Image</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider w-32">Brand</th>
                      <th className="py-4 px-6 text-right font-medium text-gray-500 uppercase tracking-wider w-24">Purchase Price</th>
                      <th className="py-4 px-6 text-right font-medium text-gray-500 uppercase tracking-wider w-24">Warranty</th>
                      <th className="py-4 px-6 text-right font-medium text-gray-500 uppercase tracking-wider w-24">Quantity</th>
                      <th className="py-4 px-6 text-center font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.length > 0 ? (
                      inventoryItems.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150">
                          <td className="py-4 px-6 text-left">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                              <img
                                src={item.billImage 
                                  ? `http://localhost:4000/${item.billImage}` 
                                  : "https://via.placeholder.com/150"}
                                alt={item.modelName || "Bill Image"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-left">
                            <div className="font-medium text-gray-800">{item.modelName || item.name}</div>
                            <div className="text-xs text-gray-500">
                              Supplier: {item.supplierName || 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-left">
                            <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-medium">
                              {item.brandName || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-medium">${item.purchasedPrice ? item.purchasedPrice.toFixed(2) : (item.buyPrice ? item.buyPrice.toFixed(2) : '0.00')}</td>
                          <td className="py-4 px-6 text-right font-medium">{item.warranty || 'N/A'} {item.warranty ? 'months' : ''}</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`py-1 px-3 rounded-full text-xs font-medium ${
                              item.quantity <= (item.reorderLevel || 5)
                                ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700"
                                : "bg-gradient-to-r from-green-50 to-green-100 text-green-700"
                            }`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                title="Edit"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                title="Delete"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-gray-500">
                          {loading ? (
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                          ) : (
                            "No inventory items found. Try a different search or add a new item."
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {inventoryItems.length > 0 && pagination.total > 0 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> of{" "}
                        <span className="font-medium">{pagination.total}</span> products
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border ${
                            pagination.page === 1 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50'
                          }`}
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <span className="sr-only">Previous</span>
                          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(Math.min(pagination.pages, 5)).keys()].map(pageNum => {
                          // Calculate the actual page number, handling cases where we're showing a window of pages
                          let actualPageNum = pageNum + 1;
                          if (pagination.pages > 5 && pagination.page > 3) {
                            actualPageNum = Math.min(pagination.page - 2 + pageNum, pagination.pages);
                          }
                          
                          return (
                            <button 
                              key={actualPageNum}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.page === actualPageNum 
                                  ? 'z-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 text-blue-600' 
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                              onClick={() => handlePageChange(actualPageNum)}
                            >
                              {actualPageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border ${
                            pagination.page === pagination.pages 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50'
                          }`}
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p>{error}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Product Model Name</label>
                    <input
                      type="text"
                      name="modelName"
                      value={formData.modelName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Brand Name</label>
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Purchased Price ($)</label>
                    <input
                      type="number"
                      name="purchasedPrice"
                      step="0.01"
                      min="0"
                      value={formData.purchasedPrice}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Warranty (months)</label>
                    <input
                      type="number"
                      name="warranty"
                      min="0"
                      value={formData.warranty}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Supplier Name</label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    className={`w-full p-3 border ${formErrors.supplierName ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {formErrors.supplierName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.supplierName}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Supplier name should not contain any numbers</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Supplier Contact Number</label>
                  <input
                    type="text"
                    name="supplierContact"
                    value={formData.supplierContact}
                    onChange={handleChange}
                    className={`w-full p-3 border ${formErrors.supplierContact ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {formErrors.supplierContact && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.supplierContact}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Contact number should only contain digits (0-9)</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Supplier Address</label>
                  <textarea
                    name="supplierAddress"
                    value={formData.supplierAddress}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Bill Image</label>
                  <input
                    type="file"
                    name="billImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isEditing && (
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="replaceBillImage"
                          checked={formData.replaceBillImage}
                          onChange={(e) => setFormData({...formData, replaceBillImage: e.target.checked})}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">Replace existing bill image</span>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement; 