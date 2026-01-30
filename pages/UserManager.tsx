import React, { useState } from 'react';
import { User, UserRole, Agency, GranularPermission, ActionType } from '../types';
import { Users, Shield, Edit, Key, Trash2, Plus, Link, Clock, Calendar, Smartphone, Building2, X, Save, MapPin, Monitor, Globe, Mail, Check, AlertCircle, LayoutGrid, Facebook, Youtube, LogIn } from 'lucide-react';

const mockAgencies: Agency[] = [
    { id: 'ag1', name: 'Dzu Global Agency', tier: 'enterprise', status: 'active', logo: 'https://via.placeholder.com/40' },
    { id: 'ag2', name: 'Partner: TopOne Media', tier: 'pro', status: 'active', logo: 'https://via.placeholder.com/40' },
];

const mockUsers: User[] = [
  { 
      id: 'u1', username: 'admin_dzu', email: 'admin@dzule.com', phone: '0987654321', company: 'Dzu Global', role: 'super_admin', status: 'active', permissions: ['all'], expirationDate: '2025-12-31',
      agencyId: 'ag1',
      granularPermissions: [{ resourceId: 'all', resourceType: 'all', actions: ['view', 'edit', 'delete', 'approve'] }],
      tracking: { ip: '113.190.23.1', location: 'Hanoi, VN', device: 'Chrome / Windows 11', lastActive: 'Vừa xong' },
      socialAccounts: [{ provider: 'google', email: 'admin@dzule.com', connectedAt: '2024-01-01' }]
  },
  { 
      id: 'u2', username: 'manager_01', email: 'manager@dzule.com', phone: '0912345678', company: 'Dzu Beauty Branch', role: 'manager', status: 'active', permissions: ['ads_manage'], expirationDate: '2024-06-30',
      agencyId: 'ag1',
      granularPermissions: [
          { resourceId: 's2', resourceType: 'shop', actions: ['view', 'edit', 'approve'] },
          { resourceId: 's4', resourceType: 'shop', actions: ['view', 'edit'] }
      ],
      tracking: { ip: '14.162.11.55', location: 'HCM, VN', device: 'Safari / iPhone 14', lastActive: '5 phút trước' },
      socialAccounts: [{ provider: 'facebook', email: 'manager.fb@dzule.com', connectedAt: '2024-02-15' }]
  },
  { 
      id: 'u3', username: 'partner_staff', email: 'staff@topone.media', phone: '0909090909', company: 'TopOne Media', role: 'member', status: 'active', permissions: ['view_reports'], expirationDate: '2024-12-31',
      agencyId: 'ag2',
      granularPermissions: [{ resourceId: 's1', resourceType: 'shop', actions: ['view'] }],
      tracking: { ip: '27.11.22.33', location: 'Danang, VN', device: 'Mobile / iOS', lastActive: '1 giờ trước' },
  },
];

