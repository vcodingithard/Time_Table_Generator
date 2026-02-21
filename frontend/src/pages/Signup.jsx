import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useUser } from '../context/UserContext';

const Signup = () => {
  const [form, setForm] = useState({
    institute_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department_name: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.signup(form);
      setUser(res.data.user); // Save to state, not localStorage
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Create Institute Account</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="institute_name" placeholder="Institute Name" onChange={onChange} required className="md:col-span-2 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="department_name" placeholder="Primary Department" onChange={onChange} required className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="phone" placeholder="Phone Number" onChange={onChange} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="email" type="email" placeholder="Admin Email" onChange={onChange} required className="md:col-span-2 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="address" placeholder="Full Address" onChange={onChange} className="md:col-span-2 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="password" type="password" placeholder="Password" onChange={onChange} required className="md:col-span-2 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          
          <button disabled={loading} className="md:col-span-2 bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
            {loading ? 'Creating Account...' : 'Register Institute'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600">
          Already registered? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;