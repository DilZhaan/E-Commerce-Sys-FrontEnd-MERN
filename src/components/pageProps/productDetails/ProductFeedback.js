import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaStar, FaRegStar, FaUser, FaClock, FaSpinner, FaPen, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductFeedback = ({ productId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSummary, setRatingSummary] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userFeedback, setUserFeedback] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Get authentication state from auth slice
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  
  // For debugging
  console.log("Auth state in ProductFeedback:", { isAuthenticated, user });
  
  const API_BASE_URL = 'http://localhost:4000/api/feedback';

  // Fetch feedbacks and rating summary
  useEffect(() => {
    if (productId) {
      fetchFeedbacks();
      fetchRatingSummary();
    }
  }, [productId, page]);

  // Check if user has already provided feedback
  useEffect(() => {
    if (isAuthenticated && user && feedbacks.length > 0) {
      const existing = feedbacks.find(feedback => 
        feedback.userId && feedback.userId._id === user._id
      );
      
      if (existing) {
        setUserFeedback(existing);
        setUserRating(existing.rating);
        setComment(existing.comment);
      }
    }
  }, [feedbacks, isAuthenticated, user]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product/${productId}?page=${page}&limit=5`);
      
      if (response.data) {
        setFeedbacks(response.data.feedbacks || []);
        setTotalPages(response.data.pagination.pages || 1);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
    }
  };

  const fetchRatingSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rating/${productId}`);
      
      if (response.data) {
        setRatingSummary(response.data);
      }
    } catch (err) {
      console.error('Error fetching rating summary:', err);
      // Don't set error - this is not critical
    }
  };

  const handleRatingClick = (rating) => {
    setUserRating(rating);
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please log in to submit a review');
      return;
    }
    
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // No need to check for token since we're using HttpOnly cookies
      // The backend will validate the token from the cookie
      
      // If in edit mode, update the existing feedback
      if (editMode && userFeedback) {
        const response = await axios({
          method: 'put',
          url: `${API_BASE_URL}/${userFeedback._id}`,
          data: { rating: userRating, comment },
          withCredentials: true
        });
        
        console.log("Update feedback response:", response.data);
        toast.success('Your review has been updated!');
      } else {
        // Otherwise, create a new feedback
        const response = await axios({
          method: 'post',
          url: API_BASE_URL,
          data: { productId, rating: userRating, comment },
          withCredentials: true
        });
        
        console.log("Submit feedback response:", response.data);
        toast.success('Your review has been submitted!');
      }
      
      // Refresh the feedbacks and summary
      setEditMode(false);
      fetchFeedbacks();
      fetchRatingSummary();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
      console.log('Full error response:', err.response);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!userFeedback) return;
    
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (!user) {
        toast.error('Authentication error. Please log in again.');
        setSubmitting(false);
        return;
      }
      
      await axios({
        method: 'delete',
        url: `${API_BASE_URL}/${userFeedback._id}`,
        withCredentials: true
      });
      
      toast.success('Your review has been deleted');
      
      // Reset state
      setUserFeedback(null);
      setUserRating(0);
      setComment('');
      
      // Refresh the data
      fetchFeedbacks();
      fetchRatingSummary();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 'text-xl') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            {star <= rating ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  // Calculate percentage for rating bars
  const getRatingPercentage = (rating) => {
    if (ratingSummary.totalRatings === 0) return 0;
    return (ratingSummary.ratingDistribution[rating] / ratingSummary.totalRatings) * 100;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
      
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-gray-900">
              {ratingSummary.averageRating.toFixed(1)}
            </span>
            <span className="text-lg text-gray-500">out of 5</span>
          </div>
          
          <div className="mb-2">
            {renderStars(Math.round(ratingSummary.averageRating), 'text-2xl')}
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Based on {ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        
        <div>
          {/* Rating Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
                <div className="flex-grow h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-10">
                  {ratingSummary.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Write a Review Section */}
      <div className="mb-10 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Your Review' : (userFeedback ? 'Your Review' : 'Write a Review')}
        </h3>
        
        {!isAuthenticated ? (
          <div className="text-center py-6">
            <p className="mb-4 text-gray-700">Please log in to submit a review</p>
            <button 
              className="bg-primeColor text-white px-6 py-2 rounded-md font-medium"
              onClick={() => toast.info('Please use the login button in the navigation bar')}
            >
              Login to Review
            </button>
          </div>
        ) : userFeedback && !editMode ? (
          // Show user's existing feedback with edit and delete options
          <div className="space-y-3 border-l-4 border-primeColor pl-4 py-2">
            <div>{renderStars(userFeedback.rating)}</div>
            <p className="text-gray-700">{userFeedback.comment}</p>
            <div className="flex gap-4 mt-2">
              <button 
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                onClick={() => setEditMode(true)}
              >
                <FaPen className="text-sm" /> Edit
              </button>
              <button 
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
                onClick={handleDeleteFeedback}
                disabled={submitting}
              >
                {submitting ? <FaSpinner className="animate-spin text-sm" /> : <FaTrash className="text-sm" />}
                Delete
              </button>
            </div>
          </div>
        ) : (
          // Show review form for new review or editing
          <form onSubmit={handleSubmitFeedback}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <span 
                    key={rating}
                    className="cursor-pointer text-2xl"
                    onClick={() => handleRatingClick(rating)}
                    onMouseEnter={() => handleRatingHover(rating)}
                    onMouseLeave={() => handleRatingHover(0)}
                  >
                    {rating <= (hoverRating || userRating) ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">Your Review</label>
              <textarea 
                id="comment"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primeColor"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="bg-primeColor hover:bg-black text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting && <FaSpinner className="animate-spin" />}
              {editMode ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
      
      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
        
        {loading ? (
          <div className="text-center py-10">
            <FaSpinner className="animate-spin text-3xl mx-auto text-gray-500 mb-2" />
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map(feedback => {
              // Skip rendering the current user's feedback as it's shown in the "Your Review" section
              if (isAuthenticated && 
                  user && 
                  feedback.userId && 
                  feedback.userId._id === user._id && 
                  !editMode) {
                return null;
              }
              
              return (
                <div key={feedback._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {feedback.userId?.proPic ? (
                          <img 
                            src={`http://localhost:4000/${feedback.userId.proPic}`} 
                            alt={`${feedback.userId.fName} ${feedback.userId.lName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {feedback.userId ? 
                            `${feedback.userId.fName} ${feedback.userId.lName}` : 
                            'Anonymous User'}
                        </div>
                        <div className="text-gray-500 text-sm flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {formatDate(feedback.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{feedback.comment}</p>
                </div>
              );
            })}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button 
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-md ${
                        pageNum === page ? 
                          'bg-primeColor text-white' : 
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFeedback; 