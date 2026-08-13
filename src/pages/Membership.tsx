import { useState } from 'react';
import { Users, User, Phone, Mail, Home, Briefcase, MessageSquare } from 'lucide-react';
import { submitMembership } from '../lib/api';
import { FormPageShell } from '../components/FormPageShell';

export default function MembershipPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    family_members: 1,
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.full_name.trim()) err.full_name = 'Name is required';
    if (!form.phone.match(/^[6-9]\d{9}$/)) err.phone = 'Valid 10-digit Indian mobile required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = 'Valid email required';
    if (!form.address.trim()) err.address = 'Address is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitMembership(form);
      setSuccess(true);
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <FormPageShell
        title="Membership Request Submitted"
        success={true}
        successMessage="Thank you for joining the Jagannath Mandir family. We will contact you soon."
      />
    );
  }

  return (
    <FormPageShell
      title="Become a Member"
      subtitle="Join the Jagannath Mandir Rohini family. Support the temple and participate in seva activities."
      icon={<Users className="w-6 h-6" />}
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
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition min-h-[80px] ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Your complete address"
            />
          </div>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.occupation}
                onChange={e => setForm({ ...form, occupation: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="Your profession"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Members
            </label>
            <input
              type="number"
              value={form.family_members}
              onChange={e => setForm({ ...form, family_members: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              min="1"
              max="50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message / Special Requests
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition min-h-[80px]"
              placeholder="Any message or special requests..."
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
            'Submit Membership Request'
          )}
        </button>
      </form>
    </FormPageShell>
  );
}