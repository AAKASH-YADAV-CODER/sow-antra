import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { creatorAPI } from '../services/api';

const CreatorApplicationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({
    experience: '',
    portfolioUrl: '',
    message: '',
    bankHolderName: '',
    bankName: '',
    ifscCode: '',
    accountNumber: ''
  });

  const loadApplication = async () => {
    setLoading(true);
    try {
      const response = await creatorAPI.getMyApplication();
      setApplication(response?.data?.application || null);
    } catch (error) {
      console.error('Failed to load creator application:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await creatorAPI.submitApplication(form);
      await loadApplication();
      alert('Creator application submitted successfully.');
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to submit application.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const status = application?.status || null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900">Creator Application</h1>
          <p className="text-sm text-gray-500 mt-2">
            Default role is NORMAL. Submit this form to request CREATOR access.
          </p>

          {loading ? (
            <p className="mt-6 text-sm font-bold text-gray-400">Loading...</p>
          ) : (
            <>
              {status && (
                <div className={`mt-6 p-4 rounded-2xl border text-sm font-bold ${
                  status === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : status === 'REJECTED'
                      ? 'bg-red-50 border-red-100 text-red-700'
                      : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {status === 'APPROVED' ? <CheckCircle2 size={18} /> : status === 'REJECTED' ? <XCircle size={18} /> : <Clock3 size={18} />}
                    <span>Current status: {status}</span>
                  </div>
                  {status === 'REJECTED' && application?.rejectionReason && (
                    <p className="mt-2 text-xs">Reason: {application.rejectionReason}</p>
                  )}
                  {status === 'APPROVED' && (
                    <p className="mt-2 text-xs">Your account is now a Creator. Please login again if needed.</p>
                  )}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="Experience (e.g. 2 years)"
                  value={form.experience}
                  onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="Portfolio URL"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
                />
                <textarea
                  className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none min-h-[110px]"
                  placeholder="Tell admin why you should be approved"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="Bank account holder name"
                  value={form.bankHolderName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankHolderName: e.target.value }))}
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="Bank name"
                  value={form.bankName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="IFSC code"
                  value={form.ifscCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, ifscCode: e.target.value }))}
                />
                <input
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none"
                  placeholder="Account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="md:col-span-2 mt-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-xl font-black"
                >
                  {submitting ? 'Submitting...' : 'Submit Creator Application'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorApplicationPage;
