import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });

  useEffect(() => {
    if (cart?.items) {
      calculateSummary();
    }
  }, [cart]);

  const calculateSummary = () => {
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const tax = 0; // 10% tax
    const shipping = subtotal >= 10000 ? 0 : 450; // Free shipping over 100
    const total = subtotal + tax + shipping;

    setCartSummary({ subtotal, tax, shipping, total });
  };

  const handleQuantityChange = async (productId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1) {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (cart?.items?.length > 0) {
      navigate('/checkout');
    } else {
      toast.error('Your cart is empty');
    }
  };

  if (!cart || !cart.items) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
            <ShoppingBag className="w-24 h-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <ShoppingCart className="w-10 h-10 mr-4" />
            Shopping Cart
          </h1>
          <p className="text-gray-300">{cart.items.length} items in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </button>
              {cart.items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                  disabled={loading}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Clear Cart
                </button>
              )}
            </div>

            {cart.items.map((item) => (
              <div
                key={item.product?._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images?.[0]}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg mb-1">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {item.product?.category} • {item.product?.brand}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product?._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-slate-300 rounded-xl overflow-hidden w-fit">
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || loading}
                          className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4 text-slate-700" />
                        </button>
                        <div className="px-4 py-2 font-semibold text-slate-900 min-w-[50px] text-center">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity, 1)}
                          disabled={item.quantity >= item.product?.quantity || loading}
                          className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-slate-500 mb-1">
                          LKR: {item.product?.price?.toFixed(2)} each
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          LKR: {((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.product?.quantity && (
                      <div className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        Maximum stock reached ({item.product?.quantity} available)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">LKR: {cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {cartSummary.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `LKR: ${cartSummary.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {cartSummary.subtotal < 10000 && cartSummary.subtotal > 0 && (
                  <div className="text-sm text-slate-500 bg-blue-50 px-3 py-2 rounded-lg">
                    Add LKR: {(10000 - cartSummary.subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-3xl font-bold text-blue-600">
                      LKR: {cartSummary.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold text-lg transition-all duration-200 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-6 h-6 ml-2" />
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;