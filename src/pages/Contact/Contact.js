import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Contact = () => {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState("");
  
  useEffect(() => {
    setPrevLocation(location.state?.data || "");
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs title="Contact Us" prevLocation={prevLocation} />
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're here to help and answer any questions you might have. We look forward to hearing from you.
        </p>
      </div>
      
      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <ContactCard 
          icon={<FaMapMarkerAlt className="text-2xl text-blue-500" />}
          title="Our Location"
          details={["123 Galle Road", "Colombo 03", "Sri Lanka"]}
        />
        <ContactCard 
          icon={<FaPhone className="text-2xl text-blue-500" />}
          title="Phone Numbers"
          details={["+94 11 234 5678", "+94 77 123 4567"]}
        />
        <ContactCard 
          icon={<FaEnvelope className="text-2xl text-blue-500" />}
          title="Email Us"
          details={["sales@dataverse.lk", "support@dataverse.lk"]}
        />
        <ContactCard 
          icon={<FaClock className="text-2xl text-blue-500" />}
          title="Working Hours"
          details={["Monday - Friday: 9am - 6pm", "Saturday: 9am - 1pm", "Sunday: Closed"]}
        />
      </div>
  
      
      {/* Branch Locations */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Branch Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BranchCard 
            name="Kandy Branch"
            address="45 Peradeniya Road, Kandy"
            phone="+94 81 234 5678"
            email="kandy@dataverse.lk"
          />
          <BranchCard 
            name="Galle Branch"
            address="78 Main Street, Galle Fort"
            phone="+94 91 234 5678"
            email="galle@dataverse.lk"
          />
          <BranchCard 
            name="Jaffna Branch"
            address="123 Hospital Road, Jaffna"
            phone="+94 21 234 5678"
            email="jaffna@dataverse.lk"
          />
        </div>
      </div>
    </div>
  );
};

// Contact Card Component
const ContactCard = ({ icon, title, details }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">{title}</h3>
      <div className="text-gray-600 text-center">
        {details.map((detail, index) => (
          <p key={index} className="mb-1">{detail}</p>
        ))}
      </div>
    </div>
  );
};

// Branch Card Component
const BranchCard = ({ name, address, phone, email }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{name}</h3>
      <div className="text-gray-600 mb-4">
        <p className="mb-1">{address}</p>
        <p className="mb-1">Sri Lanka</p>
      </div>
      <div className="text-gray-600">
        <p className="mb-1 flex items-center gap-2">
          <FaPhone className="text-blue-500" /> {phone}
        </p>
        <p className="flex items-center gap-2">
          <FaEnvelope className="text-blue-500" /> {email}
        </p>
      </div>
    </div>
  );
};

export default Contact;
