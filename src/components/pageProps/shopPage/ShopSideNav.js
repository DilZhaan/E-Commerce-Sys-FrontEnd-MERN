import React from "react";
import Price from "./shopBy/Price";

const ShopSideNav = ({ onPriceChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Price onPriceChange={onPriceChange} />
      </div>
    </div>
  );
};

export default ShopSideNav;
