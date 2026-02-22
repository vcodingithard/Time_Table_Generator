import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { timetableApi } from '../api/timetableApi';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setStatus('failed');
        return;
      }

      try {
        // Call your backend GET /api/payment/verify-status?order_id=...
        const response = await timetableApi.verifyPaymentStatus(orderId);
        
        if (response.data.payment_status === 'PAID' || response.data.payment_status === 'SUCCESS') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus('failed');
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-black text-slate-900">Verifying Payment...</h2>
            <p className="text-slate-500">Please do not refresh the page.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Success!</h2>
            <p className="text-slate-500 mb-8">Your subscription has been upgraded. You can now use your AI credits.</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
            >
              Back to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Failed</h2>
            <p className="text-slate-500 mb-8">Something went wrong or the payment was cancelled.</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;