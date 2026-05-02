import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, X, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import axios from 'axios';

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const specializations = [
    'Hardware Repair',
    'Software Issues',
    'Network Problems',
    'Data Recovery',
    'Virus Removal',
    'General Maintenance'
  ];

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/technicians');
      if (data.success) {
        setTechnicians(data.technicians);
      }
    } catch (error) {
      toast.error('Failed to fetch technicians');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format'),
    password: editingTechnician 
      ? Yup.string().min(6, 'Password must be at least 6 characters')
      : Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^[\d\s\-\+KATEX_INLINE_OPENKATEX_INLINE_CLOSE]+$/, 'Invalid phone number format'),
    specialization: Yup.string()
      .required('Specialization is required'),
    experience: Yup.number()
      .required('Experience is required')
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience cannot exceed 50 years'),
    status: Yup.string()
      .oneOf(['active', 'inactive'], 'Invalid status')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      status: 'active'
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Remove password field if empty during edit
        const submitData = { ...values };
        if (editingTechnician && !submitData.password) {
          delete submitData.password;
        }

        if (editingTechnician) {
          const { data } = await axios.put(`/technicians/${editingTechnician._id}`, submitData);
          if (data.success) {
            toast.success('Technician updated successfully');
          }
        } else {
          const { data } = await axios.post('/technicians', submitData);
          if (data.success) {
            toast.success('Technician created successfully');
          }
        }
        resetForm();
        setShowModal(false);
        setEditingTechnician(null);
        fetchTechnicians();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Operation failed');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (technician) => {
    setEditingTechnician(technician);
    formik.setValues({
      name: technician.name,
      email: technician.email,
      password: '',
      phone: technician.phone || '',
      specialization: technician.specialization,
      experience: technician.experience,
      status: technician.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician? This will also delete their login credentials.')) return;

    try {
      const { data } = await axios.delete(`/technicians/${id}`);
      if (data.success) {
        toast.success('Technician deleted successfully');
        fetchTechnicians();
      }
    } catch (error) {
      toast.error('Failed to delete technician');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTechnician(null);
    formik.resetForm();
    setShowPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Users className="w-7 h-7 mr-3 text-blue-600" />
              Technician Management
            </h2>
            <p className="text-slate-600 mt-1">Manage your technical support team</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Technician
          </button>
        </div>
      </div>

      {/* Technicians Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((technician) => (
            <div key={technician._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{technician.name}</h3>
                  <p className="text-sm text-slate-500">{technician.specialization}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  technician.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : technician.status === 'pending-deletion'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {technician.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {technician.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {technician.phone || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {technician.experience} years experience
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(technician)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(technician._id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingTechnician ? 'Edit Technician' : 'Add New Technician'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('name')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="John Doe"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...formik.getFieldProps('email')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password {!editingTechnician && <span className="text-red-500">*</span>}
                    {editingTechnician && <span className="text-xs text-slate-500">(Leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...formik.getFieldProps('password')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                        formik.touched.password && formik.errors.password
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.password}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...formik.getFieldProps('phone')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      formik.touched.phone && formik.errors.phone
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="+94 77 123 4567"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...formik.getFieldProps('specialization')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      formik.touched.specialization && formik.errors.specialization
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {formik.touched.specialization && formik.errors.specialization && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.specialization}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps('experience')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      formik.touched.experience && formik.errors.experience
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="5"
                  />
                  {formik.touched.experience && formik.errors.experience && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{formik.errors.experience}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    {...formik.getFieldProps('status')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {formik.isSubmitting ? 'Saving...' : editingTechnician ? 'Update Technician' : 'Create Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianManagement;