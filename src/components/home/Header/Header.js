import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { motion } from "framer-motion";
import { logo } from "../../../assets/images";
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
      <nav className="relative h-full px-4 mx-auto max-w-container">
        <Flex className="flex items-center justify-between h-full">
          <Link to="/">
            <div className="relative group">
              <Image
                className="object-cover w-48 transition-all duration-300 group-hover:scale-105"
                imgSrc={logo}
              />
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>
          <div>
            {showMenu && (
              <motion.ul
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="z-50 flex items-center w-auto gap-6 p-0"
              >
                <>
                  {navBarList.map(({ _id, title, link }) => (
                    <NavLink
                      key={_id}
                      className={({ isActive }) =>
                        `relative group flex font-normal w-auto h-8 justify-center items-center px-2 text-base 
                        ${
                          isActive
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        } 
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
              className="absolute inline-block w-8 h-6 text-gray-700 cursor-pointer md:hidden top-6 right-4"
            />
            {sidenav && (
              <div className="fixed top-0 left-0 z-50 w-full h-screen bg-black bg-opacity-50 backdrop-blur-sm">
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-[80%] h-full relative"
                >
                  <div className="w-full h-full p-6 bg-white">
                    <img className="mb-6 w-72" src={logo} alt="logo" />
                    <ul className="flex flex-col gap-4 text-gray-700">
                      {navBarList.map((item) => (
                        <li
                          className="relative inline-block text-lg font-normal text-gray-700 transition-all duration-300 hover:text-blue-600"
                          key={item._id}
                        >
                          <NavLink
                            to={item.link}
                            state={{ data: location.pathname.split("/")[1] }}
                            onClick={() => setSidenav(false)}
                            className={({ isActive }) =>
                              isActive ? "text-blue-600" : ""
                            }
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
                        className="flex items-center justify-between mb-2 text-base text-gray-700 transition-all duration-300 cursor-pointer font-titleFont hover:text-blue-600"
                      >
                        Shop by Category{" "}
                        <span className="text-lg">{category ? "-" : "+"}</span>
                      </h1>
                      {category && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-2 pl-4 text-sm"
                        >
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            New Arrivals
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Gadgets
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Accessories
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Electronics
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Others
                          </li>
                        </motion.ul>
                      )}
                    </div>
                    <div className="mt-6">
                      <h1
                        onClick={() => setBrand(!brand)}
                        className="flex items-center justify-between mb-2 text-base text-gray-700 transition-all duration-300 cursor-pointer font-titleFont hover:text-blue-600"
                      >
                        Shop by Brand
                        <span className="text-lg">{brand ? "-" : "+"}</span>
                      </h1>
                      {brand && (
                        <motion.ul
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-2 pl-4 text-sm"
                        >
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            New Arrivals
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Gadgets
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Accessories
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Electronics
                          </li>
                          <li className="text-gray-600 transition-all duration-300 cursor-pointer hover:text-blue-600">
                            Others
                          </li>
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
