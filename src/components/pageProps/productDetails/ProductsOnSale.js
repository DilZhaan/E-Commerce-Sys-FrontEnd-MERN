import React from "react";
import { Link } from "react-router-dom";

const ProductsOnSale = ({ products = [] }) => {
  // Format the product data to make it suitable for display
  const formatProducts = (products) => {
    return products.map(product => ({
      _id: product._id,
      productName: product.name,
      price: product.price,
      discount: product.discount || 0,
      img: product.images && product.images.length > 0
        ? `http://localhost:4000/${product.images[0]}`
        : "https://via.placeholder.com/100",
      category: product.category
    }));
  };

  const formattedProducts = formatProducts(products);

  // Calculate discounted price
  const getDiscountedPrice = (regularPrice, discountPercentage) => {
    if (!discountPercentage) return regularPrice;
    return (regularPrice - (regularPrice * (discountPercentage / 100))).toFixed(2);
  };

  return (
    <div>
      <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
        Related Products
      </h3>
      
      {formattedProducts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {formattedProducts.map((product) => (
            <Link 
              to={`/product/${product._id}`} 
              key={product._id}
              className="flex items-center gap-4 border-b-[1px] border-b-gray-300 py-2 hover:bg-gray-50 transition-colors"
            >
              <div>
                <img 
                  className="w-24 h-24 object-cover" 
                  src={product.img} 
                  alt={product.productName} 
                />
              </div>
              <div className="flex flex-col gap-2 font-titleFont">
                <p className="text-base font-medium line-clamp-2">{product.productName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-primeColor">
                    ${getDiscountedPrice(product.price, product.discount)}
                  </p>
                  {product.discount > 0 && (
                    <p className="text-xs text-gray-500 line-through">${product.price}</p>
                  )}
                </div>
                <p className="text-xs text-gray-600">{product.category}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No related products found</p>
      )}
    </div>
  );
};

export default ProductsOnSale;
