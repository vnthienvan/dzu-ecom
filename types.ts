export type Platform = 'shopee' | 'tiktok' | 'facebook' | 'google';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: 'active' | 'inactive' | 'syncing';
  lastSynced: string;
  sales: number;
  shopId?: string;
  shopName?: string; 
  platform: Platform; 
  
  // New: Linked Performance Data
  performance?: ProductPerformanceMetrics;
}

export interface ProductPerformanceMetrics {
    // I. Core Revenue
    revenue: number;
    unitsSold: number;
    orders: number;
    aov: number;
    revenueShare: number; // % contribution
    adAttributedRevenue: number;
    organicRevenue: number;

    // II. Ad Performance
    adSpend: number;
    roas: number;
    cpa: number; // Cost per Order for this product
    costPerUnit: number;
    profit: number; // Revenue - Ads - COGS (Estimated)
    margin: number; // % Profit/Revenue

    // III. Pricing & Behavior
    discountRate: number; // %
    bundleRate: number; // % orders with bundle
    crossSellRate: number; // % purchased with others

    // IV. Funnel
    views: number;
    addToCart: number;
    checkout: number;
    conversionRate: number; // Purchase / View

    // VI. Customer
    newCustomerRevenue: number;
    returningRevenue: number;
    repeatRate: number;

    // VII. Classification
    classification: 'Star' | 'Potential' | 'Warning' | 'Kill';
}

export interface HandoverCredential {
    id: string;
    shopId: string;
    platform: Platform;
    username: string;
    passwordEncrypted: string;
    twoFactorCode?: string;
    recoveryEmail?: string;
    notes?: string;
    chromeRemotePin?: string; // New: Remote access pin
    status: 'active' | 'changed' | 'revoked';
}

export interface Shop {
  id: string;
  name: string;
  platform: Platform;
  status: 'connected' | 'disconnected' | 'policy_violation' | 'token_expired'; // Updated for policy compliance
  violationReason?: string; // New: Reason for policy violation
  productCount: number;
  accountName?: string;
  handover?: HandoverCredential; // Linked credential
  agencyId?: string; // New: Multi-tenancy
}

export type UserRole = 'super_admin' | 'agency_admin' | 'manager' | 'member' | 'customer';

// New: Granular Permissions
export type ActionType = 'view' | 'edit' | 'delete' | 'approve';
export type ResourceType = 'shop' | 'ad_account' | 'campaign' | 'all';

export interface GranularPermission {
    resourceId: string; // ID of the shop or 'all'
    resourceType: ResourceType;
    actions: ActionType[];
}

export interface SocialAccount {
    provider: 'google' | 'facebook' | 'tiktok';
    email: string;
    avatar?: string;
    connectedAt: string;
}

export interface Agency {
    id: string;
    name: string;
    logo?: string;
    tier: 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive';
    // Info for Contracts
    taxCode?: string;
    address?: string;
    representative?: string;
    position?: string;
}

export interface UserTracking {
  ip: string;
  location: string;
  device: string;
  lastActive: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string; 
  company?: string; 
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: string[]; // Legacy simple permissions
  lastLogin?: string;
  expirationDate?: string; 
  
  // New: Multi-Agency & Granular Access
  agencyId: string; 
  granularPermissions: GranularPermission[];
  socialAccounts?: SocialAccount[];
  
  // New: Access Control (Legacy support)
  accessibleShops?: string[]; 
  
  // New: Tracking
  tracking?: UserTracking;
}

// New: Email & Reporting Configuration
export interface EmailConfig {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    senderName: string;
    secure: boolean;
}

export interface ReportSchedule {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    recipients: string[]; // emails
    includeCharts: boolean;
    format: 'pdf' | 'excel';
}

// New: Advanced Targeting
export interface Targeting {
  gender: 'all' | 'male' | 'female';
  ageRange: { min: number; max: number };
  locations: string[];
  interests: string[];
  behaviors: string[];
  placements: string[];
}

// New: Advanced Analysis Types
export interface CreativeMetrics {
    hookRate: number; // 3s view / impressions (%)
    holdRate: number; // 6s view / impressions or ThruPlay (%)
    scrollStopRate: number; // (%)
    fatigueScore: 'Low' | 'Medium' | 'High'; // Ad Fatigue
    avgWatchTime: number; // seconds
}

export interface KPIConfig {
    targetROAS: number;
    currentROAS: number;
    achieved: boolean;
    percentAchieved: number;
    recommendation: 'Scale' | 'Kill' | 'Test' | 'Optimize';
}

export interface Campaign {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  platform: Platform;
  status: 'running' | 'paused' | 'ended';
  source: 'manual' | 'synced';
  createdAt: string;
  startDate: string;
  endDate: string;
  dailyBudget: number;
  monthlyBudget: number;
  totalBudget: number;
  spent: number;
  revenue: number;
  roas: number;
  clicks: number;
  impressions: number;
  
