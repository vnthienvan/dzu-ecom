import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductSync from './pages/ProductSync';
import AdsManager from './pages/AdsManager';
import ShopManager from './pages/ShopManager';
import UserManager from './pages/UserManager';
import Reports from './pages/Reports';
import WorkManager from './pages/WorkManager';
import ChatSystem from './pages/ChatSystem';
import Settings from './pages/Settings';
import Finance from './pages/Finance';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex flex-col min-h-screen">
            <div className="max-w-7xl mx-auto w-full flex-1">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/work" element={<WorkManager />} />
                    <Route path="/products" element={<ProductSync />} />
                    <Route path="/ads" element={<AdsManager />} />
                    <Route path="/chat" element={<ChatSystem />} />
                    <Route path="/shops" element={<ShopManager />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/users" element={<UserManager />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
            
            <footer className="mt-8 pt-4 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    Phần mềm quản lý công việc bản quyền <a href="https://dzule.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Dzule.com</a>
                </p>
                <p className="text-xs text-slate-400 mt-1">Version 2.5.0 - Enterprise Edition</p>
            </footer>
        </main>
      </div>
    </Router>
  );
};

export default App;