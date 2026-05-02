import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Box, Tag, Search, Filter, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import * as Yup from 'yup';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    quantity: '',
    specifications: {},
    featured: false,
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const categoryOptions = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling', 'Peripherals', 'Accessories'];

  // Validation Schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Product name is required')
      .min(3, 'Product name must be at least 3 characters')
      .max(200, 'Product name must not exceed 200 characters'),
    
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must not exceed 2000 characters'),
    
    category: Yup.string()
      .required('Category is required')
      .oneOf(categoryOptions, 'Invalid category selected'),
    
    brand: Yup.string()
      .required('Brand is required')
      .min(2, 'Brand must be at least 2 characters')
      .max(100, 'Brand must not exceed 100 characters'),
    
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be a positive number')
      .min(0.01, 'Price must be at least $0.01')
      .max(999999.99, 'Price must not exceed $999,999.99')
      .test('decimal', 'Price must have at most 2 decimal places', (value) => {
        if (value) {
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        }
        return true;
      }),
    
    quantity: Yup.number()
      .required('Quantity is required')
      .integer('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative')
      .max(99999, 'Quantity must not exceed 99,999'),
    
    status: Yup.string()
      .required('Status is required')
      .oneOf(['active', 'inactive'], 'Invalid status'),
    
    featured: Yup.boolean(),
    
    specifications: Yup.object()
  });

  // Validate images
  const validateImages = () => {
    if (!editingProduct && images.length === 0) {
      return 'At least one product image is required';
    }
    if (editingProduct && existingImages.length === 0 && images.length === 0) {
      return 'At least one product image is required';
    }
    
    // Validate file sizes and types
    for (let file of images) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return 'Each image must be less than 5MB';
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        return 'Only JPG, PNG, and WEBP images are allowed';
      }
    }
    
    return null;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [searchQuery, filters, pagination.currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.status && { status: filters.status })
      });

      const { data } = await axios.get(`/products?${params}`);
      if (data.success) {
        setProducts(data.products);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total
        });
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/products/categories');
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get('/products/brands');
      if (data.success) setBrands(data.brands);
    } catch (error) {
      console.error('Failed to fetch brands');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);

    // Clear image error when files are selected
    if (files.length > 0) {
      setFormErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleAddSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [newSpecKey]: newSpecValue
        }
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleDeleteExistingImage = async (imageUrl) => {
    if (existingImages.length <= 1) {
      toast.error('Product must have at least one image');
      return;
    }

    try {
      const { data } = await axios.delete(`/products/${editingProduct._id}/images`, {
        data: { imageUrl }
      });

      if (data.success) {
        setExistingImages(existingImages.filter(img => img !== imageUrl));
        toast.success('Image deleted');
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  // Validate single field
  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: value });
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    } catch (error) {
      setFormErrors(prev => ({ ...prev, [fieldName]: error.message }));
    }
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Validate images
      const imageError = validateImages();
      if (imageError) {
        setFormErrors({ images: imageError });
        toast.error(imageError);
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'specifications') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      images.forEach(image => {
        submitData.append('images', image);
      });

      if (editingProduct) {
        const { data } = await axios.put(`/products/${editingProduct._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
          toast.success('Product updated successfully');
        }
      } else {
        const { data } = await axios.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
          toast.success('Product created successfully');
        }
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Yup validation errors
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setFormErrors(errors);
        toast.error('Please fix the form errors');
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      quantity: product.quantity,
      specifications: product.specifications || {},
      featured: product.featured,
      status: product.status
    });
    setExistingImages(product.images);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { data } = await axios.delete(`/products/${id}`);
      if (data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      price: '',
      quantity: '',
      specifications: {},
      featured: false,
      status: 'active'
    });
    setImages([]);
    setExistingImages([]);
    setPreviewImages([]);
    setEditingProduct(null);
    setFormErrors({});
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Package className="w-7 h-7 mr-3 text-blue-600" />
              Product Management
            </h2>
            <p className="text-slate-600 mt-1">Manage your computer parts inventory</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="relative h-48 bg-slate-100">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">
                  {product.name}
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Tag className="w-4 h-4 mr-2" />
                  {product.category}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Box className="w-4 h-4 mr-2" />
                  Stock: {product.quantity}
                </div>
                <div className="flex items-center text-lg font-bold text-blue-600">
                  LKR: {product.price.toFixed(2)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Product Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(image)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview New Images */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {previewImages.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                      />
                    ))}
                  </div>
                )}

                <div className={`border-2 border-dashed ${formErrors.images ? 'border-red-300' : 'border-slate-300'} rounded-xl p-6 text-center hover:border-blue-500 transition-colors`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className={`w-12 h-12 ${formErrors.images ? 'text-red-400' : 'text-slate-400'} mx-auto mb-2`} />
                    <p className="text-slate-600 font-medium">Click to upload images</p>
                    <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </label>
                </div>
                {formErrors.images && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {formErrors.images}
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                    placeholder="Enter product name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    onBlur={(e) => validateField('brand', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.brand ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                    placeholder="Enter brand name"
                  />
                  {formErrors.brand && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.brand}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    onBlur={(e) => validateField('category', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.category}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    onBlur={(e) => validateField('price', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    onBlur={(e) => validateField('quantity', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                    placeholder="0"
                  />
                  {formErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.quantity}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    onBlur={(e) => validateField('status', e.target.value)}
                    className={`w-full px-4 py-3 border ${formErrors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {formErrors.status && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {formErrors.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onBlur={(e) => validateField('description', e.target.value)}
                  rows="4"
                  className={`w-full px-4 py-3 border ${formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent`}
                  placeholder="Enter product description"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {formErrors.description}
                  </p>
                )}
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Specifications
                </label>
                
                <div className="space-y-3 mb-4">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(key)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Key (e.g., Cores)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 8)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-3 text-sm font-medium text-slate-700">
                  Feature this product
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;