  products: string[];
  content: string;
  mediaUrl?: string;
  note?: string;
  
  // New: Advanced Targeting
  targeting?: Targeting;

  // --- Detailed Ads Metrics (Deep Dive) ---
  // Group 1: Display & Awareness
  reach?: number;
  frequency?: number;
  cpm?: number;
  
  // Group 2: Engagement
  ctr?: number;
  cpc?: number;
  engagementRate?: number;
  socialInteractions?: number; // Likes, Shares, Comments

  // Group 3: Conversion (Funnel)
  viewContent?: number;
  addToCart?: number;
  initiateCheckout?: number;
  orders?: number;
  conversionRate?: number; // CVR
  cpa?: number; // Cost Per Acquisition/Order

  // Group 4: Revenue & Profit
  profit?: number; // Revenue - Spend - COGS (estimated)
  roi?: number;

  // New: Advanced Analysis Blocks
  creativeMetrics?: CreativeMetrics;
  kpi?: KPIConfig;

  // Platform Specifics
  facebookMetrics?: {
      qualityRanking: string;
      engagementRanking: string;
      conversionRanking: string;
  };
  shopeeMetrics?: {
      directOrders: number;
      assistedOrders: number;
      searchImpressionShare: number;
  };
}

export interface ReportFilter {
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  platform: Platform | 'all';
}

export interface AiKeywordSuggestion {
  keyword: string;
  searchVolume: number;
  suggestedBid: number;
  relevance: 'High' | 'Medium' | 'Low';
}

export interface AiAdCopySuggestion {
  title: string;
  description: string;
}

export interface AiSuggestion {
  keywords: AiKeywordSuggestion[];
  adCopy: AiAdCopySuggestion;
  strategy: string;
}

// --- Work Management Types ---

// UPDATE: Standard Agency Workflow Statuses
export type TaskStatus = 'new_request' | 'approved' | 'inprogress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskHistory {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'approve';
  user: string;
  description: string;
  snapshot?: Partial<Task>; // Save state for restore
}

export interface TaskComment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
    isSystem?: boolean; // Is this a system log or user comment
}

export interface TaskChecklist {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface TaskKPI {
    estimatedHours: number;
    actualHours: number;
    onTime: boolean;
    rating: number; // 1-5 stars
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  shopId: string; 
  shopName: string;
  platform: Platform;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string; 
  dueDate: string;
  relatedItem?: {
    type: 'campaign' | 'product';
    id: string;
    name: string;
  };
  attachments?: number;
  
  // Advanced Fields
  targetEntities?: string[]; 
  goals?: string[]; 
  detailedContent?: string;
  budgetConfig?: {
      total: number;
      daily: number;
      monthly: number; // Added monthly
      currency: string;
  };
  timeConfig?: {
      startDate: string;
      endDate: string;
  };
  
  // New: Features
  history?: TaskHistory[];
  comments?: TaskComment[];
  checklist?: TaskChecklist[];
  kpi?: TaskKPI;
  tags?: string[];
}

// --- Chat System ---
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'system';
  relatedTaskId?: string; // New: Sync with task
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  status: 'online' | 'offline' | 'busy' | 'bot'; // Added bot
  messages: ChatMessage[];
}

// --- Alerts & Logs ---
export interface Alert {
  id: string;
  type: 'overdue_task' | 'campaign_budget' | 'account_expiry' | 'system';
  message: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SystemLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    target: string; // e.g., "Campaign #123"
    detail: string;
    ip: string;
}

// --- Finance Module ---
export interface Contract {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    type: 'ads_service' | 'shop_care' | 'full_package';
    value: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'pending' | 'expired' | 'terminated';
    paymentCycle: 'monthly' | 'one_time' | 'quarterly';
    paidAmount: number;
    debtAmount: number; // Công nợ
}

export interface Transaction {
    id: string;
    date: string;
    contractId: string;
    description: string;
    amount: number;
    type: 'income' | 'expense'; // Income from client, Expense for Ads top-up
    status: 'completed' | 'pending' | 'failed';
}

// New: Contract Templates & Clients
export interface ContractTemplate {
    id: string;
    name: string;
    content: string; // HTML with variables like {{CLIENT_NAME}}
}

export interface Client {
    id: string;
    companyName: string;
    taxCode: string;
    address: string;
    representative: string;
    position: string;
    email: string;
    phone: string;
}

// New: System Integrations
export interface Integration {
    id: string;
    platform: Platform | 'google'; 
    name: string;
    description: string;
    docUrl: string;
    status: 'connected' | 'disconnected' | 'error';
    connectedAt?: string;
    clientId?: string;
}