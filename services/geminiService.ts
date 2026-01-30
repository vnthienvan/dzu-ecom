import { GoogleGenAI, Type } from "@google/genai";
import { AiSuggestion } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAdOptimizationSuggestions = async (
  productName: string,
  currentPrice: number,
  category: string
): Promise<AiSuggestion | null> => {
  try {
    const prompt = `
      Tôi đang chạy quảng cáo Shopee cho sản phẩm: "${productName}"
      Giá bán: ${currentPrice} VND
      Danh mục: ${category}

      Hãy đóng vai trò là chuyên gia Shopee Ads. Vui lòng cung cấp:
      1. 5 từ khóa (keywords) tiềm năng nhất với lượng tìm kiếm ước tính (thấp/trung bình/cao) và giá thầu gợi ý (VND).
      2. Gợi ý tiêu đề và mô tả ngắn gọn thu hút người mua.
      3. Chiến lược đấu thầu ngắn gọn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  searchVolume: { type: Type.NUMBER, description: "Scale 1-100 or actual volume estimation" },
                  suggestedBid: { type: Type.NUMBER, description: "In VND" },
                  relevance: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                },
                required: ["keyword", "searchVolume", "suggestedBid", "relevance"]
              }
            },
            adCopy: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            },
            strategy: { type: Type.STRING }
          },
          required: ["keywords", "adCopy", "strategy"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiSuggestion;
    }
    return null;

  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return null;
  }
};

export const analyzeCampaignData = async (
  campaignName: string,
  metrics: { roas: number; spent: number; revenue: number; clicks: number }
): Promise<string> => {
  try {
    const prompt = `
      Phân tích hiệu quả chiến dịch Shopee Ads sau đây:
      Tên: ${campaignName}
      ROAS: ${metrics.roas}
      Chi tiêu: ${metrics.spent}
      Doanh thu: ${metrics.revenue}
      Clicks: ${metrics.clicks}

      Hãy đưa ra nhận xét ngắn gọn (dưới 50 từ) về hiệu quả và 1 hành động đề xuất cụ thể để cải thiện.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Không thể phân tích dữ liệu lúc này.";
  } catch (error) {
    console.error("Error analyzing campaign:", error);
    return "Lỗi kết nối AI.";
  }
};

export const analyzeReportOverview = async (
  totals: { spent: number; revenue: number; clicks: number; impressions: number; orders: number },
  platform: string,
  timeRange: string
): Promise<string> => {
  try {
    const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : 0;
    const cvr = totals.clicks > 0 ? ((totals.orders / totals.clicks) * 100).toFixed(2) : 0;
    const cpc = totals.clicks > 0 ? (totals.spent / totals.clicks).toFixed(0) : 0;

    const prompt = `
      Bạn là chuyên gia phân tích dữ liệu Digital Marketing (Performance Ads).
      Hãy phân tích báo cáo tổng quan sau đây:
      - Thời gian: ${timeRange}
      - Nền tảng: ${platform}
      - Tổng chi tiêu: ${totals.spent} VND
      - Tổng doanh thu: ${totals.revenue} VND
      - Tổng đơn hàng (Orders): ${totals.orders}
      - Clicks: ${totals.clicks} | Impressions: ${totals.impressions}
      - CTR: ${ctr}%
      - CVR (Tỷ lệ chuyển đổi): ${cvr}%
      - CPC Trung bình: ${cpc} VND
      
      Hãy đưa ra 3 điểm nổi bật về hiệu suất (chú ý CTR, CVR và chi phí) và 2 lời khuyên chiến lược cụ thể để tối ưu ngân sách hoặc tăng đơn hàng. Định dạng Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Chưa có dữ liệu phân tích.";
  } catch (error) {
    console.error("Error analyzing report:", error);
    return "Lỗi khi gọi AI phân tích.";
  }
};