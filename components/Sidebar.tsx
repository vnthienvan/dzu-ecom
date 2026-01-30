import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Megaphone, Settings, Users, Store, FileBarChart, Briefcase, MessageSquareText, CircleDollarSign } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { to: '/work', icon: <Briefcase size={20} />, label: 'Quản lý Công việc' },
    { to: '/reports', icon: <FileBarChart size={20} />, label: 'Báo cáo & Xuất dữ liệu' },
    { to: '/ads', icon: <Megaphone size={20} />, label: 'Quản lý Chiến dịch' },
    { to: '/chat', icon: <MessageSquareText size={20} />, label: 'Tin nhắn & Chat' },
    { to: '/shops', icon: <Store size={20} />, label: 'Quản lý Shop' },
    { to: '/products', icon: <ShoppingBag size={20} />, label: 'Sản phẩm' },
    { to: '/finance', icon: <CircleDollarSign size={20} />, label: 'Tài chính & HĐ' },
    { to: '/users', icon: <Users size={20} />, label: 'Thành viên & Khách' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Cấu hình & Bảo mật' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
            <img 
              src="https://www.dzule.com/logo.png" 
              alt="Dzu Ecom Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Dzu';
              }}
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Dzu Ecom
            </span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              A
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">Admin</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;