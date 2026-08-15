import { useState } from 'react';
import { Users, User, Phone, Mail, Home, Briefcase, MessageSquare } from 'lucide-react';
import { submitMembership } from '../lib/api';
import { FormPageShell, IconTextInput } from '../components/membership/FormControls';

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
    // PAN or Aadhaar mandatory for ID verification
    if (!form.pan.trim() && !form.aadhaar.trim()) err.pan_aadhaar = 'Either PAN or Aadhaar number is required for ID verification';
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
        <IconTextInput
  label="Full Name"
  required
  error={errors.full_name}
  icon={User}
  type="text"
  placeholder="Your full name"
  value={form.full_name}
  onChange={e => setForm({ ...form, full_name: e.target.value })}
  className=""

/>
        <IconTextInput
  label="Phone"
  required
  error={errors.phone}
  icon={Phone}
  type="tel"
  placeholder="9876543210"
  value={form.phone}
  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
  className=""

/>
        <IconTextInput
  label="Email"
  required
  error={errors.email}
  icon={Mail}
  type="email"
  placeholder="you@example.com"
  value={form.email}
  onChange={e => setForm({ ...form, email: e.target.value })}
  className=""

/>
<IconTextInput
  label="Address"
  error={errors.address}
  icon={Home}
  placeholder="Your complete address"
  value={form.address}
  onChange={e => setForm({ ...form, address: e.target.value })}
  className="min-h-[80px]"
  asTextarea
/>
        <IconTextInput
  label="PAN Number"
  error={errors.pan_aadhaar}
  icon={FileText}
  type="text"
  placeholder="ABCDE1234F"
  value={form.pan}
  onChange={e => setForm({ ...form, pan: e.target.value })}
  className=""
/>
        <IconTextInput
  label="Aadhaar Number"
  error={}
  icon={User}
  type="text"
  placeholder="123456789012"
  value={form.aadhaar}
  onChange={e => setForm({ ...form, aadhaar: e.target.value})}
  className=""
/>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <IconTextInput
                label="Occupation"
                error={errors.occupation}
                icon={Briefcase}
                placeholder="Your profession"
                value={form.occupation}
                onChange={e => setForm({ ...form, occupation: e.target.value })}
                className=""
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

        <IconTextInput
  label="Message / Special Requests"
  error={errors.message}
  icon={MessageSquare}
  placeholder="Any message or special requests..."
  value={form.message}
  onChange={e => setForm({ ...form, message: e.target.value })}
  className="min-h-[80px]"
  asTextarea
/>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <IconTextInput
                label="Occupation"
                error={errors.occupation}
                icon={Briefcase}
                type="text"
                placeholder="Your profession"
                value={form.occupation}
                onChange={e => setForm({ ...form, occupation: e.target.value })}
                className=""
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

        <IconTextInput
  label="Message / Special Requests"
  error={errors.message}
  icon={MessageSquare}
  type="textarea"
  placeholder="Any message or special requests..."
  value={form.message}
  onChange={e => setForm({ ...form, message: e.target.value })}
  className="min-h-[80px]"
/>

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