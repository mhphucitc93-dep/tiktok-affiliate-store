import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Local JSON Storage Path
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BANNERS_FILE = path.join(DATA_DIR, 'banners.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Sample Products
const defaultProducts = [
  {
    id: 'prod-1',
    title: 'Son Kem Lì Bbia Last Velvet Lip Tint Hàng Chính Hãng - Chuẩn Màu TikTok Shop',
    originalPrice: 220000,
    price: 139000,
    discountPercent: 37,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfBbiaTint/',
    category: 'Mỹ phẩm',
    soldCount: 18400,
    rating: 4.9,
    isVerified: true,
    isFeatured: true,
    isVisible: true,
    frameTemplate: 'flash_sale',
    badgeText: 'MÃ GIẢM 50K',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    clicks: 1420
  },
  {
    id: 'prod-2',
    title: 'Tai Nghe Bluetooth Không Dây TWS Âm Thanh Hi-Fi Pin Trâu 24H Hot Trend TikTok',
    originalPrice: 350000,
    price: 189000,
    discountPercent: 46,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfTWSAudio/',
    category: 'Công nghệ',
    soldCount: 32100,
    rating: 4.8,
    isVerified: true,
    isFeatured: true,
    isVisible: true,
    frameTemplate: 'payday_gold',
    badgeText: 'FREESHIP 0Đ',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    clicks: 2890
  },
  {
    id: 'prod-3',
    title: 'Áo Phông Unisex Unisex Regular Fit Chất Cotton 100% Co Giãn Form Rộng Hàn Quốc',
    originalPrice: 199000,
    price: 99000,
    discountPercent: 50,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfUnisexTee/',
    category: 'Thời trang',
    soldCount: 9500,
    rating: 4.9,
    isVerified: true,
    isFeatured: false,
    isVisible: true,
    frameTemplate: 'live_stream',
    badgeText: 'MUA 2 GIẢM 10%',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    clicks: 870
  },
  {
    id: 'prod-4',
    title: 'Nồi Chiên Không Dầu Dung Tích 6.5L Cảm Ứng Thông Minh TikTok Choice 2026',
    originalPrice: 1450000,
    price: 799000,
    discountPercent: 45,
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfAirFryer/',
    category: 'Đồ gia dụng',
    soldCount: 5400,
    rating: 5.0,
    isVerified: true,
    isFeatured: true,
    isVisible: true,
    frameTemplate: 'custom_red',
    badgeText: 'SALE SỐC 11.11',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    clicks: 1120
  },
  {
    id: 'prod-5',
    title: 'Kính Cường Lực Chống Nhìn Trộm Full Màn Hình Cho iPhone 11 - 16 Pro Max',
    originalPrice: 90000,
    price: 39000,
    discountPercent: 57,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfGlassPro/',
    category: 'Phụ kiện',
    soldCount: 45000,
    rating: 4.8,
    isVerified: true,
    isFeatured: false,
    isVisible: true,
    frameTemplate: 'verified_blue',
    badgeText: 'COMBO 2 CÁI',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    clicks: 3410
  },
  {
    id: 'prod-6',
    title: 'Máy Rửa Mặt Sóng Âm Silicon Cao Cấp Làm Sạch Sâu Giảm Mụn Đầu Đen',
    originalPrice: 280000,
    price: 159000,
    discountPercent: 43,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: 'https://vt.tiktok.com/ZSfFacialCleaner/',
    category: 'Mỹ phẩm',
    soldCount: 11200,
    rating: 4.9,
    isVerified: true,
    isFeatured: true,
    isVisible: true,
    frameTemplate: 'flash_sale',
    badgeText: 'TẶNG CỌ RỬA',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    clicks: 980
  }
];

// Initial Banners & Event
const defaultBanners = [
  {
    id: 'banner-1',
    title: 'SỰ KIỆN LỚN TIKTOK SHOP - PAYDAY SUPER SALE',
    subtitle: 'Săn Deal Đồng Giá 1K & Mã Freeship Không Giới Hạn!',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    link: 'https://vt.tiktok.com/event/payday',
    tag: 'PAYDAY SALE',
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'LIVESTREAM ĐẶC BIỆT - KỜ LỜ DÒNG DEAL SỐC',
    subtitle: 'Voucher Giảm 50% Cho Mọi Sản Phẩm Hot Trend',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
    link: 'https://vt.tiktok.com/event/live',
    tag: 'TIKTOK LIVE',
    isActive: true
  },
  {
    id: 'banner-3',
    title: 'SIÊU HỘI MỸ PHẨM & THỜI TRANG 2026',
    subtitle: 'Cam Kết Hàng Chính Hãng TikTok Verified 100%',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    link: 'https://vt.tiktok.com/event/fashion',
    tag: 'MALL EXCLUSIVE',
    isActive: true
  }
];

const defaultEventConfig = {
  eventName: 'SỰ KIỆN TIKTOK LIVE & FLASH SALE SỐC',
  eventTag: 'ĐANG DIỄN RA',
  endTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(), // 12 hours from now
  voucherCode: 'TIKTOK50K',
  subtitle: 'Ưu đãi cực lớn dành riêng cho khách hàng nhấp link TikTok Affiliate!'
};

// Helper to read JSON file or write default
function readJSON(filePath: string, fallback: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Ensure initial files exist
readJSON(PRODUCTS_FILE, defaultProducts);
readJSON(BANNERS_FILE, { banners: defaultBanners, event: defaultEventConfig });
readJSON(ANALYTICS_FILE, { totalClicks: 11690, dailyStats: {} });

// --- API ROUTES ---

// 1. Scrape TikTok / Product Metadata API
app.post('/api/scrape-tiktok', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Vui lòng cung cấp đường dẫn URL hợp lệ!' });
    }

    const cleanUrl = url.trim();
    console.log(`[Scraper] Parsing URL: ${cleanUrl}`);

    // Set fallback extracted values
    let extracted = {
      title: '',
      price: 0,
      originalPrice: 0,
      discountPercent: 0,
      image: '',
      affiliateUrl: cleanUrl,
      category: 'Công nghệ',
      isVerified: true
    };

    try {
      // Attempt HTTP fetch with standard browser headers
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        redirect: 'follow'
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract OpenGraph / Meta tags
      const ogTitle = $('meta[property="og:title"]').attr('content') || 
                      $('meta[name="twitter:title"]').attr('content') || 
                      $('title').text();

      const ogImage = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="twitter:image"]').attr('content') ||
                      $('link[rel="image_src"]').attr('href');

      const ogDescription = $('meta[property="og:description"]').attr('content') || 
                            $('meta[name="description"]').attr('content');

      // Price extraction from Meta or JSON-LD
      let priceText = $('meta[property="product:price:amount"]').attr('content') || 
                      $('meta[property="og:price:amount"]').attr('content');

      // Parse JSON-LD if available
      let jsonLdPrice = 0;
      let jsonLdTitle = '';
      let jsonLdImage = '';

      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          if (json['@type'] === 'Product' || json['@type'] === 'IndividualProduct') {
            jsonLdTitle = json.name || '';
            if (json.image) {
              jsonLdImage = Array.isArray(json.image) ? json.image[0] : json.image;
            }
            if (json.offers) {
              const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
              jsonLdPrice = parseFloat(offer.price || offer.lowPrice || 0);
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      });

      if (ogTitle) extracted.title = ogTitle.trim();
      if (jsonLdTitle) extracted.title = jsonLdTitle.trim();

      if (ogImage) extracted.image = ogImage;
      if (jsonLdImage) extracted.image = jsonLdImage;

      if (priceText) {
        extracted.price = parseInt(priceText.replace(/\D/g, ''), 10) || 0;
      } else if (jsonLdPrice > 0) {
        extracted.price = jsonLdPrice;
      }

      // Try price extraction from title or description text (e.g. "Son Bbia - 139k", "Chỉ 139.000đ")
      const textForPrice = `${extracted.title} ${ogDescription || ''} ${html}`;
      const priceMatch = textForPrice.match(/(?:giá|chỉ|giảm|deal|bán)\s*(?:còn)?\s*:?\s*([\d\.,]+)\s*(?:k|đ|vnd)/i);
      if (!extracted.price && priceMatch) {
        let matchedVal = priceMatch[1].replace(/[\.,]/g, '');
        let num = parseInt(matchedVal, 10);
        if (num < 1000 && num > 1) num = num * 1000; // e.g. 139 -> 139000
        if (num > 1000) extracted.price = num;
      }

    } catch (scrapeErr) {
      console.log('[Scraper] Direct HTTP fetch failed, using fallback parser:', scrapeErr);
    }

    // Heuristics & Smart Completion if field is missing or redirect/short link
    if (!extracted.title || extracted.title.length < 5) {
      // Create title from URL path or default
      const urlSegment = cleanUrl.split('/').filter(Boolean).pop() || '';
      const cleanSegment = decodeURIComponent(urlSegment).replace(/[-_]/g, ' ').replace(/\?.*$/, '');
      if (cleanSegment.length > 3) {
        extracted.title = `Sản Phẩm TikTok Hot Trend - ${cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1)}`;
      } else {
        extracted.title = 'Sản Phẩm TikTok Shop Hot Trend - Deal Giảm Sốc';
      }
    }

    // Clean up title
    extracted.title = extracted.title
      .replace(/\| TikTok/gi, '')
      .replace(/TikTok Shop/gi, 'TikTok Shop')
      .replace(/\s+/g, ' ')
      .trim();

    // Fill realistic prices if 0
    if (!extracted.price || extracted.price < 5000) {
      // Pick sensible random demo price based on keywords
      const lowerTitle = extracted.title.toLowerCase();
      if (lowerTitle.includes('son') || lowerTitle.includes('kem') || lowerTitle.includes('mỹ phẩm')) {
        extracted.price = 149000;
        extracted.originalPrice = 250000;
        extracted.category = 'Mỹ phẩm';
      } else if (lowerTitle.includes('áo') || lowerTitle.includes('quần') || lowerTitle.includes('váy') || lowerTitle.includes('thời trang')) {
        extracted.price = 119000;
        extracted.originalPrice = 199000;
        extracted.category = 'Thời trang';
      } else if (lowerTitle.includes('nồi') || lowerTitle.includes('máy') || lowerTitle.includes('gia dụng')) {
        extracted.price = 490000;
        extracted.originalPrice = 790000;
        extracted.category = 'Đồ gia dụng';
      } else if (lowerTitle.includes('kính') || lowerTitle.includes('ốp') || lowerTitle.includes('sạc')) {
        extracted.price = 45000;
        extracted.originalPrice = 90000;
        extracted.category = 'Phụ kiện';
      } else {
        extracted.price = 189000;
        extracted.originalPrice = 320000;
        extracted.category = 'Công nghệ';
      }
    } else {
      extracted.originalPrice = Math.round((extracted.price * 1.6) / 1000) * 1000;
    }

    // Calculate discount percent
    if (extracted.originalPrice > extracted.price) {
      extracted.discountPercent = Math.round(((extracted.originalPrice - extracted.price) / extracted.originalPrice) * 100);
    } else {
      extracted.discountPercent = 35;
    }

    // High quality default image if none found
    if (!extracted.image || !extracted.image.startsWith('http')) {
      const lowerCat = extracted.category.toLowerCase();
      if (lowerCat.includes('mỹ phẩm')) {
        extracted.image = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
      } else if (lowerCat.includes('thời trang')) {
        extracted.image = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
      } else if (lowerCat.includes('gia dụng')) {
        extracted.image = 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80';
      } else {
        extracted.image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
      }
    }

    // Attempt Gemini AI Enhancement if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `Bạn là chuyên gia Marketing TikTok Shop. Hãy tối ưu hóa tiêu đề sản phẩm này cho ngắn gọn, giật gân, chuẩn TikTok Affiliate (dưới 90 ký tự, tiếng Việt): "${extracted.title}". Trả về JSON duy nhất format {"title": "..."}.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        });

        const text = response.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.title) extracted.title = parsed.title;
        }
      } catch (aiErr) {
        console.log('[Gemini AI] Enhancement skipped:', aiErr);
      }
    }

    return res.json({
      success: true,
      data: extracted
    });

  } catch (error: any) {
    console.error('Error in /api/scrape-tiktok:', error);
    return res.status(500).json({ error: 'Không thể bóc tách dữ liệu từ đường dẫn này. Vui lòng nhập thủ công!' });
  }
});

