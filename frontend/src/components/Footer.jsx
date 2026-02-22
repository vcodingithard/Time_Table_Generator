import React from 'react';
import { Mail, Phone, Linkedin, Github, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand & Developer Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">VS</span>
              </div>
              <h2 className="text-slate-900 font-black text-xl tracking-tight">SmartSched AI</h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              An intelligent MERN-stack scheduling platform engineered to solve complex institutional constraints through LLM integration.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> Mangalore, KA, India
            </div>
          </div>

          {/* Quick Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Contact Developer</h3>
              <div className="space-y-3">
                <a href="mailto:vivekshenoy6763@gmail.com" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group">
                  <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">vivekshenoy6763@gmail.com</span>
                </a>
                <a href="tel:+919901177522" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group">
                  <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">+91 9901177522</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Professional Profiles</h3>
              <div className="flex gap-4">
                <a 
                  href="https://www.linkedin.com/in/vivek-shenoy-55b20b319/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all transform hover:-translate-y-1 shadow-lg shadow-slate-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/vcodingithard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-slate-200"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-slate-200 transition-all transform hover:-translate-y-1"
                  title="Portfolio"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">
            © {currentYear} Created by <span className="text-slate-900 font-bold">Vivek Shenoy</span>. Built with MERN & LLM APIs.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">Terms</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">Tech Stack</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;