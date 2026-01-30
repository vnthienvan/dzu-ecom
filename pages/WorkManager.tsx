import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Platform, TaskHistory, TaskComment } from '../types';
import { Plus, Search, Filter, Clock, MessageSquare, Paperclip, X, DollarSign, Target, Briefcase, History, RotateCcw, Trash2, Edit3, ArrowRight, CornerDownRight, Zap, Bot, Share2, Video, Globe, List, Send, CheckSquare, BarChart, User, Bell, Sparkles, AlertTriangle, BellRing, ChevronRight } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// --- Mock Data ---
const mockTasks: Task[] = [
  {
    id: 't1', title: 'Tối ưu quảng cáo Tết - Dzu Fashion', description: 'Tăng ngân sách và điều chỉnh từ khóa cho camp Tết',
    shopId: 's1', shopName: 'Dzu Fashion HN', platform: 'shopee', status: 'inprogress', priority: 'high',
    assignee: 'Staff A', dueDate: '2024-02-05', attachments: 1,
    targetEntities: ['Dzu Fashion HN'],
    relatedItem: { type: 'campaign', id: '1', name: 'Sale Tết 2024 - Áo thun' },
    budgetConfig: { total: 5500000, daily: 500000, monthly: 15000000, currency: 'VND' },
    timeConfig: { startDate: '2024-01-26', endDate: '2024-02-05' },
    history: [
        { id: 'h1', timestamp: '2024-01-26 09:00', action: 'create', user: 'Admin', description: 'Tạo công việc mới' },
        { id: 'h2', timestamp: '2024-01-27 10:30', action: 'update', user: 'Staff A', description: 'Cập nhật ngân sách từ 3M -> 5.5M' }
    ],
    comments: [
        { id: 'c1', userId: 'u1', userName: 'Admin', text: 'Chú ý ngân sách không được vượt quá 6M nhé', timestamp: '2024-01-26 09:05' },
        { id: 'c2', userId: 'u2', userName: 'Staff A', text: 'Đã rõ, em đang tối ưu lại từ khóa.', timestamp: '2024-01-26 09:15' }
    ],
    checklist: [
        { id: 'cl1', text: 'Nghiên cứu từ khóa Tết', isCompleted: true },
        { id: 'cl2', text: 'Cập nhật giá thầu', isCompleted: false },
        { id: 'cl3', text: 'Báo cáo sơ bộ', isCompleted: false }
    ],
    kpi: { estimatedHours: 5, actualHours: 3, onTime: true, rating: 0 }
  },
  {
    id: 't2', title: 'Đăng Video Viral TikTok + Reels', description: 'Video review son môi mới, đăng chéo Shopee Video',
    shopId: 's2', shopName: 'Dzu Beauty', platform: 'tiktok', status: 'new_request', priority: 'medium',
    assignee: 'Editor B', dueDate: '2024-02-06', attachments: 2,
    targetEntities: ['Dzu Beauty (TikTok)', 'Dzu Beauty (Insta)', 'Dzu Fashion (Shopee Video)'],
    budgetConfig: { total: 0, daily: 0, monthly: 0, currency: 'VND' },
    comments: [],
    checklist: [
        { id: 'cl1', text: 'Quay source thô', isCompleted: false },
        { id: 'cl2', text: 'Edit và lồng tiếng', isCompleted: false }
    ],
    history: []
  },
  {
    id: 't3', title: 'Yêu cầu thiết kế Banner 8/3', description: 'Banner chính cho Campaign 8/3, phong cách hồng pastel',
    shopId: 's1', shopName: 'Dzu Fashion HN', platform: 'facebook', status: 'review', priority: 'high',
    assignee: 'Designer C', dueDate: '2024-02-28', attachments: 0,
    targetEntities: ['Dzu Fashion (FB)'],
    budgetConfig: { total: 0, daily: 0, monthly: 0, currency: 'VND' },
    history: []
  }
];

const mockEntities = [
    { id: 's1', name: 'Dzu Fashion HN (Shopee)', type: 'shop', platform: 'shopee' },
    { id: 's2', name: 'Dzu Beauty (TikTok)', type: 'shop', platform: 'tiktok' },
    { id: 's3', name: 'Dzu Gadgets (Facebook)', type: 'shop', platform: 'facebook' },
    { id: 's4', name: 'Dzu Beauty (Insta)', type: 'shop', platform: 'instagram' },
];

// --- Types for Local State ---
type ViewMode = 'kanban' | 'list' | 'kpi';
type ModalTab = 'overview' | 'discussion' | 'history' | 'checklist';
interface Notification {
    id: string;
    taskId: string;
    message: string;
    type: 'warning' | 'danger' | 'success';
    timestamp: string;
}

const WorkManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showSmartAssistant, setShowSmartAssistant] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Form/Input States
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');
  const [syncToChat, setSyncToChat] = useState(true);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Alert System State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [riskyTaskIds, setRiskyTaskIds] = useState<string[]>([]);

  // --- Logic: KPI Scanning & Alerts ---
  const handleScanKPIs = () => {
      // Simulate checking backend API for Ads Metrics
      const newNotifications: Notification[] = [];
      const newRiskyIds: string[] = [];

      // Logic: Randomly flag 'inprogress' tasks as 'Over Budget' or 'Low ROAS'
      tasks.forEach(t => {
          if (t.status === 'inprogress' && t.budgetConfig?.total && t.budgetConfig.total > 0) {
              // Simulate risk
              const isOverBudget = Math.random() > 0.5;
              if (isOverBudget) {
                  newNotifications.push({
                      id: Date.now() + Math.random().toString(),
                      taskId: t.id,
                      message: `Ngân sách chạm ngưỡng 95%: ${t.title}`,
                      type: 'danger',
                      timestamp: 'Vừa xong'
                  });
                  newRiskyIds.push(t.id);
              }
          }
          if (t.platform === 'tiktok' && t.status === 'inprogress') {
               newNotifications.push({
                  id: Date.now() + Math.random().toString(),
                  taskId: t.id,
                  message: `ROAS thấp (1.2): ${t.title}`,
                  type: 'warning',
                  timestamp: 'Vừa xong'
              });
              newRiskyIds.push(t.id);
          }
      });

      if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
          setRiskyTaskIds(prev => Array.from(new Set([...prev, ...newRiskyIds])));
          setShowNotifications(true); // Auto open notification panel
          
          // Browser Notification Simulation
          if ("Notification" in window && Notification.permission === "granted") {
             new Notification("Dzu Ecom Alert", { body: `Phát hiện ${newNotifications.length} vấn đề về KPI cần xử lý ngay!` });
          } else if ("Notification" in window && Notification.permission !== "denied") {
             Notification.requestPermission().then(permission => {
                 if (permission === "granted") {
                     new Notification("Dzu Ecom Alert", { body: `Phát hiện ${newNotifications.length} vấn đề về KPI cần xử lý ngay!` });
                 }
             });
          }
      } else {
          alert("Hệ thống ổn định. Không phát hiện bất thường về KPI.");
      }
  };

  const clearNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- Logic: Comments & Chat Sync ---
  const handleAddComment = () => {
      if (!newComment.trim() || !formData.id) return;
      
      const now = new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
      const comment: TaskComment = {
          id: Date.now().toString(),
          userId: 'me',
          userName: 'Admin (Me)',
          text: newComment,
          timestamp: now
      };

      setTasks(prev => prev.map(t => {
          if (t.id === formData.id) {
              return { ...t, comments: [...(t.comments || []), comment] };
          }
          return t;
      }));
      setFormData(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
      setNewComment('');

      if (syncToChat) {
          // Simulation of Chat Sync
          alert("Hệ thống: Đã đồng bộ bình luận này sang Box Chat nhóm!");
      }
  };

  // --- Logic: Checklist ---
  const handleAddChecklist = () => {
      if (!newChecklistItem.trim() || !formData.id) return;
      const item = { id: Date.now().toString(), text: newChecklistItem, isCompleted: false };
      setTasks(prev => prev.map(t => t.id === formData.id ? { ...t, checklist: [...(t.checklist || []), item] } : t));
      setFormData(prev => ({ ...prev, checklist: [...(prev.checklist || []), item] }));
      setNewChecklistItem('');
  };

  const toggleChecklist = (itemId: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === formData.id) {
              const updatedCL = t.checklist?.map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i);
              return { ...t, checklist: updatedCL };
          }
          return t;
      }));
      setFormData(prev => {
          const updatedCL = prev.checklist?.map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i);
          return { ...prev, checklist: updatedCL };
      });
  };

  // --- Logic: CRUD ---
  const openCreateModal = (template?: string) => {
      setIsEditing(false);
      setModalTab('overview');
      const base = {
        id: '', title: '', status: 'new_request' as TaskStatus, priority: 'medium' as any,
        targetEntities: [], goals: [], comments: [], checklist: [],
        budgetConfig: { total: 0, daily: 0, monthly: 0, currency: 'VND' },
        timeConfig: { startDate: new Date().toISOString().split('T')[0], endDate: '' }
      };
      if(template === 'viral') base.title = 'Viral Video: [Product Name]';
      if(template === 'request') {
          base.title = 'Yêu cầu từ khách hàng: [Tiêu đề]';
          base.status = 'new_request';
      }
      setFormData(base);
      setShowModal(true);
  };

  const openEditModal = (task: Task) => {
      setIsEditing(true);
      setModalTab('overview');
      setFormData({ ...task });
      setShowModal(true);
  };

  const saveTask = () => {
      if (!formData.title) return alert("Thiếu tiêu đề!");
      
      const updatedTask = {
          ...formData,
          id: formData.id || Math.random().toString(36).substr(2, 9),
          updatedAt: new Date().toISOString()
      } as Task;

      if (isEditing) {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
          setTasks([...tasks, updatedTask]);
      }
      setShowModal(false);
  };

  const deleteTask = (id: string) => {
      if(confirm('Xóa công việc này?')) setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Workflow Columns (Agency Standard) ---
  const columns: { id: TaskStatus; label: string; color: string; icon?: React.ReactNode }[] = [
    { id: 'new_request', label: 'Yêu cầu mới', color: 'bg-indigo-50 border-indigo-100', icon: <Sparkles size={14}/> },
    { id: 'approved', label: 'Đã duyệt', color: 'bg-slate-50', icon: <CheckSquare size={14}/> },
    { id: 'inprogress', label: 'Đang làm', color: 'bg-blue-50 border-blue-100', icon: <Zap size={14}/> },
    { id: 'review', label: 'Khách duyệt', color: 'bg-orange-50 border-orange-100', icon: <User size={14}/> },
    { id: 'done', label: 'Hoàn thành', color: 'bg-green-50 border-green-100', icon: <CheckSquare size={14}/> },
    { id: 'cancelled', label: 'Hủy/Dừng', color: 'bg-red-50 border-red-100', icon: <X size={14}/> },
  ];

  // --- KPI Data Prep ---
  const kpiDataStatus = columns.map(c => ({
      name: c.label,
      value: tasks.filter(t => t.status === c.id).length,
      color: c.id === 'done' ? '#22c55e' : c.id === 'new_request' ? '#6366f1' : '#94a3b8'
  }));

  const filteredTasks = tasks.filter(t => filterPlatform === 'all' || t.platform === filterPlatform);

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col relative">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Công việc & Quy trình</h1>
          <p className="text-slate-500">Quy trình chuẩn Agency: Yêu cầu &rarr; Duyệt &rarr; Triển khai &rarr; Review</p>
        </div>
        <div className="flex gap-2 relative">
            {/* Notification Bell */}
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all mr-2"
            >
                <BellRing size={20} className={notifications.length > 0 ? "animate-swing text-orange-600" : ""} />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <h3 className="font-bold text-slate-800 text-sm">Thông báo KPI</h3>
                        <button onClick={() => setNotifications([])} className="text-xs text-indigo-600 hover:underline">Xóa tất cả</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs">Không có cảnh báo nào.</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 relative group">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-semibold ${n.type === 'danger' ? 'text-red-700' : 'text-orange-700'}`}>{n.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                                    </div>
                                    <button onClick={() => clearNotification(n.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <button onClick={handleScanKPIs} className="hidden md:flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                <Activity size={16} /> Quét KPI & Cảnh báo
            </button>
            <button onClick={() => openCreateModal('request')} className="hidden md:flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                <User size={16} /> Giả lập Khách yêu cầu
            </button>
            <button onClick={() => openCreateModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus size={18} /> Tạo công việc
            </button>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
         <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
             <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} title="Kanban"><Briefcase size={18}/></button>
             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} title="Danh sách"><List size={18}/></button>
             <button onClick={() => setViewMode('kpi')} className={`p-1.5 rounded ${viewMode === 'kpi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} title="Báo cáo KPI"><BarChart size={18}/></button>
         </div>
         <div className="h-6 w-px bg-slate-200 mx-1"></div>
         <select className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value as any)}>
             <option value="all">Tất cả Nền tảng</option>
             <option value="shopee">Shopee</option>
             <option value="tiktok">TikTok</option>
             <option value="facebook">Facebook</option>
         </select>
      </div>

      {/* VIEW: KANBAN BOARD (6 Steps) */}
      {viewMode === 'kanban' && (
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
              <div className="flex gap-4 h-full min-w-[1600px]">
                  {columns.map(col => (
                      <div key={col.id} className={`flex-1 rounded-xl p-3 flex flex-col gap-3 border shadow-sm transition-colors ${col.color.replace('bg-', 'bg-opacity-50 ')}`}>
                          <div className="flex justify-between items-center font-bold text-slate-700 pb-2 border-b border-black/5 uppercase text-xs tracking-wider">
                              <span className="flex items-center gap-1.5">{col.icon} {col.label}</span>
                              <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border border-slate-100">{filteredTasks.filter(t => t.status === col.id).length}</span>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                              {filteredTasks.filter(t => t.status === col.id).map(task => (
                                  <div 
                                    key={task.id} 
                                    onClick={() => openEditModal(task)} 
                                    className={`bg-white p-3 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group relative
                                        ${riskyTaskIds.includes(task.id) ? 'border-red-400 ring-1 ring-red-100' : 'border-slate-100'}
                                    `}
                                  >
                                      {/* Risk Badge */}
                                      {riskyTaskIds.includes(task.id) && (
                                          <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm z-10 animate-bounce">
                                              <AlertTriangle size={12} />
                                          </div>
                                      )}

                                      <div className="flex flex-wrap gap-1 mb-2">
                                          {task.targetEntities?.map((entityName, idx) => (
                                              <span key={idx} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[80px]">{entityName}</span>
                                          ))}
                                      </div>
                                      <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 leading-snug">{task.title}</h3>
                                      
                                      {/* Tags for Request Type */}
                                      {task.status === 'new_request' && (
                                          <div className="mb-2">
                                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">New Request</span>
                                          </div>
                                      )}

                                      <div className="flex justify-between items-center mt-3 text-xs text-slate-400 border-t border-slate-50 pt-2">
                                          <div className="flex items-center gap-2">
                                              <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                                              {task.dueDate && <span className="flex items-center gap-1 text-[10px]">{task.dueDate.slice(5)}</span>}
                                          </div>
                                          <div className="flex gap-2">
                                              {(task.comments?.length || 0) > 0 && <span className="flex items-center gap-0.5"><MessageSquare size={10}/> {task.comments?.length}</span>}
                                              {(task.attachments || 0) > 0 && <span className="flex items-center gap-0.5"><Paperclip size={10}/> {task.attachments}</span>}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* VIEW: LIST (Table) */}
      {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 font-medium text-slate-600">
                      <tr>
                          <th className="px-6 py-4">Công việc</th>
                          <th className="px-6 py-4">Shop/Target</th>
                          <th className="px-6 py-4">Người làm</th>
                          <th className="px-6 py-4">Hạn chót</th>
                          <th className="px-6 py-4 text-center">Trạng thái</th>
                          <th className="px-6 py-4 text-right">Hành động</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredTasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEditModal(task)}>
                              <td className="px-6 py-4 font-medium text-slate-900">
                                  {task.title}
                                  {riskyTaskIds.includes(task.id) && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Risk</span>}
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">{task.targetEntities?.join(', ')}</td>
                              <td className="px-6 py-4 text-slate-600"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">{task.assignee}</span></td>
                              <td className="px-6 py-4 text-slate-500">{task.dueDate}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                      task.status === 'done' ? 'bg-green-100 text-green-700' : 
                                      task.status === 'review' ? 'bg-orange-100 text-orange-700' :
                                      'bg-slate-100 text-slate-600'}`}>
                                      {task.status.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* VIEW: KPI REPORT */}
      {viewMode === 'kpi' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Tiến độ Workload</h3>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart data={kpiDataStatus} layout="vertical" margin={{left: 20}}>
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={100} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#6366f1" barSize={20} radius={[0, 4, 4, 0]} />
                          </ReBarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              
              {/* Performance Stats */}
              <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-slate-500 text-sm">Đúng hạn (On-time)</p>
                          <p className="text-2xl font-bold text-green-600">{Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-full text-green-600"><CheckSquare size={24}/></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-slate-500 text-sm">Việc tồn đọng (Backlog)</p>
                          <p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'new_request' || t.status === 'approved').length}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-full text-red-600"><Clock size={24}/></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-slate-500 text-sm">Chờ khách duyệt</p>
                          <p className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'review').length}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-full text-orange-600"><User size={24}/></div>
                  </div>
              </div>
          </div>
      )}

      {/* TASK MODAL (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-indigo-600" />
                        <input 
                            type="text" 
                            className="bg-transparent font-bold text-lg text-slate-900 border-none focus:ring-0 p-0 w-96 placeholder:text-slate-400"
                            placeholder="Tên công việc..."
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 bg-white">
                    {[
                        { id: 'overview', label: 'Thông tin chung', icon: <List size={16}/> },
                        { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={16}/> },
                        { id: 'discussion', label: `Thảo luận (${formData.comments?.length || 0})`, icon: <MessageSquare size={16}/> },
                        { id: 'history', label: 'Lịch sử', icon: <History size={16}/> },
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setModalTab(tab.id as ModalTab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${modalTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                    {modalTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả chi tiết</label>
                                    <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg h-32 text-sm focus:ring-2 focus:ring-indigo-500 resize-none" value={formData.detailedContent || formData.description} onChange={(e) => setFormData({...formData, detailedContent: e.target.value})} placeholder="Nhập mô tả công việc..."></textarea>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Share2 size={16}/> Target Shop/Account</label>
                                    <div className="flex flex-wrap gap-2">
                                        {mockEntities.map(e => (
                                            <button key={e.id} onClick={() => {
                                                const current = formData.targetEntities || [];
                                                const exists = current.includes(e.name);
                                                setFormData({...formData, targetEntities: exists ? current.filter(x => x !== e.name) : [...current, e.name]});
                                            }} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${formData.targetEntities?.includes(e.name) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                                                {e.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
                                        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as TaskStatus})}>
                                            <option value="new_request">Yêu cầu mới</option>
                                            <option value="approved">Đã duyệt (Approved)</option>
                                            <option value="inprogress">Đang làm</option>
                                            <option value="review">Chờ Khách duyệt</option>
                                            <option value="done">Hoàn thành</option>
                                            <option value="cancelled">Hủy / Tạm dừng</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Độ ưu tiên</label>
                                        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value as any})}>
                                            <option value="low">Thấp</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="high">Cao</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Người làm</label>
                                        <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hạn chót</label>
                                        <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngân sách (Optional)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                                        <input type="number" className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm" value={formData.budgetConfig?.total} onChange={e => setFormData({...formData, budgetConfig: {...formData.budgetConfig!, total: Number(e.target.value)}})} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === 'checklist' && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Thêm việc cần làm..." value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddChecklist()} />
                                <button onClick={handleAddChecklist} className="bg-indigo-50 text-indigo-600 px-4 rounded-lg text-sm font-medium hover:bg-indigo-100">Thêm</button>
                            </div>
                            <div className="space-y-2">
                                {formData.checklist?.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                        <input type="checkbox" checked={item.isCompleted} onChange={() => toggleChecklist(item.id)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                                        <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                    </div>
                                ))}
                                {(!formData.checklist || formData.checklist.length === 0) && <p className="text-center text-slate-400 text-sm italic py-4">Chưa có checklist.</p>}
                            </div>
                        </div>
                    )}

                    {modalTab === 'discussion' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {formData.comments?.map(comment => (
                                    <div key={comment.id} className={`flex gap-3 ${comment.userId === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                                            {comment.userName.charAt(0)}
                                        </div>
                                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${comment.userId === 'me' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                            <div className={`font-bold text-xs mb-1 ${comment.userId === 'me' ? 'text-indigo-200' : 'text-slate-500'}`}>{comment.userName} • {comment.timestamp}</div>
                                            <p>{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!formData.comments || formData.comments.length === 0) && <p className="text-center text-slate-400 text-sm italic py-10">Chưa có thảo luận nào. Hãy bắt đầu!</p>}
                            </div>
                            <div className="border-t border-slate-100 pt-4 bg-white sticky bottom-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" id="syncChat" checked={syncToChat} onChange={e => setSyncToChat(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                                    <label htmlFor="syncChat" className="text-xs text-slate-500 flex items-center gap-1"><Bell size={12}/> Đồng bộ tin nhắn sang Box Chat nhóm</label>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Viết bình luận..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <button onClick={handleAddComment} className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === 'history' && (
                        <div className="space-y-4">
                            {formData.history?.map(h => (
                                <div key={h.id} className="flex gap-3 text-sm text-slate-600 border-l-2 border-slate-200 pl-4 py-1">
                                    <span className="font-mono text-xs text-slate-400 min-w-[100px]">{h.timestamp}</span>
                                    <div>
                                        <span className="font-bold text-slate-800">{h.user}</span>: {h.description}
                                    </div>
                                </div>
                            ))}
                            {(!formData.history || formData.history.length === 0) && <p className="text-center text-slate-400 text-sm italic">Chưa có lịch sử.</p>}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50 rounded-b-xl">
                    <button onClick={() => deleteTask(formData.id!)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"><Trash2 size={16}/> Xóa</button>
                    <div className="flex gap-2">
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">Hủy</button>
                        <button onClick={saveTask} className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/30">Lưu công việc</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WorkManager;

function Activity(props: {size: number}) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}