import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductInfo from "../../components/pageProps/productDetails/ProductInfo";
import ProductsOnSale from "../../components/pageProps/productDetails/ProductsOnSale";
import ProductFeedback from "../../components/pageProps/productDetails/ProductFeedback";
import { FaRegImages } from "react-icons/fa";
import { getShopProductById } from "../../services/shopServices";

const ProductDetails = () => {
  const location = useLocation();
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // First attempt to get product from state if coming from product list
    if (location.state && location.state.item) {
      // We still have the product item in state - but we'll fetch the full details anyway
      const item = location.state.item;
      
      // Extract the actual product ID - either from state or from URL
      const productId = item._id || _id;
      
      fetchProductById(productId);
    } else if (_id) {
      // No state, but we have an ID in the URL
      fetchProductById(_id);
    } else {
      // Neither state nor ID - error
      setError("Product not found");
      setLoading(false);
    }
  }, [_id, location]);

  const fetchProductById = async (productId) => {
    try {
      setLoading(true);
      
      // Fetch the product details
      const response = await getShopProductById(productId);
      
      if (response.success && response.product) {
        const productData = response.product;
        setProduct(productData);
        setActiveImage(0); // Reset active image when product changes
        
        // We're not fetching related products for now
        setRelatedProducts([]);
      } else {
        setError("Product details not available");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details. Please try again later.");
      setLoading(false);
    }
  };

  // Format the product data to match the expected props structure
  const formatProduct = (product) => {
    if (!product) return null;
    
    return {
      _id: product._id,
      productName: product.name,
      price: product.salePrice,
      discount: product.discount || 0,
      des: product.description || '',
      img: product.images && product.images.length > 0
        ? `http://localhost:4000/${product.images[0]}`
        : "https://via.placeholder.com/400",
      images: product.images 
        ? product.images.map(img => `http://localhost:4000/${img}`)
        : [],
      color: product.inventoryItem?.brandName || '',
      badge: product.active ? null : 'Inactive',
      warranty: product.shopWarranty ? `${product.shopWarranty} months` : 'No warranty',
      inventory: product.inventoryItem ? {
        model: product.inventoryItem.modelName,
        brand: product.inventoryItem.brandName,
        quantity: product.inventoryItem.quantity
      } : null
    };
  };

  const formattedProduct = formatProduct(product);

  return (
    <div className="bg-white">
      <div className="max-w-container mx-auto px-4">
        <div className="py-6">
          <Breadcrumbs title={formattedProduct?.productName || "Product Detail"} prevLocation={location.pathname} />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : formattedProduct ? (
          <div className="flex flex-col">
            {/* Product Main Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-16">
              {/* Left Column - Images */}
              <div className="lg:w-1/2">
                <div className="sticky top-24">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                    {formattedProduct.images && formattedProduct.images.length > 0 ? (
                      <img 
                        src={formattedProduct.images[activeImage]} 
                        alt={formattedProduct.productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaRegImages size={60} />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Images */}
                  {formattedProduct.images && formattedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formattedProduct.images.map((image, index) => (
                        <div 
                          key={index}
                          className={`cursor-pointer border-2 rounded-md overflow-hidden aspect-square
                            ${activeImage === index ? 'border-primeColor' : 'border-transparent hover:border-gray-300'}`}
                          onClick={() => setActiveImage(index)}
                        >
                          <img 
                            src={image} 
                            alt={`${formattedProduct.productName} - view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column - Product Info */}
              <div className="lg:w-1/2">
                <ProductInfo productInfo={formattedProduct} />
              </div>
            </div>
            
            {/* Product Details and Related Items Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
              {/* Related Products */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <ProductsOnSale products={relatedProducts} />
              </div>
              
              {/* Product Feedback */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <ProductFeedback productId={formattedProduct._id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-80">
            <p className="text-xl text-gray-500">Product not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