// 2. CORS Proxy for Images (to load images onto Canvas without CORS errors)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url query parameter');
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy image error:', err);
    return res.status(500).send('Error fetching remote image');
  }
});

// 3. Products Endpoints
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, defaultProducts);
  return res.json({ success: true, products });
});

app.post('/api/products', (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct.title || !newProduct.affiliateUrl) {
      return res.status(400).json({ error: 'Thiếu thông tin tiêu đề hoặc đường dẫn Affiliate!' });
    }

    const products = readJSON(PRODUCTS_FILE, defaultProducts);

    const productToSave = {
      id: newProduct.id || `prod-${Date.now()}`,
      title: newProduct.title,
      originalPrice: Number(newProduct.originalPrice) || 0,
      price: Number(newProduct.price) || 0,
      discountPercent: Number(newProduct.discountPercent) || 0,
      image: newProduct.image || '',
      affiliateUrl: newProduct.affiliateUrl,
      category: newProduct.category || 'Khác',
      soldCount: Number(newProduct.soldCount) || Math.floor(Math.random() * 500) + 10,
      rating: Number(newProduct.rating) || 4.9,
      isVerified: newProduct.isVerified !== false,
      isFeatured: Boolean(newProduct.isFeatured),
      isVisible: newProduct.isVisible !== false,
      frameTemplate: newProduct.frameTemplate || 'flash_sale',
      badgeText: newProduct.badgeText || 'SALE SỐC',
      createdAt: newProduct.createdAt || new Date().toISOString(),
      clicks: 0
    };

    products.unshift(productToSave); // Newest first
    writeJSON(PRODUCTS_FILE, products);

    return res.json({ success: true, product: productToSave });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lưu sản phẩm!' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const products = readJSON(PRODUCTS_FILE, defaultProducts);

    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
    }

    products[index] = { ...products[index], ...updatedData };
    writeJSON(PRODUCTS_FILE, products);

    return res.json({ success: true, product: products[index] });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật sản phẩm!' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    let products = readJSON(PRODUCTS_FILE, defaultProducts);

    products = products.filter((p: any) => p.id !== id);
    writeJSON(PRODUCTS_FILE, products);

    return res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa sản phẩm!' });
  }
});

