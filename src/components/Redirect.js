import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * A component that handles redirecting to external URLs or API endpoints
 * In this case, we're using it to redirect to the receipt download API
 */
const Redirect = ({ to }) => {
  const navigate = useNavigate();
  const params = useParams();
  
  useEffect(() => {
    // Replace any URL parameters in the destination URL
    const processedUrl = to.replace(/:([^/]+)/g, (match, param) => {
      return params[param] || match;
    });
    
    // For API endpoints, construct a proper URL
    if (processedUrl.startsWith('/api/')) {
      // Create a link element
      const link = document.createElement('a');
      link.href = `http://localhost:4000${processedUrl}`; 
      link.setAttribute('target', '_blank');
      
      // Append, click and remove to trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Navigate back to payments page after triggering download
      navigate('/dashboard/payments');
    } else {
      // For regular routes, use navigation
      window.location.href = processedUrl;
    }
  }, [to, params, navigate]);
  
  return null; // This component doesn't render anything
};

export default Redirect; 