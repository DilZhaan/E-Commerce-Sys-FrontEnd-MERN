import React from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import { removeCartItem, updateCartItem } from "../../redux/orebiSlice";
import { toast } from "react-toastify";

const ItemCard = ({ item }) => {
  const dispatch = useDispatch();
  
  const handleRemoveFromCart = () => {
    dispatch(removeCartItem(item._id))
      .unwrap()
      .then(() => {
        toast.success("Item removed from cart");
      })
      .catch((error) => {
        toast.error(error || "Failed to remove item");
      });
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity <= 1) return;
    
    dispatch(updateCartItem({ 
      itemId: item._id, 
      quantity: item.quantity - 1 
    }))
      .unwrap()
      .catch((error) => {
        toast.error(error || "Failed to update quantity");
      });
  };

  const handleIncreaseQuantity = () => {
    dispatch(updateCartItem({ 
      itemId: item._id, 
      quantity: item.quantity + 1 
    }))
      .unwrap()
      .catch((error) => {
        toast.error(error || "Failed to update quantity");
      });
  };

  return (
    <div className="w-full grid grid-cols-5 mb-4 border py-2">
      <div className="flex col-span-5 mdl:col-span-2 items-center gap-4 ml-4">
        <ImCross
          onClick={handleRemoveFromCart}
          className="text-primeColor hover:text-red-500 duration-300 cursor-pointer"
        />
        <img 
          className="w-32 h-32" 
          src={`http://localhost:4000/${item.product.images[0]}`} 
          alt={item.product.name} 
        />
        <h1 className="font-titleFont font-semibold">{item.product.name}</h1>
      </div>
      <div className="col-span-5 mdl:col-span-3 flex items-center justify-between py-4 mdl:py-0 px-4 mdl:px-0 gap-6 mdl:gap-0">
        <div className="flex w-1/3 items-center text-lg font-semibold">
          ${item.price.toFixed(2)}
        </div>
        <div className="w-1/3 flex items-center gap-6 text-lg">
          <span
            onClick={handleDecreaseQuantity}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300 hover:border-gray-300"
          >
            -
          </span>
          <p>{item.quantity}</p>
          <span
            onClick={handleIncreaseQuantity}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300 hover:border-gray-300"
          >
            +
          </span>
        </div>
        <div className="w-1/3 flex items-center font-titleFont font-bold text-lg">
          <p>${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
