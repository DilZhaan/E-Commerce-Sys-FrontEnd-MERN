import React, { useState } from "react";
import { FaShoppingCart, FaSpinner } from "react-icons/fa";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCartActions } from "../../../hooks/useCartActions";

const Product = (props) => {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { addToCart } = useCartActions();
  
  // Get the product ID
  const _id = props._id;
  
  // Calculate discounted price if discount exists
  const hasDiscount = props.discount && props.discount > 0;
  const finalPrice = hasDiscount 
    ? props.price - (props.price * props.discount / 100)
    : props.price;
  
  // Format price with 2 decimal places
  const formattedPrice = Number(finalPrice).toFixed(2);
  const formattedOriginalPrice = Number(props.price).toFixed(2);
  
  // Handle product details navigation
  const handleProductDetails = () => {
    navigate(`/product/${_id}`, {
      state: {
        item: props,
      },
    });
  };
  
  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent triggering the product details navigation
    
    if (!isAuthenticated) {
      return; // The useCartActions hook will handle the error message
    }
    
    setAddingToCart(true);
    await addToCart(props, 1);
    setAddingToCart(false);
  };
  
  return (
    <div className="w-full relative group">
      <div className="max-w-80 max-h-80 relative overflow-y-hidden" onClick={handleProductDetails}>
        <div className="cursor-pointer">
          <Image className="w-full h-full" imgSrc={props.img} />
        </div>
        <div className="absolute top-6 left-8">
          {props.badge && <Badge text={props.badge === true ? "New" : props.badge} />}
        </div>
        <div className="w-full h-12 absolute bg-white/90 -bottom-[50px] group-hover:bottom-0 duration-500 flex justify-center items-center">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="bg-primeColor hover:bg-black text-white py-2 px-4 rounded-sm flex items-center gap-2 text-sm transition-colors duration-300 disabled:bg-gray-400"
          >
            {addingToCart ? (
              <>
                <FaSpinner className="text-lg animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FaShoppingCart className="text-lg" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
      <div className="max-w-80 py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4 cursor-pointer" onClick={handleProductDetails}>
        <div className="flex items-center justify-between font-titleFont">
          <h2 className="text-lg text-primeColor font-bold">
            {props.productName}
          </h2>
          <div>
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <p className="text-[#767676] text-[14px] line-through">${formattedOriginalPrice}</p>
                <p className="text-red-500 font-semibold">${formattedPrice}</p>
              </div>
            ) : (
              <p className="text-[#767676] text-[14px]">${formattedPrice}</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[#767676] text-[14px]">{props.color}</p>
        </div>
      </div>
    </div>
  );
};

export default Product;
