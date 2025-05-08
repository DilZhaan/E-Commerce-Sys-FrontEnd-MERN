import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';
import Loading from '../../components/Loading';

function IssueForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    district: '',
    province: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      toast.error('You can upload a maximum of 3 images');
      return;
    }
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`"${file.name}" is not a supported file type. Please upload JPEG or PNG images.`);
      }
      
      if (!isValidSize) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
      }
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) return;
    
    setFormData({
      ...formData,
      images: validFiles
    });
    
    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    // Clear old previews to prevent memory leaks
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    
    setImagePreview(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      images: newImages
    });
    setImagePreview(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Issue title is required';
    } else if (formData.name.length < 5) {
      newErrors.name = 'Issue title must be at least 5 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('province', formData.province);
      
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      const response = await createIssue(formDataToSend, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      toast.success('Issue reported successfully');
      navigate(`/account/issues/${response.data._id}`);
    } catch (err) {
      console.error('Error submitting issue:', err);
      toast.error(err.response?.data?.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/account/issues')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Report New Issue</h1>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loading />
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter a clear title for the issue"
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the issue in detail"
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Specific location of the issue"
                    className={`w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>
                
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                    District*
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className={`w-full px-3 py-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province*
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Province"
                  className={`w-full px-3 py-2 border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (optional, max 3)
                </label>
                
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload images</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleImageChange}
                          multiple
                          className="sr-only" 
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </div>
                </div>
                
                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={src} 
                          alt={`Preview ${index + 1}`} 
                          className="h-24 w-full object-cover rounded-md" 
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center -mt-2 -mr-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/account/issues')}
                  className="mr-4 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueForm; 