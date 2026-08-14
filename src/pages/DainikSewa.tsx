import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart, User, Mail, Phone, Home, Briefcase, Calendar, HeartPulse,
  Contact, Repeat, Users, Camera, PenLine, IndianRupee, ChevronDown,
} from 'lucide-react';
import { createDainikOrder, getRazorpayPublicKey, uploadFile, verifyDainikPayment, verifyDainikSubscription } from '../lib/api';
import { useRazorpay } from '../lib/useRazorpay';
import { FormPageShell } from '../components/FormPageShell';
import { numberToIndianWords } from '../lib/utils';
import { Field, FileInput, SectionTitle, inputClass } from '../components/membership/FormControls';

const ONE_TIME_AMOUNT = 2100;
const RECURRING_AMOUNT = 200;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const icon = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400';
const iconTextarea = 'absolute left-3 top-3 w-4 h-4 text-gray-400';

const initialForm = {
  name: '', gotra: '', father_name: '', spouse_name: '',
  office_address: '', residence_address: '',
  email: '', office_telephone: '', residence_telephone: '', mobile: '',
  self_profession: '', spouse_profession: '', self_dob: '', spouse_dob: '', marriage_anniversary: '',
  child1_name: '', child1_birthday: '', child2_name: '', child2_birthday: '', child3_name: '', child3_birthday: '',
  self_blood_group: '', spouse_blood_group: '', temple_contribution: '',
  applicant_signature: '', place: '',
};

type FormKey = keyof typeof initialForm;

const childFields: { key: string; nameKey: FormKey; bdKey: FormKey }[] = [
  { key: 'child1', nameKey: 'child1_name', bdKey: 'child1_birthday' },
  { key: 'child2', nameKey: 'child2_name', bdKey: 'child2_birthday' },
  { key: 'child3', nameKey: 'child3_name', bdKey: 'child3_birthday' },
];

