import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ArrowLeft, Mail, Calendar, CreditCard, CheckCircle, XCircle, Clock, FileText, AlertCircle
} from 'lucide-react';
import { eventService } from '../../services/api';
import { showToast } from '../../services/toast';
import { Button, Loading } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';

const EventAttendeesPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAttendees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventAttendees(slug, statusFilter !== 'all' ? statusFilter : undefined);
      console.log('👥 Attendees data:', data);
      setEvent({
        title: data.event_title,
        total_attendees: data.total_attendees,
        max_attendees: data.max_attendees
      });
      setAttendees(data.attendees);
    } catch (error) {
      console.error('Failed to fetch attendees:', error);
      console.error('Error details:', error.response?.data);
      showToast.error('Failed to load attendees');
      // If forbidden, redirect back to event page
      if (error.response?.status === 403) {
        navigate(`/events/${slug}`);
      }
    } finally {
      setLoading(false);
    }
  }, [slug, statusFilter, navigate]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      attended: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
      no_show: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
        method === 'online' 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      }`}>
        <CreditCard className="w-3 h-3" />
        {method === 'online' ? 'Online Payment' : 'Cash'}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
            Event not found
          </h2>
          <Button onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const filteredAttendees = statusFilter === 'all' 
    ? attendees 
    : attendees.filter(a => a.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(`/events/${slug}`)}
            className="mb-4"
          >
            Back to Event
          </Button>

          <div className="bg-white dark:bg-[#2d2a27] rounded-3xl p-8 shadow-xl border border-[#e8e7e5] dark:border-[#4a4642]">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                  Event Attendees
                </h1>
                <p className="text-xl text-[#5d5955] dark:text-[#c4bfb9] mb-4">
                  {event.title}
                </p>
                <div className="flex items-center gap-4 text-sm text-[#9b9791] dark:text-[#6d6762]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      <strong>{event.total_attendees}</strong> registered
                    </span>
                  </div>
                  {event.max_attendees > 0 && (
                    <div>
                      / {event.max_attendees} capacity
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      statusFilter === status
                        ? 'bg-[#6d2842] text-white'
                        : 'bg-[#f5f5f3] dark:bg-[#1a1816] text-[#5d5955] dark:text-[#c4bfb9] hover:bg-[#e8e7e5] dark:hover:bg-[#3a3633]'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attendees List */}
        {filteredAttendees.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#2d2a27] rounded-3xl p-12 text-center shadow-xl border border-[#e8e7e5] dark:border-[#4a4642]"
          >
            <Users className="w-16 h-16 text-[#9b9791] dark:text-[#6d6762] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
              No attendees found
            </h3>
            <p className="text-[#5d5955] dark:text-[#c4bfb9]">
              {statusFilter !== 'all' 
                ? `No attendees with status "${statusFilter}"`
                : 'No one has subscribed to this event yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {filteredAttendees.map((attendee, index) => (
              <motion.div
                key={attendee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-[#2d2a27] rounded-2xl p-6 shadow-lg border border-[#e8e7e5] dark:border-[#4a4642] hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Attendee Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6d2842] to-[#a64d6d] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {attendee.attendee_name ? attendee.attendee_name.charAt(0).toUpperCase() : attendee.user?.email?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div className="flex-1">
                        {/* Name & Email */}
                        <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                          {attendee.attendee_name || 'Anonymous'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9] mb-3">
                          <Mail className="w-4 h-4" />
                          <span>{attendee.user?.email || 'No email'}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(attendee.status)}
                          {getPaymentMethodBadge(attendee.payment_method)}
                        </div>

                        {/* Additional Info */}
                        {attendee.attendee_notes && (
                          <div className="mt-3 p-3 bg-[#f5f5f3] dark:bg-[#1a1816] rounded-xl">
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">Notes:</p>
                                <p className="text-[#5d5955] dark:text-[#c4bfb9]">{attendee.attendee_notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {attendee.special_requirements && (
                          <div className="mt-3 p-3 bg-[#f5f5f3] dark:bg-[#1a1816] rounded-xl">
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-[#b8862f] dark:text-[#d4a343] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">Special Requirements:</p>
                                <p className="text-[#5d5955] dark:text-[#c4bfb9]">{attendee.special_requirements}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="flex flex-col items-end gap-2 text-sm text-[#9b9791] dark:text-[#6d6762]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Subscribed: {formatDate(attendee.subscribed_at)}</span>
                    </div>
                    {attendee.confirmed_at && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmed: {formatDate(attendee.confirmed_at)}</span>
                      </div>
                    )}
                    <div className="text-right mt-2">
                      <p className="text-xs text-[#9b9791] dark:text-[#6d6762]">Confirmation Code</p>
                      <p className="font-mono text-xs text-[#2d2a27] dark:text-[#fafaf9] bg-[#f5f5f3] dark:bg-[#1a1816] px-2 py-1 rounded">
                        {attendee.confirmation_code}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-3xl p-8 text-white shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90 mb-1">Total</p>
              <p className="text-3xl font-bold">{attendees.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90 mb-1">Confirmed</p>
              <p className="text-3xl font-bold">
                {attendees.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90 mb-1">Pending</p>
              <p className="text-3xl font-bold">
                {attendees.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90 mb-1">Cancelled</p>
              <p className="text-3xl font-bold">
                {attendees.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventAttendeesPage;
