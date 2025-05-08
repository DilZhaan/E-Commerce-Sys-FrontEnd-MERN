import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Pagination from "../../components/pageProps/shopPage/Pagination";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getShopProducts, searchShopProducts } from "../../services/shopServices";

const Shop = () => {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    searchTerm: "",
    sortBy: "",
    sortOrder: "asc",
    page: 1
  });
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Fetch products whenever filters change
  useEffect(() => {
    fetchShopProducts();
  }, [filters, itemsPerPage]);

  // Function to fetch shop products with filters
  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: filters.page,
        limit: itemsPerPage
      };
      
      if (filters.minPrice) {
        params.minPrice = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice;
      }
      
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
      }
      
      // Make API request
      let response;
      if (filters.searchTerm) {
        response = await searchShopProducts(filters.searchTerm, params);
      } else {
        response = await getShopProducts(params);
      }
      
      // Handle response
      if (response.success) {
        setProducts(response.products || []);
        
        // Update pagination if available
        if (response.pagination) {
          setTotalProducts(response.pagination.total);
        }
      } else {
        setError("Failed to load shop products");
        setProducts([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shop products:", err);
      setError("Failed to load shop products. Please try again later.");
      setProducts([]);
      setLoading(false);
    }
  };

  // Handler for pagination
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  // Handler for search
  const handleSearch = (searchTerm) => {
    setFilters({
      ...filters,
      searchTerm,
      page: 1 // Reset to first page when searching
    });
  };

  // Handler for price range filter
  const handlePriceFilter = (minPrice, maxPrice) => {
    setFilters({
      ...filters,
      minPrice,
      maxPrice,
      page: 1 // Reset to first page when filtering
    });
  };

  // Handler for sort options
  const handleSort = (sortOption) => {
    if (!sortOption) {
      // Reset sort
      setFilters({
        ...filters,
        sortBy: "",
        sortOrder: "asc"
      });
      return;
    }
    
    const [field, order] = sortOption.split('_');
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: order
    });
  };

  const itemsPerPageFromBanner = (items) => {
    setItemsPerPage(items);
    // Reset to page 1 when changing items per page
    setFilters({
      ...filters,
      page: 1
    });
  };

  // Calculate active filters count for mobile UI
  const activeFiltersCount = [
    filters.minPrice, 
    filters.maxPrice
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs title="Shop Products" />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <ShopSideNav 
            onPriceChange={handlePriceFilter}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <ProductBanner 
            itemsPerPageFromBanner={itemsPerPageFromBanner}
            onSortChange={handleSort}
            onSearch={handleSearch}
            searchTerm={filters.searchTerm}
            activeFiltersCount={activeFiltersCount}
          />
          
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
              <button 
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                onClick={fetchShopProducts}
              >
                Retry
              </button>
            </div>
          ) : (
            <Pagination 
              products={products} 
              itemsPerPage={itemsPerPage}
              totalProducts={totalProducts}
              currentPage={filters.page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
