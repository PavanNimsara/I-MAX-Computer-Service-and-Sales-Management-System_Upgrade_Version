import React, { useState } from 'react';
import { useFormik } from 'formik';
import { supportTicketSchema } from '../../utils/validationSchemas';
import { Send, Upload, X, FileText, AlertCircle, Settings, Monitor, Cpu, Wifi, HardDrive, Smartphone, Laptop, AlertTriangle, HelpCircle, CreditCard } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SupportTicketForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const formik = useFormik({
    initialValues: {
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    },
    validationSchema: supportTicketSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });

        console.log('Submitting form with data:', formData);
        const response = await axios.post('http://localhost:5000/api/support-tickets', values);

        if (response.data.success) {
          toast.success('Support ticket created successfully!');
          resetForm();
          setAttachments([]);
          onSuccess?.();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create support ticket');
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  const categories = [
  {
    value: 'technical',
    label: 'Technical Issues',
    icon: Cpu,
    desc: 'Computer hardware problems, diagnostics, repairs, and upgrades',
  },
  {
    value: 'billing',
    label: 'Billing & Payments',
    icon: CreditCard,
    desc: 'Invoice inquiries, payment issues, subscription management, refunds',
  },
  {
    value: 'equipment',
    label: 'Equipment Support',
    icon: Monitor,
    desc: 'Printers, peripherals, office equipment setup and troubleshooting',
  },
  {
    value: 'general',
    label: 'General Support',
    icon: HelpCircle,
    desc: 'Basic IT help, account assistance, FAQs, and general inquiries',
  },
  {
    value: 'complaint',
    label: 'Complaints',
    icon: AlertTriangle,
    desc: 'Report service dissatisfaction, delays, or unresolved issues',
  },
];


  const priorities = [
    { 
      value: 'low', 
      label: 'Low', 
      color: 'from-slate-500 to-slate-600', 
      textColor: 'text-slate-600',
      desc: 'General questions, minor issues',
      badge: '24-48 hours'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'from-yellow-500 to-orange-500', 
      textColor: 'text-yellow-600',
      desc: 'Standard technical issues',
      badge: '4-24 hours'
    },
    { 
      value: 'high', 
      label: 'High', 
      color: 'from-orange-500 to-red-500', 
      textColor: 'text-orange-600',
      desc: 'Urgent business-critical issues',
      badge: '1-4 hours'
    },
    { 
      value: 'urgent', 
      label: 'Critical', 
      color: 'from-red-500 to-red-700', 
      textColor: 'text-red-600',
      desc: 'System down, emergency situations',
      badge: '< 1 hour'
    }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/60">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Technical Support Request
          </h2>
          <p className="text-slate-600 mt-1">Get expert help with your computer and technology issues</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-xl mr-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Quick Response Guarantee</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Our certified technicians will respond within 2 hours during business hours. For faster resolution, 
              please include device models, error messages, and detailed problem descriptions.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-3">
            Issue Summary *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 ${
              formik.touched.subject && formik.errors.subject
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Brief description (e.g., Laptop won't boot up, WiFi connection issues)"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.subject}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">
            Issue Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                  formik.values.category === cat.value
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={formik.values.category === cat.value}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    formik.values.category === cat.value
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg'
                      : 'bg-slate-100 group-hover:bg-blue-100'
                  }`}>
                    <cat.icon className={`w-6 h-6 transition-colors duration-300 ${
                      formik.values.category === cat.value ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                    }`} />
                  </div>
                  {formik.values.category === cat.value && (
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg animate-pulse"></div>
                  )}
                </div>
                <h3 className={`font-bold mb-2 transition-colors duration-300 ${
                  formik.values.category === cat.value ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-900'
                }`}>
                  {cat.label}
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  formik.values.category === cat.value ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-700'
                }`}>
                  {cat.desc}
                </p>
              </label>
            ))}
          </div>
          {formik.touched.category && formik.errors.category && (
            <p className="mt-3 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.category}
            </p>
          )}
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">
            Priority Level *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                  formik.values.priority === priority.value
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formik.values.priority === priority.value}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${priority.color}`}>
                    {priority.badge}
                  </span>
                  {formik.values.priority === priority.value && (
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg animate-pulse"></div>
                  )}
                </div>
                <h4 className={`font-bold mb-1 transition-colors duration-300 ${
                  formik.values.priority === priority.value ? 'text-blue-900' : priority.textColor
                }`}>
                  {priority.label}
                </h4>
                <p className={`text-xs transition-colors duration-300 ${
                  formik.values.priority === priority.value ? 'text-blue-700' : 'text-slate-500'
                }`}>
                  {priority.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-3">
            Detailed Problem Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={7}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
              formik.touched.description && formik.errors.description
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Please provide comprehensive details about your technical issue:

• Device information (brand, model, operating system)
• When did the problem start?
• What were you doing when it occurred?
• Any error messages or codes
• Steps you've already tried
• Is this affecting work productivity?

The more details you provide, the faster we can resolve your issue!"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Be as detailed as possible for faster resolution</span>
            <span>{formik.values.description.length}/2000</span>
          </div>
          {formik.touched.description && formik.errors.description && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.description}
            </p>
          )}
        </div>


        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex-1 flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-5 h-5 mr-3" />
            {isSubmitting ? 'Creating Support Ticket...' : 'Submit Support Request'}
          </button>
        </div>
      </form>

      {/* Response Time Info */}
      
    </div>
  );
};

export default SupportTicketForm;