import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authApi } from '../api/authApi';

const Navbar = () => {
  const { user, setUser } = useUser(); // Pull from Context, not localStorage
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null); // Clear global state
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const navLinks = [
    { name: 'View Timetable', path: '/view-timetable' },
    { name: 'Faculty Timetable', path: '/view-faculty' },
    { name: 'Slot Exchanger', path: '/relief-chat' },
    { name: 'Generate', path: '/generate-timetable' },
  ];

  return (
    <nav className="w-full h-[70px] bg-blue-900 text-white shadow-lg fixed top-0 left-0 px-6 md:px-10 py-4 flex items-center justify-between z-50">
      <h1 className="text-xl md:text-2xl font-bold">
        <Link to="/">TimeTable Generator</Link>
      </h1>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-6 text-sm md:text-base font-medium">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="hover:text-blue-300 transition">
              {link.name}
            </Link>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-4 border-l border-blue-700 pl-6">
            <span className="text-blue-200 text-sm hidden xl:inline">Welcome, {user.institute_name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-900 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="bg-white text-blue-900 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition text-sm">
              Login
            </Link>
            <Link to="/signup" className="border border-white px-4 py-1.5 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition text-sm">
              Signup
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button 
        className="lg:hidden text-white focus:outline-none p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[70px] left-0 w-full bg-blue-900 border-t border-blue-800 shadow-xl lg:hidden flex flex-col p-4 space-y-4 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="py-2 px-4 rounded hover:bg-blue-800 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-blue-800" />
          {user ? (
            <button onClick={handleLogout} className="w-full bg-white text-blue-900 py-3 rounded-lg font-bold">
              Logout ({user.institute_name})
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-white text-blue-900 py-3 rounded-lg font-bold text-center">Login</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full border border-white py-3 rounded-lg font-bold text-center">Signup</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;