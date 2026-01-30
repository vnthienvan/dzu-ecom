import React, { useState } from 'react';
import { Campaign, Shop, Platform, Targeting } from '../types';
import { Plus, Download, Calendar, Filter, X, Save, Edit3, RefreshCw, Link2, Briefcase, MapPin, User, Heart, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const mockShops: Shop[] = [
  { id: 's1', name: 'Dzu Fashion HN', platform: 'shopee', status: 'connected', productCount: 150 },
  { id: 's2', name: 'Dzu Beauty', platform: 'tiktok', status: 'connected', productCount: 45 },
];

const mockCampaigns: Campaign[] = [
  { 
    id: '1', shopId: 's1', shopName: 'Dzu Fashion HN', name: 'Sale Tết 2024 - Áo thun', platform: 'shopee', source: 'synced',
    status: 'running', createdAt: '2024-01-10', startDate: '2024-01-15', endDate: '2024-02-15',
    dailyBudget: 200000, monthlyBudget: 6000000, totalBudget: 6200000, spent: 1250000, 
    revenue: 8900000, roas: 7.12, clicks: 1450, impressions: 45000, products: ['1'], content: 'Giảm giá 50% toàn bộ shop',
    targeting: { gender: 'all', ageRange: {min: 18, max: 35}, locations: ['Hanoi'], interests: ['Fashion', 'T-shirt'], behaviors: [], placements: ['feed'] }
  },
];

const AdsManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Platform | 'all'>('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // --- Create/Edit State ---
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    shopId: '',
    platform: 'shopee',
    dailyBudget: 0,
    totalBudget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    products: [],
    content: '',
    note: '',
    // Advanced Targeting Defaults
    targeting: {
        gender: 'all',
        ageRange: { min: 18, max: 55 },
        locations: [],
        interests: [],
        behaviors: [],
        placements: ['feed']
    }
  });
  
  // UI State for Advanced Sections
  const [showAdvancedTargeting, setShowAdvancedTargeting] = useState(false);

  const handleSyncAds = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          alert("Đã đồng bộ 5 chiến dịch mới từ API TikTok và Shopee!");
      }, 2000);
  }

  // --- Budget Calculation Logic ---
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return diffDays > 0 ? diffDays : 1;
  };

  const handleBudgetChange = (type: 'daily' | 'total', value: number) => {
    const days = calculateDays(formData.startDate || '', formData.endDate || '');
    if (type === 'daily') {
      setFormData(prev => ({ ...prev, dailyBudget: value, totalBudget: value * days, monthlyBudget: value * 30 }));
    } else {
      setFormData(prev => ({ ...prev, totalBudget: value, dailyBudget: Math.round(value / days), monthlyBudget: Math.round((value / days) * 30) }));
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newData = { ...formData, [field]: value };
    const days = calculateDays(newData.startDate || '', newData.endDate || '');
    const currentDaily = formData.dailyBudget || 0;
    setFormData(prev => ({ ...prev, [field]: value, totalBudget: currentDaily * days }));
  };

  const handleSaveCampaign = () => {
    if (!formData.name || !formData.shopId) return alert("Vui lòng nhập tên chiến dịch và chọn Shop");
    const shop = mockShops.find(s => s.id === formData.shopId);
    const newCampaign: Campaign = {
        ...(formData as Campaign),
        id: Math.random().toString(36).substr(2, 9),
        shopName: shop?.name || 'Unknown',
        status: 'running',
        source: 'manual',
        createdAt: new Date().toISOString().split('T')[0],
        spent: 0, revenue: 0, roas: 0, clicks: 0, impressions: 0,
    };
    setCampaigns([newCampaign, ...campaigns]);
    setShowModal(false);
  };

  const handleCreateTask = (campaign: Campaign) => {
      if(confirm(`Bạn muốn tạo công việc "Tối ưu chiến dịch: ${campaign.name}"?`)) navigate('/work');
  };

  const filteredCampaigns = activeTab === 'all' ? campaigns : campaigns.filter(c => c.platform === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Dzu Ads</h1>
          <p className="text-slate-500">Đồng bộ tự động hoặc thêm thủ công (Shopee, TikTok, Facebook, Google)</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handleSyncAds} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm">
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ API'}
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus size={18} />
                Thêm Thủ Công
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['all', 'shopee', 'tiktok', 'facebook', 'google'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab === 'all' ? 'Tất cả' : `${tab} Ads`}
            </button>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Nguồn</th>
                        <th className="px-6 py-4">Tên Chiến Dịch</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4 text-right">Ngân sách (VNĐ)</th>
                        <th className="px-6 py-4 text-center">Hiệu quả</th>
                        <th className="px-6 py-4">Mục tiêu (Target)</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCampaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{camp.shopName}</div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase mt-1 ${camp.platform === 'shopee' ? 'bg-orange-100 text-orange-700' : camp.platform === 'tiktok' ? 'bg-black text-white' : camp.platform === 'facebook' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{camp.platform}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{camp.name}</div>
                                <div className="text-slate-500 text-xs mt-1">Tạo: {camp.createdAt}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex items-center gap-1"><Calendar size={14} />{camp.startDate}</div>
                                <div className="flex items-center gap-1 mt-1"><span className="text-xs ml-5">đến {camp.endDate}</span></div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="font-medium text-slate-900">{new Intl.NumberFormat('vi-VN').format(camp.dailyBudget)} / ngày</div>
                                <div className="text-slate-500 text-xs">Tổng: {new Intl.NumberFormat('vi-VN').format(camp.totalBudget)}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">ROAS:</span><span className={camp.roas > 5 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{camp.roas}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">Rev:</span><span className="font-medium">{new Intl.NumberFormat('vi-VN', {notation:'compact'}).format(camp.revenue)}</span></div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {camp.targeting ? (
                                    <div className="text-xs text-slate-600 space-y-1">
                                        <div className="flex items-center gap-1"><User size={10}/> {camp.targeting.gender === 'all' ? 'All' : camp.targeting.gender}, {camp.targeting.ageRange.min}-{camp.targeting.ageRange.max}</div>
                                        <div className="flex items-center gap-1"><MapPin size={10}/> {camp.targeting.locations.join(', ') || 'Toàn quốc'}</div>
                                    </div>
                                ) : <span className="text-xs text-slate-400">Basic</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <button onClick={() => handleCreateTask(camp)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full" title="Tạo công việc"><Briefcase size={16} /></button>
                                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Edit3 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-900">Thiết lập Chiến Dịch (Chuyên sâu)</h2>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-5">
                         <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">1. Thông tin cơ bản</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Shop</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.shopId} onChange={(e) => setFormData({...formData, shopId: e.target.value})}>
                                        <option value="">-- Chọn Shop --</option>
                                        {mockShops.map(s => <option key={s.id} value={s.id}>{s.name} ({s.platform})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nền tảng</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value as Platform})}>
                                        <option value="shopee">Shopee Ads</option>
                                        <option value="tiktok">TikTok Ads</option>
                                        <option value="facebook">Facebook Ads</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Chiến Dịch</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="VD: Khuyến mãi Hè 2024" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bắt đầu</label>
                                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kết thúc</label>
                                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.endDate} onChange={(e) => handleDateChange('endDate', e.target.value)} />
                                </div>
                            </div>
                         </div>

                         {/* Budget */}
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                                <span className="p-1 bg-green-100 text-green-700 rounded text-xs">$</span> Ngân sách
                            </h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Ngày (VNĐ)</label>
                                        <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right font-medium text-sm" value={formData.dailyBudget} onChange={(e) => handleBudgetChange('daily', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tổng (VNĐ)</label>
                                        <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-right font-medium text-sm bg-white" value={formData.totalBudget} onChange={(e) => handleBudgetChange('total', Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Right Column: Advanced Targeting */}
                    <div className="space-y-5">
                         <div className="border border-indigo-100 rounded-xl overflow-hidden">
                             <div 
                                className="bg-indigo-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                                onClick={() => setShowAdvancedTargeting(!showAdvancedTargeting)}
                             >
                                 <h3 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
                                     <Target size={16}/> 2. Target Chuyên Sâu (Đối tượng)
                                 </h3>
                                 <button className="text-indigo-600 text-xs font-medium">{showAdvancedTargeting ? 'Thu gọn' : 'Mở rộng'}</button>
                             </div>
                             
                             {showAdvancedTargeting && (
                                 <div className="p-4 space-y-4 bg-white">
                                     {/* Demographics */}
                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                             <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><User size={12}/> Giới tính</label>
                                             <select 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                value={formData.targeting?.gender}
                                                onChange={e => setFormData({...formData, targeting: {...formData.targeting!, gender: e.target.value as any}})}
                                             >
                                                 <option value="all">Tất cả</option>
                                                 <option value="male">Nam</option>
                                                 <option value="female">Nữ</option>
                                             </select>
                                         </div>
                                         <div>
                                             <label className="block text-xs font-semibold text-slate-600 mb-1">Độ tuổi</label>
                                             <div className="flex items-center gap-2">
                                                 <input 
                                                    type="number" className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-sm text-center" 
                                                    value={formData.targeting?.ageRange.min}
                                                    onChange={e => setFormData({...formData, targeting: {...formData.targeting!, ageRange: {...formData.targeting!.ageRange, min: Number(e.target.value)}}})}
                                                 />
                                                 <span className="text-slate-400">-</span>
                                                 <input 
                                                    type="number" className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-sm text-center" 
                                                    value={formData.targeting?.ageRange.max}
                                                    onChange={e => setFormData({...formData, targeting: {...formData.targeting!, ageRange: {...formData.targeting!.ageRange, max: Number(e.target.value)}}})}
                                                 />
                                             </div>
                                         </div>
                                     </div>

                                     {/* Location */}
                                     <div>
                                         <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><MapPin size={12}/> Vị trí địa lý</label>
                                         <input 
                                            type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                                            placeholder="Nhập thành phố (VD: Hà Nội, TP.HCM...)" 
                                         />
                                     </div>

                                     {/* Interests */}
                                     <div>
                                         <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Heart size={12}/> Sở thích & Hành vi</label>
                                         <textarea 
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-16 resize-none" 
                                            placeholder="Nhập sở thích (VD: Thời trang, Làm đẹp, Công nghệ...)"
                                         ></textarea>
                                     </div>

                                     {/* Placements */}
                                     <div>
                                         <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><Monitor size={12}/> Vị trí hiển thị</label>
                                         <div className="flex gap-3 text-sm text-slate-700">
                                             <label className="flex items-center gap-1"><input type="checkbox" checked readOnly className="text-indigo-600 rounded"/> News Feed</label>
                                             <label className="flex items-center gap-1"><input type="checkbox" className="text-indigo-600 rounded"/> Stories</label>
                                             <label className="flex items-center gap-1"><input type="checkbox" className="text-indigo-600 rounded"/> Reels</label>
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </div>

                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                             <textarea 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20"
                                placeholder="Ghi chú nội bộ..."
                                value={formData.note}
                                onChange={(e) => setFormData({...formData, note: e.target.value})}
                             ></textarea>
                         </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Hủy bỏ</button>
                    <button onClick={handleSaveCampaign} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/30">
                        <Save size={18} /> Lưu Chiến Dịch
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdsManager;

function Target(props: {size: number}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    )
}