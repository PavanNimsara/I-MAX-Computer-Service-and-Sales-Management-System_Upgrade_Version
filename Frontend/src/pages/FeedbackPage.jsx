import React, { useState } from 'react';
import { MessageSquare, ArrowLeft, CheckCircle, Star, Award, Users, TrendingUp, ThumbsUp, Heart, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedbackForm from '../components/feedback/FeedbackForm';

const FeedbackPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = () => {
    setSuccessMessage('Thank you for your valuable feedback! We appreciate you taking the time to help us improve our computer services.');
    setShowSuccess(true);
    
    // Hide success message after 6 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 6000);
  };

  const feedbackStats = [
    {
      icon: Star,
      label: 'Average Rating',
      value: '4.8/5',
      color: 'blue-500'
    },
    {
      icon: Users2,
      label: 'Happy Customers',
      value: '2,500+',
      color: 'blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Satisfaction Rate',
      value: '96%',
      color: 'blue-700'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Perera',
      location: 'Colombo',
      rating: 5,
      comment: 'Excellent laptop repair service! Fixed my device within 2 hours.',
      service: 'Laptop Repair'
    },
    {
      name: 'Kamal Silva',
      location: 'Kandy',
      rating: 5,
      comment: 'Professional team and fair pricing. Highly recommended for PC builds.',
      service: 'PC Assembly'
    },
    {
      name: 'Nisha Fernando',
      location: 'Galle',
      rating: 4,
      comment: 'Quick response and solved my network issues efficiently.',
      service: 'Network Setup'
    }
  ];

  const feedbackCategories = [
    {
      title: 'Service Quality',
      icon: Award,
      count: '1,250+ reviews',
      color: 'blue-500'
    },
    {
      title: 'Technical Expertise',
      icon: Star,
      count: '980+ reviews',
      color: 'blue-600'
    },
    {
      title: 'Customer Support',
      icon: Heart,
      count: '850+ reviews',
      color: 'blue-700'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50 mt-16">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-blue-900">
                  Service Feedback
                </h1>
                <p className="text-blue-700 mt-1 text-sm sm:text-base">
                  Share your experience and help us improve our computer services
                </p>
              </div>
            </div>
            
            <Link 
              to="/dashboard"
              className="flex items-center px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start shadow-sm">
            <div className="p-2 bg-blue-100 rounded-xl mr-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Success!</p>
              <p className="text-sm text-blue-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {feedbackStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-blue-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FeedbackForm onSuccess={handleSuccess} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Feedback Categories */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Feedback Categories</h3>
              <div className="space-y-4">
                {feedbackCategories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all">
                   
                    <div>
                      <h4 className="font-semibold text-blue-900">{category.title}</h4>
                      <p className="text-sm text-blue-600">{category.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Testimonials */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-blue-600">{testimonial.location}</p>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">"{testimonial.comment}"</p>
                    <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">{testimonial.service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Feedback Matters */}
            <div className="bg-blue-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="p-3 bg-blue-400 rounded-xl inline-block mb-3">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Your Voice Matters</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Every piece of feedback helps us improve our services and serve Sri Lanka's technology needs better.
                </p>
                <div className="bg-blue-400 rounded-xl p-3">
                  <p className="text-sm font-medium">Impact of Your Feedback:</p>
                  <ul className="text-sm text-blue-100 mt-2 space-y-1">
                    <li>• Service quality improvements</li>
                    <li>• Staff training programs</li>
                    <li>• New service offerings</li>
                    <li>• Better customer experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;