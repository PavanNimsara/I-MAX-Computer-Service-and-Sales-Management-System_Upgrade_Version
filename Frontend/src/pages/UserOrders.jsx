import { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, CreditCard, Calendar, DollarSign, Edit2, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import * as Yup from 'yup';

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddress, setEditAddress] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Schema
  const addressValidationSchema = Yup.object().shape({
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
      .matches(/^[a-zA-Z\s]+$/, 'Country name can only contain letters and spaces')
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { data } = await axios.put(`/orders/${orderId}/cancel`);
      if (data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleEditAddress = (order) => {
    setSelectedOrder(order);
    setEditAddress(order.shippingAddress);
    setFormErrors({});
    setShowEditModal(true);
  };

  // Validate single field
  const validateField = async (fieldName, value) => {
    try {
      await addressValidationSchema.validateAt(fieldName, { [fieldName]: value });
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
  const handleAddressChange = (field, value) => {
    setEditAddress({ ...editAddress, [field]: value });
    validateField(field, value);
  };

  // Handle blur event
  const handleBlur = (field, value) => {
    validateField(field, value);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validate entire form
      await addressValidationSchema.validate(editAddress, { abortEarly: false });

      const { data } = await axios.put(`/orders/${selectedOrder._id}/address`, {
        shippingAddress: editAddress
      });

      if (data.success) {
        toast.success('Shipping address updated successfully');
        setShowEditModal(false);
        setEditAddress({});
        fetchOrders();
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
        setTimeout(() => {
          const firstErrorField = document.querySelector('.border-red-500');
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update address');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      pending: { color: 'text-yellow-600', label: 'Pending' },
      paid: { color: 'text-green-600', label: 'Paid' },
      failed: { color: 'text-red-600', label: 'Failed' },
      refunded: { color: 'text-blue-600', label: 'Refunded' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <Package className="w-7 h-7 mr-3 text-blue-600" />
          My Orders
        </h2>
        <p className="text-slate-600 mt-1">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
          <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-600 mb-6">Start shopping to place your first order</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-[#8BE13B] text-[#1A1A1A] rounded-xl hover:bg-[#7acc32] font-semibold transition-all duration-200"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const paymentConfig = getPaymentStatusConfig(order.paymentStatus);

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-slate-500">Order Number</p>
                        <p className="font-bold text-slate-900">{order.orderNumber}</p>
                      </div>
                      <div className="h-10 w-px bg-slate-300"></div>
                      <div>
                        <p className="text-sm text-slate-500">Order Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-xl font-semibold flex items-center ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{item.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-slate-500">Quantity: {item.quantity}</span>
                            <span className="font-semibold text-slate-900">
                              LKR: {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Shipping Address */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          Shipping Address
                        </h4>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleEditAddress(order)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.phone}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>

                    {/* Payment & Total */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-900 flex items-center mb-3">
                        <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                        Payment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Payment Method:</span>
                          <span className="font-medium text-slate-900 capitalize">
                            {order.paymentMethod.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Payment Status:</span>
                          <span className={`font-semibold ${paymentConfig.color}`}>
                            {paymentConfig.label}
                          </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 mt-2">
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Subtotal:</span>
                            <span>LKR: {order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 mb-2">
                            <span>Shipping:</span>
                            <span>LKR: {order.shippingCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                            <span className="font-semibold text-slate-900">Total:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              LKR: {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Order Notes:</p>
                      <p className="text-sm text-blue-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {/* Delivery Info */}
                  {order.deliveredAt && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        <strong>Delivered on:</strong> {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {order.cancelledAt && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-800">
                        <strong>Cancelled on:</strong> {new Date(order.cancelledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">Edit Shipping Address</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setFormErrors({});
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editAddress.fullName || ''}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    onBlur={(e) => handleBlur('fullName', e.target.value)}
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editAddress.phone || ''}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
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
                    value={editAddress.postalCode || ''}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    onBlur={(e) => handleBlur('postalCode', e.target.value)}
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
                    value={editAddress.address || ''}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    onBlur={(e) => handleBlur('address', e.target.value)}
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
                    value={editAddress.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    onBlur={(e) => handleBlur('city', e.target.value)}
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
                    value={editAddress.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    onBlur={(e) => handleBlur('country', e.target.value)}
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
              </div>

              {/* Error Summary */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-semibold mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {Object.values(formErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormErrors({});
                  }}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(formErrors).length > 0}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;