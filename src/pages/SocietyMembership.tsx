import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, User, Phone, Mail, FileText, Home, Briefcase, Calendar,
  Type, HeartPulse, UserPlus, Camera, IdCard, IndianRupee, Handshake, PenLine,
} from 'lucide-react';
import { createSocietyOrder, getRazorpayPublicKey, uploadFile, verifySocietyPayment } from '../lib/api';
import { useRazorpay } from '../lib/useRazorpay';
import { FormPageShell } from '../components/FormPageShell';
import { numberToIndianWords } from '../lib/utils';
import { Field, FileInput, SectionTitle, inputClass } from '../components/membership/FormControls';

const MEMBERSHIP_TYPES: { value: string; label: string; amount: number }[] = [
  { value: 'partner', label: 'Partner Member', amount: 551000 },
  { value: 'founder', label: 'Founder Member (Voting Right)', amount: 111000 },
  { value: 'life', label: 'Life Member', amount: 73000 },
  { value: 'general', label: 'General Member', amount: 31000 },
  { value: 'advisor', label: 'Advisor', amount: 251000 },
];

const AMOUNTS: Record<string, number> = Object.fromEntries(
  MEMBERSHIP_TYPES.map((t) => [t.value, t.amount]),
);

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const icon = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400';
const iconTextarea = 'absolute left-3 top-3 w-4 h-4 text-gray-400';

const initialForm = {
  membership_type: 'general',
  name: '', father_husband_name: '', gotra: '', dob: '', blood_group: '',
  residence_address: '', office_address: '',
  residence_telephone: '', office_telephone: '', mobile: '', fax: '', email: '',
  pan: '', occupation_designation: '',
  introducing_member_name: '', introducing_member_mobile: '',
  place: '', member_signature: '',
};

const initialFiles: Record<string, File | null> = {
  member_photo: null, spouse_photo: null, pan_document: null, aadhaar_document: null,
};

