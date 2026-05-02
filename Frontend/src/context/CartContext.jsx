import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { checkAuth } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (checkAuth) {
      fetchCart();
      fetchCartCount();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [checkAuth]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      if (data.success) {
        setCart(data.cart);
        calculateCartCount(data.cart);
      }
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const fetchCartCount = async () => {
    try {
      const { data } = await axios.get('/cart/count');
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count');
    }
  };

  const calculateCartCount = (cartData) => {
    const count = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    setCartCount(count);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/cart', { productId, quantity });
      if (data.success) {
        setCart(data.cart);
        calculateCartCount(data.cart);
        toast.success('Item added to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/cart', { productId, quantity });
      if (data.success) {
        setCart(data.cart);
        calculateCartCount(data.cart);
        toast.success('Cart updated');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`/cart/${productId}`);
      if (data.success) {
        setCart(data.cart);
        calculateCartCount(data.cart);
        toast.success('Item removed from cart');
      }
    } catch (error) {
      toast.error('Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.delete('/cart');
      if (data.success) {
        setCart(data.cart);
        setCartCount(0);
        toast.success('Cart cleared');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};