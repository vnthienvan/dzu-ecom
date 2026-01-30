import React, { useState } from 'react';
import { Shield, Smartphone, Globe, Lock, Bell, Eye, EyeOff, Save, Key, AlertTriangle, LogOut, CheckCircle, Mail, CalendarClock, Server, Users, Facebook, Youtube, Video, Building2, Image, User, FileText, Plug, RefreshCw, ExternalLink, Link2, X } from 'lucide-react';
import { EmailConfig, ReportSchedule, Agency, SocialAccount, SystemLog, Integration, Platform } from '../types';

const mockLogs: SystemLog[] = [
    { id: 'l1', timestamp: '2024-02-05 10:30:00', user: 'admin', action: 'LOGIN', target: 'System', detail: 'Đăng nhập thành công', ip: '113.190.23.1' },
    { id: 'l2', timestamp: '2024-02-05 10:35:12', user: 'admin', action: 'UPDATE', target: 'Campaign #123', detail: 'Thay đổi ngân sách từ 5M -> 10M', ip: '113.190.23.1' },
    { id: 'l3', timestamp: '2024-02-05 11:00:00', user: 'manager_01', action: 'DELETE', target: 'Task #t3', detail: 'Xóa công việc cũ', ip: '14.162.11.55' },
];

const mockIntegrations: Integration[] = [
    { 
        id: 'int_shopee', platform: 'shopee', name: 'Shopee Open Platform', 
        description: 'Đồng bộ sản phẩm, đơn hàng và Shopee Ads.', 
        docUrl: 'https://banhang.shopee.vn/edu/article/8497', 
        status: 'connected', connectedAt: '2024-01-15', clientId: 'shopee_app_id_123' 
    },
    { 
        id: 'int_tiktok', platform: 'tiktok', name: 'TikTok Shop Partner', 
        description: 'Quản lý TikTok Shop, Video và Ads.', 
        docUrl: 'https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405', 
        status: 'disconnected' 
    },
    { 
        id: 'int_facebook', platform: 'facebook', name: 'Meta for Developers', 
        description: 'Kết nối Facebook Ads & Pages API.', 
        docUrl: 'https://developers.facebook.com/docs/marketing-api', 
        status: 'connected', connectedAt: '2024-01-20', clientId: 'fb_app_id_456' 
    },
    { 
        id: 'int_google', platform: 'google', name: 'Google Ads API', 
        description: 'Tự động hóa Google Ads & Analytics.', 
        docUrl: 'https://developers.google.com/google-ads/api', 
        status: 'disconnected' 
    },
];

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'agency' | 'security' | 'social' | 'integrations' | 'email' | 'logs'>('integrations');
    const [twoFactor, setTwoFactor] = useState(false);
    const [ipWhitelist, setIpWhitelist] = useState('192.168.1.1, 14.162.*.*');
    
    // Integration State
    const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [integrationForm, setIntegrationForm] = useState({ appId: '', appSecret: '' });
    const [isConnecting, setIsConnecting] = useState(false);

    // User Profile State
    const [userProfile, setUserProfile] = useState({
        username: 'admin',
        fullName: 'Nguyen Van A',
        email: 'admin@dzule.com',
        phone: '0987654321',
        avatar: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Agency Profile State
    const [agencyProfile, setAgencyProfile] = useState<Partial<Agency>>({
        name: 'Dzu Global Agency',
        tier: 'enterprise',
        logo: 'https://via.placeholder.com/150'
    });

    // Mock Connected Social Accounts
    const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
        { provider: 'google', email: 'admin@dzule.com', connectedAt: '2024-01-10' }
    ]);

    // Email Config State
    const [emailConfig, setEmailConfig] = useState<EmailConfig>({
        smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: 'admin@dzule.com', smtpPass: '', senderName: 'Dzu Ads System', secure: true
    });
    const [showSmtpPass, setShowSmtpPass] = useState(false);

    // --- Integration Handlers ---
    const openConnectModal = (integration: Integration) => {
        setSelectedIntegration(integration);
        // Pre-fill if connected (mock)
        if (integration.status === 'connected') {
            setIntegrationForm({ appId: integration.clientId || '********', appSecret: '********' });
        } else {
            setIntegrationForm({ appId: '', appSecret: '' });
        }
        setShowIntegrationModal(true);
    };

    const handleConnectIntegration = () => {
        if (!integrationForm.appId || !integrationForm.appSecret) {
            return alert('Vui lòng nhập App ID và Secret!');
        }
        setIsConnecting(true);
        // Simulate API Handshake & Token Exchange
        setTimeout(() => {
            setIsConnecting(false);
            setIntegrations(prev => prev.map(i => 
                i.id === selectedIntegration?.id 
                ? { 
                    ...i, 
                    status: 'connected', 
                    connectedAt: new Date().toISOString().split('T')[0],
                    clientId: integrationForm.appId 
                  } 
                : i
            ));
            setShowIntegrationModal(false);
            alert(`Kết nối ${selectedIntegration?.name} thành công! Token đã được lưu.`);
        }, 2000);
    };

    const handleDisconnectIntegration = (id: string) => {
        if(confirm("Bạn có chắc muốn ngắt kết nối? Hệ thống sẽ ngừng đồng bộ dữ liệu và xóa Token truy cập.")) {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'disconnected', connectedAt: undefined, clientId: undefined } : i));
        }
    };

    const handleConnectSocial = (provider: 'google' | 'facebook' | 'tiktok') => {
        // Mock Logic: In reality, this redirects to OAuth
        const mockEmail = 'admin@dzule.com'; // Simulate same email as system
        const alreadyConnected = socialAccounts.find(s => s.provider === provider);
        
        if (alreadyConnected) {
            if(confirm(`Ngắt kết nối tài khoản ${provider}?`)) {
                setSocialAccounts(prev => prev.filter(s => s.provider !== provider));
            }
        } else {
            // Simulate check: Does social email match system email?
            const confirmConnect = confirm(`Hệ thống sẽ chuyển hướng đến ${provider} để xác thực. \n(Giả lập: Email khớp, kết nối thành công)`);
            if (confirmConnect) {
                setSocialAccounts(prev => [...prev, { provider, email: mockEmail, connectedAt: new Date().toISOString().split('T')[0] }]);
            }
        }
    };

    const handleSaveAgency = () => {
        alert("Thông tin Agency đã được cập nhật!");
    };

    const handleSaveProfile = () => {
        if (userProfile.newPassword && userProfile.newPassword !== userProfile.confirmPassword) {
            return alert("Mật khẩu mới không khớp!");
        }
        alert("Thông tin cá nhân đã được cập nhật thành công!");
    };

    const handleSaveEmailConfig = () => {
        if(!emailConfig.smtpPass) return alert("Vui lòng nhập mật khẩu ứng dụng SMTP!");
        alert("Đã lưu cấu hình Email và gửi mail test thành công!");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Cấu hình & Bảo mật</h1>
                <p className="text-slate-500">Quản lý hồ sơ Agency, kết nối API nền tảng và an toàn hệ thống</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Vertical Tabs Sidebar */}
                <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 p-2">
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User size={18}/> },
                            { id: 'agency', label: 'Hồ sơ Agency', icon: <Building2 size={18}/> },
                            { id: 'integrations', label: 'Kết nối API', icon: <Plug size={18}/> },
                            { id: 'social', label: 'Liên kết Social', icon: <Globe size={18}/> },
                            { id: 'security', label: 'Bảo mật & Login', icon: <Shield size={18}/> },
                            { id: 'email', label: 'Email Server', icon: <Mail size={18}/> },
                            { id: 'logs', label: 'Nhật ký hệ thống', icon: <CalendarClock size={18}/> },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                    ${activeTab === item.id 
                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {/* API INTEGRATIONS TAB (New) */}
                    {activeTab === 'integrations' && (
                        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Kết nối API Nền tảng (Platform API)</h2>
                                <p className="text-sm text-slate-500">Cấu hình App ID và Secret Key để đồng bộ dữ liệu tự động.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {integrations.map(int => (
                                    <div key={int.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl font-bold
                                                    ${int.platform === 'shopee' ? 'bg-orange-500' : 
                                                      int.platform === 'tiktok' ? 'bg-black' : 
                                                      int.platform === 'facebook' ? 'bg-blue-600' : 'bg-red-500'}`}>
                                                    {int.platform === 'shopee' ? 'S' : int.platform === 'tiktok' ? 'T' : int.platform === 'facebook' ? 'F' : 'G'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base">{int.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`w-2 h-2 rounded-full ${int.status === 'connected' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span className={`text-xs font-medium uppercase ${int.status === 'connected' ? 'text-green-600' : 'text-slate-500'}`}>
                                                            {int.status === 'connected' ? 'Đã kết nối' : 'Ngắt kết nối'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 flex-1">{int.description}</p>
                                        
                                        <div className="flex gap-2">
                                            {int.status === 'connected' ? (
                                                <>
                                                    <button 
                                                        className="flex-1 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100" 
                                                        onClick={() => openConnectModal(int)}
                                                    >
                                                        Cấu hình
                                                    </button>
                                                    <button className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDisconnectIntegration(int.id)} title="Ngắt kết nối">
                                                        <LogOut size={18}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => openConnectModal(int)}
                                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <Link2 size={16}/> Kết nối ngay
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-xs text-slate-400">
                                                {int.connectedAt ? `Đồng bộ: ${int.connectedAt}` : 'Chưa có dữ liệu'}
                                            </span>
                                            <a href={int.docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                                Tài liệu <ExternalLink size={10}/>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MY PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Hồ sơ cá nhân (My Profile)</h2>
                                <p className="text-sm text-slate-500">Quản lý thông tin hiển thị và bảo mật tài khoản của bạn.</p>
                            </div>

                            <div className="flex items-start gap-6 pb-6 border-b border-slate-100">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative group overflow-hidden shrink-0">
                                    <span className="text-2xl font-bold text-slate-400">{userProfile.username.charAt(0).toUpperCase()}</span>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="text-white text-xs font-medium">Đổi ảnh</span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên</label>
                                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={userProfile.fullName} onChange={e => setUserProfile({...userProfile, fullName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
                                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={userProfile.phone} onChange={e => setUserProfile({...userProfile, phone: e.target.value})} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email đăng nhập</label>
                                        <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" value={userProfile.email} disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Lock size={18}/> Đổi mật khẩu</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
                                    <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={userProfile.currentPassword} onChange={e => setUserProfile({...userProfile, currentPassword: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                                        <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={userProfile.newPassword} onChange={e => setUserProfile({...userProfile, newPassword: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                                        <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={userProfile.confirmPassword} onChange={e => setUserProfile({...userProfile, confirmPassword: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button onClick={handleSaveProfile} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <Save size={18} /> Lưu hồ sơ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AGENCY PROFILE TAB */}
                    {activeTab === 'agency' && (
                        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Hồ sơ Đối tác (Agency Profile)</h2>
                                <p className="text-sm text-slate-500">Thông tin hiển thị trên báo cáo và giao diện của thành viên.</p>
                            </div>
                            
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center relative group overflow-hidden">
                                    {agencyProfile.logo ? <img src={agencyProfile.logo} alt="Logo" className="w-full h-full object-cover" /> : <Image size={32} className="text-slate-400"/>}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="text-white text-xs font-medium">Upload</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị</label>
                                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={agencyProfile.name} onChange={e => setAgencyProfile({...agencyProfile, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gói dịch vụ</label>
                                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" disabled value={agencyProfile.tier}>
                                            <option value="basic">Basic Partner</option>
                                            <option value="pro">Pro Partner</option>
                                            <option value="enterprise">Enterprise (Global)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button onClick={handleSaveAgency} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20">Lưu thay đổi</button>
                            </div>
                        </div>
                    )}

                    {/* SOCIAL LOGIN TAB */}
                    {activeTab === 'social' && (
                        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Đăng nhập Mạng xã hội</h2>
                                <p className="text-sm text-slate-500">Liên kết tài khoản Google, Facebook, TikTok để đăng nhập nhanh.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Google */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                            <Globe className="text-red-500" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Google</h3>
                                            <p className="text-xs text-slate-500">Dùng để đăng nhập và đồng bộ Lịch</p>
                                        </div>
                                    </div>
                                    {socialAccounts.find(s => s.provider === 'google') ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Đã liên kết</span>
                                            <button onClick={() => handleConnectSocial('google')} className="text-sm text-slate-400 hover:text-red-600 underline">Ngắt kết nối</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleConnectSocial('google')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Kết nối</button>
                                    )}
                                </div>

                                {/* Facebook */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-sm text-white">
                                            <Facebook size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Facebook</h3>
                                            <p className="text-xs text-slate-500">Đăng nhập nhanh & Sync Ads Manager</p>
                                        </div>
                                    </div>
                                    {socialAccounts.find(s => s.provider === 'facebook') ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Đã liên kết</span>
                                            <button onClick={() => handleConnectSocial('facebook')} className="text-sm text-slate-400 hover:text-red-600 underline">Ngắt kết nối</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleConnectSocial('facebook')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Kết nối</button>
                                    )}
                                </div>

                                {/* TikTok */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-black transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm text-white">
                                            <Video size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">TikTok</h3>
                                            <p className="text-xs text-slate-500">Đồng bộ TikTok Shop & Ads</p>
                                        </div>
                                    </div>
                                    {socialAccounts.find(s => s.provider === 'tiktok') ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Đã liên kết</span>
                                            <button onClick={() => handleConnectSocial('tiktok')} className="text-sm text-slate-400 hover:text-red-600 underline">Ngắt kết nối</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleConnectSocial('tiktok')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Kết nối</button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                                <Shield className="text-blue-600 shrink-0 mt-0.5" size={18}/>
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Cơ chế bảo mật thông minh</p>
                                    <p>Hệ thống sẽ tự động so sánh Email của tài khoản mạng xã hội với Email đăng ký trong hệ thống. Nếu trùng khớp, tài khoản sẽ được liên kết tự động.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB (Refined) */}
                    {activeTab === 'security' && (
                        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* 2FA Section */}
                            <div className="flex justify-between items-center p-6 bg-white rounded-xl border border-slate-200">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Smartphone className="text-indigo-600"/> Xác thực 2 bước (2FA)
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Yêu cầu mã xác thực Google Authenticator khi đăng nhập.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} className="sr-only peer" />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {/* IP Whitelist Section */}
                            <div className="pt-2">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Globe className="text-slate-600"/> Giới hạn IP truy cập (Whitelist)
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-600">Chỉ cho phép đăng nhập từ các địa chỉ IP được liệt kê. Dùng dấu phẩy để ngăn cách.</p>
                                    <textarea 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm h-24 focus:ring-2 focus:ring-indigo-500"
                                        value={ipWhitelist}
                                        onChange={(e) => setIpWhitelist(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <button className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                                            <Save size={18} /> Lưu IP Config
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMAIL & AUTOMATION TAB (Updated with Password) */}
                    {activeTab === 'email' && (
                        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                             {/* SMTP Server Config */}
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                     <Server size={20} className="text-blue-600"/> Cấu hình SMTP Server
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                         <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={emailConfig.smtpHost} onChange={e => setEmailConfig({...emailConfig, smtpHost: e.target.value})} placeholder="smtp.gmail.com" />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                                         <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={emailConfig.smtpPort} onChange={e => setEmailConfig({...emailConfig, smtpPort: parseInt(e.target.value)})} placeholder="587" />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username (Email)</label>
                                         <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={emailConfig.smtpUser} onChange={e => setEmailConfig({...emailConfig, smtpUser: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium text-slate-700 mb-1">App Password (Mật khẩu ứng dụng)</label>
                                         <div className="relative">
                                             <input 
                                                type={showSmtpPass ? "text" : "password"} 
                                                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg" 
                                                value={emailConfig.smtpPass} 
                                                onChange={e => setEmailConfig({...emailConfig, smtpPass: e.target.value})} 
                                                placeholder="••••••••••••"
                                             />
                                             <button 
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                onClick={() => setShowSmtpPass(!showSmtpPass)}
                                             >
                                                 {showSmtpPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                             </button>
                                         </div>
                                         <p className="text-[10px] text-slate-500 mt-1">Lưu ý: Sử dụng "App Password" nếu dùng Gmail 2FA.</p>
                                     </div>
                                     <div className="md:col-span-2 flex justify-end">
                                        <button onClick={handleSaveEmailConfig} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Lưu cấu hình & Test Mail</button>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* SYSTEM LOGS TAB (New) */}
                    {activeTab === 'logs' && (
                        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Nhật ký Hệ thống (Audit Logs)</h2>
                                <p className="text-sm text-slate-500">Theo dõi toàn bộ hoạt động của nhân viên để đảm bảo an toàn dữ liệu.</p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600 font-medium">
                                            <tr>
                                                <th className="px-6 py-3">Thời gian</th>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Hành động</th>
                                                <th className="px-6 py-3">Đối tượng</th>
                                                <th className="px-6 py-3">Chi tiết</th>
                                                <th className="px-6 py-3 text-right">IP Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {mockLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.timestamp}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-800">{log.user}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase
                                                            ${log.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                                              log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                              'bg-blue-100 text-blue-700'}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-700">{log.target}</td>
                                                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={log.detail}>{log.detail}</td>
                                                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">{log.ip}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* INTEGRATION MODAL */}
            {showIntegrationModal && selectedIntegration && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Plug size={20} className="text-indigo-600"/>
                                {selectedIntegration.status === 'connected' ? 'Cấu hình' : 'Kết nối'} {selectedIntegration.name}
                            </h3>
                            <button onClick={() => setShowIntegrationModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        
                        <p className="text-sm text-slate-500 mb-6">
                            Vui lòng nhập thông tin API Credential từ tài khoản Developer của bạn.
                            <a href={selectedIntegration.docUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">Xem hướng dẫn.</a>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">App ID / Client ID</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                                    value={integrationForm.appId} 
                                    onChange={e => setIntegrationForm({...integrationForm, appId: e.target.value})} 
                                    placeholder="Ex: 123456789..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">App Secret / Client Secret</label>
                                <input 
                                    type="password" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                                    value={integrationForm.appSecret} 
                                    onChange={e => setIntegrationForm({...integrationForm, appSecret: e.target.value})} 
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowIntegrationModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm">Hủy</button>
                            <button 
                                onClick={handleConnectIntegration} 
                                disabled={isConnecting}
                                className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-70"
                            >
                                {isConnecting ? <RefreshCw size={16} className="animate-spin"/> : <Save size={16}/>}
                                {isConnecting ? 'Đang xác thực...' : 'Lưu & Kết nối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;