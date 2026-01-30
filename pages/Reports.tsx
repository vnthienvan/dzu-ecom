import React, { useState } from 'react';
import { Campaign, Platform } from '../types';
import { Download, FileSpreadsheet, Calendar, Filter, Sparkles, TrendingUp, Eye, MousePointer, Layers, X, Target, Zap, Check, AlertTriangle, ArrowRight, Activity, DollarSign, Bot } from 'lucide-react';
import { analyzeReportOverview } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const mockCampaigns: Campaign[] = [
    { 
      id: '1', shopId: 's1', shopName: 'Dzu Fashion HN', name: 'Sale Tết 2024 - Áo thun', platform: 'shopee', source: 'synced',
      status: 'running', createdAt: '2024-01-10', startDate: '2024-01-15', endDate: '2024-02-15',
      dailyBudget: 200000, monthlyBudget: 6000000, totalBudget: 6200000, spent: 1250000, 
      revenue: 8900000, roas: 7.12, clicks: 1450, impressions: 45000, products: ['1'], content: '',
      orders: 120, ctr: 3.22, cpc: 862, cpm: 27777, conversionRate: 8.27,
      reach: 38000, frequency: 1.18, engagementRate: 4.5, socialInteractions: 200,
      addToCart: 350, initiateCheckout: 200, cpa: 10416, profit: 4500000, roi: 360,
      shopeeMetrics: { directOrders: 90, assistedOrders: 30, searchImpressionShare: 45 },
      creativeMetrics: { hookRate: 25, holdRate: 10, scrollStopRate: 15, fatigueScore: 'Low', avgWatchTime: 8 },
      kpi: { targetROAS: 5, currentROAS: 7.12, achieved: true, percentAchieved: 142, recommendation: 'Scale' }
    },
    { 
      id: '2', shopId: 's2', shopName: 'Dzu Beauty', name: 'Video Viral TikTok', platform: 'tiktok', source: 'manual',
      status: 'paused', createdAt: '2024-01-12', startDate: '2024-01-20', endDate: '2024-01-25',
      dailyBudget: 500000, monthlyBudget: 15000000, totalBudget: 2500000, spent: 1800000, 
      revenue: 1900000, roas: 1.05, clicks: 800, impressions: 22000, products: [], content: '',
      orders: 15, ctr: 3.63, cpc: 2250, cpm: 81818, conversionRate: 1.87,
      reach: 20000, frequency: 1.1, engagementRate: 12.5, socialInteractions: 1500,
      addToCart: 80, initiateCheckout: 30, cpa: 120000, profit: -500000, roi: -5,
      creativeMetrics: { hookRate: 35.5, holdRate: 12.2, scrollStopRate: 40, fatigueScore: 'High', avgWatchTime: 4.5 },
      kpi: { targetROAS: 2, currentROAS: 1.05, achieved: false, percentAchieved: 52, recommendation: 'Kill' }
    },
    { 
      id: '3', shopId: 's3', shopName: 'Dzu Gadgets', name: 'FB Ads - Tai nghe', platform: 'facebook', source: 'synced',
      status: 'ended', createdAt: '2023-12-01', startDate: '2023-12-01', endDate: '2023-12-31',
      dailyBudget: 100000, monthlyBudget: 3000000, totalBudget: 3100000, spent: 3100000, 
      revenue: 9500000, roas: 3.06, clicks: 1200, impressions: 30000, products: [], content: '',
      orders: 45, ctr: 4.00, cpc: 2583, cpm: 103333, conversionRate: 3.75,
      reach: 25000, frequency: 1.2, engagementRate: 8.0, socialInteractions: 500,
      addToCart: 150, initiateCheckout: 80, cpa: 68888, profit: 3000000, roi: 200,
      facebookMetrics: { qualityRanking: 'Above Average', engagementRanking: 'Average', conversionRanking: 'Below Average' },
      creativeMetrics: { hookRate: 18, holdRate: 8, scrollStopRate: 20, fatigueScore: 'Medium', avgWatchTime: 10 },
      kpi: { targetROAS: 3, currentROAS: 3.06, achieved: true, percentAchieved: 102, recommendation: 'Optimize' }
    },
  ];

