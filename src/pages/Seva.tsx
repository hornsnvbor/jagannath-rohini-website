import { useState } from 'react';
import { HandHeart, User, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { submitSeva } from '../lib/api';
import { FormPageShell } from '../components/FormPageShell';

const SEVA_TYPES = [
  'Annadaan Seva (Free Meal)',
  'Rath Yatra Seva',
  'Nitya Puja Seva',
  'Temple Cleaning',
  'Gardening / Maintenance',
  'Prasad Distribution',
  'Other',
];

export default function SevaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    seva_type: 'Annadaan Seva (Free Meal)',
    preferred_date: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.full_name.trim()) err.full_name = 'Name is required';
    if (!form.phone.match(/^[6-9]\d{9}$/)) err.phone = 'Valid 10-digit Indian mobile required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = 'Valid email required';
    if (!form.seva_type.trim()) err.seva_type = 'Please select a seva type';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitSeva(form);
      setSuccess(true);
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <FormPageShell
        title="Seva Request Submitted"
        success={true}
        successMessage="Thank you for offering your seva. We will contact you with the details."
      />
    );
  }

  return (
    <FormPageShell
      title="Offer Your Seva"
      subtitle="Join us in serving Lord Jagannath. Choose a seva and we'll get in touch."
      icon={<HandHeart className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Your full name"
            />
          </div>
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type of Seva <span className="text-red-500">*</span>
          </label>
          <select
            value={form.seva_type}
            onChange={e => setForm({ ...form, seva_type: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.seva_type ? 'border-red-500' : 'border-gray-300'}`}
          >
            {SEVA_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.seva_type && <p className="text-red-500 text-sm mt-1">{errors.seva_type}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={form.preferred_date}
              onChange={e => setForm({ ...form, preferred_date: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes / Special Requests
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition min-h-[80px]"
              placeholder="Any specific instructions or requests..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Seva Request'
          )}
        </button>
      </form>
    </FormPageShell>
  );
}