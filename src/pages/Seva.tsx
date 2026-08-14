import { useState } from 'react';
import { HandHeart, User, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { submitSeva } from '../lib/api';
import { FormPageShell, IconTextInput } from '../components/membership/FormControls';

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
  label="Type of Seva"
  required
  error={errors.seva_type}
  icon={Calendar}
  type="select"
  placeholder="Select seva type"
  value={form.seva_type}
  onChange={e => setForm({ ...form, seva_type: e.target.value })}
  className=""
/>
        <IconTextInput
  label="Preferred Date"
  error={}
  icon={Calendar}
  type="date"
  placeholder="Preferred date"
  value={form.preferred_date}
  onChange={e => setForm({ ...form, preferred_date: e.target.value })}
  className=""
/>
        <IconTextInput
  label="Notes / Special Requests"
  error={errors.message}
  icon={MessageSquare}
  type="textarea"
  placeholder="Any specific instructions or requests..."
  value={form.notes}
  onChange={e => setForm({ ...form, notes: e.target.value })}
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
            'Submit Seva Request'
          )}
        </button>
      </form>
    </FormPageShell>
  );
}