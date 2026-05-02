import React, { useState, useEffect } from 'react';
import SupportTicketList from '../components/support/SupportTicketList';
import FeedbackList from '../components/feedback/FeedbackList';
import axios from 'axios';

const AdminSupportPage = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [stats, setStats] = useState({
    tickets: {},
    feedback: {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ticketStats, feedbackStats] = await Promise.all([
        axios.get('http://localhost:5000/api/support-tickets/stats'),
        axios.get('http://localhost:5000/api/feedback/stats')
      ]);

      setStats({
        tickets: ticketStats.data.stats,
        feedback: feedbackStats.data.stats
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const tabs = [
    { id: 'tickets', label: 'Support Tickets', icon: '🎫' },
    { id: 'feedback', label: 'Customer Feedback', icon: '💬' }
  ];

  const renderTicketStats = () => {
    if (!stats.tickets.status) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.tickets.status.map((stat) => (
          <div key={stat._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stat._id === 'open' ? 'bg-blue-100' :
                  stat._id === 'in-progress' ? 'bg-yellow-100' :
                  stat._id === 'resolved' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {stat._id === 'open' ? '📨' :
                   stat._id === 'in-progress' ? '⏳' :
                   stat._id === 'resolved' ? '✅' : '🔒'}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                    {stat._id.replace('-', ' ')} Tickets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.count}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFeedbackStats = () => {
    if (!stats.feedback.overall) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                💬
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Feedback
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.feedback.overall.totalFeedback}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                ⭐
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Average Rating
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.feedback.overall.avgRating?.toFixed(1) || 0}/5
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                📊
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Satisfaction Rate
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.feedback.overall.avgRating 
                    ? `${((stats.feedback.overall.avgRating / 5) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tickets':
        return (
          <div>
            {renderTicketStats()}
            <SupportTicketList isAdmin={true} />
          </div>
        );
      case 'feedback':
        return (
          <div>
            {renderFeedbackStats()}
            <FeedbackList isAdmin={true} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support & Feedback Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage customer support tickets and feedback
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;