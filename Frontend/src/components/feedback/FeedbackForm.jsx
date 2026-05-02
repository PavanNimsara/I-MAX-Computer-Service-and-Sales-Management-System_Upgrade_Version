import React, { useState } from 'react';
import { useFormik } from 'formik';
import { feedbackSchema } from '../../utils/validationSchemas';
import { Send, Star, MessageSquare, Shield, AlertCircle, Monitor, Cpu, Wifi, HardDrive, Users, Award, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackForm = ({ onSuccess, existingFeedback = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const formik = useFormik({
    initialValues: {
      subject: existingFeedback?.subject || '',
      category: existingFeedback?.category || '',
      rating: existingFeedback?.rating || 5,
      message: existingFeedback?.message || '',
      isAnonymous: existingFeedback?.isAnonymous || false
    },
    validationSchema: feedbackSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        let response;
        if (existingFeedback) {
          response = await axios.put(`http://localhost:5000/api/feedback/${existingFeedback._id}`, values);
        } else {
          response = await axios.post('http://localhost:5000/api/feedback', values);
        }
        
        if (response.data.success) {
          toast.success(existingFeedback ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
          if (!existingFeedback) resetForm();
          onSuccess?.();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit feedback');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const categories = [
    { 
      value: 'service', 
      label: 'Technical Service', 
      icon: Cpu, 
      desc: 'Quality of technical support and expertise',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      value: 'equipment', 
      label: 'Repair Quality', 
      icon: Monitor, 
      desc: 'Hardware repair and maintenance services',
      gradient: 'from-blue-500 to-emerald-500'
    },
    { 
      value: 'website', 
      label: 'Customer Service', 
      icon: Users, 
      desc: 'Staff behavior and customer interaction',
      gradient: 'from-blue-500 to-blue-500'
    },
    { 
      value: 'staff', 
      label: 'Response Time', 
      icon: Award, 
      desc: 'Speed of service delivery and communication',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      value: 'pricing', 
      label: 'Pricing & Value', 
      icon: ThumbsUp, 
      desc: 'Cost effectiveness and value for money',
      gradient: 'from-indigo-500 to-blue-500'
    },
    { 
      value: 'suggestion', 
      label: 'Overall Experience', 
      icon: HardDrive, 
      desc: 'Complete service experience evaluation',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  const getRatingText = (rating) => {
    const texts = {
      1: 'Very Dissatisfied 😞',
      2: 'Dissatisfied 😕',
      3: 'Neutral 😐',
      4: 'Satisfied 😊',
      5: 'Extremely Satisfied 😍'
    };
    return texts[rating] || '';
  };

  const getRatingColor = (rating) => {
    if (rating === 1) return 'from-red-500 to-red-500';
    if (rating === 2) return 'from-orange-500 to-orange-500';
    if (rating === 3) return 'from-yellow-500 to-yellow-500';
    if (rating === 4) return 'from-lime-500 to-lime-500';
    return 'from-green-500 to-green-500';
  };

  const handleStarClick = (rating) => {
    formik.setFieldValue('rating', rating);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/60">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            {existingFeedback ? 'Update Your Feedback' : 'Share Your IMAX Experience'}
          </h2>
          <p className="text-slate-600 mt-1">
            {existingFeedback ? 'Modify your feedback details' : 'Help us improve our computer services across Sri Lanka'}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-xl mr-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Your Voice Matters!</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              We value every piece of feedback from our customers. Your insights help us enhance our computer 
              services and maintain our position as Sri Lanka's leading technology solution provider.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-3">
            Feedback Title *
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
            placeholder="Brief summary of your feedback (e.g., Excellent laptop repair service, Quick response time)"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.subject}
            </p>
          )}
        </div>

        {/* Category and Rating Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">
              Feedback Category *
            </label>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`relative flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    formik.values.category === cat.value
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-50 shadow-lg scale-[1.02]'
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
                  <div className="flex items-start space-x-4 w-full">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      formik.values.category === cat.value
                        ? `bg-gradient-to-br ${cat.gradient} shadow-lg`
                        : 'bg-slate-100 group-hover:bg-blue-100'
                    }`}>
                      <cat.icon className={`w-6 h-6 transition-colors duration-300 ${
                        formik.values.category === cat.value ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold mb-1 transition-colors duration-300 ${
                          formik.values.category === cat.value ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-900'
                        }`}>
                          {cat.label}
                        </h3>
                        {formik.values.category === cat.value && (
                          <div className={`w-3 h-3 bg-gradient-to-r ${cat.gradient} rounded-full shadow-lg animate-pulse`}></div>
                        )}
                      </div>
                      <p className={`text-sm transition-colors duration-300 ${
                        formik.values.category === cat.value ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-700'
                      }`}>
                        {cat.desc}
                      </p>
                    </div>
                  </div>
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">
              Overall Experience Rating *
            </label>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex flex-col space-y-6">
                {/* Star Rating */}
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-3 transition-all duration-300 hover:scale-125 focus:outline-none rounded-xl group"
                    >
                      <Star
                        className={`w-10 h-10 transition-all duration-300 ${
                          star <= (hoveredStar || formik.values.rating)
                            ? 'text-yellow-400 fill-current drop-shadow-md'
                            : 'text-slate-300 group-hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                {/* Rating Display */}
                {formik.values.rating > 0 && (
                  <div className="text-center space-y-3">
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r ${getRatingColor(formik.values.rating)} text-white font-bold shadow-lg`}>
                      <span className="text-lg">{getRatingText(formik.values.rating)}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      {formik.values.rating} out of 5 stars
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getRatingColor(formik.values.rating)} transition-all duration-500`}
                        style={{ width: `${(formik.values.rating / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {formik.touched.rating && formik.errors.rating && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {formik.errors.rating}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-3">
            Detailed Feedback *
          </label>
          <textarea
            id="message"
            name="message"
            rows={8}
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
              formik.touched.message && formik.errors.message
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Share your detailed experience with IMAX Computer Services:

• Technical service quality and expertise
• Repair work satisfaction and durability  
• Customer service and staff professionalism
• Response time and communication
• Value for money and pricing
• Website/system usability
• Suggestions for improvement
• Any issues or concerns

Your detailed feedback helps us serve Sri Lanka's technology needs better!"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Be specific and constructive in your feedback</span>
            <span className={`${formik.values.message.length > 1500 ? 'text-orange-500 font-semibold' : ''}`}>
              {formik.values.message.length}/2000
            </span>
          </div>
          {formik.touched.message && formik.errors.message && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.message}
            </p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formik.values.isAnonymous}
                onChange={formik.handleChange}
                className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg transition-colors duration-200"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="isAnonymous" className="block text-sm font-bold text-slate-900 mb-2 cursor-pointer">
                Submit as anonymous feedback
              </label>
              <div className="flex items-start space-x-2 text-sm text-slate-600">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-700 mb-1">Privacy Protection</p>
                  <p className="text-slate-600 leading-relaxed">
                    When enabled, your personal information will be kept completely private. 
                    Only our feedback analysis team will have access to improve our services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-2xl hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-5 h-5 mr-3" />
            {isSubmitting 
              ? (existingFeedback ? 'Updating Feedback...' : 'Submitting Feedback...') 
              : (existingFeedback ? 'Update Feedback' : 'Submit Feedback')
            }
          </button>
          
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Monitor className="w-5 h-5" />
            <span className="font-bold">IMAX Computer Solutions</span>
          </div>
          <p className="text-sm text-blue-100">
            Thank you for helping us improve our computer services across Sri Lanka. 
            Your feedback drives our commitment to excellence in technology solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;