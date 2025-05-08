import React, { useState } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";

const Color = ({ onSpecificTypeChange, selectedSpecificType }) => {
  const [showColors, setShowColors] = useState(true);
  
  // Define common machine and accessory types from the product schema
  const specificTypes = [
    {
      _id: 'machine-1',
      title: "Digital Printing machine",
      type: "machineType",
      value: "Digital Printing machine (10feet)"
    },
    {
      _id: 'machine-2',
      title: "Sublimation Machine",
      type: "machineType",
      value: "Sublimation Machine (10feet)"
    },
    {
      _id: 'machine-3',
      title: "DTF Printing Machine",
      type: "machineType",
      value: "DTF Printing Machine"
    },
    {
      _id: 'accessory-1',
      title: "Ink (Digital)",
      type: "accessoryType",
      value: "Ink (Digital)"
    },
    {
      _id: 'accessory-2',
      title: "Ink (Sublimation)",
      type: "accessoryType",
      value: "Ink (Sublimation)"
    },
    {
      _id: 'convert-1',
      title: "Update Digital & Sublimation",
      type: "convertPackageType",
      value: "i3200 Update Digital & Sublimation"
    }
  ];

  const handleSpecificTypeClick = (type, value) => {
    // If clicking the already selected type, clear the filter
    if (value === selectedSpecificType) {
      onSpecificTypeChange("", "");
    } else {
      onSpecificTypeChange(type, value);
    }
  };

  return (
    <div>
      <div
        onClick={() => setShowColors(!showColors)}
        className="cursor-pointer"
      >
        <NavTitle title="Filter by Product Type" icons={true} />
      </div>
      {showColors && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {specificTypes.map((item) => (
              <li
                key={item._id}
                onClick={() => handleSpecificTypeClick(item.type, item.value)}
                className={`border-b-[1px] pb-2 flex items-center gap-2 cursor-pointer
                  ${selectedSpecificType === item.value 
                    ? "border-b-primeColor text-primeColor font-medium" 
                    : "border-b-[#F0F0F0] hover:text-primeColor hover:border-gray-400 duration-300"
                  }`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                {item.title}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Color;