app.post('/api/products/reset', (req, res) => {
  writeJSON(PRODUCTS_FILE, defaultProducts);
  return res.json({ success: true, products: defaultProducts, message: 'Đã khôi phục sản phẩm mẫu!' });
});

// 4. Banners & Events Endpoints
app.get('/api/banners', (req, res) => {
  const data = readJSON(BANNERS_FILE, { banners: defaultBanners, event: defaultEventConfig });
  return res.json({ success: true, ...data });
});

app.post('/api/banners', (req, res) => {
  try {
    const { banners, event } = req.body;
    const currentData = readJSON(BANNERS_FILE, { banners: defaultBanners, event: defaultEventConfig });

    const newBanners = banners || currentData.banners;
    const newEvent = event || currentData.event;

    const updated = { banners: newBanners, event: newEvent };
    writeJSON(BANNERS_FILE, updated);

    return res.json({ success: true, ...updated });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật banner!' });
  }
});

// 5. Analytics & Click Tracking
app.post('/api/track-click', (req, res) => {
  try {
    const { productId } = req.body;
    const products = readJSON(PRODUCTS_FILE, defaultProducts);
    const analytics = readJSON(ANALYTICS_FILE, { totalClicks: 11690, dailyStats: {} });

    analytics.totalClicks = (analytics.totalClicks || 0) + 1;

    if (productId) {
      const idx = products.findIndex((p: any) => p.id === productId);
      if (idx !== -1) {
        products[idx].clicks = (products[idx].clicks || 0) + 1;
        writeJSON(PRODUCTS_FILE, products);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    analytics.dailyStats[today] = (analytics.dailyStats[today] || 0) + 1;

    writeJSON(ANALYTICS_FILE, analytics);
    return res.json({ success: true, totalClicks: analytics.totalClicks });
  } catch (err) {
    return res.status(500).json({ error: 'Lỗi ghi nhận lượt nhấp!' });
  }
});

app.get('/api/analytics', (req, res) => {
  const analytics = readJSON(ANALYTICS_FILE, { totalClicks: 11690, dailyStats: {} });
  const products = readJSON(PRODUCTS_FILE, defaultProducts);

  return res.json({
    success: true,
    totalClicks: analytics.totalClicks,
    totalProducts: products.length,
    activeProducts: products.filter((p: any) => p.isVisible).length,
    topClickedProducts: [...products].sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5)
  });
});

// --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TikTok Affiliate App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
