import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Edit2, X as XIcon, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/appointments/my-appointments');
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const { data } = await axios.put(`/appointments/${id}/cancel`);
      if (data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      'in-progress': { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XIcon, label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);

    return appointmentDate > oneDayFromNow;
  };

  const canEditAppointment = (appointment) => {
    return appointment.status !== 'cancelled' && appointment.status !== 'completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-7 h-7 mr-3 text-blue-600" />
              My Appointments
            </h2>
            <p className="text-slate-600 mt-1">View and manage your repair appointments</p>
          </div>
          <button
            onClick={() => navigate('/create-appointment')}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
          <Calendar className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No appointments yet</h3>
          <p className="text-slate-600 mb-6">Book your first repair appointment to get started</p>
          <button
            onClick={() => navigate('/create-appointment')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => {
            const statusConfig = getStatusConfig(appointment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={appointment._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-slate-500">Appointment Number</p>
                        <p className="font-bold text-slate-900">{appointment.appointmentNumber}</p>
                      </div>
                      <div className="h-10 w-px bg-slate-300"></div>
                      <div>
                        <p className="text-sm text-slate-500">Booked On</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl font-semibold flex items-center ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Appointment Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Appointment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium w-24">Date:</span>
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium w-24">Time:</span>
                          <span>{appointment.timeSlot}</span>
                        </div>
                        <div className="flex items-start text-slate-600">
                          <span className="font-medium w-24">Issue:</span>
                          <span className="flex-1">{appointment.issueType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Technician */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium w-24">Name:</span>
                          <span>{appointment.customerName}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium w-24">Email:</span>
                          <span>{appointment.customerEmail}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium w-24">Phone:</span>
                          <span>{appointment.customerPhone}</span>
                        </div>
                        {appointment.technician && (
                          <div className="flex items-center text-slate-600 pt-2 border-t border-slate-200">
                            <span className="font-medium w-24">Technician:</span>
                            <span className="text-blue-600 font-medium">{appointment.technician.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Issue Description */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-900 flex items-center mb-3">
                      Issue Description
                    </h4>
                    <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl">
                      {appointment.issueDescription}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
                    {canEditAppointment(appointment) && (
                      <button
                        onClick={() => navigate(`/edit-appointment/${appointment._id}`)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    )}
                    {canCancelAppointment(appointment) && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Cancellation/Completion Info */}
                  {appointment.cancelledAt && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-800">
                        <strong>Cancelled on:</strong> {new Date(appointment.cancelledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {appointment.completedAt && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        <strong>Completed on:</strong> {new Date(appointment.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserAppointments;