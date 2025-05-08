import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import {
  newArrOne,
  newArrTwo,
  newArrThree,
  newArrFour,
} from "../../../assets/images/index";
import SampleNextArrow from "./SampleNextArrow";
import SamplePrevArrow from "./SamplePrevArrow";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = "http://localhost:4000/api/products";

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        // Build query parameters to get the newest products
        const params = new URLSearchParams();
        params.append('sortBy', 'createdAt');
        params.append('sortOrder', 'desc');
        params.append('limit', 8); // Get the 8 newest products
        
        // Make API request
        const response = await axios.get(`${API_BASE_URL}?${params.toString()}`);
        
        // Handle empty response
        setProducts(response.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Failed to load new arrivals");
        setLoading(false);
      }
    };
    
    fetchNewArrivals();
  }, []);
  
  // Convert backend product data to match our component's expected format
  const formattedProducts = products.map(product => ({
    _id: product._id,
    productName: product.name,
    img: product.images && product.images.length > 0 
      ? `http://localhost:4000/${product.images[0]}` 
      : "https://via.placeholder.com/150",
    price: product.price,
    color: product.category,
    des: product.description,
    discount: product.discount,
    badge: true // New arrivals always get a badge
  }));

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
        },
      },
    ],
  };

  return (
    <div className="w-full pb-16">
      <Heading heading="New Arrivals" />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : formattedProducts.length > 0 ? (
        <Slider {...settings}>
          {formattedProducts.map((product) => (
            <div className="px-2" key={product._id}>
              <Product
                _id={product._id}
                img={product.img}
                productName={product.productName}
                price={product.price}
                color={product.color}
                badge={product.badge}
                des={product.des}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="text-center py-10">No new arrivals found</div>
      )}
    </div>
  );
};

export default NewArrivals;
