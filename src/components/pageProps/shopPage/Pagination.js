import React from "react";
import ReactPaginate from "react-paginate";
import Product from "../../home/Products/Product";

const Pagination = ({ products, totalProducts, currentPage, onPageChange, itemsPerPage }) => {
  // Calculate page count
  const pageCount = Math.ceil(totalProducts / itemsPerPage);
  
  // Convert backend product data to match our component's expected format
  const formattedProducts = products.map(product => {
    // Check if it's a shop product by looking for inventoryItem property
    const isShopProduct = product.hasOwnProperty('inventoryItem');
    
    // Format based on product type
    if (isShopProduct) {
      // Shop product format
      return {
        _id: product._id,
        productName: product.name,
        img: product.images && product.images.length > 0 
          ? `http://localhost:4000/${product.images[0]}` 
          : "https://via.placeholder.com/150",
        price: product.salePrice,
        color: product.inventoryItem?.brandName || 'Shop Product',
        des: product.description,
        discount: product.discount,
        badge: product.active ? null : 'Inactive'
      };
    } else {
      // Regular product format
      return {
        _id: product._id,
        productName: product.name,
        img: product.images && product.images.length > 0 
          ? `http://localhost:4000/${product.images[0]}` 
          : "https://via.placeholder.com/150",
        price: product.price,
        color: product.category,
        des: product.description,
        discount: product.discount,
        badge: product.quantity < 10 ? 'Limited Stock' : null
      };
    }
  });

  const handlePageClick = (event) => {
    onPageChange(event.selected + 1); // Add 1 because our backend uses 1-indexed pages
  };

  return (
    <div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mdl:gap-4 lg:gap-10">
          {formattedProducts.map((item) => (
            <Product
              key={item._id}
              _id={item._id}
              img={item.img}
              productName={item.productName}
              price={item.price}
              color={item.color}
              badge={item.badge}
              des={item.des}
              discount={item.discount}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-500">No products found</p>
        </div>
      )}
      
      {products.length > 0 && (
        <div className="flex flex-col mdl:flex-row justify-center mdl:justify-between items-center mt-10">
          <ReactPaginate
            nextLabel=""
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel=""
            pageLinkClassName="w-9 h-9 border-[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
            pageClassName="mr-6"
            containerClassName="flex text-base font-semibold font-titleFont py-10"
            activeClassName="bg-black text-white"
            forcePage={currentPage - 1} // Set active page (subtract 1 for 0-indexed)
          />

          <p className="text-base font-normal text-lightText">
            Products from {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of{" "}
            {totalProducts}
          </p>
        </div>
      )}
    </div>
  );
};

export default Pagination;
