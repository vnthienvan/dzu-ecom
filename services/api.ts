// services/api.ts
import { Shop, Product, User } from '../types';

// Trong môi trường dev (npm run dev), URL này có thể trỏ về localhost của PHP server (ví dụ XAMPP)
// Khi build production, nó sẽ tự nhận đường dẫn tương đối
const API_BASE_URL = (import.meta as any).env?.PROD ? '/api' : 'http://localhost/dzu_ecom/api'; 
// Lưu ý: Nếu bạn chạy React ở cổng 5173 và PHP ở cổng 80, bạn cần cấu hình CORS ở file config.php (đã làm)

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const res = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        }
    },
    shops: {
        getAll: async (): Promise<Shop[]> => {
            try {
                const res = await fetch(`${API_BASE_URL}/shops.php`);
                if (!res.ok) throw new Error('Failed to fetch shops');
                return await res.json();
            } catch (e) {
                console.warn("API Error, returning mock data for dev", e);
                return []; 
            }
        },
        create: async (shop: Partial<Shop>) => {
            const res = await fetch(`${API_BASE_URL}/shops.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shop)
            });
            return res.json();
        },
        delete: async (id: string) => {
            await fetch(`${API_BASE_URL}/shops.php?id=${id}`, { method: 'DELETE' });
        }
    },
    products: {
        getAll: async (): Promise<Product[]> => {
            try {
                const res = await fetch(`${API_BASE_URL}/products.php`);
                if (!res.ok) throw new Error('Failed to fetch products');
                return await res.json();
            } catch (e) {
                console.warn("API Error, returning empty", e);
                return [];
            }
        }
    }
};