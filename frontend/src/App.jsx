import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { authApi } from './api/authApi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManageClasses from './pages/ManageClasses';
import ManageCourses from './pages/ManageCourses';
import ManageFaculty from './pages/ManageFaculty';
import ManageMetadata from './pages/ManageMetaData';
import ManageRooms from './pages/ManageRoom';

function AppContent() {
  const { user, setUser } = useUser();
  const [appLoading, setAppLoading] = useState(true);
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Persistence Logic: Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getCurrentUser();
        if (res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // No session found or expired - user remains null
        console.log("No active session");
      } finally {
        setAppLoading(false);
      }
    };
    checkAuth();
  }, [setUser]);

  // Show a clean loader while checking the session
  if (appLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-900 font-medium">Loading your timetable...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className={`flex-grow ${!isAuthPage ? 'pt-[70px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/manage-classes" element={<ManageClasses />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/manage-faculty" element={<ManageFaculty />} />
          <Route path="/manage-metadata" element={<ManageMetadata />} />
          <Route path="/manage-rooms" element={<ManageRooms />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}