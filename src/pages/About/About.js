import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { FaCheck, FaLightbulb, FaUsers, FaChartLine, FaHandshake } from "react-icons/fa";

const About = () => {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState("");
  
  useEffect(() => {
    setPrevLocation(location.state?.data || "");
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs title="About Us" prevLocation={prevLocation} />
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Dilzhan's Store</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Dilzhan's Store is dedicated to providing a wide variety of quality products at great prices, with a focus on customer satisfaction and fast delivery.
        </p>
      </div>
      
      {/* Mission Statement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <FaLightbulb className="text-4xl text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600">
            To offer the best shopping experience by delivering quality products, excellent service, and unbeatable value to our customers.
          </p>
        </div>
      </div>
      
      {/* Services Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard 
            icon={<FaChartLine className="text-2xl text-blue-500" />}
            title="Wide Product Selection"
            description="A diverse range of products for every need."
          />
          <ServiceCard 
            icon={<FaUsers className="text-2xl text-blue-500" />}
            title="Customer Support"
            description="Friendly and responsive support for all your questions."
          />
          <ServiceCard 
            icon={<FaHandshake className="text-2xl text-blue-500" />}
            title="Fast Delivery"
            description="Quick and reliable shipping to your doorstep."
          />
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Expertise</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Trusted by thousands of happy customers</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Easy returns and secure payments</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Dedicated to customer satisfaction</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Approach</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Customer-centric solutions</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Agile and flexible methodologies</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-500 mt-1" />
                <span className="text-gray-600">Continuous support and improvement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Team Member Component
const TeamMember = ({ name, role, image }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
      <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
};

export default About;
