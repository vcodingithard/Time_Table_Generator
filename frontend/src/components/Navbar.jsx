import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authApi } from '../api/authApi';
import { Menu, X, LogOut, LayoutDashboard, Calendar, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Main links visible on the bar
  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Generate', path: '/generate-timetable', icon: <Calendar className="w-4 h-4" /> },
  ];

  // Management links nested in a dropdown
  const manageLinks = [
    { name: 'Classes', path: '/manage-classes' },
    { name: 'Courses', path: '/manage-courses' },
    { name: 'Faculty', path: '/manage-faculty' },
    { name: 'Rooms', path: '/manage-rooms' },
    { name: 'Settings', path: '/manage-metadata' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full h-[70px] bg-white border-b border-slate-200 fixed top-0 left-0 px-6 md:px-10 flex items-center justify-between z-50">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
          <Calendar className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight hidden sm:block">
          Smart<span className="text-blue-600">Sched</span>
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                isActive(link.path) ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          {/* Admin Management Dropdown */}
          <div className="relative">
            <button 
              onMouseEnter={() => setIsAdminOpen(true)}
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Manage Resources <ChevronDown className={`w-4 h-4 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isAdminOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200"
                onMouseLeave={() => setIsAdminOpen(false)}
              >
                {manageLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsAdminOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Institute</span>
              <span className="text-sm font-bold text-slate-900">{user.institute_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition transform active:scale-95 shadow-lg shadow-slate-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-600 font-bold px-4 py-2 hover:text-slate-900 transition">
              Login
            </Link>
            <Link to="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition transform active:scale-95 shadow-lg shadow-blue-100">
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button 
        className="lg:hidden text-slate-900 focus:outline-none p-2 bg-slate-50 rounded-xl"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Sidebar/Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[70px] left-0 w-full bg-white border-t border-slate-100 shadow-2xl lg:hidden flex flex-col p-6 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>
            {[...navLinks, ...manageLinks].map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="flex items-center gap-3 text-lg font-bold text-slate-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <hr className="border-slate-100" />
          
          {user ? (
            <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" /> Logout {user.institute_name}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-center">Login</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-center">Sign Up Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;