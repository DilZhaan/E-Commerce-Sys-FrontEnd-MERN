import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  FaDesktop, 
  FaLaptop, 
  FaHeadset, 
  FaTools, 
  FaShieldAlt, 
  FaTruck,
  FaStar,
  FaCheckCircle
} from "react-icons/fa";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full mx-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="max-w-container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Your Trusted Partner in <span className="text-blue-400">IT Solutions</span>
              </h1>
              <p className="text-lg text-gray-200 mb-8">
                Explore our extensive collection of desktop computers, laptops, and accessories designed to meet a variety of needs and budgets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <button className="bg-white text-blue-900 hover:bg-blue-100 px-8 py-3 rounded-lg font-semibold transition duration-300">
                    Shop Now
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300">
                    Contact Us
                  </button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:block"
            >
              <img 
                src="https://tenisitech.com/wp-content/uploads/2024/01/IT-Solutions.jpg" 
                alt="IT Solutions" 
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive IT solutions with a focus on quality, reliability, and customer satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaDesktop className="text-4xl text-blue-600" />}
              title="Premium Hardware"
              description="High-quality computers and accessories from leading manufacturers"
            />
            <FeatureCard 
              icon={<FaHeadset className="text-4xl text-blue-600" />}
              title="24/7 Support"
              description="Round-the-clock technical support and assistance"
            />
            <FeatureCard 
              icon={<FaShieldAlt className="text-4xl text-blue-600" />}
              title="Warranty Protection"
              description="Comprehensive warranty coverage for all products"
            />
            <FeatureCard 
              icon={<FaTools className="text-4xl text-blue-600" />}
              title="Expert Installation"
              description="Professional setup and configuration services"
            />
            <FeatureCard 
              icon={<FaTruck className="text-4xl text-blue-600" />}
              title="Fast Delivery"
              description="Quick and reliable shipping options"
            />
            <FeatureCard 
              icon={<FaCheckCircle className="text-4xl text-blue-600" />}
              title="Quality Assurance"
              description="Rigorous testing and quality checks"
            />
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="py-16">
        <div className="max-w-container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategoryCard 
              title="Desktop Computers"
              description="High-performance desktops for business and gaming"
              image="https://images.unsplash.com/photo-1587202372775-e229f172b9d7"
              link="/shop?category=desktop"
            />
            <CategoryCard 
              title="Laptops"
              description="Portable computing solutions for every need"
              image="https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
              link="/shop?category=laptop"
            />
            <CategoryCard 
              title="Accessories"
              description="Essential peripherals and components"
              image="https://images.unsplash.com/photo-1586953208448-b95a87c12357"
              link="/shop?category=accessories"
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="John Smith"
              role="IT Manager"
              company="TechCorp Solutions"
              text="The IT solutions we received from Dataverse IT Solutions have significantly improved our business operations. Their expert guidance in selecting the right equipment was invaluable."
              rating={5}
            />
            <TestimonialCard 
              name="Sarah Johnson"
              role="CEO"
              company="Digital Innovations"
              text="Exceptional service and support. The team went above and beyond to ensure our IT infrastructure was set up perfectly."
              rating={5}
            />
            <TestimonialCard 
              name="Michael Brown"
              role="Operations Director"
              company="Global Systems"
              text="We've been sourcing our IT equipment from Dataverse IT Solutions for over 5 years. Their reliability and quality products have made them our preferred supplier."
              rating={5}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="max-w-container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Upgrade Your IT Infrastructure?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and discover how we can help transform your business with the right IT solutions.
          </p>
          <Link to="/contact">
            <button className="bg-white text-blue-900 hover:bg-blue-100 px-8 py-3 rounded-lg font-semibold transition duration-300">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Category Card Component
const CategoryCard = ({ title, description, image, link }) => {
  return (
    <Link to={link}>
      <motion.div 
        className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300"
        whileHover={{ scale: 1.02 }}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-64 object-cover transition duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="absolute bottom-0 p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-200">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ name, role, company, text, rating }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-600">{role} at {company}</p>
        </div>
      </div>
      <div className="flex text-yellow-400 mb-4">
        {[...Array(rating)].map((_, i) => (
          <FaStar key={i} />
        ))}
      </div>
      <p className="text-gray-600">{text}</p>
    </motion.div>
  );
};

export default Home;