export default function DainikSewaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [showChildren, setShowChildren] = useState(true);
  const [recurring, setRecurring] = useState(false);
  const [autoPayment, setAutoPayment] = useState(false);
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { loadRazorpay, isLoaded } = useRazorpay();

  const set = (k: FormKey, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.mobile.match(/^[6-9]\d{9}$/)) err.mobile = 'Valid 10-digit Indian mobile required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = 'Valid email required';
    if (!photo) err.photo = 'Recent stamp-size photo is required';
    if (!consent) err.consent = 'Please grant consent to proceed';
    if (recurring && !autoPayment) err.autoPayment = 'Please authorize the recurring auto-payment';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const openOrder = (rzp: any, rzpKey: string, order: { id: string; razorpay_order_id: string; amount: number }): Promise<'paid' | 'dismissed'> =>
    new Promise((resolve) => {
      const r = new rzp({
        key: rzpKey,
        amount: Math.round(order.amount * 100),
        currency: 'INR',
        name: 'Jagannath Mandir Rohini',
        description: 'Dainik Sewa Membership – One-time',
        order_id: order.razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        modal: { ondismiss: () => resolve('dismissed') },
        handler: async (response: any) => {
          try {
            await verifyDainikPayment({
              form_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve('paid');
          } catch {
            resolve('dismissed');
          }
        },
      });
      r.open();
    });

  const openSubscription = (rzp: any, rzpKey: string, formId: string, subId: string): Promise<'paid' | 'dismissed'> =>
    new Promise((resolve) => {
      const r = new rzp({
        key: rzpKey,
        subscription_id: subId,
        name: 'Jagannath Mandir Rohini',
        description: 'Dainik Sewa – ₹200/month auto-debit',
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        modal: { ondismiss: () => resolve('dismissed') },
        handler: async (response: any) => {
          try {
            await verifyDainikSubscription({
              form_id: formId,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve('paid');
          } catch {
            resolve('dismissed');
          }
        },
      });
      r.open();
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const uploaded = photo ? await uploadFile(photo) : undefined;
      const payload = {
        name: form.name,
        gotra: form.gotra || undefined,
        father_name: form.father_name || undefined,
        spouse_name: form.spouse_name || undefined,
        office_address: form.office_address || undefined,
        residence_address: form.residence_address || undefined,
        email: form.email,
        office_telephone: form.office_telephone || undefined,
        residence_telephone: form.residence_telephone || undefined,
        mobile: form.mobile,
        self_profession: form.self_profession || undefined,
        spouse_profession: form.spouse_profession || undefined,
        self_dob: form.self_dob || undefined,
        spouse_dob: form.spouse_dob || undefined,
        marriage_anniversary: form.marriage_anniversary || undefined,
        child1_name: form.child1_name || undefined,
        child1_birthday: form.child1_birthday || undefined,
        child2_name: form.child2_name || undefined,
        child2_birthday: form.child2_birthday || undefined,
        child3_name: form.child3_name || undefined,
        child3_birthday: form.child3_birthday || undefined,
        self_blood_group: form.self_blood_group || undefined,
        spouse_blood_group: form.spouse_blood_group || undefined,
        temple_contribution: form.temple_contribution || undefined,
        photo: uploaded?.filename,
        consent,
        applicant_signature: form.applicant_signature || undefined,
        payment_method: 'online',
        amount_in_words: `${numberToIndianWords(ONE_TIME_AMOUNT)} Rupees Only`,
        recurring_consent: recurring,
        auto_payment_consent: recurring && autoPayment,
        recurring_payment_method: recurring ? 'razorpay' : undefined,
        recurring_start_date: recurringStartDate || undefined,
        place: form.place || undefined,
      };
      const order = await createDainikOrder(payload);
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

      const oneTimeResult = await openOrder(rzp, rzpKey, {
        id: order.id,
        razorpay_order_id: order.razorpay_order_id,
        amount: order.amount,
      });

      let recurringResult: 'paid' | 'dismissed' | 'skipped' = 'skipped';
      if (order.razorpay_subscription_id && recurring) {
        recurringResult = await openSubscription(rzp, rzpKey, order.id, order.razorpay_subscription_id);
      }

      if (oneTimeResult === 'paid' && (recurringResult === 'paid' || recurringResult === 'skipped')) {
        setSuccess(true);
      } else if (oneTimeResult === 'paid') {
        setSuccess(true);
      } else {
        alert('Payment was not completed. Your application is saved — please complete the payment or contact the temple office.');
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <FormPageShell
        title="Dainik Sewa Submitted"
        success={true}
        successMessage="Jai Jagannath! Your Dainik Sewa Membership is received. Jai Jagannath!"
      />
    );
  }

  return (
    <FormPageShell
      title="Dainik Sewa Membership Application"
      subtitle="Join daily seva of Lord Jagannath. One-time membership ₹2,100 (optional recurring contribution ₹200/month)."
      icon={<HandHeart className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <section className="space-y-4">
          <SectionTitle>Personal Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name (Capital Letters)" required error={errors.name}>
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value.toUpperCase())} placeholder="FULL NAME" className={inputClass(!!errors.name)} />
              </div>
            </Field>
            <Field label="Gotra">
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.gotra} onChange={(e) => set('gotra', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Father Name">
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.father_name} onChange={(e) => set('father_name', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Spouse Name">
              <div className="relative">
                <User className={icon} />
                <input type="text" value={form.spouse_name} onChange={(e) => set('spouse_name', e.target.value)} className={inputClass()} />
              </div>
            </Field>
          </div>
          <Field label="Office Address">
            <div className="relative">
              <Briefcase className={iconTextarea} />
              <textarea value={form.office_address} onChange={(e) => set('office_address', e.target.value)} className={`${inputClass()} min-h-[70px] pl-10`} />
            </div>
          </Field>
          <Field label="Residence Address">
            <div className="relative">
              <Home className={iconTextarea} />
              <textarea value={form.residence_address} onChange={(e) => set('residence_address', e.target.value)} className={`${inputClass()} min-h-[70px] pl-10`} />
            </div>
          </Field>
        </section>

        {/* Contact Details */}
        <section className="space-y-4">
          <SectionTitle>Contact Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Email" required error={errors.email}>
              <div className="relative">
                <Mail className={icon} />
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass(!!errors.email)} placeholder="you@example.com" />
              </div>
            </Field>
            <Field label="Office Telephone">
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.office_telephone} onChange={(e) => set('office_telephone', e.target.value.replace(/\D/g, ''))} className={inputClass()} maxLength={15} />
              </div>
            </Field>
            <Field label="Residence Telephone">
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.residence_telephone} onChange={(e) => set('residence_telephone', e.target.value.replace(/\D/g, ''))} className={inputClass()} maxLength={15} />
              </div>
            </Field>
            <Field label="Mobile Number" required error={errors.mobile}>
              <div className="relative">
                <Phone className={icon} />
                <input type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} className={inputClass(!!errors.mobile)} placeholder="9876543210" maxLength={10} />
              </div>
            </Field>
          </div>
        </section>

        {/* Family / Professional Details */}
        <section className="space-y-4">
          <SectionTitle>Family / Professional Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Self Profession">
              <div className="relative">
                <Briefcase className={icon} />
                <input type="text" value={form.self_profession} onChange={(e) => set('self_profession', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Spouse Profession">
              <div className="relative">
                <Briefcase className={icon} />
                <input type="text" value={form.spouse_profession} onChange={(e) => set('spouse_profession', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Self Birthday / Date of Birth">
              <div className="relative">
                <Calendar className={icon} />
                <input type="date" value={form.self_dob} onChange={(e) => set('self_dob', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Spouse Birthday / Date of Birth">
              <div className="relative">
                <Calendar className={icon} />
                <input type="date" value={form.spouse_dob} onChange={(e) => set('spouse_dob', e.target.value)} className={inputClass()} />
              </div>
            </Field>
            <Field label="Marriage Anniversary">
              <div className="relative">
                <HeartPulse className={icon} />
                <input type="date" value={form.marriage_anniversary} onChange={(e) => set('marriage_anniversary', e.target.value)} className={inputClass()} />
              </div>
            </Field>
          </div>

          {/* Children */}
          <div className="rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setShowChildren(!showChildren)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Children Details</span>
              <ChevronDown className={`w-4 h-4 transition ${showChildren ? 'rotate-180' : ''}`} />
            </button>
            {showChildren && (
              <div className="px-4 pb-4 space-y-4">
                {childFields.map((c) => (
                  <div key={c.key} className="grid md:grid-cols-2 gap-4">
                    <Field label={`Child ${c.key.replace('child', '')} — Name`}>
                      <div className="relative">
                        <User className={icon} />
                        <input type="text" value={form[c.nameKey]} onChange={(e) => set(c.nameKey, e.target.value)} className={inputClass()} />
                      </div>
                    </Field>
                    <Field label={`Child ${c.key.replace('child', '')} — Birthday`}>
                      <div className="relative">
                        <Calendar className={icon} />
                        <input type="date" value={form[c.bdKey]} onChange={(e) => set(c.bdKey, e.target.value)} className={inputClass()} />
                      </div>
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Blood Group */}
        <section className="space-y-4">
          <SectionTitle>Blood Group</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Self Blood Group">
              <div className="relative">
                <HeartPulse className={icon} />
                <select value={form.self_blood_group} onChange={(e) => set('self_blood_group', e.target.value)} className={inputClass()}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Spouse Blood Group">
              <div className="relative">
                <HeartPulse className={icon} />
                <select value={form.spouse_blood_group} onChange={(e) => set('spouse_blood_group', e.target.value)} className={inputClass()}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </Field>
          </div>
        </section>

        {/* Temple Contribution */}
        <section className="space-y-4">
          <SectionTitle>Temple Contribution</SectionTitle>
          <Field label="How can you help for the development of the Jagannath Temple?">
            <div className="relative">
              <Contact className={iconTextarea} />
              <textarea value={form.temple_contribution} onChange={(e) => set('temple_contribution', e.target.value)} className={`${inputClass()} min-h-[90px] pl-10`} placeholder="Volunteer, donation, skills..." />
            </div>
          </Field>
        </section>

        {/* Photo */}
        <section className="space-y-4">
          <SectionTitle>Photo</SectionTitle>
          <Field label="Recent Stamp-size Photo" required error={errors.photo}>
            <FileInput label="Recent Stamp-size Photo" required value={photo} onChange={setPhoto} accept="image/*" />
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </Field>
          <Camera className="hidden" />
        </section>

        {/* Consent */}
        <section className="space-y-4">
          <SectionTitle>Consent</SectionTitle>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-primary" />
            <span>I consent to the use of the provided details for the member directory / publication by the temple.</span>
          </label>
          {errors.consent && <p className="text-red-500 text-sm">{errors.consent}</p>}
          <Field label="Applicant Signature" hint="Type your name as digital signature">
            <div className="relative">
              <PenLine className={icon} />
              <input type="text" value={form.applicant_signature} onChange={(e) => set('applicant_signature', e.target.value.toUpperCase())} className={inputClass()} placeholder="Type full name" />
            </div>
          </Field>
        </section>

        {/* Payment */}
        <section className="space-y-4">
          <SectionTitle>Payment</SectionTitle>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-700">One-Time Membership</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">₹{ONE_TIME_AMOUNT.toLocaleString('en-IN')}</span>
              <p className="text-xs text-gray-500">{numberToIndianWords(ONE_TIME_AMOUNT)} Rupees Only</p>
            </div>
          </div>

          {/* Recurring Dainik Sewa */}
          <div className="rounded-xl border border-primary/20 overflow-hidden">
            <label className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer bg-primary/5">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-primary" />
                <span className="flex items-center gap-2 font-medium text-gray-800">
                  <Repeat className="w-4 h-4 text-primary" /> Recurring Dainik Sewa — ₹{RECURRING_AMOUNT}/month
                </span>
              </div>
              <span className="text-sm font-bold text-primary">₹{RECURRING_AMOUNT.toLocaleString('en-IN')}/mo</span>
            </label>
            {recurring && (
              <div className="px-4 py-3 space-y-3 border-t border-primary/10">
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={autoPayment} onChange={(e) => setAutoPayment(e.target.checked)} className="mt-1 accent-primary" />
                  <span>Authorize recurring auto-payment (auto-debit) of ₹{RECURRING_AMOUNT}/month via UPI / Card for Dainik Sewa.</span>
                </label>
                {errors.autoPayment && <p className="text-red-500 text-sm">{errors.autoPayment}</p>}
                <Field label="Recurring Payment Start Date">
                  <div className="relative">
                    <Calendar className={icon} />
                    <input type="date" value={recurringStartDate} onChange={(e) => setRecurringStartDate(e.target.value)} className={inputClass()} />
                  </div>
                </Field>
                <p className="text-xs text-gray-400">
                  On the next step you'll securely authorize the monthly auto-debit via Razorpay. You can cancel anytime.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">You will be redirected to the Razorpay secure payment gateway.</p>
        </section>

        {/* Final */}
        <section className="space-y-4">
          <SectionTitle>Final</SectionTitle>
          <Field label="Place">
            <div className="relative">
              <Home className={icon} />
              <input type="text" value={form.place} onChange={(e) => set('place', e.target.value)} className={inputClass()} placeholder="City" />
            </div>
          </Field>
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