import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart, FaTachometerAlt, FaClipboardList, FaCreditCard, FaColumns, FaDownload, FaUserCog, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import Flex from "../../designLayouts/Flex";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { clearCartSuccess } from "../../../redux/orebiSlice";
import axios from "axios";

const HeaderBottom = () => {
  const { cartItems, cartTotalQuantity } = useSelector((state) => state.orebiReducer);
  const [show, setShow] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const userRef = useRef();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      if (ref.current && ref.current.contains(e.target)) {
        setShow(true);
      } else {
        setShow(false);
      }
    });

    return () => {
      document.body.removeEventListener("click", (e) => {
        if (ref.current && ref.current.contains(e.target)) {
          setShow(true);
        } else {
          setShow(false);
        }
      });
    };
  }, [show, ref]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUser(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [userRef]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        
        axios.get(`${process.env.REACT_APP_API_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}`)
          .then(response => {
            setSearchResults(response.data.products);
            setIsSearching(false);
          })
          .catch(error => {
            console.error("Search error:", error);
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartSuccess());
  };

  // Enhanced dropdown positioning with boundary detection
  const getDropdownClasses = () => {
    const baseClasses = `
      absolute top-full mt-2 z-50 bg-white text-gray-700 
      rounded-lg shadow-xl border border-gray-100
      transform origin-top max-h-[80vh] overflow-y-auto
      backdrop-blur-sm bg-white/95
    `;
    
    // Dynamic positioning based on screen size and available space
    if (windowWidth < 640) {
      // Mobile: Full width dropdown with proper margins
      return `${baseClasses} 
        left-1/2 transform -translate-x-1/2
        w-[calc(100vw-2rem)] max-w-xs
        before:content-[''] before:absolute before:-top-1 
        before:left-1/2 before:transform before:-translate-x-1/2
        before:w-3 before:h-3 before:bg-white before:rotate-45 
        before:border-l before:border-t before:border-gray-100
      `;
    } else if (windowWidth < 768) {
      // Tablet: Right aligned with boundary check
      return `${baseClasses} 
        right-0 w-64
        before:content-[''] before:absolute before:-top-1 before:right-4
        before:w-3 before:h-3 before:bg-white before:rotate-45 
        before:border-l before:border-t before:border-gray-100
      `;
    } else {
      // Desktop: Normal positioning
      return `${baseClasses} 
        right-0 w-72
        before:content-[''] before:absolute before:-top-1 before:right-6
        before:w-3 before:h-3 before:bg-white before:rotate-45 
        before:border-l before:border-t before:border-gray-100
      `;
    }
  };

  // Enhanced menu item component for better consistency
  const MenuItem = ({ to, icon: Icon, label, onClick, isLogout = false, children }) => {
    const content = (
      <li 
        onClick={onClick}
        className={`
          flex items-center gap-3 px-4 py-3 
          transition-all duration-200 cursor-pointer rounded-lg mx-2
          ${isLogout 
            ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
          }
          ${windowWidth < 640 ? 'text-sm' : 'text-base'}
        `}
      >
        <Icon className={`flex-shrink-0 ${windowWidth < 640 ? 'text-base' : 'text-lg'}`} />
        <span className="truncate font-medium">{label}</span>
        {children}
      </li>
    );

    return to ? <Link to={to}>{content}</Link> : content;
  };

  console.log("Auth state:", { isAuthenticated, user });

  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 relative border-b border-gray-200">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
        
          {/* Enhanced Search Bar */}
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-gray-700 bg-white flex items-center gap-2 justify-between px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-400 focus-within:shadow-md">
            <input
              className="flex-1 h-full outline-none placeholder:text-gray-400 placeholder:text-[14px] bg-transparent text-gray-700"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5 text-blue-500" />
            
            {/* Enhanced Search Results */}
            {searchQuery && (
              <div className="w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-lg scrollbar-hide cursor-pointer border border-gray-200 rounded-xl">
                {isSearching ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      onClick={() => {
                        navigate(`/product/${item._id}`, {
                          state: { item: item }
                        });
                        setShowSearchBar(true);
                        setSearchQuery("");
                      }}
                      key={item._id}
                      className="max-w-[600px] h-28 bg-gray-50 mb-2 mx-2 rounded-lg flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 border border-transparent"
                    >
                      <img 
                        className="w-20 h-20 object-contain p-2 rounded-lg bg-white ml-2" 
                        src={item.images && item.images.length > 0 ? `${process.env.REACT_APP_API_URL}/`+item.images[0] : "/images/no-image.png"} 
                        alt={item.name} 
                      />
                      <div className="flex flex-col gap-1 pr-2">
                        <p className="font-semibold text-lg text-gray-700 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price:{" "}
                          <span className="text-blue-600 font-semibold">
                            ${item.price}
                          </span>
                          {item.discount > 0 && (
                            <span className="ml-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
                              {item.discount}% off
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center h-20 text-gray-500">
                    <FaSearch className="text-2xl mb-2 opacity-50" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Enhanced User menu and cart */}
          <div className="flex gap-6 mt-4 lg:mt-0 items-center pr-2 sm:pr-6 relative">
            {/* Quick Checkout Button */}
            {isAuthenticated && cartItems.length > 0 && (
              <Link to="/checkout">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md" title="Quick Checkout">
                  <FaCreditCard className="text-sm" />
                  {windowWidth >= 640 && <span className="text-sm font-medium">Checkout</span>}
                </div>
              </Link>
            )}
            
            {/* Enhanced User Dropdown */}
            <div 
              ref={userRef}
              onClick={() => setShowUser(!showUser)} 
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 relative cursor-pointer group"
            >
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 text-sm" />
                </div>
                {windowWidth >= 768 && isAuthenticated && (
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user?.email?.split('@')[0]}
                  </span>
                )}
                <FaCaretDown className={`text-sm transition-transform duration-300 ${showUser ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {/* Enhanced Dropdown Menu */}
            {showUser && (
              <motion.div
                initial={{ y: -10, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={getDropdownClasses()}
              >
                <ul className="py-2">
                  {isAuthenticated ? (
                    <>
                      {/* User Info Header */}
                      <li className="px-4 py-3 border-b border-gray-100 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-sm" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {user?.email}
                            </span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block w-fit">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </li>

                      <MenuItem to="/dashboard" icon={FaTachometerAlt} label="Dashboard" />
                      <MenuItem to="/dashboard/orders" icon={FaClipboardList} label="My Orders" />
                      <MenuItem to="/dashboard/payments" icon={FaDownload} label="My Receipts" />
                      <MenuItem to="/profile" icon={FaUserCog} label="Profile Settings" />
                      
                      {cartItems.length > 0 && (
                        <MenuItem to="/checkout" icon={FaCreditCard} label="Checkout">
                          <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {cartTotalQuantity}
                          </span>
                        </MenuItem>
                      )}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <MenuItem 
                          icon={FaSignOutAlt} 
                          label="Logout" 
                          onClick={handleLogout}
                          isLogout={true}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <MenuItem to="/signin" icon={FaSignOutAlt} label="Sign In" />
                      <MenuItem to="/signup" icon={FaUserCog} label="Sign Up" />
                    </>
                  )}
                </ul>
              </motion.div>
            )}
            
            {/* Enhanced Cart Icon */}
            <Link to="/cart">
              <div className="relative group">
                <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300">
                  <FaShoppingCart className="text-lg text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                </div>
                {isAuthenticated && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold shadow-md animate-pulse">
                    {cartTotalQuantity > 99 ? '99+' : cartTotalQuantity}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;