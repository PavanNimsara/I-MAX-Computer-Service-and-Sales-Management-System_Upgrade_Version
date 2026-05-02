import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Trash2, Filter, UserCheck, AlertCircle } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import axios from 'axios';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
    fetchStats();
  }, [filterStatus, pagination.currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...(filterStatus && { status: filterStatus })
      });

      const { data } = await axios.get(`/appointments?${params}`);
      if (data.success) {
        setAppointments(data.appointments);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total
        });
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data } = await axios.get('/technicians?status=active');
      if (data.success) {
        setTechnicians(data.technicians);
      }
    } catch (error) {
      console.error('Failed to fetch technicians');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/appointments/stats/overview');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  // Assign Technician Validation
  const assignValidationSchema = Yup.object({
    technicianId: Yup.string()
      .required('Please select a technician')
  });

  const assignFormik = useFormik({
    initialValues: {
      technicianId: ''
    },
    validationSchema: assignValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { data } = await axios.put(
          `/appointments/${selectedAppointment._id}/assign-technician`,
          values
        );
        if (data.success) {
          toast.success('Technician assigned successfully');
          setShowAssignModal(false);
          resetForm();
          fetchAppointments();
          fetchStats();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to assign technician');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const { data } = await axios.put(`/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      if (data.success) {
        toast.success('Status updated successfully');
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { data } = await axios.delete(`/appointments/${appointmentId}`);
      if (data.success) {
        toast.success('Appointment deleted successfully');
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const handleAssignTechnician = (appointment) => {
    setSelectedAppointment(appointment);
    assignFormik.setFieldValue('technicianId', appointment.technician?._id || '');
    setShowAssignModal(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'in-progress': { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <Calendar className="w-7 h-7 mr-3 text-blue-600" />
          Appointment Management
        </h2>
        <p className="text-slate-600 mt-1">Manage customer repair appointments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pendingAppointments || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-800">{stats.confirmedAppointments || 0}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-sm p-4 border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-purple-800">{stats.inProgressAppointments || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-800">{stats.completedAppointments || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm p-4 border border-red-200">
          <p className="text-sm text-red-700 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">{stats.cancelledAppointments || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {appointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);

                  return (
                    <tr key={appointment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{appointment.appointmentNumber}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(appointment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{appointment.customerName}</p>
                          <p className="text-sm text-slate-500">{appointment.customerEmail}</p>
                          <p className="text-sm text-slate-500">{appointment.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500">{appointment.timeSlot}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-slate-900">{appointment.issueType}</p>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {appointment.issueDescription}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.technician ? (
                          <div>
                            <p className="font-medium text-blue-600">{appointment.technician.name}</p>
                            <p className="text-sm text-slate-500">{appointment.technician.specialization}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignTechnician(appointment)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Assign Technician
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                          className={`px-3 py-1 rounded-lg font-semibold text-sm border-0 ${statusConfig.color}`}
                          disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {!appointment.technician && (
                            <button
                              onClick={() => handleAssignTechnician(appointment)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Assign Technician"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(appointment._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
              Assign Technician
            </h3>

            <div className="mb-4 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-1">Appointment</p>
              <p className="font-semibold text-slate-900">{selectedAppointment?.appointmentNumber}</p>
              <p className="text-sm text-slate-600 mt-2">Issue: {selectedAppointment?.issueType}</p>
            </div>

            <form onSubmit={assignFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Technician <span className="text-red-500">*</span>
                </label>
                <select
                  {...assignFormik.getFieldProps('technicianId')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                    assignFormik.touched.technicianId && assignFormik.errors.technicianId
                      ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                >
                  <option value="">Select a technician</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} - {tech.specialization} ({tech.experience} years exp)
                    </option>
                  ))}
                </select>
                {assignFormik.touched.technicianId && assignFormik.errors.technicianId && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{assignFormik.errors.technicianId}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    assignFormik.resetForm();
                  }}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignFormik.isSubmitting || !assignFormik.isValid}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  {assignFormik.isSubmitting ? 'Assigning...' : 'Assign Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;