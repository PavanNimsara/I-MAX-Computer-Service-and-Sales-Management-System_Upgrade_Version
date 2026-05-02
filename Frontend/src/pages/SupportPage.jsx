import React, { useState } from 'react';
import { Monitor, ArrowLeft, CheckCircle, Settings, MessageSquare, HardDrive, Phone, Clock, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportTicketForm from '../components/support/SupportTicketForm';

const SupportPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = () => {
    setSuccessMessage('Your support ticket has been created successfully! Our technical team will respond within 2 hours during business hours.');
    setShowSuccess(true);
    
    // Hide success message after 6 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 6000);
  };

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Chat with our technical experts in real-time',
      icon: MessageSquare,
      color: 'blue-500',
      action: 'Start Chat'
    },
    {
      title: 'Remote Assistance',
      description: 'Get remote computer assistance and troubleshooting',
      icon: Monitor,
      color: 'blue-600',
      action: 'Request Access'
    },
    {
      title: 'Knowledge Base',
      description: 'Browse our comprehensive technical documentation',
      icon: HardDrive,
      color: 'blue-700',
      action: 'Browse FAQ'
    }
  ];

  const supportStats = [
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: '< 2 Hours',
      color: 'blue-500'
    },
    {
      icon: Users,
      label: 'Expert Technicians',
      value: '25+ Team',
      color: 'blue-600'
    },
    {
      icon: Shield,
      label: 'Resolution Rate',
      value: '98.5%',
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
                  Technical Support
                </h1>
                <p className="text-blue-700 mt-1 text-sm sm:text-base">
                  Get expert help with your computer and technology issues
                </p>
              </div>
            </div>
            
            <Link 
              to="/"
              className="flex items-center px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Back to Home</span>
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
        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-${stat.color} rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-blue-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Support Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SupportTicketForm onSuccess={handleSuccess} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="group border border-blue-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 bg-${action.color} rounded-lg`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-sm text-blue-600 mb-3">
                          {action.description}
                        </p>
                        <button className={`w-full px-3 py-2 text-sm bg-blue-50 text-${action.color} hover:bg-blue-100 rounded-lg font-medium transition-colors`}>
                          {action.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-blue-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="p-3 bg-blue-400 rounded-xl inline-block mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Emergency Support</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Critical system failures? Our emergency response team is available 24/7.
                </p>
                <button className="w-full px-4 py-3 bg-white text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Call: +94 11 234 5678
                </button>
              </div>
            </div>

            {/* Service Hours */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Service Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Monday - Friday</span>
                  <span className="text-blue-900 font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Saturday</span>
                  <span className="text-blue-900 font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Sunday</span>
                  <span className="text-blue-900 font-medium">Emergency Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default SupportPage;