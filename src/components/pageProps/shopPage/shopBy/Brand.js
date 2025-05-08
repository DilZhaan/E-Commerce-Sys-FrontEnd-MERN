import React from "react";
import NavTitle from "./NavTitle";

const Brand = ({ types = [], onTypeChange, selectedType }) => {
  // If no types provided, use Dataverse default types
  const displayTypes = types.length > 0 ? 
    types : 
    [
      "Business Intelligence",
      "Data Analytics",
      "Cloud Computing",
      "Cybersecurity",
      "AI/ML"
    ];

  const handleTypeClick = (type) => {
    // If clicking the already selected type, clear the filter
    if (type === selectedType) {
      onTypeChange("");
    } else {
      onTypeChange(type);
    }
  };

  return (
    <div className="w-full">
      <NavTitle title="Product Types" icons={false} />
      <div>
        <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
          {displayTypes.map((type, index) => (
            <li
              key={index}
              className={`border-b-[1px] pb-2 flex items-center justify-between cursor-pointer
                ${selectedType === type 
                  ? "border-b-primeColor text-primeColor font-medium" 
                  : "border-b-[#F0F0F0] hover:border-b-gray-400 hover:text-primeColor duration-300"
                }`}
              onClick={() => handleTypeClick(type)}
            >
              <span className="flex items-center gap-2">
                {type}
                {selectedType === type && (
                  <span className="text-xs bg-primeColor text-white px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Brand;
