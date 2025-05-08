import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaShoppingCart, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { useCartActions } from "../../../hooks/useCartActions";

const ProductInfo = ({ productInfo }) => {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { addToCart } = useCartActions();
  
  // Check if productInfo exists
  if (!productInfo) {
    return <div>Product information not available</div>;
  }
  
  // Calculate discounted price if there's a discount
  const regularPrice = parseFloat(productInfo.price);
  const discountPercentage = parseFloat(productInfo.discount) || 0;
  const discountedPrice = discountPercentage > 0 
    ? regularPrice - (regularPrice * (discountPercentage / 100)) 
    : regularPrice;
  
  // Format price with 2 decimal places
  const formattedPrice = discountedPrice.toFixed(2);
  
  // Handle quantity changes
  const handleIncreaseQuantity = () => {
    const maxQuantity = productInfo.inventory?.quantity || 99;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      return; // The useCartActions hook will handle the error message
    }
    
    setAddingToCart(true);
    await addToCart(productInfo, quantity);
    setAddingToCart(false);
  };
  
  // Get additional details based on product category
  const renderAdditionalDetails = () => {
    let details = [];
    
    if (productInfo.solutionType) {
      details.push(<li key="solution">Solution Type: <span className="font-medium">{productInfo.solutionType}</span></li>);
    }
    
    if (productInfo.deploymentType) {
      details.push(<li key="deployment">Deployment: <span className="font-medium">{productInfo.deploymentType}</span></li>);
    }
    
    if (productInfo.supportLevel) {
      details.push(<li key="support">Support Level: <span className="font-medium">{productInfo.supportLevel}</span></li>);
    }
    
    if (productInfo.licenseType) {
      details.push(<li key="license">License Type: <span className="font-medium">{productInfo.licenseType}</span></li>);
    }
    
    return details.length > 0 ? (
      <div className="flex flex-col gap-2 mt-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold uppercase text-gray-700">Solution Specifications</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
          {details}
        </ul>
      </div>
    ) : null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Product Title */}
      <h2 className="text-3xl font-semibold text-gray-800">{productInfo.productName}</h2>
      
      {/* Price Section */}
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold text-primeColor">${formattedPrice}</p>
        {discountPercentage > 0 && (
          <p className="text-lg text-gray-500 line-through">${regularPrice.toFixed(2)}</p>
        )}
        {discountPercentage > 0 && (
          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full ml-2">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
      
      {/* Stock Status */}
      <div className="flex items-center mb-2">
        {productInfo.inventory && productInfo.inventory.quantity < 10 ? (
          <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
            <FaExclamationTriangle className="mr-2 text-amber-500" />
            <span className="font-medium">Only {productInfo.inventory.quantity} left in stock - order soon</span>
          </div>
        ) : (
          <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-md">
            <FaCheckCircle className="mr-2 text-green-500" />
            <span className="font-medium">In Stock</span>
            {productInfo.inventory && (
              <span className="text-green-600 ml-1">({productInfo.inventory.quantity} available)</span>
            )}
          </div>
        )}
      </div>
      
      {/* Description */}
      <div className="text-base text-gray-600 border-t border-b border-gray-200 py-4">
        <p>{productInfo.des}</p>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col gap-1">
        {productInfo.color && (
          <div className="flex">
            <p className="font-medium text-base w-24">Brand:</p>
            <span className="text-gray-700">{productInfo.color}</span>
          </div>
        )}
        {productInfo.inventory && productInfo.inventory.model && (
          <div className="flex">
            <p className="font-medium text-base w-24">Model:</p>
            <span className="text-gray-700">{productInfo.inventory.model}</span>
          </div>
        )}
        {productInfo.warranty && (
          <div className="flex">
            <p className="font-medium text-base w-24">Warranty:</p>
            <span className="text-gray-700">{productInfo.warranty}</span>
          </div>
        )}
      </div>
      
      {/* Additional Details */}
      {renderAdditionalDetails()}
      
      {/* Quantity & Add to Cart */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-4">
          <p className="font-medium text-gray-700 w-24">Quantity:</p>
          <div className="flex border border-gray-300 rounded-md">
            <button 
              className="px-4 py-2 border-r border-gray-300 hover:bg-gray-100 transition-colors text-lg font-medium" 
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-6 py-2 flex items-center justify-center min-w-[50px] font-medium">
              {quantity}
            </span>
            <button 
              className="px-4 py-2 border-l border-gray-300 hover:bg-gray-100 transition-colors text-lg font-medium" 
              onClick={handleIncreaseQuantity}
              disabled={productInfo.inventory && quantity >= productInfo.inventory.quantity}
            >
              +
            </button>
          </div>
        </div>
        
        <div className="mt-2">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || (productInfo.inventory && productInfo.inventory.quantity === 0)}
            className="w-full py-4 bg-primeColor hover:bg-black duration-300 text-white text-lg font-bold rounded-md flex items-center justify-center gap-3 shadow-md disabled:bg-gray-400"
          >
            {addingToCart ? (
              <>
                <FaSpinner className="animate-spin" /> Adding to Cart...
              </>
            ) : (
              <>
                <FaShoppingCart size={20} /> Add to Cart
              </>
            )}
          </button>
          
          {!isAuthenticated && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Please sign in to add items to your cart
            </p>
          )}
        </div>
      </div>
      
      {/* SKU */}
      <div className="border-t border-gray-200 pt-4 mt-4 text-gray-500">
        <p className="font-medium text-sm">
          SKU: <span className="font-normal ml-2">{productInfo._id}</span>
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
