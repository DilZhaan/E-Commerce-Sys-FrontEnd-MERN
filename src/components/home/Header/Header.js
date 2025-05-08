import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { motion } from "framer-motion";
import { logo, logoLight } from "../../../assets/images";
import Image from "../../designLayouts/Image";
import Flex from "../../designLayouts/Flex";

const Header = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [sidenav, setSidenav] = useState(false);
  const [category, setCategory] = useState(false);
  const [brand, setBrand] = useState(false);
  const location = useLocation();
  
  // Define navBarList directly in the component
  const navBarList = [
    { _id: 1001, title: "Home", link: "/" },
    { _id: 1002, title: "Shop", link: "/shop" },
    { _id: 1003, title: "About", link: "/about" },
    { _id: 1004, title: "Contact", link: "/contact" },
  ];
  
  useEffect(() => {
    let ResponsiveMenu = () => {
      if (window.innerWidth < 667) {
        setShowMenu(false);
      } else {
        setShowMenu(true);
      }
    };
    ResponsiveMenu();
    window.addEventListener("resize", ResponsiveMenu);
  }, []);

  return (
    <div className="w-full h-20 bg-white sticky top-0 z-50 border-b-[1px] border-gray-100 shadow-sm">
      <nav className="h-full px-4 max-w-container mx-auto relative">
        <Flex className="flex items-center justify-between h-full">
          <Link to="/">
            <div className="relative group">
              <Image className="w-20 object-cover transition-all duration-300 group-hover:scale-105" imgSrc={logo} />
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>
          <div>
            {showMenu && (
              <motion.ul
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center w-auto z-50 p-0 gap-6"
              >
                <>
                  {navBarList.map(({ _id, title, link }) => (
                    <NavLink
                      key={_id}
                      className={({ isActive }) => 
                        `relative group flex font-normal w-auto h-8 justify-center items-center px-2 text-base 
                        ${isActive ? 'text-blue-600 font-medium' : 'text-gray-700'} 
                        hover:text-blue-600 transition-all duration-300`
                      }
                      to={link}
                      state={{ data: location.pathname.split("/")[1] }}
                    >
                      <li className="flex items-center">
                        {title}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
                      </li>
                    </NavLink>
                  ))}
                </>
              </motion.ul>
            )}
            <HiMenuAlt2
              onClick={() => setSidenav(!sidenav)}
              className="inline-block md:hidden cursor-pointer w-8 h-6 absolute top-6 right-4 text-gray-700"
            />
            {sidenav && (
              <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-50 backdrop-blur-sm z-50">
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-[80%] h-full relative"
                >
                  <div className="w-full h-full bg-white p-6">
                    <img
                      className="w-28 mb-6"
                      src={logo}
                      alt="logo"
                    />
                    <ul className="text-gray-700 flex flex-col gap-4">
                      {navBarList.map((item) => (
                        <li
                          className="font-normal relative inline-block text-lg text-gray-700 hover:text-blue-600 transition-all duration-300"
                          key={item._id}
                        >
                          <NavLink
                            to={item.link}
                            state={{ data: location.pathname.split("/")[1] }}
                            onClick={() => setSidenav(false)}
                            className={({ isActive }) => isActive ? "text-blue-600" : ""}
                          >
                            {item.title}
                          </NavLink>
                          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 hover:w-full transition-all duration-300"></div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <h1
                        onClick={() => setCategory(!category)}
                        className="flex justify-between text-base cursor-pointer items-center font-titleFont mb-2 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      >
                        Shop by Category{" "}
                        <span className="text-lg">{category ? "-" : "+"}</span>
                      </h1>
                      {category && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm flex flex-col gap-2 pl-4"
                        >
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">New Arrivals</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Gadgets</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Accessories</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Electronics</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Others</li>
                        </motion.ul>
                      )}
                    </div>
                    <div className="mt-6">
                      <h1
                        onClick={() => setBrand(!brand)}
                        className="flex justify-between text-base cursor-pointer items-center font-titleFont mb-2 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      >
                        Shop by Brand
                        <span className="text-lg">{brand ? "-" : "+"}</span>
                      </h1>
                      {brand && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm flex flex-col gap-2 pl-4"
                        >
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">New Arrivals</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Gadgets</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Accessories</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Electronics</li>
                          <li className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer">Others</li>
                        </motion.ul>
                      )}
                    </div>
                  </div>
                  <span
                    onClick={() => setSidenav(false)}
                    className="w-8 h-8 border-[1px] border-gray-300 absolute top-2 -right-10 text-gray-700 text-2xl flex justify-center items-center cursor-pointer hover:text-red-500 duration-300 rounded-full bg-white shadow-md"
                  >
                    <MdClose />
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </Flex>
      </nav>
    </div>
  );
};

export default Header;
