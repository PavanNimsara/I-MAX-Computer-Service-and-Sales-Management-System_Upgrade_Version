import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Phone, Package, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import * as Yup from 'yup';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'credit-card',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });

  // Validation Schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .required('Full name is required')
      .min(3, 'Full name must be at least 3 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
    
    phone: Yup.string()
      .required('Phone number is required')
      .matches(
        /^[\d\s\+\-KATEX_INLINE_OPENKATEX_INLINE_CLOSE]+$/,
        'Please enter a valid phone number'
      )
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number must not exceed 20 characters'),
    
    address: Yup.string()
      .required('Address is required')
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address must not exceed 200 characters'),
    
    city: Yup.string()
      .required('City is required')
      .min(2, 'City name must be at least 2 characters')
      .max(50, 'City name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces'),
    
    postalCode: Yup.string()
      .required('Postal code is required')
      .matches(/^[A-Za-z0-9\s\-]+$/, 'Please enter a valid postal code')
      .min(3, 'Postal code must be at least 3 characters')
      .max(10, 'Postal code must not exceed 10 characters'),
    
    country: Yup.string()
      .required('Country is required')
      .min(2, 'Country name must be at least 2 characters')
      .max(50, 'Country name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Country name can only contain letters and spaces'),
    
    paymentMethod: Yup.string()
      .required('Payment method is required')
      .oneOf(
        ['credit-card', 'debit-card', 'paypal', 'cash-on-delivery'],
        'Invalid payment method selected'
      ),
    
    notes: Yup.string()
      .max(500, 'Notes must not exceed 500 characters')
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    calculateSummary();
  }, [cart]);

  const calculateSummary = () => {
    if (!cart?.items) return;

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    setCartSummary({ subtotal, tax, shipping, total });
  };

  // Validate single field
  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: value });
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      setFormErrors(prev => ({ ...prev, [fieldName]: error.message }));
      return false;
    }
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Validate field on change
    validateField(name, value);
  };

  // Handle blur event
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      // Validate entire form
      await validationSchema.validate(formData, { abortEarly: false });

      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const { data } = await axios.post('/orders', orderData);

      if (data.success) {
        setOrderId(data.order._id);
        setOrderSuccess(true);
        toast.success('Order placed successfully!');
        await clearCart();
        
        // Redirect to order details after 3 seconds
        setTimeout(() => {
          navigate(`/orders/${data.order._id}`);
        }, 3000);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Yup validation errors
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setFormErrors(errors);
        toast.error('Please fix the form errors');
        
        // Scroll to first error
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center mt-16">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Order Placed!</h2>
            <p className="text-slate-600 mb-6">
              Your order has been successfully placed. You will be redirected to your order details shortly.
            </p>
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="px-6 py-3 bg-[#0054fd] text-white rounded-xl hover:bg-[#0541cc] font-semibold transition-all duration-200"
            >
              View Order Details
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
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-300">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Cart
        </button>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.fullName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="+1 234 567 8900"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.postalCode 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="12345"
                    />
                    {formErrors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.address 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="Street address, apartment, suite, etc."
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.city 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="Enter your city"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.city}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border ${
                        formErrors.country 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="Enter your country"
                    />
                    {formErrors.country && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.country}
                      </p>
                    )}
                  </div>

                  {/* Order Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="3"
                      className={`w-full px-4 py-3 border ${
                        formErrors.notes 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-blue-500'
                      } rounded-xl focus:ring-2 focus:border-transparent`}
                      placeholder="Any special instructions for your order..."
                    />
                    {formErrors.notes && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {formErrors.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {[
                    { value: 'credit-card', label: 'Credit Card', icon: '💳' },
                    { value: 'debit-card', label: 'Debit Card', icon: '💳' },
                    { value: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { value: 'cash-on-delivery', label: 'Cash on Delivery', icon: '💵' }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-2xl ml-4 mr-3">{method.icon}</span>
                      <span className="font-semibold text-slate-900">{method.label}</span>
                    </label>
                  ))}
                </div>

                {formErrors.paymentMethod && (
                  <p className="mt-3 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {formErrors.paymentMethod}
                  </p>
                )}

                {formData.paymentMethod !== 'cash-on-delivery' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Payment processing is simulated in this demo. Your order will be marked as paid.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.product?._id} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product?.images?.[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                          {item.product?.name}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
                          <span className="font-semibold text-slate-900">
                            LKR: {((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3 mb-6">
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
                        `LKR ${cartSummary.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Total</span>
                      <span className="text-3xl font-bold text-blue-600">
                        LKR: {cartSummary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || Object.keys(formErrors).length > 0}
                  className="w-full px-6 py-4 bg-[#0c51f2] text-white rounded-xl hover:bg-[#1137b4] font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                {Object.keys(formErrors).length > 0 && (
                  <p className="text-xs text-red-600 text-center mt-3">
                    Please fix the errors above to continue
                  </p>
                )}

                <p className="text-xs text-slate-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;