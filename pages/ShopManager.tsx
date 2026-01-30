import React, { useState, useEffect } from 'react';
import { Shop, Platform, HandoverCredential } from '../types';
import { Store, Plus, RefreshCw, CheckCircle, XCircle, Trash2, Link as LinkIcon, AlertCircle, Key, Eye, EyeOff, Monitor, Copy, ShieldAlert, LogIn } from 'lucide-react';
import { api } from '../services/api';

const mockHandover: HandoverCredential[] = [
    { id: 'h1', shopId: 's1', platform: 'shopee', username: 'dzu_fashion_main', passwordEncrypted: '••••••••', notes: 'Sim nhận OTP: 0987xxx', chromeRemotePin: '123456', status: 'active' }
];

const ShopManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connected' | 'handover'>('connected');
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [handovers, setHandovers] = useState<HandoverCredential[]>(mockHandover);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newShop, setNewShop] = useState<Partial<Shop>>({ platform: 'shopee' });

  // FETCH DATA FROM PHP API
  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
      setIsLoading(true);
      try {
          const data = await api.shops.getAll();
          if (data.length > 0) {
            setShops(data);
          } else {
             // Fallback mock data if API is empty or error during dev
             setShops([
                { id: 's1', name: 'Dzu Fashion HN', accountName: 'dzu_fashion_main', platform: 'shopee', status: 'connected', productCount: 150 },
                { id: 's2', name: 'Dzu Beauty', accountName: 'dzu_beauty_official', platform: 'tiktok', status: 'connected', productCount: 45 },
             ]);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSync = (id: string) => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
        setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'connected', productCount: Math.floor(Math.random() * 100) + 10, violationReason: undefined } : s));
        alert('Đã đồng bộ lại dữ liệu thành công!');
    }, 1500);
  };

  const handleDelete = async (id: string) => {
      if(confirm('Bạn có chắc muốn xóa shop này khỏi hệ thống?')) {
          try {
              await api.shops.delete(id); // Call API
              setShops(prev => prev.filter(s => s.id !== id));
          } catch (error) {
              alert("Lỗi khi xóa shop");
          }
      }
  }
  
  const togglePassword = (id: string) => {
      setShowPassword(showPassword === id ? null : id);
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Đã sao chép!');
  }

  const handleAddShop = async () => {
      try {
          const shopToCreate = {
              name: newShop.name || 'New Shop',
              accountName: newShop.accountName || 'user_id',
              platform: newShop.platform || 'shopee',
          };
          
          const result = await api.shops.create(shopToCreate);
          
          if (result) {
              await loadShops(); // Reload list
              setShowAddModal(false);
              setNewShop({ platform: 'shopee' });
          }
      } catch (error) {
          alert("Lỗi khi tạo shop. Kiểm tra kết nối API.");
      }
  }

  const getStatusBadge = (shop: Shop) => {
      switch (shop.status) {
          case 'connected':
              return (
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <CheckCircle size={12} /> Đã kết nối
                  </span>
              );
          case 'policy_violation':
              return (
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <ShieldAlert size={12} /> Vi phạm CS
                  </span>
              );
          case 'token_expired':
              return (
                  <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <Key size={12} /> Token hết hạn
                  </span>
              );
          default:
              return (
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <XCircle size={12} /> Mất kết nối
                  </span>
              );
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Shop & Tài khoản</h1>
          <p className="text-slate-500">Kết nối, đồng bộ và bàn giao tài khoản khách hàng</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Thêm Tài Khoản
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
          <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('connected')}
                className={`pb-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'connected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                  <Store size={18} /> Shop đã kết nối
              </button>
              <button 
                onClick={() => setActiveTab('handover')}
                className={`pb-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'handover' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              >
                  <Key size={18} /> Thông tin bàn giao
              </button>
          </div>
      </div>

      {/* CONNECTED SHOPS TAB */}
      {activeTab === 'connected' && (
        <>
        {isLoading ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <RefreshCw className="animate-spin mb-2" size={32}/>
                Đang tải dữ liệu từ Server...
            </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map(shop => (
            <div key={shop.id} className={`bg-white rounded-xl border shadow-sm p-6 relative group transition-all
                ${shop.status === 'policy_violation' ? 'border-red-200 shadow-red-50' : shop.status === 'token_expired' ? 'border-orange-200' : 'border-slate-200 hover:border-indigo-300'}
            `}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl
                        ${shop.platform === 'shopee' ? 'bg-orange-500' : 
                        shop.platform === 'tiktok' ? 'bg-black' : 
                        shop.platform === 'facebook' ? 'bg-blue-600' : 'bg-red-500'}`}>
                        {shop.platform === 'shopee' ? 'S' : shop.platform === 'tiktok' ? 'T' : shop.platform === 'facebook' ? 'F' : 'G'}
                    </div>
                    <div className="flex items-center gap-1">
                        {getStatusBadge(shop)}
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-0">{shop.name}</h3>
                <p className="text-sm text-slate-500 mb-2 font-mono bg-slate-50 inline-block px-2 py-0.5 rounded mt-1">@{shop.accountName}</p>
                <p className="text-xs text-slate-400 capitalize mb-4">Platform: {shop.platform}</p>
                
                {shop.status === 'policy_violation' && (
                    <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-700 flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1"><ShieldAlert size={14}/> Cảnh báo vi phạm:</span>
                        <span>{shop.violationReason || 'Vui lòng kiểm tra trung tâm chính sách.'}</span>
                        <button className="mt-1 text-red-600 underline font-medium text-left">Xem hướng dẫn kháng nghị</button>
                    </div>
                )}

                {shop.status === 'token_expired' && (
                    <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100 text-xs text-orange-700 flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1"><AlertCircle size={14}/> Phiên đăng nhập hết hạn</span>
                        <span>Vui lòng đăng nhập lại để tiếp tục đồng bộ dữ liệu.</span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-sm">
                        <span className="font-semibold text-slate-900">{shop.productCount}</span> <span className="text-slate-500">Sản phẩm</span>
                    </div>
                    <div className="flex gap-2">
                        {shop.status === 'token_expired' || shop.status === 'disconnected' ? (
                            <button 
                                onClick={() => handleSync(shop.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <LogIn size={14} /> Kết nối lại
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleSync(shop.id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Đồng bộ lại"
                            >
                                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                            </button>
                        )}
                        
                        <button 
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Cấu hình link"
                        >
                            <LinkIcon size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(shop.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa shop"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
            ))}
            
            {/* Add New Card Placeholder */}
            <button onClick={() => setShowAddModal(true)} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Plus size={24} />
                </div>
                <span className="font-medium">Thêm tài khoản mới</span>
            </button>
        </div>
        )}
        </>
      )}

      {/* HANDOVER TAB (Giữ nguyên UI cũ cho Handover vì chưa có API phần này) */}
      {activeTab === 'handover' && (
          <div className="space-y-6">
              {/* Remote Tools */}
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                          <Monitor size={20} /> Chrome Remote Desktop
                      </h3>
                      <p className="text-indigo-700 text-sm mt-1">Truy cập máy khách hàng để xử lý sự cố hoặc setup quảng cáo từ xa.</p>
                  </div>
                  <a 
                    href="https://remotedesktop.google.com/access" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm"
                  >
                      Mở Chrome Remote
                  </a>
              </div>

              {/* Credentials Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800 flex justify-between items-center">
                      <span>Danh sách tài khoản bàn giao</span>
                      <button className="text-sm text-indigo-600 hover:underline">+ Ghi nhận mới</button>
                  </div>
                  <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-200 text-slate-600 font-medium">
                          <tr>
                              <th className="px-6 py-3">Shop / Nền tảng</th>
                              <th className="px-6 py-3">Tài khoản (Username)</th>
                              <th className="px-6 py-3">Mật khẩu / PIN</th>
                              <th className="px-6 py-3">UltraViewer / Remote PIN</th>
                              <th className="px-6 py-3">Ghi chú</th>
                              <th className="px-6 py-3 text-right">Hành động</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {handovers.map(cred => {
                              const shop = shops.find(s => s.id === cred.shopId);
                              return (
                                  <tr key={cred.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4">
                                          <div className="font-medium text-slate-900">{shop?.name || 'Unknown'}</div>
                                          <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded capitalize">{cred.platform}</span>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-slate-600">
                                          {cred.username} 
                                          <button onClick={() => copyToClipboard(cred.username)} className="ml-2 text-slate-400 hover:text-indigo-600"><Copy size={12}/></button>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                                                  {showPassword === cred.id ? 'P@ssw0rd123' : '••••••••'}
                                              </span>
                                              <button onClick={() => togglePassword(cred.id)} className="text-slate-400 hover:text-slate-600">
                                                  {showPassword === cred.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                              </button>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-indigo-600 font-medium">
                                          {cred.chromeRemotePin || '---'}
                                      </td>
                                      <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                                          {cred.notes}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                      </td>
                                  </tr>
                              );
                          })}
                          {handovers.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Chưa có thông tin bàn giao nào.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm Tài Khoản Mới</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tên Shop</label>
                          <input type="text" className="w-full border rounded-lg px-3 py-2" value={newShop.name || ''} onChange={e => setNewShop({...newShop, name: e.target.value})} placeholder="VD: Dzu Store..." />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nền tảng</label>
                          <select className="w-full border rounded-lg px-3 py-2" value={newShop.platform} onChange={e => setNewShop({...newShop, platform: e.target.value as Platform})}>
                              <option value="shopee">Shopee</option>
                              <option value="tiktok">TikTok</option>
                              <option value="facebook">Facebook</option>
                              <option value="google">Google</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tên tài khoản (Account ID)</label>
                          <input type="text" className="w-full border rounded-lg px-3 py-2" value={newShop.accountName || ''} onChange={e => setNewShop({...newShop, accountName: e.target.value})} />
                      </div>
                  </div>
                  <div className="mt-6 flex gap-3 justify-end">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                      <button onClick={handleAddShop} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Lưu & Kết nối</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShopManager;