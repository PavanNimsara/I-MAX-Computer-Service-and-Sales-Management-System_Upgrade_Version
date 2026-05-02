import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreateAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  const issueTypes = [
    'Hardware Repair',
    'Software Issues',
    'Network Problems',
    'Data Recovery',
    'Virus Removal',
    'General Maintenance',
    'Other'
  ];

  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00'
  ];

  // Get minimum date (2 days from now)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  // Validation Schema
  const validationSchema = Yup.object({
    customerName: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    customerEmail: Yup.string()
      .required('Email is required')
      .email('Invalid email format')
      .max(100, 'Email must not exceed 100 characters'),
    customerPhone: Yup.string()
      .required('Phone number is required')
      .matches(/^[\d\s\-\+KATEX_INLINE_OPENKATEX_INLINE_CLOSE]+$/, 'Invalid phone number format')
      .test('min-digits', 'Phone number must have at least 10 digits', (value) => {
        if (!value) return false;
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10;
      })
      .test('max-digits', 'Phone number must not exceed 15 digits', (value) => {
        if (!value) return false;
        const digits = value.replace(/\D/g, '');
        return digits.length <= 15;
      }),
    appointmentDate: Yup.date()
      .required('Appointment date is required')
      .test('not-past', 'Date cannot be in the past', (value) => {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(value) >= today;
      }),
    timeSlot: Yup.string()
      .required('Time slot is required')
      .oneOf(timeSlots, 'Invalid time slot'),
    issueType: Yup.string()
      .required('Issue type is required')
      .oneOf(issueTypes, 'Invalid issue type'),
    issueDescription: Yup.string()
      .required('Issue description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters')
  });

  const formik = useFormik({
    initialValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      appointmentDate: '',
      timeSlot: '',
      issueType: '',
      issueDescription: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await axios.post('/appointments', values);
        if (data.success) {
          toast.success('Appointment created successfully!');
          navigate('/my-appointments');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create appointment');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Check availability when date or time changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (formik.values.appointmentDate && formik.values.timeSlot) {
        setCheckingAvailability(true);
        try {
          const { data } = await axios.get('/appointments/check-availability', {
            params: {
              date: formik.values.appointmentDate,
              timeSlot: formik.values.timeSlot
            }
          });
          setAvailabilityStatus(data);
        } catch (error) {
          console.error('Failed to check availability');
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [formik.values.appointmentDate, formik.values.timeSlot]);

  const InputField = ({ label, name, type = 'text', ...props }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        {...formik.getFieldProps(name)}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
          formik.touched[name] && formik.errors[name]
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
            : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
        }`}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{formik.errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-gray-300">Schedule a repair for your computer</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    name="customerName"
                    placeholder="John Doe"
                  />

                  <InputField
                    label="Email Address"
                    name="customerEmail"
                    type="email"
                    placeholder="john@example.com"
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Phone Number"
                      name="customerPhone"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Appointment Date"
                    name="appointmentDate"
                    type="date"
                    min={getMinDate()}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...formik.getFieldProps('timeSlot')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                        formik.touched.timeSlot && formik.errors.timeSlot
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    >
                      <option value="">Select Time Slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {formik.touched.timeSlot && formik.errors.timeSlot && (
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{formik.errors.timeSlot}</span>
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  {formik.values.appointmentDate && formik.values.timeSlot && (
                    <div className="md:col-span-2">
                      {checkingAvailability ? (
                        <div className="flex items-center text-slate-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Checking availability...
                        </div>
                      ) : availabilityStatus && (
                        <div className={`p-4 rounded-xl flex items-center ${
                          availabilityStatus.available
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          {availabilityStatus.available ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${
                            availabilityStatus.available ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {availabilityStatus.message}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  Issue Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Issue Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...formik.getFieldProps('issueType')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                        formik.touched.issueType && formik.errors.issueType
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    >
                      <option value="">Select Issue Type</option>
                      {issueTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {formik.touched.issueType && formik.errors.issueType && (
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{formik.errors.issueType}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...formik.getFieldProps('issueDescription')}
                      rows="4"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                        formik.touched.issueDescription && formik.errors.issueDescription
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="Please describe the issue in detail..."
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {formik.touched.issueDescription && formik.errors.issueDescription && (
                          <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{formik.errors.issueDescription}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formik.values.issueDescription.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid || (availabilityStatus && !availabilityStatus.available)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formik.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;