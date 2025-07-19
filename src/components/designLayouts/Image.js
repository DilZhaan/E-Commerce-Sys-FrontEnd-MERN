import React from "react";

const Image = ({ imgSrc, className }) => {
  return (
    <img 
      className={className} 
      src={imgSrc} 
      alt={imgSrc}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
      }}
    />
  );
};

export default Image;
