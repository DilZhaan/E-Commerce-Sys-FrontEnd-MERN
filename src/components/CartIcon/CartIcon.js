import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../redux/cartActions';
import './CartIcon.css';

const CartIcon = () => {
  const dispatch = useDispatch();
  const { itemCount = 0 } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  // Fetch cart data when the component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="cart-icon-container">
      <Link to="/cart" className="cart-icon-link">
        <FaShoppingCart className="cart-icon" />
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </Link>
    </div>
  );
};

export default CartIcon; 