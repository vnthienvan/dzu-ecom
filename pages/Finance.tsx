import React, { useState, useEffect } from 'react';
import { Contract, Transaction, Client, ContractTemplate, Agency } from '../types';
import { DollarSign, FileText, Calendar, AlertCircle, Search, Filter, Plus, TrendingUp, TrendingDown, CheckCircle, Clock, MoreVertical, Download, Printer, X, PenTool, UserCheck, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

// --- MOCK DATA ---
const mockContracts: Contract[] = [
    { id: 'c1', title: 'Hợp đồng Chạy Ads TikTok - Dzu Beauty', clientId: 'cl2', clientName: 'Dzu Beauty', type: 'ads_service', value: 15000000, startDate: '2024-01-01', endDate: '2024-03-31', status: 'active', paymentCycle: 'monthly', paidAmount: 10000000, debtAmount: 5000000 },
    { id: 'c2', title: 'Gói Quản lý Shop trọn gói - Dzu Fashion', clientId: 'cl1', clientName: 'Dzu Fashion HN', type: 'full_package', value: 30000000, startDate: '2024-02-01', endDate: '2024-02-28', status: 'pending', paymentCycle: 'monthly', paidAmount: 0, debtAmount: 30000000 },
    { id: 'c3', title: 'Thiết kế Bộ nhận diện - TopOne', clientId: 'cl3', clientName: 'TopOne Media', type: 'shop_care', value: 5000000, startDate: '2023-12-01', endDate: '2023-12-15', status: 'expired', paymentCycle: 'one_time', paidAmount: 5000000, debtAmount: 0 },
];

const mockTransactions: Transaction[] = [
    { id: 't1', date: '2024-02-05', contractId: 'c1', description: 'Thanh toán đợt 1 - Dzu Beauty', amount: 5000000, type: 'income', status: 'completed' },
    { id: 't2', date: '2024-02-04', contractId: 'c1', description: 'Nạp tiền Ads TikTok', amount: 3000000, type: 'expense', status: 'completed' },
    { id: 't3', date: '2024-02-01', contractId: 'c1', description: 'Thanh toán đợt 2 - Dzu Beauty', amount: 5000000, type: 'income', status: 'completed' },
];

// Mock CRM Data
const mockClients: Client[] = [
    { id: 'cl1', companyName: 'CÔNG TY TNHH DZU FASHION', taxCode: '0101234567', address: 'Số 10, Ngõ 5, Nguyễn Trãi, Thanh Xuân, Hà Nội', representative: 'Nguyễn Văn Dũng', position: 'Giám đốc', email: 'contact@dzufashion.com', phone: '0988777666' },
    { id: 'cl2', companyName: 'HỘ KINH DOANH DZU BEAUTY', taxCode: '8374928374', address: 'Tầng 2, Landmark 81, TP.HCM', representative: 'Trần Thị Hoa', position: 'Chủ hộ kinh doanh', email: 'hoa@dzubeauty.vn', phone: '0912345678' },
    { id: 'cl3', companyName: 'CÔNG TY CP TOPONE MEDIA', taxCode: '0312345678', address: 'Đà Nẵng, Việt Nam', representative: 'Lê Văn Cường', position: 'CEO', email: 'admin@topone.media', phone: '0909090909' },
];

// Current Agency Info (Mocked from Settings)
const currentAgency: Agency = {
    id: 'ag1',
    name: 'CÔNG TY TNHH DZU GLOBAL AGENCY',
    taxCode: '0109998888',
    address: 'Tầng 18, Tòa nhà Tech, Cầu Giấy, Hà Nội',
    representative: 'Phạm Văn Admin',
    position: 'Tổng Giám đốc',
    tier: 'enterprise',
    status: 'active'
};

// CONTRACT TEMPLATES
const CONTRACT_TEMPLATES: ContractTemplate[] = [
    {
        id: 'tpl_ads',
        name: 'Hợp đồng Dịch vụ Quảng cáo (Ads Service)',
        content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.5;">
    <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        <p style="text-transform: uppercase; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p style="margin: 0;">Độc lập - Tự do - Hạnh phúc</p>
        <p style="margin: 5px 0;">---o0o---</p>
        <h2 style="margin-top: 20px;">HỢP ĐỒNG DỊCH VỤ QUẢNG CÁO</h2>
        <p>Số: {CONTRACT_NUMBER}/HĐQC/DZU</p>
    </div>

    <p>Hôm nay, ngày {DAY} tháng {MONTH} năm {YEAR}, tại văn phòng {AGENCY_NAME}, chúng tôi gồm:</p>

    <div style="margin-bottom: 15px;">
        <strong>BÊN A (BÊN SỬ DỤNG DỊCH VỤ): {CLIENT_COMPANY}</strong><br/>
        - Mã số thuế: {CLIENT_TAX}<br/>
        - Địa chỉ: {CLIENT_ADDRESS}<br/>
        - Đại diện bởi: Ông/Bà {CLIENT_REP}<br/>
        - Chức vụ: {CLIENT_POS}
    </div>

    <div style="margin-bottom: 15px;">
        <strong>BÊN B (BÊN CUNG CẤP DỊCH VỤ): {AGENCY_NAME}</strong><br/>
        - Mã số thuế: {AGENCY_TAX}<br/>
        - Địa chỉ: {AGENCY_ADDRESS}<br/>
        - Đại diện bởi: Ông/Bà {AGENCY_REP}<br/>
        - Chức vụ: {AGENCY_POS}
    </div>

    <p>Hai bên thống nhất ký kết hợp đồng với các điều khoản sau:</p>

    <h4>ĐIỀU 1: NỘI DUNG DỊCH VỤ</h4>
    <p>Bên B đồng ý cung cấp dịch vụ quảng cáo trực tuyến cho Bên A trên nền tảng: <strong>{PLATFORM}</strong>.</p>
    <p>Phạm vi công việc bao gồm: Lên kế hoạch, thiết lập tài khoản, tối ưu chiến dịch và báo cáo định kỳ.</p>

    <h4>ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG & THANH TOÁN</h4>
    <p>1. Tổng ngân sách dự kiến: <strong>{CONTRACT_VALUE} VNĐ</strong> (Bằng chữ: {CONTRACT_VALUE_TEXT})</p>
    <p>2. Phí dịch vụ (Agency Fee): {SERVICE_FEE}% trên tổng ngân sách chi tiêu.</p>
    <p>3. Phương thức thanh toán: Chuyển khoản ngân hàng.</p>

    <h4>ĐIỀU 3: TRÁCH NHIỆM CỦA CÁC BÊN</h4>
    <p>- Bên A có trách nhiệm cung cấp hình ảnh, thông tin sản phẩm và thanh toán đúng hạn.</p>
    <p>- Bên B cam kết thực hiện đúng KPI: {KPI_COMMITMENT}.</p>

    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center;">
            <strong>ĐẠI DIỆN BÊN A</strong><br/>
            (Ký, ghi rõ họ tên)<br/><br/><br/><br/>
            {CLIENT_REP}
        </div>
        <div style="text-align: center;">
            <strong>ĐẠI DIỆN BÊN B</strong><br/>
            (Ký, đóng dấu)<br/><br/><br/><br/>
            {AGENCY_REP}
        </div>
    </div>
</div>
        `
    },
    {
        id: 'tpl_shop',
        name: 'Hợp đồng Vận hành Shop (Shop Operation)',
        content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.5;">
    <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        <p style="text-transform: uppercase; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p style="margin: 0;">Độc lập - Tự do - Hạnh phúc</p>
        <h2 style="margin-top: 20px;">HỢP ĐỒNG QUẢN LÝ VẬN HÀNH SHOP</h2>
    </div>

    <p>Căn cứ vào nhu cầu và khả năng của hai bên, hôm nay ngày {DAY} tháng {MONTH} năm {YEAR}:</p>

    <div style="margin-bottom: 15px;">
        <strong>BÊN A (SHOP): {CLIENT_COMPANY}</strong><br/>
        - Đại diện: {CLIENT_REP} - Chức vụ: {CLIENT_POS}
    </div>

    <div style="margin-bottom: 15px;">
        <strong>BÊN B (ĐƠN VỊ VẬN HÀNH): {AGENCY_NAME}</strong><br/>
        - Đại diện: {AGENCY_REP} - Chức vụ: {AGENCY_POS}
    </div>

    <p>Bên B chịu trách nhiệm quản lý, đăng sản phẩm, chăm sóc khách hàng và xử lý đơn hàng cho Bên A trên sàn TMĐT.</p>
    <p>Phí quản lý cố định: <strong>{CONTRACT_VALUE} VNĐ/tháng</strong>.</p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center;"><strong>BÊN A</strong></div>
        <div style="text-align: center;"><strong>BÊN B</strong></div>
    </div>
</div>
        `
    }
];

const Finance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'transactions'>('overview');
    const [contracts, setContracts] = useState<Contract[]>(mockContracts);
    
    // --- CREATE CONTRACT MODAL STATE ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1: Selection
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CONTRACT_TEMPLATES[0].id);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    // Step 2: Auto-filled Data (Editable)
    const [contractData, setContractData] = useState({
        contractNumber: '001',
        clientCompany: '',
        clientTax: '',
        clientAddress: '',
        clientRep: '',
        clientPos: '',
        platform: 'Shopee & TikTok',
        value: 0,
        valueText: '',
        serviceFee: 15,
        kpi: 'ROAS > 5',
        agencyRep: currentAgency.representative || '',
        agencyPos: currentAgency.position || ''
    });

    const chartData = [
        { name: 'T1', income: 15000000, expense: 5000000 },
        { name: 'T2', income: 20000000, expense: 8000000 },
        { name: 'T3', income: 18000000, expense: 6000000 },
        { name: 'T4', income: 22000000, expense: 9000000 },
        { name: 'T5', income: 25000000, expense: 10000000 },
        { name: 'T6', income: 30000000, expense: 12000000 },
    ];

    // --- LOGIC ---
    
    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
        const client = mockClients.find(c => c.id === clientId);
        if (client) {
            setContractData(prev => ({
                ...prev,
                clientCompany: client.companyName,
                clientTax: client.taxCode,
                clientAddress: client.address,
                clientRep: client.representative,
                clientPos: client.position
            }));
        }
    };

    const handleNextStep = () => {
        if (!selectedClientId) return alert("Vui lòng chọn khách hàng!");
        setStep(2);
    };

    const generatePreviewHTML = () => {
        const template = CONTRACT_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (!template) return '';

        const today = new Date();
        let html = template.content;

        // Replacements
        const replacements: Record<string, string> = {
            '{CONTRACT_NUMBER}': contractData.contractNumber,
            '{DAY}': today.getDate().toString(),
            '{MONTH}': (today.getMonth() + 1).toString(),
            '{YEAR}': today.getFullYear().toString(),
            '{CLIENT_COMPANY}': contractData.clientCompany,
            '{CLIENT_TAX}': contractData.clientTax,
            '{CLIENT_ADDRESS}': contractData.clientAddress,
            '{CLIENT_REP}': contractData.clientRep,
            '{CLIENT_POS}': contractData.clientPos,
            '{AGENCY_NAME}': currentAgency.name,
            '{AGENCY_TAX}': currentAgency.taxCode || '',
            '{AGENCY_ADDRESS}': currentAgency.address || '',
            '{AGENCY_REP}': contractData.agencyRep,
            '{AGENCY_POS}': contractData.agencyPos,
            '{PLATFORM}': contractData.platform,
            '{CONTRACT_VALUE}': new Intl.NumberFormat('vi-VN').format(contractData.value),
            '{CONTRACT_VALUE_TEXT}': contractData.valueText || '...',
            '{SERVICE_FEE}': contractData.serviceFee.toString(),
            '{KPI_COMMITMENT}': contractData.kpi
        };

        Object.keys(replacements).forEach(key => {
            html = html.split(key).join(replacements[key]);
        });

        return html;
    };

    const handlePrint = () => {
        const content = generatePreviewHTML();
        const printWindow = window.open('', '', 'width=800,height=900');
        if (printWindow) {
            printWindow.document.write('<html><head><title>In Hợp đồng</title></head><body style="padding: 40px;">');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleSaveContract = () => {
        const client = mockClients.find(c => c.id === selectedClientId);
        const newContract: Contract = {
            id: `c_${Date.now()}`,
            title: `Hợp đồng ${contractData.contractNumber} - ${client?.companyName}`,
            clientId: selectedClientId,
            clientName: client?.companyName || 'Unknown',
            type: selectedTemplateId === 'tpl_ads' ? 'ads_service' : 'shop_care',
            value: contractData.value,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            status: 'pending',
            paymentCycle: 'monthly',
            paidAmount: 0,
            debtAmount: contractData.value
        };
        setContracts([newContract, ...contracts]);
        setShowCreateModal(false);
        setStep(1);
    };

    // Stats Calculation
    const totalRevenue = contracts.reduce((acc, c) => acc + c.paidAmount, 0);
    const totalDebt = contracts.reduce((acc, c) => acc + c.debtAmount, 0);
    const activeContractsCount = contracts.filter(c => c.status === 'active').length;
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài chính & Hợp đồng</h1>
                    <p className="text-slate-500">Tạo hợp đồng tự động, theo dõi doanh thu và công nợ</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        <Download size={18} /> Xuất Báo cáo
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus size={18} /> Tạo Hợp đồng Mới
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                {['overview', 'contracts', 'transactions'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'overview' ? 'Tổng quan' : tab === 'contracts' ? 'Hợp đồng' : 'Giao dịch'}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 rounded-full text-green-600"><DollarSign size={24}/></div>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+15%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Thực thu (Paid)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600"><AlertCircle size={24}/></div>
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">Cần thu</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Công nợ (Debt)</p>
                            <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><FileText size={24}/></div>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Active</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Hợp đồng đang chạy</p>
                            <h3 className="text-2xl font-bold text-slate-900">{activeContractsCount}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Biểu đồ Tài chính</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                                    <Bar dataKey="income" name="Thu (Income)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Chi (Ads/Cost)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTRACTS TAB */}
            {activeTab === 'contracts' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input type="text" placeholder="Tìm hợp đồng..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"><Filter size={16}/> Bộ lọc</button>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Tên Hợp đồng</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Giá trị</th>
                                <th className="px-6 py-4">Đã thanh toán</th>
                                <th className="px-6 py-4">Công nợ</th>
                                <th className="px-6 py-4">Thời hạn</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right">#</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contracts.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{c.title}</div>
                                        <div className="text-xs text-slate-500 capitalize">{c.type.replace('_', ' ')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{c.clientName}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(c.value)}</td>
                                    <td className="px-6 py-4 text-green-600">{formatCurrency(c.paidAmount)}</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">{formatCurrency(c.debtAmount)}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {c.startDate} <br/> {c.endDate}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                            ${c.status === 'active' ? 'bg-green-100 text-green-700' : 
                                              c.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                                              'bg-slate-100 text-slate-600'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600"><MoreVertical size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Mã GD</th>
                                <th className="px-6 py-4">Ngày</th>
                                <th className="px-6 py-4">Nội dung</th>
                                <th className="px-6 py-4 text-right">Số tiền</th>
                                <th className="px-6 py-4 text-center">Loại</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{t.id}</td>
                                    <td className="px-6 py-4 text-slate-700">{t.date}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">{t.description}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold uppercase">
                                            <CheckCircle size={14}/> Completed
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE CONTRACT WIZARD MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <PenTool size={20} className="text-indigo-600"/>
                                Tạo Hợp đồng & Văn bản
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden flex">
                            {/* Left Panel: Form */}
                            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                                <div className="p-6 space-y-6">
                                    {/* Stepper */}
                                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>1</span>
                                        <span className={step === 1 ? 'text-indigo-900' : 'text-slate-500'}>Thông tin</span>
                                        <div className="w-8 h-[1px] bg-slate-300"></div>
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                                        <span className={step === 2 ? 'text-indigo-900' : 'text-slate-500'}>Review & In</span>
                                    </div>

                                    {step === 1 && (
                                        <div className="space-y-5 animate-in slide-in-from-left-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. Chọn mẫu Hợp đồng</label>
                                                <select 
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    value={selectedTemplateId}
                                                    onChange={e => setSelectedTemplateId(e.target.value)}
                                                >
                                                    {CONTRACT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">2. Chọn Khách hàng (Bên A)</label>
                                                <select 
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    value={selectedClientId}
                                                    onChange={e => handleClientSelect(e.target.value)}
                                                >
                                                    <option value="">-- Chọn khách hàng từ CRM --</option>
                                                    {mockClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                                </select>
                                                {selectedClientId && (
                                                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                                                        <p><strong>MST:</strong> {contractData.clientTax}</p>
                                                        <p><strong>Đại diện:</strong> {contractData.clientRep} ({contractData.clientPos})</p>
                                                        <p className="text-green-600 font-medium flex items-center gap-1"><UserCheck size={10}/> Đã tự động điền thông tin</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">3. Thông tin Hợp đồng</label>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-slate-600">Số HĐ</span>
                                                        <input type="text" className="w-full border rounded px-2 py-1.5 text-sm" value={contractData.contractNumber} onChange={e => setContractData({...contractData, contractNumber: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-600">Tổng giá trị (VNĐ)</span>
                                                        <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={contractData.value} onChange={e => setContractData({...contractData, value: Number(e.target.value)})} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-600">Bằng chữ</span>
                                                        <input type="text" className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Ví dụ: Mười lăm triệu đồng chẵn" value={contractData.valueText} onChange={e => setContractData({...contractData, valueText: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button onClick={handleNextStep} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Tiếp tục: Xem trước</button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5 animate-in slide-in-from-right-4">
                                            <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
                                                Bạn có thể chỉnh sửa thông tin bên dưới nếu thấy sai sót trong bản xem trước.
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chỉnh sửa Bên A (Khách)</label>
                                                <input type="text" className="w-full border rounded mb-2 px-2 py-1.5 text-sm" value={contractData.clientRep} onChange={e => setContractData({...contractData, clientRep: e.target.value})} placeholder="Người đại diện" />
                                                <input type="text" className="w-full border rounded px-2 py-1.5 text-sm" value={contractData.clientPos} onChange={e => setContractData({...contractData, clientPos: e.target.value})} placeholder="Chức vụ" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chỉnh sửa Bên B (Agency)</label>
                                                <input type="text" className="w-full border rounded mb-2 px-2 py-1.5 text-sm" value={contractData.agencyRep} onChange={e => setContractData({...contractData, agencyRep: e.target.value})} placeholder="Người đại diện" />
                                                <input type="text" className="w-full border rounded px-2 py-1.5 text-sm" value={contractData.agencyPos} onChange={e => setContractData({...contractData, agencyPos: e.target.value})} placeholder="Chức vụ" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Điều khoản KPI / Ghi chú</label>
                                                <textarea className="w-full border rounded px-2 py-1.5 text-sm h-20" value={contractData.kpi} onChange={e => setContractData({...contractData, kpi: e.target.value})}></textarea>
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-medium hover:bg-slate-200">Quay lại</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Preview */}
                            <div className="w-2/3 bg-slate-100 p-8 overflow-y-auto flex justify-center">
                                <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-sm text-slate-900 leading-relaxed origin-top scale-100">
                                    {step === 1 && !selectedClientId ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <FileText size={48} className="mb-4 opacity-20"/>
                                            <p>Vui lòng chọn khách hàng để tạo bản nháp</p>
                                        </div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy bỏ</button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                                <Printer size={18} /> In / Xuất PDF
                            </button>
                            <button onClick={handleSaveContract} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                                <CheckCircle size={18} /> Lưu Hợp đồng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;