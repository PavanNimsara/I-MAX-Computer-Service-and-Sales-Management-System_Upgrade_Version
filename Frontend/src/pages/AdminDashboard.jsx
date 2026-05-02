import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Save, X, Search, Mail, Phone, MapPin, Calendar, Shield, Activity, TrendingUp, Settings, Mountain, MessageSquare, Ticket, Star, AlertCircle, CheckCircle, Clock, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupportTicketList from '../components/support/SupportTicketList';
import FeedbackList from '../components/feedback/FeedbackList';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import toast from 'react-hot-toast';
import axios from 'axios';
import TechnicianManagement from './TechnicianManagement';
import AppointmentManagement from './AppointmentManagement';
import AllUsersManagement from "../components/AllUsersManagement.js";
const AdminDashboard = () => {
  const { user, checkAuth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    recentUsers: [],
    tickets: {},
    feedback: {},
    products: 0,
    orders: 0
  });
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
const [deletionFilter, setDeletionFilter] = useState('all');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchStats();
    if (activeSection === 'admins') {
      fetchAdmins();
    }
  }, [activeSection]);

  const fetchStats = async () => {
    try {
      const [userStats, ticketStats, feedbackStats, productStats, orderStats] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('http://localhost:5000/api/support-tickets/stats'),
        axios.get('http://localhost:5000/api/feedback/stats'),
        axios.get('/products?limit=1'),
        axios.get('/orders/stats/overview')
      ]);

      setStats({
        totalUsers: userStats.data.stats.totalUsers,
        totalAdmins: userStats.data.stats.totalAdmins,
        recentUsers: userStats.data.stats.recentUsers,
        tickets: ticketStats.data.stats,
        feedback: feedbackStats.data.stats,
        products: productStats.data.total || 0,
        orders: orderStats.data.stats.totalOrders || 0
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get('/admin/admins');
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      toast.error('Failed to fetch admins');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.get(`/users/search?query=${searchQuery}`);
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/admin/admins', newAdminData);
      if (data.success) {
        toast.success('Admin created successfully');
        setShowCreateModal(false);
        setNewAdminData({ name: '', email: '', password: '' });
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (adminId) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`/admin/admins/${adminId}`, editingAdmin);
      if (data.success) {
        toast.success('Admin updated successfully');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.delete(`/admin/admins/${adminId}`);
      if (data.success) {
        toast.success('Admin deleted successfully');
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put('/users/profile', profileData);
      if (data.success) {
        toast.success('Profile updated successfully');
        checkAuth();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  const fetchDeletionRequests = async () => {
    try {
      const { data } = await axios.get('/deletion-requests');
      if (data.success) {
        setDeletionRequests(data.deletionRequests);
      }
    } catch (error) {
      toast.error('Failed to fetch deletion requests');
    }
  };

  // Call it in useEffect when activeSection changes:
  useEffect(() => {
    // ... existing code
    if (activeSection === 'deletion-requests') {
      fetchDeletionRequests();
    }
  }, [activeSection]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'technicians', label: 'Technicians', icon: Users },
    { id: 'deletion-requests', label: 'Deletion Requests', icon: Trash2 },
    { id: 'admins', label: 'Manage Admins', icon: Users },
    { id: 'all-users', label: 'All Users', icon: Users },
    { id: 'tickets', label: 'Support Tickets', icon: Ticket },
    { id: 'feedback', label: 'Customer Feedback', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: Settings }
  ];

  const renderTicketStats = () => {
    if (!stats.tickets.status) return null;

    const statusConfig = {
      open: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock, label: 'Open' },
      'in-progress': { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle, label: 'In Progress' },
      resolved: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'text-slate-600', bg: 'bg-slate-100', icon: CheckCircle, label: 'Closed' }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.tickets.status.map((stat) => {
          const config = statusConfig[stat._id] || statusConfig.open;
          const IconComponent = config.icon;
          return (
            <div key={stat._id} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 capitalize">
                    {config.label} Tickets
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${config.color}`}>{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg}`}>
                  <IconComponent className={`w-6 h-6 ${config.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFeedbackStats = () => {
    if (!stats.feedback.overall) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Feedback</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.feedback.overall.totalFeedback}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.feedback.overall.avgRating?.toFixed(1) || 0}/5
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Satisfaction Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.feedback.overall.avgRating
                  ? `${((stats.feedback.overall.avgRating / 5) * 100).toFixed(0)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 mt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">IMAX Admin Portal</h1>
              <p className="text-slate-600 mt-1">Manage your e-commerce system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeSection === item.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Admin Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="bg-blue-500 px-8 py-12">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="w-12 h-12 text-blue-500" />
                      </div>
                      <div className="text-white">
                        <h2 className="text-3xl font-bold">{user?.name}</h2>
                        <p className="text-blue-100 mt-1">{user?.email}</p>
                        <div className="flex items-center mt-4 space-x-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                            IMAX Administrator
                          </span>
                          <span className="text-sm text-blue-100">
                            Admin since {new Date(user?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Mail className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email Address</p>
                          <p className="font-medium text-slate-900">{user?.email || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Phone className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Phone Number</p>
                          <p className="font-medium text-slate-900">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-medium text-slate-900">{user?.address || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Account Created</p>
                          <p className="font-medium text-slate-900">
                            {new Date(user?.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Users</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Products</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">{stats.products}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Orders</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.orders}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Admins</p>
                        <p className="text-3xl font-bold text-slate-600 mt-1">{stats.totalAdmins}</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Overview */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Support Tickets Overview</h3>
                  {renderTicketStats()}
                </div>

                {/* Feedback Overview */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Customer Feedback Overview</h3>
                  {renderFeedbackStats()}
                </div>

                {/* User Search */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Search Users</h3>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Search
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                      {searchResults.map((user) => (
                        <div key={user._id} className="p-4 hover:bg-slate-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-lg ${user.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                              }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent IMAX Members</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {stats.recentUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-slate-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'products' && <ProductManagement />}

            {activeSection === 'orders' && <OrderManagement />}

            {activeSection === 'all-users' && <AllUsersManagement />}

            {activeSection === 'admins' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Admin Management</h2>
                    <p className="text-slate-600 mt-1">Manage IMAX system administrators</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Admin
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-slate-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingAdmin?._id === admin._id ? (
                              <input
                                type="text"
                                value={editingAdmin.name}
                                onChange={(e) => setEditingAdmin({
                                  ...editingAdmin,
                                  name: e.target.value
                                })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                              />
                            ) : (
                              <div className="text-sm font-medium text-slate-900">{admin.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingAdmin?._id === admin._id ? (
                              <input
                                type="email"
                                value={editingAdmin.email}
                                onChange={(e) => setEditingAdmin({
                                  ...editingAdmin,
                                  email: e.target.value
                                })}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                              />
                            ) : (
                              <div className="text-sm text-slate-500">{admin.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-500">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingAdmin?._id === admin._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateAdmin(admin._id)}
                                  className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200"
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingAdmin(null)}
                                  className="p-2 text-white bg-slate-500 hover:bg-slate-600 rounded-lg transition-all duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingAdmin(admin)}
                                  className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {admin._id !== user._id && (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin._id)}
                                    className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
                                    disabled={loading}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Support Ticket Management</h2>
                  <p className="text-slate-600">Manage and respond to customer support requests</p>
                </div>
                {renderTicketStats()}
                <SupportTicketList isAdmin={true} />
              </div>
            )}

            {activeSection === 'appointments' && <AppointmentManagement />}

            {activeSection === 'technicians' && <TechnicianManagement />}

            {activeSection === 'deletion-requests' && (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Deletion Requests</h2>
      <p className="text-slate-600">Review and manage technician account deletion requests</p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {deletionRequests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {deletionRequests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {deletionRequests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <X className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    {/* Filter Tabs */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setDeletionFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            deletionFilter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({deletionRequests.length})
        </button>
        <button
          onClick={() => setDeletionFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            deletionFilter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pending ({deletionRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setDeletionFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            deletionFilter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Approved ({deletionRequests.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setDeletionFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            deletionFilter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Rejected ({deletionRequests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Requests List */}
      {deletionRequests
        .filter(r => deletionFilter === 'all' || r.status === deletionFilter)
        .length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            {deletionFilter === 'all' 
              ? 'No deletion requests found' 
              : `No ${deletionFilter} deletion requests`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletionRequests
            .filter(r => deletionFilter === 'all' || r.status === deletionFilter)
            .map((request) => (
              <div key={request._id} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Check if technician exists (not deleted) */}
                    {request.technician ? (
                      <>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {request.technician.name}
                        </h3>
                        <p className="text-sm text-slate-500">{request.technician.email}</p>
                        <p className="text-sm text-slate-500">
                          {request.technician.specialization || 'No specialization'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Technician Account Deleted
                        </h3>
                        <p className="text-sm text-slate-500">
                          Account no longer exists in the system
                        </p>
                      </>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-1">Reason for Deletion</p>
                  <p className="text-slate-900">{request.reason}</p>
                </div>

                <div className="text-sm text-slate-500 mb-4">
                  <p>Requested on: {new Date(request.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        const response = prompt('Enter admin response (optional):');
                        if (response !== null) {
                          try {
                            setLoading(true);
                            const { data } = await axios.put(`/deletion-requests/${request._id}/approve`, {
                              adminResponse: response
                            });
                            if (data.success) {
                              toast.success('Request approved and account deleted');
                              fetchDeletionRequests();
                            }
                          } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to approve request');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Delete Account
                    </button>
                    <button
                      onClick={async () => {
                        const response = prompt('Enter reason for rejection:');
                        if (response) {
                          try {
                            setLoading(true);
                            const { data } = await axios.put(`/deletion-requests/${request._id}/reject`, {
                              adminResponse: response
                            });
                            if (data.success) {
                              toast.success('Request rejected');
                              fetchDeletionRequests();
                            }
                          } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to reject request');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}

                {request.adminResponse && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-700 mb-1">Admin Response</p>
                    <p className="text-blue-900">{request.adminResponse}</p>
                    {request.reviewedBy && (
                      <p className="text-sm text-blue-600 mt-2">
                        Reviewed by: {request.reviewedBy.name} on {new Date(request.reviewedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  </div>
)}

            {activeSection === 'feedback' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Feedback Management</h2>
                  <p className="text-slate-600">Review and respond to customer feedback and ratings</p>
                </div>
                {renderFeedbackStats()}
                <FeedbackList isAdmin={true} />
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Admin Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          name: e.target.value
                        })}
                        className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          email: e.target.value
                        })}
                        className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          phone: e.target.value
                        })}
                        className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          address: e.target.value
                        })}
                        className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="123 Main St, City, Country"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          bio: e.target.value
                        })}
                        rows="4"
                        className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Tell us about your role in IMAX..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Create New Admin
              </h3>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({
                    ...newAdminData,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({
                    ...newAdminData,
                    email: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({
                    ...newAdminData,
                    password: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  minLength="6"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAdminData({ name: '', email: '', password: '' });
                  }}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;