const Reports: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom'>('month');
    const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [platform, setPlatform] = useState<Platform | 'all'>('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncingSheet, setIsSyncingSheet] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [reportTab, setReportTab] = useState<'executive' | 'funnel' | 'advanced'>('executive');
    
    // AI Analysis State
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);

    const filteredCampaigns = mockCampaigns.filter(c => platform === 'all' || c.platform === platform);
    
    // Calculated Totals
    const totals = filteredCampaigns.reduce((acc, curr) => ({
        spent: acc.spent + curr.spent,
        revenue: acc.revenue + curr.revenue,
        clicks: acc.clicks + curr.clicks,
        impressions: acc.impressions + curr.impressions,
        orders: acc.orders + (curr.orders || 0)
    }), { spent: 0, revenue: 0, clicks: 0, impressions: 0, orders: 0 });

    const totalROAS = totals.spent > 0 ? (totals.revenue / totals.spent).toFixed(2) : 0;
    const totalCTR = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : 0;
    const totalCVR = totals.clicks > 0 ? ((totals.orders / totals.clicks) * 100).toFixed(2) : 0;
    const avgCPC = totals.clicks > 0 ? (totals.spent / totals.clicks).toFixed(0) : 0;

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const rangeText = timeRange === 'custom' ? `${customStartDate} đến ${customEndDate}` : timeRange;
        const result = await analyzeReportOverview(totals, platform, rangeText);
        setAiAnalysis(result);
        setIsAnalyzing(false);
    };

    const handleAutoOptimize = () => {
        setIsAutoOptimizing(true);
        setTimeout(() => {
            setIsAutoOptimizing(false);
            alert("Hệ thống đã tự động điều chỉnh giá thầu cho 3 nhóm quảng cáo hiệu quả thấp!");
        }, 2000);
    };

    const handleExportExcel = () => {
        setIsExporting(true);
        
        const dateText = timeRange === 'custom' 
            ? `Từ ${customStartDate} đến ${customEndDate}` 
            : timeRange === 'all' ? 'Toàn thời gian' : timeRange;

        // Build HTML Table String for Excel
        const tableContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8" />
                <style>
                    table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: middle; }
                    
                    /* Header Styles */
                    .header-main { background-color: #1e1b4b; color: white; font-weight: bold; text-align: center; }
                    .header-group-1 { background-color: #dbeafe; color: #1e3a8a; font-weight: bold; text-align: center; } /* Awareness - Blue */
                    .header-group-2 { background-color: #ffedd5; color: #7c2d12; font-weight: bold; text-align: center; } /* Engagement - Orange */
                    .header-group-3 { background-color: #dcfce7; color: #14532d; font-weight: bold; text-align: center; } /* Conversion - Green */
                    .header-group-4 { background-color: #f3e8ff; color: #581c87; font-weight: bold; text-align: center; } /* Finance - Purple */
                    
                    /* Cell Styles */
                    .money { mso-number-format:"\#\,\#\#0"; text-align: right; }
                    .percent { mso-number-format:"0.00%"; text-align: center; }
                    .number { text-align: center; }
                    .text-left { text-align: left; }
                    
                    /* Profit/Loss Colors */
                    .positive { color: #15803d; font-weight: bold; }
                    .negative { color: #b91c1c; font-weight: bold; }
                    
                    /* Platform Badges (Simulated with text color) */
                    .plat-shopee { color: #c2410c; font-weight: bold; }
                    .plat-tiktok { color: #000000; font-weight: bold; }
                    .plat-facebook { color: #1d4ed8; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>BÁO CÁO HIỆU QUẢ QUẢNG CÁO DZU ADS</h2>
                <p><b>Thời gian xuất:</b> ${new Date().toLocaleString('vi-VN')}</p>
                <p><b>Khoảng thời gian:</b> ${dateText} | <b>Platform:</b> ${platform.toUpperCase()}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2" class="header-main" style="width: 50px;">STT</th>
                            <th rowspan="2" class="header-main" style="width: 100px;">Nền tảng</th>
                            <th rowspan="2" class="header-main" style="width: 250px;">Tên Chiến Dịch</th>
                            <th rowspan="2" class="header-main" style="width: 100px;">Trạng thái</th>
                            
                            <!-- Group Headers -->
                            <th colspan="4" class="header-group-1">1. HIỂN THỊ & NHẬN DIỆN (Awareness)</th>
                            <th colspan="4" class="header-group-2">2. TƯƠNG TÁC (Engagement)</th>
                            <th colspan="5" class="header-group-3">3. CHUYỂN ĐỔI (Conversion)</th>
                            <th colspan="4" class="header-group-4">4. TÀI CHÍNH (Finance & ROI)</th>
                            <th colspan="3" class="header-main">5. ĐÁNH GIÁ (AI)</th>
                        </tr>
                        <tr>
                            <!-- Awareness -->
                            <th class="header-group-1">Impressions</th>
                            <th class="header-group-1">Reach</th>
                            <th class="header-group-1">CPM (VNĐ)</th>
                            <th class="header-group-1">Frequency</th>
                            
                            <!-- Engagement -->
                            <th class="header-group-2">Clicks</th>
                            <th class="header-group-2">CTR (%)</th>
                            <th class="header-group-2">CPC (VNĐ)</th>
                            <th class="header-group-2">Social (Like/Share)</th>
                            
                            <!-- Conversion -->
                            <th class="header-group-3">View Content</th>
                            <th class="header-group-3">Add to Cart</th>
                            <th class="header-group-3">Checkout</th>
                            <th class="header-group-3">Orders</th>
                            <th class="header-group-3">CVR (%)</th>
                            
                            <!-- Finance -->
                            <th class="header-group-4">Chi phí (Spent)</th>
                            <th class="header-group-4">Doanh thu (Rev)</th>
                            <th class="header-group-4">Lợi nhuận (Est)</th>
                            <th class="header-group-4">ROAS</th>

                            <!-- AI -->
                            <th class="header-main">KPI</th>
                            <th class="header-main">Đề xuất</th>
                            <th class="header-main">Fatigue Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredCampaigns.map((c, i) => `
                            <tr>
                                <td class="number">${i + 1}</td>
                                <td class="plat-${c.platform}">${c.platform.toUpperCase()}</td>
                                <td class="text-left">${c.name}</td>
                                <td class="number">${c.status}</td>
                                
                                <!-- Awareness -->
                                <td class="number">${c.impressions}</td>
                                <td class="number">${c.reach || 0}</td>
                                <td class="money">${c.cpm?.toFixed(0) || 0}</td>
                                <td class="number">${c.frequency || 1}</td>
                                
                                <!-- Engagement -->
                                <td class="number">${c.clicks}</td>
                                <td class="percent">${(c.ctr || 0) / 100}</td>
                                <td class="money">${c.cpc?.toFixed(0) || 0}</td>
                                <td class="number">${c.socialInteractions || 0}</td>
                                
                                <!-- Conversion -->
                                <td class="number">${c.viewContent || c.clicks}</td>
                                <td class="number">${c.addToCart || 0}</td>
                                <td class="number">${c.initiateCheckout || 0}</td>
                                <td class="number">${c.orders}</td>
                                <td class="percent">${(c.conversionRate || 0) / 100}</td>
                                
                                <!-- Finance -->
                                <td class="money">${c.spent}</td>
                                <td class="money">${c.revenue}</td>
                                <td class="money ${(c.revenue - c.spent) > 0 ? 'positive' : 'negative'}">${c.revenue - c.spent}</td>
                                <td class="number" style="font-weight:bold;">${c.roas}</td>

                                <!-- AI -->
                                <td class="number">${c.kpi?.percentAchieved || 0}%</td>
                                <td class="text-left" style="font-weight:bold;">${c.kpi?.recommendation || '-'}</td>
                                <td class="number">${c.creativeMetrics?.fatigueScore || '-'}</td>
                            </tr>
                        `).join('')}
                        <tr style="background-color: #f1f5f9; font-weight: bold;">
                            <td colspan="4" style="text-align:right;">TỔNG CỘNG</td>
                            <td class="number">${totals.impressions}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="number">${totals.clicks}</td>
                            <td class="percent">${(totals.clicks/totals.impressions) || 0}</td>
                            <td class="money">${avgCPC}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="number">${totals.orders}</td>
                            <td class="percent">${(totals.orders/totals.clicks) || 0}</td>
                            <td class="money">${totals.spent}</td>
                            <td class="money">${totals.revenue}</td>
                            <td class="money">${totals.revenue - totals.spent}</td>
                            <td class="number">${totalROAS}</td>
                            <td colspan="3"></td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DzuAds_Report_${new Date().toISOString().slice(0,10)}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
    };

    const handleSyncGoogleSheets = () => {
        setIsSyncingSheet(true);
        setTimeout(() => {
            setIsSyncingSheet(false);
            alert("Đã đồng bộ dữ liệu thành công lên Google Sheet: 'Báo Cáo Dzu Ads 2024'");
        }, 2000);
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // --- Helper for Benchmarks ---
    const getBenchmarkColor = (metric: 'ctr' | 'cvr' | 'roas', value: number, platform: Platform) => {
        let good = false;
        let bad = false;
        
        if (metric === 'ctr') {
            const threshold = platform === 'tiktok' ? 2 : platform === 'facebook' ? 1.5 : 2.5; // Shopee needs higher CTR
            if (value >= threshold) good = true;
            else if (value < threshold * 0.5) bad = true;
        }
        if (metric === 'roas') {
            if (value >= 3) good = true;
            else if (value < 1.5) bad = true;
        }
        
        if (good) return 'text-green-600 bg-green-50';
        if (bad) return 'text-red-600 bg-red-50';
        return 'text-slate-600 bg-slate-50';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Báo cáo & Xuất dữ liệu</h1>
                    <p className="text-slate-500">Báo cáo hiệu quả Marketing theo chuẩn Agency (Funnel & Creative)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleSyncGoogleSheets}
                        disabled={isSyncingSheet}
                        className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors shadow-sm text-sm"
                    >
                        <FileSpreadsheet size={16} className={isSyncingSheet ? 'animate-pulse' : ''} />
                        {isSyncingSheet ? 'Đang đồng bộ...' : 'Sync Sheet'}
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                    >
                        <Download size={16} />
                        Xuất Excel (Màu)
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4 w-full md:w-auto">
                    <Filter size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Bộ lọc:</span>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center w-full">
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                    >
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                        <option value="year">Năm nay</option>
                        <option value="all">Toàn thời gian (All Time)</option>
                        <option value="custom">Tùy chỉnh ngày (Custom)</option>
                    </select>

                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in duration-300">
                            <input 
                                type="date" 
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <input 
                                type="date" 
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                    )}

                    <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                    >
                        <option value="all">Tất cả nền tảng</option>
                        <option value="shopee">Shopee Ads</option>
                        <option value="tiktok">TikTok Ads</option>
                        <option value="facebook">Facebook Ads</option>
                        <option value="google">Google Ads</option>
                    </select>
                </div>

                <button 
                    onClick={handleAutoOptimize} 
                    className="ml-auto flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium whitespace-nowrap"
                    disabled={isAutoOptimizing}
                >
                    <Bot size={16} className={isAutoOptimizing ? "animate-spin" : ""} />
                    {isAutoOptimizing ? "Đang tối ưu..." : "Tự động tối ưu (AI)"}
                </button>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800 flex justify-between items-center">
                    <span>Danh sách Chiến dịch (Nhấn để xem báo cáo chi tiết)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3 min-w-[200px]">Chiến dịch</th>
                                <th className="px-4 py-3">Platform</th>
                                <th className="px-4 py-3 text-right">Chi phí</th>
                                <th className="px-4 py-3 text-right">Doanh thu</th>
                                <th className="px-4 py-3 text-center">Đơn</th>
                                <th className="px-4 py-3 text-center bg-slate-50">ROAS (Lợi tức)</th>
                                <th className="px-4 py-3 text-center">CTR (Tỷ lệ nhấp)</th>
                                <th className="px-4 py-3 text-right">CPC (Giá click)</th>
                                <th className="px-4 py-3 text-center">Đề xuất (AI)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCampaigns.map(camp => (
                                <tr key={camp.id} onClick={() => { setSelectedCampaign(camp); setReportTab('executive'); }} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 line-clamp-1 group-hover:text-indigo-600" title={camp.name}>{camp.name}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1">{camp.shopName}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-bold
                                            ${camp.platform === 'shopee' ? 'bg-orange-100 text-orange-700' : 
                                            camp.platform === 'tiktok' ? 'bg-black text-white' : 
                                            camp.platform === 'facebook' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {camp.platform}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">{new Intl.NumberFormat('vi-VN').format(camp.spent)}</td>
                                    <td className="px-4 py-4 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(camp.revenue)}</td>
                                    <td className="px-4 py-4 text-center">{camp.orders || 0}</td>
                                    <td className={`px-4 py-4 text-center font-bold bg-slate-50/50 ${camp.roas >= 5 ? 'text-green-600' : camp.roas >= 2 ? 'text-slate-700' : 'text-red-500'}`}>{camp.roas}</td>
                                    <td className="px-4 py-4 text-center text-slate-600">{camp.ctr ? `${camp.ctr}%` : '-'}</td>
                                    <td className="px-4 py-4 text-right text-slate-600">{camp.cpc ? new Intl.NumberFormat('vi-VN').format(camp.cpc) : '-'}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
                                            ${camp.kpi?.recommendation === 'Scale' ? 'bg-green-100 text-green-700' : 
                                              camp.kpi?.recommendation === 'Kill' ? 'bg-red-100 text-red-700' : 
                                              'bg-blue-100 text-blue-700'}`}>
                                            {camp.kpi?.recommendation || 'Test'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DEEP DIVE REPORT MODAL */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl w-full max-w-6xl my-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-t-xl sticky top-0 z-10 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold text-white
                                        ${selectedCampaign.platform === 'shopee' ? 'bg-orange-500' : 
                                        selectedCampaign.platform === 'tiktok' ? 'bg-black' : 'bg-blue-600'}`}>
                                        {selectedCampaign.platform}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{selectedCampaign.name}</h2>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${selectedCampaign.status === 'running' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {selectedCampaign.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">ID: {selectedCampaign.id} | Shop: {selectedCampaign.shopName}</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                {/* Navigation Tabs */}
                                <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                                    <button 
                                        onClick={() => setReportTab('executive')}
                                        className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${reportTab === 'executive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        1. Tổng quan
                                    </button>
                                    <button 
                                        onClick={() => setReportTab('funnel')}
                                        className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${reportTab === 'funnel' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        2. Phễu (Funnel)
                                    </button>
                                    <button 
                                        onClick={() => setReportTab('advanced')}
                                        className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${reportTab === 'advanced' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        3. Đề xuất
                                    </button>
                                </div>
                                <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hidden md:block">
                                    <X size={24} />
                                </button>
                                <button onClick={() => setSelectedCampaign(null)} className="md:hidden w-full py-2 bg-slate-200 rounded-lg text-slate-700">Đóng</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
                            {/* PAGE 1: EXECUTIVE SUMMARY */}
                            {reportTab === 'executive' && (
                                <div className="space-y-6">
                                    {/* Big KPI Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10"><DollarSign size={48} /></div>
                                            <p className="text-sm text-slate-500 font-bold uppercase mb-1">Spend vs Revenue</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-bold text-slate-900">{formatCurrency(selectedCampaign.revenue)}</span>
                                                <span className="text-xs text-slate-400 mb-1">/ {new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(selectedCampaign.spent)}</span>
                                            </div>
                                            <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                                                <TrendingUp size={14} /> +12% so với tuần trước (WoW)
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10"><Target size={48} /></div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-bold uppercase mb-1">ROAS (Lợi tức)</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-3xl font-black ${selectedCampaign.roas >= 3 ? 'text-indigo-600' : 'text-orange-600'}`}>{selectedCampaign.roas}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase">Mục tiêu</span>
                                                        <span className="text-xs font-bold text-slate-700">{selectedCampaign.kpi?.targetROAS || 3.0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedCampaign.kpi && (
                                                <div className={`mt-2 text-xs font-bold px-2 py-1 rounded w-fit ${selectedCampaign.kpi.achieved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {selectedCampaign.kpi.achieved ? `Đạt ${selectedCampaign.kpi.percentAchieved}% KPI` : `Chỉ đạt ${selectedCampaign.kpi.percentAchieved}% KPI`}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-5 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center
                                            ${selectedCampaign.kpi?.recommendation === 'Scale' ? 'bg-green-600 text-white border-green-700' : 
                                              selectedCampaign.kpi?.recommendation === 'Kill' ? 'bg-red-600 text-white border-red-700' : 'bg-blue-600 text-white border-blue-700'}`}>
                                            <p className="text-xs font-bold uppercase opacity-80 mb-2">Đề xuất hành động (AI)</p>
                                            <h3 className="text-4xl font-black tracking-widest">{selectedCampaign.kpi?.recommendation?.toUpperCase() || 'TEST'}</h3>
                                            <p className="text-xs opacity-90 mt-2 px-4">
                                                {selectedCampaign.kpi?.recommendation === 'Scale' ? 'ROAS tốt, lợi nhuận cao. Hãy tăng ngân sách 20%.' : 
                                                 selectedCampaign.kpi?.recommendation === 'Kill' ? 'Lỗ vốn. Cần tắt hoặc đổi nội dung ngay.' : 'Tiếp tục theo dõi thêm 3 ngày.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3 Key Insights */}
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles className="text-indigo-600" size={18}/> 3 Insight Quan Trọng Nhất</h3>
                                            <button 
                                                onClick={handleAnalyze} 
                                                disabled={isAnalyzing}
                                                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1"
                                            >
                                                {isAnalyzing ? "Đang phân tích..." : "Phân tích AI chuyên sâu"}
                                                {!isAnalyzing && <Bot size={14}/>}
                                            </button>
                                        </div>
                                        
                                        {aiAnalysis ? (
                                            <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg">
                                                <p className="whitespace-pre-wrap">{aiAnalysis}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={16} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Hiệu quả Doanh thu & ROAS</p>
                                                        <p className="text-sm text-slate-600">Doanh thu đạt {formatCurrency(selectedCampaign.revenue)}, ROAS {selectedCampaign.roas} (cao hơn mức hòa vốn 1.8). Lợi nhuận ước tính {formatCurrency(selectedCampaign.revenue - selectedCampaign.spent)}.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0"><AlertTriangle size={16} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Vấn đề tại Phễu (Funnel)</p>
                                                        <p className="text-sm text-slate-600">CTR đạt {selectedCampaign.ctr}% (Tốt), tuy nhiên tỷ lệ chuyển đổi (CVR) chỉ đạt {selectedCampaign.conversionRate}%. Cần kiểm tra lại trang đích hoặc giá bán.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Zap size={16} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Cơ hội (Opportunity)</p>
                                                        <p className="text-sm text-slate-600">Nhóm khách hàng "Nữ, 25-34, Hà Nội" đang có CVR cao nhất (4.5%). Cần tách nhóm này ra để scale mạnh hơn.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PAGE 2: FUNNEL & CREATIVE */}
                            {reportTab === 'funnel' && (
                                <div className="space-y-6">
                                    {/* 4 Groups Metrics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-800 uppercase mb-2">1. Awareness (Nhận diện)</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Impressions</span> <span className="font-semibold">{new Intl.NumberFormat('vi-VN', {notation: "compact"}).format(selectedCampaign.impressions)}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">CPM</span> <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedCampaign.cpm || 0)}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Reach</span> <span className="font-semibold">{new Intl.NumberFormat('vi-VN', {notation: "compact"}).format(selectedCampaign.reach || 0)}</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-orange-100">
                                            <p className="text-xs font-bold text-orange-800 uppercase mb-2">2. Engagement (Tương tác)</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Clicks</span> <span className="font-semibold">{selectedCampaign.clicks}</span></div>
                                                <div className="flex justify-between text-sm items-center">
                                                    <span className="text-slate-500">CTR</span> 
                                                    <span className={`font-bold px-1.5 rounded ${getBenchmarkColor('ctr', selectedCampaign.ctr || 0, selectedCampaign.platform)}`}>{selectedCampaign.ctr}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">CPC</span> <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedCampaign.cpc || 0)}</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-green-100">
                                            <p className="text-xs font-bold text-green-800 uppercase mb-2">3. Conversion (Chuyển đổi)</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Orders</span> <span className="font-semibold">{selectedCampaign.orders}</span></div>
                                                <div className="flex justify-between text-sm items-center">
                                                    <span className="text-slate-500">CVR</span> 
                                                    <span className={`font-bold px-1.5 rounded ${getBenchmarkColor('cvr', selectedCampaign.conversionRate || 0, selectedCampaign.platform)}`}>{selectedCampaign.conversionRate}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">CPA</span> <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedCampaign.cpa || 0)}</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-purple-100">
                                            <p className="text-xs font-bold text-purple-800 uppercase mb-2">4. Core Perf (Tài chính)</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Revenue</span> <span className="font-semibold text-purple-700">{new Intl.NumberFormat('vi-VN', {notation: "compact"}).format(selectedCampaign.revenue)}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-slate-500">Profit</span> <span className={`font-semibold ${(selectedCampaign.revenue - selectedCampaign.spent) > 0 ? 'text-green-600' : 'text-red-600'}`}>{new Intl.NumberFormat('vi-VN', {notation: "compact"}).format(selectedCampaign.revenue - selectedCampaign.spent)}</span></div>
                                                <div className="flex justify-between text-sm items-center">
                                                    <span className="text-slate-500">ROAS</span>
                                                    <span className={`font-bold px-1.5 rounded ${getBenchmarkColor('roas', selectedCampaign.roas, selectedCampaign.platform)}`}>{selectedCampaign.roas}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Funnel & Creative Split */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18}/> Marketing Funnel</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart 
                                                        layout="vertical"
                                                        data={[
                                                            { name: 'Impressions', value: selectedCampaign.impressions, fill: '#e0e7ff' },
                                                            { name: 'Clicks', value: selectedCampaign.clicks, fill: '#818cf8' },
                                                            { name: 'Add to Cart', value: selectedCampaign.addToCart || 0, fill: '#6366f1' },
                                                            { name: 'Purchase', value: selectedCampaign.orders, fill: '#4338ca' },
                                                        ]}
                                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                                    >
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11}} />
                                                        <Tooltip formatter={(val) => new Intl.NumberFormat('vi-VN').format(Number(val))} />
                                                        <Bar dataKey="value" barSize={25} radius={[0, 4, 4, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
                                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Eye size={18}/> Creative Analysis (Video/Image)</h3>
                                            
                                            {selectedCampaign.creativeMetrics ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1 text-slate-400">
                                                            <span>Hook Rate (3s View)</span>
                                                            <span className="text-white font-bold">{selectedCampaign.creativeMetrics.hookRate}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${selectedCampaign.creativeMetrics.hookRate > 30 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${selectedCampaign.creativeMetrics.hookRate}%`}}></div>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-1">Benchmark: &gt; 25% là tốt</p>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1 text-slate-400">
                                                            <span>Hold Rate (ThruPlay)</span>
                                                            <span className="text-white font-bold">{selectedCampaign.creativeMetrics.holdRate}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${selectedCampaign.creativeMetrics.holdRate > 10 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${selectedCampaign.creativeMetrics.holdRate * 3}%`}}></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                                                        <span className="text-sm text-slate-400">Ad Fatigue Score (Độ lặp lại)</span>
                                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                                            selectedCampaign.creativeMetrics.fatigueScore === 'Low' ? 'bg-green-500/20 text-green-400' : 
                                                            selectedCampaign.creativeMetrics.fatigueScore === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {selectedCampaign.creativeMetrics.fatigueScore}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-48 text-slate-500 text-sm italic">
                                                    Không có dữ liệu Creative cho chiến dịch này.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PAGE 3: PROPOSAL & CONCLUSION */}
                            {reportTab === 'advanced' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-900 text-lg mb-4">VIII. KẾT LUẬN & DỰ BÁO TUẦN TỚI</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Đánh giá chung</h4>
                                                <ul className="space-y-3 text-sm text-slate-600">
                                                    <li className="flex gap-2">
                                                        <div className="min-w-[4px] h-4 bg-green-500 rounded-full mt-0.5"></div>
                                                        <span><b>KPI Chính:</b> {selectedCampaign.kpi?.achieved ? 'Đã đạt' : 'Chưa đạt'}. ROAS hiện tại là {selectedCampaign.roas}.</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="min-w-[4px] h-4 bg-orange-500 rounded-full mt-0.5"></div>
                                                        <span><b>Điểm nghẽn:</b> {selectedCampaign.ctr < 2 ? 'CTR thấp, cần thay đổi Creative.' : selectedCampaign.conversionRate < 1 ? 'CVR thấp, xem lại giá và Landing Page.' : 'Các chỉ số đều ổn định.'}</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="min-w-[4px] h-4 bg-blue-500 rounded-full mt-0.5"></div>
                                                        <span><b>Xu hướng:</b> Chi phí CPC đang {selectedCampaign.cpc > 1000 ? 'tăng cao' : 'ổn định'}. Cần theo dõi sát trong 3 ngày tới.</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                                                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Zap size={16}/> Đề xuất hành động (Action Plan)</h4>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                                        <div className="bg-indigo-100 p-1.5 rounded text-indigo-700 font-bold text-xs shrink-0">B1</div>
                                                        <p className="text-sm text-slate-700">
                                                            {selectedCampaign.kpi?.recommendation === 'Scale' 
                                                                ? 'Tăng ngân sách ngay 20-30% vào các khung giờ vàng (12h, 20h).' 
                                                                : selectedCampaign.kpi?.recommendation === 'Kill' 
                                                                ? 'Tắt chiến dịch này để cắt lỗ. Dồn ngân sách sang Camp #2.' 
                                                                : 'Tiếp tục A/B Testing tiêu đề và ảnh bìa mới.'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                                        <div className="bg-indigo-100 p-1.5 rounded text-indigo-700 font-bold text-xs shrink-0">B2</div>
                                                        <p className="text-sm text-slate-700">
                                                            {selectedCampaign.platform === 'tiktok' ? 'Sản xuất thêm 3 video mới focus vào Hook 3s đầu.' : 'Tối ưu lại trang sản phẩm (Shopee Decor) để tăng CVR.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4">
                                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                                            <Download size={18} /> Tải xuống PDF (1 Trang)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;