const mockShopsList = [
    { id: 's1', name: 'Dzu Fashion HN' },
    { id: 's2', name: 'Dzu Beauty' },
    { id: 's3', name: 'Dzu Gadgets' },
    { id: 's4', name: 'Dzu Fashion HCM' },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeAgencyFilter, setActiveAgencyFilter] = useState<string>('all');
  
  // Modal States
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State for User
  // Adding 'password' to partial User for this form logic, though not in main type
  const [userForm, setUserForm] = useState<Partial<User> & { password?: string }>({});
  
  // Granular Permission Temporary State in Modal
  const [tempPermission, setTempPermission] = useState<{resourceId: string, actions: ActionType[]}>({ resourceId: '', actions: [] });

  // --- CRUD ---
  const handleAddUser = () => {
      setIsEditing(false);
      setUserForm({ 
          role: 'member', 
          status: 'active', 
          agencyId: mockAgencies[0].id,
          granularPermissions: [],
          password: '',
          expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] 
      });
      setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
      setIsEditing(true);
      setUserForm({ ...user, password: '' }); // Don't show existing password
      setShowUserModal(true);
  };

  const saveUser = () => {
      if (!userForm.username || !userForm.email) return alert('Vui lòng nhập Username và Email');
      
      // In a real app, send 'password' to backend securely
      const { password, ...userData } = userForm;

      if (isEditing) {
          setUsers(prev => prev.map(u => u.id === userForm.id ? { ...u, ...userData } as User : u));
          if(password) alert(`Đã cập nhật mật khẩu mới cho user ${userData.username}`);
      } else {
          const newUser: User = {
              ...userData as User,
              id: Math.random().toString(36).substr(2, 9),
              status: userForm.status || 'active',
              granularPermissions: userForm.granularPermissions || [],
              socialAccounts: [],
              tracking: { ip: 'Unknown', location: 'Unknown', device: 'Unknown', lastActive: 'Never' }
          };
          setUsers([...users, newUser]);
          alert(`Đã tạo thành viên mới với mật khẩu: ${password}`);
      }
      setShowUserModal(false);
  };

  const toggleStatus = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const handleImpersonate = (user: User) => {
      const confirmLogin = confirm(`Bạn có chắc chắn muốn đăng nhập với vai trò: ${user.username} (${user.role})?\n\nHành động này sẽ được ghi lại trong nhật ký hệ thống.`);
      if (confirmLogin) {
          alert(`Đang chuyển phiên làm việc sang: ${user.username}...\n(Simulation: Access granted)`);
          // In real app: call API to get temp token -> window.location.reload()
      }
  };

  // --- Permission Matrix Logic ---
  const addPermission = () => {
      if (!tempPermission.resourceId || tempPermission.actions.length === 0) return;
      const newPerm: GranularPermission = {
          resourceId: tempPermission.resourceId,
          resourceType: tempPermission.resourceId === 'all' ? 'all' : 'shop',
          actions: tempPermission.actions
      };
      
      const currentPerms = userForm.granularPermissions || [];
      // Remove existing for same resource to overwrite
      const filtered = currentPerms.filter(p => p.resourceId !== newPerm.resourceId);
      setUserForm({ ...userForm, granularPermissions: [...filtered, newPerm] });
      setTempPermission({ resourceId: '', actions: [] });
  };

  const removePermission = (resourceId: string) => {
      const currentPerms = userForm.granularPermissions || [];
      setUserForm({ ...userForm, granularPermissions: currentPerms.filter(p => p.resourceId !== resourceId) });
  };

  const toggleActionInTemp = (action: ActionType) => {
      const current = tempPermission.actions;
      if (current.includes(action)) {
          setTempPermission({ ...tempPermission, actions: current.filter(a => a !== action) });
      } else {
          setTempPermission({ ...tempPermission, actions: [...current, action] });
      }
  };

  // --- Helpers ---
  const getRoleBadgeColor = (role: UserRole) => {
      switch(role) {
          case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'agency_admin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
          case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'member': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
          case 'customer': return 'bg-green-100 text-green-700 border-green-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  const filteredUsers = activeAgencyFilter === 'all' ? users : users.filter(u => u.agencyId === activeAgencyFilter);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Thành viên & Đối tác</h1>
          <p className="text-slate-500">Phân quyền chi tiết (RBAC) cho đa Agency và nhiều Shop</p>
        </div>
        <div className="flex gap-2">
            {/* Agency Selector for Super Admin */}
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2"
                value={activeAgencyFilter}
                onChange={(e) => setActiveAgencyFilter(e.target.value)}
            >
                <option value="all">Tất cả Đối tác (Agencies)</option>
                {mockAgencies.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
            </select>

            <button 
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
            <Plus size={18} />
            Thêm Thành viên
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Agency / Tổ chức</th>
                    <th className="px-6 py-4">Vai trò & Quyền hạn</th>
                    <th className="px-6 py-4">Liên kết Social</th>
                    <th className="px-6 py-4">Hoạt động cuối</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                    const agency = mockAgencies.find(a => a.id === user.agencyId);
                    return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{user.username}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-slate-400" />
                                <span className="font-medium text-slate-700">{agency?.name || 'Unknown'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-6 uppercase tracking-wider">{agency?.tier}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mb-1 uppercase ${getRoleBadgeColor(user.role)}`}>
                                <Shield size={12} />
                                {user.role.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                Quyền: {user.granularPermissions.find(p => p.resourceId === 'all') ? 'Toàn quyền hệ thống' : `${user.granularPermissions.length} rules assigned`}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2">
                                {user.socialAccounts && user.socialAccounts.some(s => s.provider === 'google') && (
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm" title="Google Linked">
                                        <Globe size={12} className="text-red-500" />
                                    </div>
                                )}
                                {user.socialAccounts && user.socialAccounts.some(s => s.provider === 'facebook') && (
                                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm" title="Facebook Linked">
                                        <Facebook size={12} className="text-blue-600" />
                                    </div>
                                )}
                                {(!user.socialAccounts || user.socialAccounts.length === 0) && (
                                    <span className="text-xs text-slate-400 italic">Chưa liên kết</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                    <MapPin size={12} className="text-red-500"/> {user.tracking?.location}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <Clock size={10} /> {user.tracking?.lastActive}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => toggleStatus(user.id)}
                                className={`px-2 py-1 rounded-md text-xs font-bold w-20 transition-all shadow-sm
                                ${user.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                            >
                                {user.status === 'active' ? 'ACTIVE' : 'LOCKED'}
                            </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => handleImpersonate(user)}
                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors hidden group-hover:block" 
                                    title="Đăng nhập dưới quyền (Impersonate)"
                                >
                                    <LogIn size={16} />
                                </button>
                                <button onClick={() => handleEditUser(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Sửa Profile & Mật khẩu">
                                    <Edit size={16} />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )})}
            </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal with Granular Permissions */}
      {showUserModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Users size={20} className="text-indigo-600"/>
                          {isEditing ? 'Cập nhật Profile & Quyền hạn' : 'Thêm thành viên mới'}
                      </h3>
                      <button onClick={() => setShowUserModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên đăng nhập *</label>
                                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={userForm.username || ''} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Login) *</label>
                                  <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={userForm.email || ''} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
                                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={userForm.phone || ''} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thuộc Đối tác (Agency)</label>
                                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={userForm.agencyId} onChange={e => setUserForm({...userForm, agencyId: e.target.value})}>
                                      {mockAgencies.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò hệ thống</label>
                                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                                      <option value="super_admin">Super Admin (Toàn quyền)</option>
                                      <option value="agency_admin">Agency Admin (Quản lý Partner)</option>
                                      <option value="manager">Manager (Quản lý Shop)</option>
                                      <option value="member">Member (Nhân viên)</option>
                                      <option value="customer">Customer (Khách hàng xem báo cáo)</option>
                                  </select>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg">
                                  <label className="block text-xs font-bold text-yellow-700 uppercase mb-1 flex items-center gap-1"><Key size={12}/> {isEditing ? 'Đặt lại Mật khẩu' : 'Mật khẩu khởi tạo'}</label>
                                  <input 
                                    type="password" 
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none bg-white" 
                                    placeholder={isEditing ? "Nhập để đổi mật khẩu mới..." : "Nhập mật khẩu..."}
                                    value={userForm.password || ''} 
                                    onChange={e => setUserForm({...userForm, password: e.target.value})} 
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Granular Permissions Matrix */}
                      <div className="border-t border-slate-100 pt-5">
                          <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <LayoutGrid size={16} className="text-indigo-600"/> Ma trận phân quyền (Granular Permissions)
                          </label>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                               <div className="flex flex-col md:flex-row gap-4 items-end">
                                   <div className="flex-1 w-full">
                                       <label className="block text-xs font-medium text-slate-500 mb-1">1. Chọn Tài nguyên (Shop/Account)</label>
                                       <select 
                                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                            value={tempPermission.resourceId}
                                            onChange={e => setTempPermission({...tempPermission, resourceId: e.target.value})}
                                       >
                                           <option value="">-- Chọn Shop --</option>
                                           <option value="all" className="font-bold text-indigo-600">★ Tất cả Shop (All Access)</option>
                                           {mockShopsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                       </select>
                                   </div>
                                   <div className="flex-1 w-full">
                                       <label className="block text-xs font-medium text-slate-500 mb-1">2. Cấp quyền hành động</label>
                                       <div className="flex gap-2">
                                           {(['view', 'edit', 'delete', 'approve'] as ActionType[]).map(action => (
                                               <button 
                                                    key={action}
                                                    onClick={() => toggleActionInTemp(action)}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors capitalize
                                                        ${tempPermission.actions.includes(action) 
                                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                                            : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                                                        }
                                                    `}
                                               >
                                                   {action}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                                   <button 
                                        onClick={addPermission}
                                        disabled={!tempPermission.resourceId || tempPermission.actions.length === 0}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1"
                                   >
                                       <Plus size={16} /> Thêm quyền
                                   </button>
                               </div>
                          </div>

                          {/* Permission List */}
                          <div className="space-y-2">
                              {userForm.granularPermissions && userForm.granularPermissions.length > 0 ? (
                                  userForm.granularPermissions.map((perm, idx) => {
                                      const resourceName = perm.resourceId === 'all' ? 'Tất cả Shop' : mockShopsList.find(s => s.id === perm.resourceId)?.name || perm.resourceId;
                                      return (
                                          <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-8 h-8 rounded flex items-center justify-center ${perm.resourceId === 'all' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                      {perm.resourceId === 'all' ? <Globe size={16}/> : <Building2 size={16}/>}
                                                  </div>
                                                  <div>
                                                      <div className="text-sm font-bold text-slate-800">{resourceName}</div>
                                                      <div className="flex gap-1 mt-1">
                                                          {perm.actions.map(a => (
                                                              <span key={a} className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold
                                                                ${a === 'delete' ? 'bg-red-50 text-red-600' : 
                                                                  a === 'approve' ? 'bg-green-50 text-green-600' : 
                                                                  'bg-slate-100 text-slate-600'}
                                                              `}>{a}</span>
                                                          ))}
                                                      </div>
                                                  </div>
                                              </div>
                                              <button onClick={() => removePermission(perm.resourceId)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                                          </div>
                                      );
                                  })
                              ) : (
                                  <div className="text-center py-6 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg">
                                      Chưa có quyền nào được gán. Thành viên này sẽ không thấy gì.
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                      <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">Hủy</button>
                      <button onClick={saveUser} className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/30">
                          <Save size={18} /> Lưu cấu hình
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManager;