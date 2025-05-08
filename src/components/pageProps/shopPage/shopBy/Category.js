import React from "react";
// import { FaPlus } from "react-icons/fa";
import { ImPlus } from "react-icons/im";
import NavTitle from "./NavTitle";

const Category = ({ categories = [], onCategoryChange, selectedCategory }) => {
  // If no categories provided, use Dataverse default categories
  const displayCategories = categories.length > 0 ? 
    categories : 
    [
      "Software Solution",
      "Hardware Solution",
      "Consulting Service",
      "Training Program"
    ];

  const handleCategoryClick = (category) => {
    // If clicking the already selected category, clear the filter
    if (category === selectedCategory) {
      onCategoryChange("");
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <div>
      <NavTitle title="Shop by Category" icons={false} />
      <div className="mt-2">
        <ul className="space-y-2">
          {displayCategories.map((category, index) => (
            <li
              key={index}
              className={`flex items-center justify-between cursor-pointer transition-colors
                ${selectedCategory === category 
                  ? "text-blue-500" 
                  : "text-gray-600 hover:text-blue-500"
                }`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="flex items-center gap-2">
                {category}
                {selectedCategory === category && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
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

export default Category;
