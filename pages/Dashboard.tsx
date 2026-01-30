import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users, Bell, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Alert } from '../types';

const data = [
  { name: 'T2', revenue: 4000000, cost: 240000 },
  { name: 'T3', revenue: 3000000, cost: 139800 },
  { name: 'T4', revenue: 2000000, cost: 980000 },
  { name: 'T5', revenue: 2780000, cost: 390800 },
  { name: 'T6', revenue: 1890000, cost: 480000 },
  { name: 'T7', revenue: 2390000, cost: 380000 },
  { name: 'CN', revenue: 3490000, cost: 430000 },
];

const mockAlerts: Alert[] = [
  { id: 'a1', type: 'overdue_task', message: 'Task "Thiết kế banner Tết" đã quá hạn 2 ngày', date: '2024-02-02', severity: 'high' },
  { id: 'a2', type: 'account_expiry', message: 'Tài khoản nhân viên "staff_02" sắp hết hạn vào ngày mai', date: '2024-02-04', severity: 'medium' },
  { id: 'a3', type: 'campaign_budget', message: 'Chiến dịch "Sale Hè" đã tiêu hết 90% ngân sách', date: '2024-02-03', severity: 'low' },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; trendUp?: boolean }> = ({ title, value, trend, icon, trendUp = true }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
        {icon}
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500">Chào mừng trở lại, Admin!</p>
        </div>
        <div className="flex gap-2">
             <div className="relative">
                 <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-indigo-600 shadow-sm">
                     <Bell size={20} />
                     {alerts.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                 </button>
             </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex items-center gap-2">
                 <AlertTriangle size={18} className="text-red-600" />
                 <h3 className="font-semibold text-red-800">Cảnh báo hệ thống ({alerts.length})</h3>
             </div>
             <div className="divide-y divide-slate-100">
                 {alerts.map(alert => (
                     <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-full ${alert.type === 'overdue_task' ? 'bg-orange-100 text-orange-600' : alert.type === 'account_expiry' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {alert.type === 'overdue_task' ? <Clock size={16} /> : alert.type === 'account_expiry' ? <Calendar size={16} /> : <AlertTriangle size={16} />}
                             </div>
                             <div>
                                 <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                                 <p className="text-xs text-slate-500">{alert.date}</p>
                             </div>
                         </div>
                         <button onClick={() => removeAlert(alert.id)} className="text-xs text-slate-400 hover:text-slate-600 underline">Đã xử lý</button>
                     </div>
                 ))}
             </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng Doanh Thu" 
          value="145.200.000 ₫" 
          trend="+12.5%" 
          icon={<DollarSign size={20} />} 
        />
        <StatCard 
          title="Đơn hàng" 
          value="1,240" 
          trend="+4.2%" 
          icon={<ShoppingCart size={20} />} 
        />
        <StatCard 
          title="Chi phí Ads" 
          value="12.400.000 ₫" 
          trend="-2.1%" 
          icon={<TrendingUp size={20} />} 
          trendUp={false}
        />
        <StatCard 
          title="ROAS Trung bình" 
          value="11.7" 
          trend="+5.3%" 
          icon={<Users size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Doanh thu vs Chi phí Ads</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Chi phí" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Hiệu suất theo giờ</h3>
            <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
             </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;