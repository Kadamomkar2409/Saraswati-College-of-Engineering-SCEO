import React, { useState } from 'react';
import api from '../services/api';

const NoticeEventForm = ({
  onSuccess,
  onClose,
  defaultType = 'Notice'
}) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =========================
  // HANDLE INPUT CHANGES
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (error) {
      setError('');
    }
  };

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (!formData.title.trim()) {
      setError('Please enter a title.');
      return;
    }

    // Validate description
    if (!formData.description.trim()) {
      setError('Please enter a description.');
      return;
    }

    // Validate event date
    if (formData.type === 'Event' && !formData.event_date) {
      setError('Please select an event date.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),

        event_date:
          formData.type === 'Event'
            ? formData.event_date
            : null,

        event_time:
          formData.type === 'Event'
            ? formData.event_time || null
            : null,

        venue:
          formData.type === 'Event'
            ? formData.venue.trim() || null
            : null
      };

      await api.post('/notices-events', payload);

      // Reset form
      setFormData({
        type: defaultType,
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        venue: ''
      });

      // Notify dashboard
      onSuccess();

    } catch (err) {
      console.error('Error creating notice/event:', err);

      setError(
        err.response?.data?.message ||
        'Failed to publish notice/event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
      FIX:
      overflow-y-auto allows the complete popup
      to scroll when the screen is small.
    */
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">

      {/* Center the popup */}
      <div className="min-h-full flex items-start sm:items-center justify-center p-4">

        {/* =========================
            MODAL
        ========================= */}
        <div className="w-full max-w-lg my-4 sm:my-8 bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* =========================
              HEADER
          ========================= */}
          <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 px-6 py-5 text-white">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold">
                  {formData.type === 'Event'
                    ? 'Add College Event'
                    : 'Add College Notice'}
                </h2>

                <p className="text-sm text-slate-300 mt-1">
                  Publish information for college users
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-shrink-0 text-slate-300 hover:text-white text-3xl leading-none disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>

            </div>
          </div>

          {/* =========================
              FORM
          ========================= */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4"
          >

            {/* =========================
                TYPE
            ========================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              >
                <option value="Notice">
                  Notice
                </option>

                <option value="Event">
                  Event
                </option>
              </select>
            </div>

            {/* =========================
                TITLE
            ========================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder={
                  formData.type === 'Event'
                    ? 'Example: Annual Sports Day'
                    : 'Example: Internal Examination Notice'
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              />
            </div>

            {/* =========================
                DESCRIPTION
            ========================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder={
                  formData.type === 'Event'
                    ? 'Enter event details...'
                    : 'Enter notice details...'
                }
                rows={4}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-slate-100"
              />
            </div>

            {/* =========================
                EVENT DETAILS
            ========================= */}
            {formData.type === 'Event' && (
              <div className="border-t border-slate-200 pt-4 space-y-4">

                <div className="text-sm font-bold text-indigo-700">
                  Event Details
                </div>

                {/* EVENT DATE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Event Date *
                  </label>

                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>

                {/* EVENT TIME */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Event Time
                  </label>

                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>

                {/* VENUE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Venue
                  </label>

                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Example: College Ground"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>

              </div>
            )}

            {/* =========================
                ERROR
            ========================= */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* =========================
                BUTTONS
            ========================= */}
            <div className="flex justify-end gap-3 pt-3">

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Publishing...'
                  : formData.type === 'Event'
                    ? 'Publish Event'
                    : 'Publish Notice'}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default NoticeEventForm;