import React, { useState } from 'react';
import { Product, Platform } from '../types';
import { RefreshCw, Search, Filter, MoreVertical, CheckCircle, AlertCircle, Briefcase, Store, BarChart3, Package, Star, TrendingUp, AlertTriangle, XCircle, DollarSign, Layers, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockProducts: Product[] = [
  { 
      id: '1', platform: 'shopee', shopName: 'Dzu Fashion HN', name: 'Áo thun nam Cotton Compact', sku: 'TSHIRT-001', price: 159000, stock: 450, imageUrl: 'https://picsum.photos/200', status: 'active', lastSynced: '10 phút trước', sales: 1200,
      performance: {
          revenue: 190800000, unitsSold: 1200, orders: 1100, aov: 173454, revenueShare: 45, adAttributedRevenue: 150000000, organicRevenue: 40800000,
          adSpend: 30000000, roas: 5.0, cpa: 27272, costPerUnit: 25000, profit: 80000000, margin: 41.9,
          discountRate: 10, bundleRate: 25, crossSellRate: 15,
          views: 50000, addToCart: 2500, checkout: 1500, conversionRate: 2.2,
          newCustomerRevenue: 120000000, returningRevenue: 70800000, repeatRate: 35,
          classification: 'Star'
      }
  },
  { 
      id: '2', platform: 'shopee', shopName: 'Dzu Fashion HCM', name: 'Quần Jeans Slimfit', sku: 'JEAN-002', price: 350000, stock: 120, imageUrl: 'https://picsum.photos/201', status: 'active', lastSynced: '15 phút trước', sales: 850,
      performance: {
          revenue: 297500000, unitsSold: 850, orders: 800, aov: 371875, revenueShare: 35, adAttributedRevenue: 100000000, organicRevenue: 197500000,
          adSpend: 50000000, roas: 2.0, cpa: 62500, costPerUnit: 58823, profit: 90000000, margin: 30.2,
          discountRate: 5, bundleRate: 10, crossSellRate: 5,
          views: 30000, addToCart: 1200, checkout: 900, conversionRate: 2.8,
          newCustomerRevenue: 250000000, returningRevenue: 47500000, repeatRate: 15,
          classification: 'Potential'
      }
  },
  { 
      id: '3', platform: 'tiktok', shopName: 'Dzu Beauty', name: 'Combo Son Lì Dzu', sku: 'LIP-003', price: 590000, stock: 0, imageUrl: 'https://picsum.photos/202', status: 'inactive', lastSynced: '1 giờ trước', sales: 3200,
      performance: {
          revenue: 1888000000, unitsSold: 3200, orders: 3000, aov: 629333, revenueShare: 80, adAttributedRevenue: 1500000000, organicRevenue: 388000000,
          adSpend: 400000000, roas: 3.75, cpa: 133333, costPerUnit: 125000, profit: 600000000, margin: 31.7,
          discountRate: 15, bundleRate: 80, crossSellRate: 40,
          views: 500000, addToCart: 20000, checkout: 5000, conversionRate: 0.6,
          newCustomerRevenue: 1600000000, returningRevenue: 288000000, repeatRate: 10,
          classification: 'Star'
      }
  },
  { 
      id: '4', platform: 'tiktok', shopName: 'Dzu Beauty', name: 'Phấn nước Cushion', sku: 'CUSH-004', price: 299000, stock: 50, imageUrl: 'https://picsum.photos/203', status: 'syncing', lastSynced: 'Đang đồng bộ...', sales: 150,
      performance: {
          revenue: 44850000, unitsSold: 150, orders: 140, aov: 320357, revenueShare: 5, adAttributedRevenue: 40000000, organicRevenue: 4850000,
          adSpend: 35000000, roas: 1.14, cpa: 250000, costPerUnit: 233333, profit: -5000000, margin: -11.1,
          discountRate: 20, bundleRate: 0, crossSellRate: 2,
          views: 10000, addToCart: 300, checkout: 150, conversionRate: 1.5,
          newCustomerRevenue: 40000000, returningRevenue: 4850000, repeatRate: 5,
          classification: 'Kill'
      }
  },
  { 
      id: '5', platform: 'facebook', shopName: 'Dzu Gadgets', name: 'Set quà tặng 20/10', sku: 'GIFT-005', price: 450000, stock: 200, imageUrl: 'https://picsum.photos/204', status: 'active', lastSynced: '2 giờ trước', sales: 540,
      performance: {
          revenue: 243000000, unitsSold: 540, orders: 500, aov: 486000, revenueShare: 60, adAttributedRevenue: 200000000, organicRevenue: 43000000,
          adSpend: 100000000, roas: 2.0, cpa: 200000, costPerUnit: 185185, profit: 50000000, margin: 20.5,
          discountRate: 0, bundleRate: 50, crossSellRate: 30,
          views: 20000, addToCart: 1000, checkout: 600, conversionRate: 2.5,
          newCustomerRevenue: 200000000, returningRevenue: 43000000, repeatRate: 20,
          classification: 'Warning'
      }
  },
];

const ProductSync: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'inventory' | 'report'>('report');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters State
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<Platform | 'all'>('all');
  const [shopFilter, setShopFilter] = useState('all');

  const uniqueShops = Array.from(new Set(mockProducts.map(p => p.shopName).filter(Boolean)));

  const handleSyncAll = () => {
    setIsSyncing(true);
    // Simulate API call to Platforms
    setTimeout(() => {
      setIsSyncing(false);
      setProducts(prev => prev.map(p => ({ ...p, lastSynced: 'Vừa xong', status: p.status === 'syncing' ? 'active' : p.status })));
      alert("Đã đồng bộ thành công dữ liệu từ Shopee, TikTok Shop, Facebook Catalog.");
    }, 2500);
  };

  const handleCreateTask = (product: Product) => {
    const confirmCreate = confirm(`Bạn muốn tạo công việc "Cập nhật sản phẩm: ${product.name}"?`);
    if(confirmCreate) {
        navigate('/work');
    }
  };

  const filteredProducts = products.filter(p => {
      const matchPlatform = activeTab === 'all' || p.platform === activeTab;
      const matchShop = shopFilter === 'all' || p.shopName === shopFilter;
      return matchPlatform && matchShop;
  });

  const handleExportProductExcel = () => {
      setIsExporting(true);
      const dateText = timeRange === 'custom' 
          ? `Từ ${customStartDate} đến ${customEndDate}` 
          : `Kỳ báo cáo: ${timeRange.toUpperCase()}`;

      const tableContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
              <meta charset="utf-8" />
              <style>
                  table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
                  th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: middle; }
                  .header-main { background-color: #1e1b4b; color: white; font-weight: bold; text-align: center; }
                  .money { mso-number-format:"\#\,\#\#0"; text-align: right; }
                  .text { mso-number-format:"\@"; }
              </style>
          </head>
          <body>
              <h2>BÁO CÁO HIỆU QUẢ SẢN PHẨM (SKU PERFORMANCE)</h2>
              <p><b>Thời gian:</b> ${dateText} | <b>Nền tảng:</b> ${activeTab.toUpperCase()}</p>
              <table>
                  <thead>
                      <tr>
                          <th class="header-main">STT</th>
                          <th class="header-main">Tên Sản Phẩm</th>
                          <th class="header-main">SKU</th>
                          <th class="header-main">Shop/Platform</th>
                          <th class="header-main">Phân loại (BCG)</th>
                          <th class="header-main">Doanh thu</th>
                          <th class="header-main">Đơn hàng</th>
                          <th class="header-main">Chi phí Ads</th>
                          <th class="header-main">ROAS</th>
                          <th class="header-main">Lợi nhuận</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${filteredProducts.map((p, i) => `
                          <tr>
                              <td>${i + 1}</td>
                              <td class="text">${p.name}</td>
                              <td class="text">${p.sku}</td>
                              <td>${p.shopName} (${p.platform})</td>
                              <td>${p.performance?.classification}</td>
                              <td class="money">${p.performance?.revenue}</td>
                              <td class="money">${p.performance?.orders}</td>
                              <td class="money">${p.performance?.adSpend}</td>
                              <td class="money">${p.performance?.roas}</td>
                              <td class="money">${p.performance?.profit}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </body>
          </html>
      `;

      const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Product_Performance_${new Date().toISOString().slice(0,10)}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
              {activeView === 'inventory' ? 'Đồng bộ sản phẩm' : 'Báo cáo hiệu quả sản phẩm'}
          </h1>
          <p className="text-slate-500">
              {activeView === 'inventory' ? 'Quản lý tồn kho đa kênh (Shopee, TikTok, Facebook)' : 'Phân tích doanh thu, lợi nhuận và hiệu quả quảng cáo từng SKU'}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExportProductExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
                <Download size={18} />
                Xuất Excel
            </button>
            <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ API'}
            </button>
        </div>
      </div>

       {/* View Switcher & Filters */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            
            {/* Top Row: View Mode & Date Filter */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center border-b border-slate-100 pb-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveView('inventory')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeView === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center gap-2"><Package size={16}/> Tồn kho & Giá</span>
                    </button>
                    <button 
                        onClick={() => setActiveView('report')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeView === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center gap-2"><BarChart3 size={16}/> Doanh thu & Ads</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                        <option value="custom">Tùy chỉnh ngày</option>
                    </select>
                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-1 animate-in fade-in">
                            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="px-2 py-2 border rounded-lg text-sm" />
                            <span>-</span>
                            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="px-2 py-2 border rounded-lg text-sm" />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Platform & Shop Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                    {(['all', 'shopee', 'tiktok', 'facebook'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                                activeTab === tab 
                                ? 'bg-indigo-50 text-indigo-600' 
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'all' ? 'Tất cả nền tảng' : `${tab}`}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Store size={18} className="text-slate-400" />
                    <select 
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                        value={shopFilter}
                        onChange={(e) => setShopFilter(e.target.value)}
                    >
                        <option value="all">Tất cả Shop</option>
                        {uniqueShops.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
       </div>

      {/* VIEW: INVENTORY MANAGEMENT (Original) */}
      {activeView === 'inventory' && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc SKU..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Shop & Nền tảng</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-right">Giá bán</th>
                <th className="px-6 py-4 text-center">Tồn kho</th>
                <th className="px-6 py-4 text-center">Đã bán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Cập nhật</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover border border-slate-200" />
                      <span className="font-medium text-slate-900 truncate max-w-[200px]" title={product.name}>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{product.shopName || 'Unknown'}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize mt-1 inline-block
                        ${product.platform === 'shopee' ? 'bg-orange-100 text-orange-700' : 
                          product.platform === 'tiktok' ? 'bg-black text-white' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {product.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500">{product.sales}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {product.status === 'active' && <CheckCircle size={16} className="text-green-500" />}
                      {product.status === 'inactive' && <AlertCircle size={16} className="text-red-500" />}
                      {product.status === 'syncing' && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
                      <span className="capitalize text-slate-700">
                        {product.status === 'active' ? 'Hoạt động' : product.status === 'inactive' ? 'Hết hàng' : 'Đang xử lý'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">{product.lastSynced}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                        <button 
                            onClick={() => handleCreateTask(product)}
                            className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full"
                            title="Tạo công việc cho sản phẩm này"
                        >
                            <Briefcase size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-2">
                          <MoreVertical size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* VIEW: REVENUE & PERFORMANCE REPORT (New) */}
      {activeView === 'report' && (
          <div className="space-y-6">
              {/* Product Classification Matrix (BCG) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-yellow-700 flex items-center gap-2"><Star size={18} fill="currentColor"/> Sản phẩm Chủ lực (Star)</h3>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">{filteredProducts.filter(p => p.performance?.classification === 'Star').length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">ROAS cao, Doanh thu cao. Scale ngân sách ngay!</p>
                      <div className="w-full bg-yellow-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full w-[70%]"></div>
                      </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-blue-700 flex items-center gap-2"><TrendingUp size={18}/> Tiềm năng (Potential)</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">{filteredProducts.filter(p => p.performance?.classification === 'Potential').length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">ROAS tốt, Doanh thu thấp. Cần tăng traffic/test creative.</p>
                      <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[40%]"></div>
                      </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-orange-700 flex items-center gap-2"><AlertTriangle size={18}/> Cảnh báo (Warning)</h3>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-bold">{filteredProducts.filter(p => p.performance?.classification === 'Warning').length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Doanh thu cao, ROAS thấp. Tối ưu giá/Target lại.</p>
                      <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full w-[60%]"></div>
                      </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-red-700 flex items-center gap-2"><XCircle size={18}/> Cắt lỗ (Kill)</h3>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">{filteredProducts.filter(p => p.performance?.classification === 'Kill').length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">ROAS thấp, Doanh thu thấp. Ngừng chạy ads ngay.</p>
                      <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full w-[20%]"></div>
                      </div>
                  </div>
              </div>

              {/* Detailed Performance Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                              {/* Group Headers */}
                              <tr>
                                  <th rowSpan={2} className="px-4 py-3 bg-white sticky left-0 z-10 border-r border-slate-200 min-w-[200px]">Sản phẩm</th>
                                  <th rowSpan={2} className="px-4 py-3 bg-white border-r border-slate-200">Phân loại</th>
                                  
                                  <th colSpan={4} className="px-4 py-2 text-center bg-green-50 border-r border-green-100 text-green-800 border-b">I. DOANH THU CỐT LÕI</th>
                                  <th colSpan={5} className="px-4 py-2 text-center bg-blue-50 border-r border-blue-100 text-blue-800 border-b">II. HIỆU QUẢ ADS</th>
                                  <th colSpan={3} className="px-4 py-2 text-center bg-purple-50 border-r border-purple-100 text-purple-800 border-b">III. GIÁ & HÀNH VI</th>
                                  <th colSpan={4} className="px-4 py-2 text-center bg-orange-50 border-r border-orange-100 text-orange-800 border-b">IV. PHỄU (FUNNEL)</th>
                                  <th colSpan={2} className="px-4 py-2 text-center bg-gray-50 text-gray-800 border-b">VI. KHÁCH HÀNG</th>
                              </tr>
                              {/* Metric Headers */}
                              <tr className="text-xs">
                                  {/* Core */}
                                  <th className="px-4 py-2 bg-green-50/50 border-r border-green-100">Doanh thu</th>
                                  <th className="px-4 py-2 bg-green-50/50 border-r border-green-100">Đơn hàng</th>
                                  <th className="px-4 py-2 bg-green-50/50 border-r border-green-100">AOV</th>
                                  <th className="px-4 py-2 bg-green-50/50 border-r border-green-100">% Đóng góp</th>
                                  
                                  {/* Ads */}
                                  <th className="px-4 py-2 bg-blue-50/50 border-r border-blue-100">Chi phí Ads</th>
                                  <th className="px-4 py-2 bg-blue-50/50 border-r border-blue-100 font-bold">ROAS</th>
                                  <th className="px-4 py-2 bg-blue-50/50 border-r border-blue-100">CPA</th>
                                  <th className="px-4 py-2 bg-blue-50/50 border-r border-blue-100">Lợi nhuận</th>
                                  <th className="px-4 py-2 bg-blue-50/50 border-r border-blue-100">Margin</th>

                                  {/* Pricing */}
                                  <th className="px-4 py-2 bg-purple-50/50 border-r border-purple-100">Giảm giá</th>
                                  <th className="px-4 py-2 bg-purple-50/50 border-r border-purple-100">Mua Combo</th>
                                  <th className="px-4 py-2 bg-purple-50/50 border-r border-purple-100">Mua kèm</th>

                                  {/* Funnel */}
                                  <th className="px-4 py-2 bg-orange-50/50 border-r border-orange-100">Views</th>
                                  <th className="px-4 py-2 bg-orange-50/50 border-r border-orange-100">Add to Cart</th>
                                  <th className="px-4 py-2 bg-orange-50/50 border-r border-orange-100">Checkout</th>
                                  <th className="px-4 py-2 bg-orange-50/50 border-r border-orange-100">CVR (%)</th>

                                  {/* Customer */}
                                  <th className="px-4 py-2 bg-gray-50/50 border-r border-gray-100">Khách mới</th>
                                  <th className="px-4 py-2 bg-gray-50/50">Khách cũ</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {filteredProducts.map(p => {
                                  const pf = p.performance;
                                  if (!pf) return null;
                                  return (
                                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                          <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                                              <div className="flex items-center gap-3">
                                                  <img src={p.imageUrl} className="w-8 h-8 rounded border border-slate-200" alt=""/>
                                                  <div>
                                                      <div className="font-medium text-slate-900 truncate w-40" title={p.name}>{p.name}</div>
                                                      <div className="text-[10px] text-slate-500">{p.sku}</div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-3 border-r border-slate-200">
                                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
                                                  ${pf.classification === 'Star' ? 'bg-yellow-100 text-yellow-700' : 
                                                    pf.classification === 'Potential' ? 'bg-blue-100 text-blue-700' :
                                                    pf.classification === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                  }`}>
                                                  {pf.classification}
                                              </span>
                                          </td>

                                          {/* Core */}
                                          <td className="px-4 py-3 text-right border-r border-slate-100">{formatCurrency(pf.revenue)}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100">{pf.orders}</td>
                                          <td className="px-4 py-3 text-right border-r border-slate-100">{formatCurrency(pf.aov)}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 font-medium">{pf.revenueShare}%</td>

                                          {/* Ads */}
                                          <td className="px-4 py-3 text-right border-r border-slate-100 text-slate-600">{formatCurrency(pf.adSpend)}</td>
                                          <td className={`px-4 py-3 text-center border-r border-slate-100 font-bold ${pf.roas >= 3 ? 'text-green-600' : pf.roas < 1.5 ? 'text-red-600' : 'text-orange-600'}`}>{pf.roas}</td>
                                          <td className="px-4 py-3 text-right border-r border-slate-100">{formatCurrency(pf.cpa)}</td>
                                          <td className={`px-4 py-3 text-right border-r border-slate-100 font-bold ${pf.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(pf.profit)}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-xs">{pf.margin}%</td>

                                          {/* Pricing */}
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-red-500">{pf.discountRate}%</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-purple-600 font-medium">{pf.bundleRate}%</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-600">{pf.crossSellRate}%</td>

                                          {/* Funnel */}
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(pf.views)}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">{pf.addToCart}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">{pf.checkout}</td>
                                          <td className="px-4 py-3 text-center border-r border-slate-100 font-medium">{pf.conversionRate}%</td>

                                          {/* Customer */}
                                          <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{formatCurrency(pf.newCustomerRevenue)}</td>
                                          <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(pf.returningRevenue)}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProductSync;