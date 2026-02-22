import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { timetableApi } from '../api/timetableApi';

const MAX_WAIT_TIME = 15000; // 60 seconds
const POLL_INTERVAL = 3000; // 3 seconds

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); 
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    let interval;
    let startTime = Date.now();

    const pollStatus = async () => {
      try {
        const response = await timetableApi.verifyPaymentStatus(orderId);
        const paymentStatus = response.data.status; // matches backend

        if (paymentStatus === 'SUCCESS') {
          setStatus('success');
          clearInterval(interval);
        }

        else if (paymentStatus === 'FAILED') {
          setStatus('failed');
          clearInterval(interval);
        }

        else {
          // CREATED or pending → keep polling
          if (Date.now() - startTime > MAX_WAIT_TIME) {
            setStatus('failed');
            clearInterval(interval);
          }
        }

      } catch (err) {
        console.error("Polling error:", err);
        setStatus('failed');
        clearInterval(interval);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, POLL_INTERVAL);

    return () => clearInterval(interval);

  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center">

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-black text-slate-900">
              Confirming Payment...
            </h2>
            <p className="text-slate-500">
              Please wait while we verify your transaction.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Payment Successful
            </h2>
            <p className="text-slate-500 mb-8">
              Your subscription is now active.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Payment Not Confirmed
            </h2>
            <p className="text-slate-500 mb-8">
              If money was deducted, it will reflect shortly.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentStatus;