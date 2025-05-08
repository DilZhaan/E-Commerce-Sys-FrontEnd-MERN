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
  
  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      if (ref.current && ref.current.contains(e.target)) {
        setShow(true);
      } else {
        setShow(false);
      }
    });

    // Cleanup event listener on component unmount
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

  // Add click outside handler for user dropdown
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

  // Use backend search API
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search?q=${encodeURIComponent(searchQuery)}`)
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
    }, 500); // Debounce search requests
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartSuccess());
  };

  // Add debug output to the console
  console.log("Auth state:", { isAuthenticated, user });

  return (
    <div className="w-full bg-gray-50 relative">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
        
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-gray-700 bg-white flex items-center gap-2 justify-between px-6 rounded-md border border-gray-200 shadow-sm">
            <input
              className="flex-1 h-full outline-none placeholder:text-gray-400 placeholder:text-[14px] bg-transparent text-gray-700"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5 text-blue-500" />
            {searchQuery && (
              <div
                className="w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-md scrollbar-hide cursor-pointer border border-gray-200 rounded-md"
              >
                {isSearching ? (
                  <div className="flex justify-center items-center h-20">
                    <p className="text-gray-500">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      onClick={() =>
                        navigate(
                          `/product/${item._id}`,
                          {
                            state: {
                              item: item,
                            },
                          }
                        ) &
                        setShowSearchBar(true) &
                        setSearchQuery("")
                      }
                      key={item._id}
                      className="max-w-[600px] h-28 bg-gray-50 mb-3 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300"
                    >
                      <img 
                        className="w-24 h-24 object-contain p-2" 
                        src={item.images && item.images.length > 0 ? "http://localhost:4000/"+item.images[0] : "/images/no-image.png"} 
                        alt={item.name} 
                      />
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-lg text-gray-700">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : ''}</p>
                        <p className="text-sm text-gray-600">
                          Price:{" "}
                          <span className="text-blue-600 font-semibold">
                            ${item.price}
                          </span>
                          {item.discount > 0 && (
                            <span className="ml-2 text-xs text-red-500">
                              {item.discount}% off
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-20">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* User menu and cart */}
          <div className="flex gap-5 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <div className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300" title="Dashboard">
                    <FaTachometerAlt className="text-lg" />
                  </div>
                </Link>
                <Link to="/dashboard/orders">
                  <div className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300" title="My Orders">
                    <FaClipboardList className="text-lg" />
                  </div>
                </Link>
                {cartItems.length > 0 && (
                  <Link to="/checkout">
                    <div className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300" title="Checkout">
                      <FaCreditCard className="text-lg" />
                    </div>
                  </Link>
                )}
              </>
            )}
            
            <div 
              ref={userRef}
              onClick={() => setShowUser(!showUser)} 
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-300 relative group"
            >
              <FaUser />
              <FaCaretDown className="group-hover:rotate-180 transition-transform duration-300" />
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
            </div>
            
            {showUser && (
              <motion.ul
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute top-6 right-12 z-50 bg-white w-52 text-gray-700 h-auto p-4 pb-6 rounded-md shadow-md border border-gray-200"
              >
                {isAuthenticated ? (
                  <>
                    <li className="flex items-center gap-2 text-gray-700 border-b-[1px] border-b-gray-200 pb-2">
                      <FaUser className="text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user?.email}</span>
                        <span className="text-xs text-gray-500">{user?.role}</span>
                      </div>
                    </li>
                    <Link to="/dashboard">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded mt-2">
                        <FaTachometerAlt />
                        <span>Dashboard</span>
                      </li>
                    </Link>
                    <Link to="/dashboard/orders">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded">
                        <FaClipboardList />
                        <span>My Orders</span>
                      </li>
                    </Link>
                    <Link to="/dashboard/payments">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded">
                        <FaDownload />
                        <span>My Receipts</span>
                      </li>
                    </Link>
                    <Link to="/profile">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded">
                        <FaUser />
                        <span>Profile</span>
                      </li>
                    </Link>
                    {cartItems.length > 0 && (
                      <Link to="/checkout">
                        <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded">
                          <FaCreditCard />
                          <span>Checkout</span>
                        </li>
                      </Link>
                    )}
                    <li 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-600 px-2 py-2 hover:bg-red-50 hover:text-red-600 duration-300 cursor-pointer rounded mt-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </li>
                  </>
                ) : (
                  <>
                    <Link to="/signin">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign In</span>
                      </li>
                    </Link>
                    <Link to="/signup">
                      <li className="flex items-center gap-2 text-gray-600 px-2 py-2 border-b-[1px] border-b-gray-200 hover:bg-gray-50 hover:text-blue-600 duration-300 cursor-pointer rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                      </li>
                    </Link>
                  </>
                )}
              </motion.ul>
            )}
            
            <Link to="/cart">
              <div className="relative group">
                <FaShoppingCart className="text-xl text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
                {isAuthenticated && cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                    {cartTotalQuantity > 0 ? cartTotalQuantity : 0}
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