export default function SocietyMembershipPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState(initialFiles);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { loadRazorpay, isLoaded } = useRazorpay();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const amount = AMOUNTS[form.membership_type];

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.mobile.match(/^[6-9]\d{9}$/)) err.mobile = 'Valid 10-digit Indian mobile required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = 'Valid email required';
    if (!files.member_photo) err.member_photo = 'Member photo is required';
    if (!terms) err.terms = 'Please accept the declaration to proceed';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const uploadAll = async (): Promise<Record<string, string | undefined>> => {
    const result: Record<string, string | undefined> = {};
    for (const key of Object.keys(initialFiles)) {
      if (files[key]) {
        const { filename } = await uploadFile(files[key] as File);
        result[key] = filename;
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const uploaded = await uploadAll();
      const payload = {
        membership_type: form.membership_type,
        name: form.name,
        father_husband_name: form.father_husband_name || undefined,
        gotra: form.gotra || undefined,
        dob: form.dob || undefined,
        blood_group: form.blood_group || undefined,
        residence_address: form.residence_address || undefined,
        office_address: form.office_address || undefined,
        residence_telephone: form.residence_telephone || undefined,
        office_telephone: form.office_telephone || undefined,
        mobile: form.mobile,
        fax: form.fax || undefined,
        email: form.email,
        pan: form.pan || undefined,
        occupation_designation: form.occupation_designation || undefined,
        introducing_member_name: form.introducing_member_name || undefined,
        introducing_member_mobile: form.introducing_member_mobile || undefined,
        member_photo: uploaded.member_photo,
        spouse_photo: uploaded.spouse_photo,
        pan_document: uploaded.pan_document,
        aadhaar_document: uploaded.aadhaar_document,
        payment_method: 'online',
        amount_in_words: `${numberToIndianWords(amount)} Rupees Only`,
        place: form.place || undefined,
        member_signature: form.member_signature || undefined,
        terms_accepted: terms,
      };
      const order = await createSocietyOrder(payload);
      if (!order.razorpay_order_id) {
        setSuccess(true);
        setLoading(false);
        return;
      }
      const rzpKey = await getRazorpayPublicKey();
      if (!rzpKey) {
        alert('Payment provider not configured yet. Please contact the temple office.');
        setLoading(false);
        return;
      }
      const rzp = await loadRazorpay();
      const pay = new rzp({
        key: rzpKey,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Jagannath Mandir Rohini',
        description: `Society Membership – ${MEMBERSHIP_TYPES.find((t) => t.value === form.membership_type)?.label}`,
        order_id: order.razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: any) => {
          try {
            await verifySocietyPayment({
              form_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess(true);
          } catch {
            alert('Payment received, but confirmation failed. Our team will contact you.');
          }
          setLoading(false);
        },
      });
      pay.open();
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <FormPageShell
        title="Membership Submitted"
        success={true}
        successMessage="Jai Jagannath! Your Society Membership application and payment are received. Our committee will contact you soon."
      />
    );
  }

  return (
    <FormPageShell
      title="Society Membership Application"
      subtitle="Join the Jagannath Mandir Rohini family. Select a membership type — payment is collected securely online, and ID proof plus photo are required."
      icon={<Users className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Membership Type */}
        <section className="space-y-3">
          <SectionTitle>Membership Type</SectionTitle>
          <div className="grid gap-2">
            {MEMBERSHIP_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${
                  form.membership_type === t.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-gray-300 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="membership_type"
                    value={t.value}
                    checked={form.membership_type === t.value}
                    onChange={() => set('membership_type', t.value)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-gray-800">{t.label}</span>
                </div>
                <span className="font-semibold text-primary">₹{t.amount.toLocaleString('en-IN')}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Personal Details */}
        <section className="space-y-4">
          <SectionTitle>Personal Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name (Capital Letters)" required error={errors.name}>
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value.toUpperCase())}
                  placeholder="FULL NAME" className={inputClass(!!errors.name)} />
              </div>
            </Field>
            <Field label="Father / Husband Name">
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.father_husband_name} onChange={(e) => set('father_husband_name', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Gotra">
              <div className="relative">
                <Type className={icon} />
                <input type="text" value={form.gotra} onChange={(e) => set('gotra', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Date of Birth">
              <div className="relative">
                <Calendar className={icon} />
                <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Blood Group">
              <div className="relative">
                <HeartPulse className={icon} />
                <select value={form.blood_group} onChange={(e) => set('blood_group', e.target.value)} className={inputClass()}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </Field>
          </div>
          <Field label="Residence Address">
            <div className="relative">
              <Home className={iconTextarea} />
              <textarea value={form.residence_address} onChange={(e) => set('residence_address', e.target.value)}
                className={`${inputClass()} min-h-[70px] pl-10`} />
            </div>
          </Field>
          <Field label="Office Address">
            <div className="relative">
              <Briefcase className={iconTextarea} />
              <textarea value={form.office_address} onChange={(e) => set('office_address', e.target.value)}
                className={`${inputClass()} min-h-[70px] pl-10`} />
            </div>
          </Field>
        </section>

        {/* Contact Details */}
        <section className="space-y-4">
          <SectionTitle>Contact Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Residence Telephone">
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.residence_telephone} onChange={(e) => set('residence_telephone', e.target.value.replace(/\D/g, ''))} className={inputClass()} maxLength={15} />
              </div>
            </Field>
            <Field label="Office Telephone">
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.office_telephone} onChange={(e) => set('office_telephone', e.target.value.replace(/\D/g, ''))} className={inputClass()} maxLength={15} />
              </div>
            </Field>
            <Field label="Mobile Number" required error={errors.mobile}>
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} className={inputClass(!!errors.mobile)} placeholder="9876543210" maxLength={10} />
              </div>
            </Field>
            <Field label="Fax">
              <div className="relative">
                <Phone className={icon} />
                <input type="text" value={form.fax} onChange={(e) => set('fax', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Email" required error={errors.email}>
              <div className="relative">
                <Mail className={icon} />
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass(!!errors.email)} placeholder="you@example.com" />
              </div>
            </Field>
          </div>
        </section>

        {/* Professional Details */}
        <section className="space-y-4">
          <SectionTitle>Professional Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="PAN Number" hint="Optional, for 80G receipt">
              <div className="relative">
                <FileText className={icon} />
                <input type="text" value={form.pan} onChange={(e) => set('pan', e.target.value.toUpperCase())} className={inputClass()} placeholder="ABCDE1234F" maxLength={10} />
              </div>
            </Field>
            <Field label="Occupation & Designation">
              <div className="relative">
                <Briefcase className={icon} />
                <input type="text" value={form.occupation_designation} onChange={(e) => set('occupation_designation', e.target.value)} className={inputClass()} />
              </div>
            </Field>
          </div>
        </section>

        {/* Introducing Member */}
        <section className="space-y-4">
          <SectionTitle>Introducing Member</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Introducing Member Name">
              <div className="relative">
                <UserPlus className={icon} />
                <input type="text" value={form.introducing_member_name} onChange={(e) => set('introducing_member_name', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Introducing Member Mobile Number">
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.introducing_member_mobile} onChange={(e) => set('introducing_member_mobile', e.target.value.replace(/\D/g, ''))} className={inputClass()} maxLength={10} />
              </div>
            </Field>
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-4">
          <SectionTitle>Photos</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Member Photo" required error={errors.member_photo} hint="Recent stamp-size photo (JPG/PNG)">
              <FileInput label="Member Photo" required value={files.member_photo} onChange={(f) => setFiles((p) => ({ ...p, member_photo: f }))} accept="image/*" />
              {errors.member_photo && <p className="text-red-500 text-sm mt-1">{errors.member_photo}</p>}
            </Field>
            <Field label="Spouse Photo (if applicable)">
              <FileInput label="Spouse Photo" value={files.spouse_photo} onChange={(f) => setFiles((p) => ({ ...p, spouse_photo: f }))} accept="image/*" />
            </Field>
          </div>
          <Camera className="hidden" />
        </section>

        {/* Documents */}
        <section className="space-y-4">
          <SectionTitle>Documents</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="PAN Card" hint="PDF or image">
              <FileInput label="PAN Card" value={files.pan_document} onChange={(f) => setFiles((p) => ({ ...p, pan_document: f }))} accept="image/*,.pdf" />
            </Field>
            <Field label="Aadhaar Card / Voter ID" hint="PDF or image">
              <FileInput label="Aadhaar / Voter ID" value={files.aadhaar_document} onChange={(f) => setFiles((p) => ({ ...p, aadhaar_document: f }))} accept="image/*,.pdf" />
            </Field>
          </div>
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <IdCard className="w-4 h-4 mt-0.5 shrink-0" />
            Your documents and photo are stored securely on our server and are only accessible to the temple committee.
          </p>
        </section>

        {/* Payment */}
        <section className="space-y-4">
          <SectionTitle>Payment — Membership</SectionTitle>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-700">Membership Amount</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</span>
              <p className="text-xs text-gray-500">{numberToIndianWords(amount)} Rupees Only</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">You will be redirected to the Razorpay secure payment gateway.</p>
        </section>

        {/* Final */}
        <section className="space-y-4">
          <SectionTitle>Final</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Place">
              <div className="relative">
                <Handshake className={icon} />
                <input type="text" value={form.place} onChange={(e) => set('place', e.target.value)} className={inputClass()} placeholder="City" />
              </div>
            </Field>
            <Field label="Member Signature" hint="Type your name as digital signature">
              <div className="relative">
                <PenLine className={icon} />
                <input type="text" value={form.member_signature} onChange={(e) => set('member_signature', e.target.value.toUpperCase())} className={inputClass()} placeholder="Type full name" />
              </div>
            </Field>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 accent-primary" />
            <span>
              I accept the terms &amp; conditions and declare that the information provided is true and correct, and
              I agree to pay the selected membership amount.
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isLoaded ? 'Processing...' : 'Loading payment...'}
            </>
          ) : (
            'Submit & Pay'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          By submitting you agree to our{' '}
          <Link to="/terms-conditions" className="text-primary underline">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
        </p>
      </form>
    </FormPageShell>
  );
}