import { useState, useEffect } from 'react';
import {
    Users,
    Download,
    Search,
    Filter,
    Calendar,
    Mail,
    Phone,
    MapPin,
    FileText,
    X,
    ChevronLeft,
    ChevronRight,
    Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AllUsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        role: '',
        search: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        fetchUsers();
    }, [filters.page, filters.role, filters.sortBy, filters.order]);

    const fetchUsers = () => {
        setLoading(true);

        const queryParams = new URLSearchParams();

        if (filters.role) queryParams.append('role', filters.role);
        if (filters.search) queryParams.append('search', filters.search);
        queryParams.append('page', String(filters.page));
        queryParams.append('limit', String(filters.limit));
        queryParams.append('sortBy', filters.sortBy);
        queryParams.append('order', filters.order);

        axios.get(`/admin/users?${queryParams.toString()}`)
            .then(response => {
                const data = response.data;
                if (data.success) {
                    setUsers(data.data.users);
                    setPagination(data.data.pagination);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Fetch users error:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch users');
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            setFilters({ ...filters, page: 1 });
            fetchUsers();
        }
    };

    const resetFilters = () => {
        setFilters({
            role: '',
            search: '',
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            order: 'desc'
        });
    };

    const downloadPDF = () => {
        const loadingToast = toast.loading('Generating PDF report...');

        const queryParams = new URLSearchParams();
        if (filters.role) queryParams.append('role', filters.role);
        if (filters.search) queryParams.append('search', filters.search);
        queryParams.append('sortBy', filters.sortBy);
        queryParams.append('order', filters.order);

        axios.get(`/admin/users/export/pdf?${queryParams.toString()}`, { responseType: 'blob' })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.dismiss(loadingToast);
                toast.success('PDF downloaded successfully!');
            })
            .catch(error => {
                console.error('PDF download error:', error);
                toast.dismiss(loadingToast);
                toast.error('Failed to download PDF');
            });
    };

    const downloadCSV = () => {
        const loadingToast = toast.loading('Generating CSV file...');

        const queryParams = new URLSearchParams();
        if (filters.role) queryParams.append('role', filters.role);
        if (filters.search) queryParams.append('search', filters.search);
        queryParams.append('sortBy', filters.sortBy);
        queryParams.append('order', filters.order);

        axios.get(`/admin/users/export/csv?${queryParams.toString()}`, { responseType: 'blob' })
            .then(response => {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.dismiss(loadingToast);
                toast.success('CSV downloaded successfully!');
            })
            .catch(error => {
                console.error('CSV download error:', error);
                toast.dismiss(loadingToast);
                toast.error('Failed to download CSV');
            });
    };

    const goToNextPage = () => {
        if (pagination.hasNextPage) {
            setFilters({ ...filters, page: filters.page + 1 });
        }
    };

    const goToPrevPage = () => {
        if (pagination.hasPrevPage) {
            setFilters({ ...filters, page: filters.page - 1 });
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'admin':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-800',
                    icon: '👑',
                    label: 'Administrator'
                };
            case 'technician':
                return {
                    bg: 'bg-orange-100',
                    text: 'text-orange-800',
                    icon: '🔧',
                    label: 'Technician'
                };
            case 'user':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: '👤',
                    label: 'User'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: '👤',
                    label: 'User'
                };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
                        <p className="text-slate-600">Manage and monitor all system users</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={downloadCSV}
                            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Export CSV
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    onKeyDown={handleSearch}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Search
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all ml-4"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="border-t border-slate-200 pt-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={filters.role}
                                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="technician">Technician</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="createdAt">Join Date</option>
                                        <option value="name">Name</option>
                                        <option value="email">Email</option>
                                        <option value="role">Role</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Order
                                    </label>
                                    <select
                                        value={filters.order}
                                        onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-slate-600">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 text-lg font-medium">No users found</p>
                            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                    {users.map((user) => {
                                        const roleBadge = getRoleBadge(user.role);
                                        return (
                                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                                                <span className="text-white font-semibold text-sm">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-slate-500 flex items-center">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        {user.phone ? (
                                                            <div className="flex items-center">
                                                                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                                                <span>{user.phone}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Not provided</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                                                            {roleBadge.icon} {roleBadge.label}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-slate-500">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-900">
                                                        {user.address ? (
                                                            <div className="flex items-center">
                                                                <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                                                <span className="truncate max-w-xs" title={user.address}>
                                                                        {user.address}
                                                                    </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Not provided</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                                <div className="flex items-center">
                                    <p className="text-sm text-slate-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {(pagination.currentPage - 1) * filters.limit + 1}
                                        </span>
                                        {' '}to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)}
                                        </span>
                                        {' '}of{' '}
                                        <span className="font-medium">{pagination.totalCount}</span>
                                        {' '}results
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={!pagination.hasPrevPage}
                                        className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </button>

                                    <span className="px-4 py-2 text-sm text-slate-700 font-medium">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>

                                    <button
                                        onClick={goToNextPage}
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllUsersManagement;