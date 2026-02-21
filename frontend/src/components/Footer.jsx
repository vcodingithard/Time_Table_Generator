import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-blue-900 font-bold text-lg">UniTime AI</h2>
            <p className="text-slate-500 text-sm mt-1">
              © {new Date().getFullYear()} Timetable Generator — All Rights Reserved
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-900 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-900 transition">Terms of Service</a>
            <a href="#" className="hover:text-blue-900 transition">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;