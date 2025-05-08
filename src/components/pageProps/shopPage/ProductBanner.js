import React, { useEffect, useState, useRef } from "react";
import { BsGridFill } from "react-icons/bs";
import { ImList } from "react-icons/im";
import { FaSearch, FaFilter } from "react-icons/fa";

const ProductBanner = ({ itemsPerPageFromBanner, onSortChange, onSearch, searchTerm = '', activeFiltersCount = 0 }) => {
  const [girdViewActive, setGridViewActive] = useState(true);
  const [listViewActive, setListViewActive] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const gridViewRef = useRef(null);
  const listViewRef = useRef(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const gridView = gridViewRef.current;
    const listView = listViewRef.current;

    if (gridView && listView) {
      const handleGridViewClick = () => {
        setListViewActive(false);
        setGridViewActive(true);
      };

      const handleListViewClick = () => {
        setGridViewActive(false);
        setListViewActive(true);
      };

      gridView.addEventListener("click", handleGridViewClick);
      listView.addEventListener("click", handleListViewClick);

      return () => {
        gridView.removeEventListener("click", handleGridViewClick);
        listView.removeEventListener("click", handleListViewClick);
      };
    }
  }, []);

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSubmitSearch} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 pl-10 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaSearch />
          </button>
          {localSearchTerm && (
            <button 
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ×
            </button>
          )}
        </form>
      </div>
    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Toggle and Mobile Filter */}
        <div className="flex items-center gap-2">
          <button
            ref={gridViewRef}
            className={`p-2 rounded-lg transition-colors ${
              girdViewActive
                ? "bg-blue-500 text-white"
                : "border border-gray-200 text-gray-400 hover:border-gray-300"
            }`}
            title="Grid View"
          >
            <BsGridFill className="w-4 h-4" />
          </button>
          <button
            ref={listViewRef}
            className={`p-2 rounded-lg transition-colors ${
              listViewActive
                ? "bg-blue-500 text-white"
                : "border border-gray-200 text-gray-400 hover:border-gray-300"
            }`}
            title="List View"
          >
            <ImList className="w-4 h-4" />
          </button>
          
          {/* Mobile filter button */}
          <button 
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Sort and Show Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              onChange={handleSortChange}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Default</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="quantity_asc">Stock (Low to High)</option>
              <option value="quantity_desc">Stock (High to Low)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              onChange={(e) => itemsPerPageFromBanner(+e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Mobile filters panel */}
      {showMobileFilters && (
        <div className="lg:hidden bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Filters</h3>
          <p className="text-sm text-gray-500">Please use full site for filtering options.</p>
        </div>
      )}
    </div>
  );
};

export default ProductBanner;
