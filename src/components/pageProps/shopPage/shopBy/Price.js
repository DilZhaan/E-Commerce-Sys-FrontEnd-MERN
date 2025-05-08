import React, { useState } from "react";
import NavTitle from "./NavTitle";

const Price = ({ onPriceChange }) => {
  const [selectedRange, setSelectedRange] = useState(null);
  
  const priceList = [
    {
      _id: 950,
      priceOne: 0.0,
      priceTwo: 49.99,
    },
    {
      _id: 951,
      priceOne: 50.0,
      priceTwo: 99.99,
    },
    {
      _id: 952,
      priceOne: 100.0,
      priceTwo: 199.99,
    },
    {
      _id: 953,
      priceOne: 200.0,
      priceTwo: 399.99,
    },
    {
      _id: 954,
      priceOne: 400.0,
      priceTwo: 599.99,
    },
    {
      _id: 955,
      priceOne: 600.0,
      priceTwo: 1000.0,
    },
  ];
  
  const handleRangeClick = (rangeId, minPrice, maxPrice) => {
    if (selectedRange === rangeId) {
      // Deselect if already selected
      setSelectedRange(null);
      onPriceChange("", "");
    } else {
      setSelectedRange(rangeId);
      onPriceChange(minPrice, maxPrice);
    }
  };
  
  return (
    <div className="cursor-pointer">
      <NavTitle title="Shop by Price" icons={false} />
      <div className="font-titleFont">
        <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
          {priceList.map((item) => (
            <li
              key={item._id}
              onClick={() => handleRangeClick(item._id, item.priceOne, item.priceTwo)}
              className={`border-b-[1px] pb-2 flex items-center gap-2 
                ${selectedRange === item._id
                  ? "border-b-primeColor text-primeColor font-medium"
                  : "border-b-[#F0F0F0] hover:text-primeColor hover:border-gray-400 duration-300"
                }`}
            >
              ${item.priceOne.toFixed(2)} - ${item.priceTwo.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Price;
