import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { MENU_CATEGORIES as seedCategories, MENU_ITEMS as seedItems } from './src/menuData';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const CONFIG_FILE = path.join(process.cwd(), 'data', 'app_config.json');
const ITEMS_FILE = path.join(process.cwd(), 'data', 'menu_items.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'menu_categories.json');

const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const loadConfig = () => {
  ensureDataDir();
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading config file, using default', e);
    }
  }
  const defaultConfig = {
    appName: "الدُّكَّان التُّرَاثِي",
    appSubtitle: "البيضة المقشرة ومقهى الشاي",
    topNotification: "يسعدنا استقبالكم في فرع جدة البلد (استكانة مجانية لطلبات الفطور الفجري بالدكان!)",
    addressText: "سوق الندى - شارع شحاتة",
    phoneNumber: "0530370440",
    whatsappNumber: "0530370440",
    primaryColor: "#584430",
    primaryColorHover: "#3d2e1f",
    secondaryColor: "#c49258",
    backgroundColor: "#fcf9f2",
    textColor: "#4a3b2c",
    fontFamily: "Amiri",
    footerCopyrightText: "حقوق الطبع محفوظة ٢٠٢٦ © دكان مطعم البيضة المقشرة واستكانة الشاي",
    instagramLink: "albaydah_jeddah",
    snapchatLink: "albaydah_snap"
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  return defaultConfig;
};

const loadCategories = () => {
  ensureDataDir();
  if (fs.existsSync(CATEGORIES_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading categories, using seed', e);
    }
  }
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(seedCategories, null, 2), 'utf-8');
  return seedCategories;
};

const loadItems = () => {
  ensureDataDir();
  if (fs.existsSync(ITEMS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading items, using seed', e);
    }
  }
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(seedItems, null, 2), 'utf-8');
  return seedItems;
};

// State references
let currentConfig = loadConfig();
let currentCategories = loadCategories();
let currentItems = loadItems();

// Admin credentials (customizable in .env or defaulting to admin/admin123)
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

// Auth Login API
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: 'albaydah_secret_admin_token_2026' });
  } else {
    res.status(401).json({ success: false, error: 'اسم مستخدم أو كلمة مرور غير صحيحة، حاول مجدداً يا طيب!' });
  }
});

// Config APIs
app.get('/api/config', (req, res) => {
  res.json(currentConfig);
});

app.post('/api/config', (req, res) => {
  try {
    const newConfig = { ...currentConfig, ...req.body };
    currentConfig = newConfig;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    res.json({ success: true, config: currentConfig });
  } catch (error: any) {
    res.status(500).json({ error: 'عطل في حفظ إعدادات المظهر المحدثة.' });
  }
});

// Categories APIs
app.get('/api/categories', (req, res) => {
  res.json(currentCategories);
});

app.post('/api/categories', (req, res) => {
  try {
    currentCategories = req.body;
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(currentCategories, null, 2), 'utf-8');
    res.json({ success: true, categories: currentCategories });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حفظ التصنيفات الحية.' });
  }
});

// Items list and CRUD
app.get('/api/items', (req, res) => {
  res.json(currentItems);
});

app.post('/api/items', (req, res) => {
  try {
    const itemData = req.body;
    
    if (!itemData.name || !itemData.price || !itemData.category) {
      res.status(400).json({ error: 'الاسم والسعر والتصنيف حقول إجبارية من فضلك.' });
      return;
    }

    if (itemData.id) {
      // Edit existing
      const index = currentItems.findIndex((it: any) => it.id === itemData.id);
      if (index !== -1) {
        currentItems[index] = { ...currentItems[index], ...itemData };
      } else {
        currentItems.push(itemData);
      }
    } else {
      // Create new
      const nextId = 'm' + (Math.max(...currentItems.map((it: any) => {
        const parsed = parseInt(it.id.replace(/[^\d]/g, ''));
        return isNaN(parsed) ? 100 : parsed;
      })) + 1);
      
      const newItem = {
        id: nextId,
        ...itemData,
        extras: itemData.extras || []
      };
      currentItems.push(newItem);
    }
    
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(currentItems, null, 2), 'utf-8');
    res.json({ success: true, items: currentItems });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حفظ الصنف في قائمة الأطعمة الخلفية.' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    currentItems = currentItems.filter((it: any) => it.id !== id);
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(currentItems, null, 2), 'utf-8');
    res.json({ success: true, items: currentItems });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل حذف الصنف.' });
  }
});


// Initialize Google Gen AI lazily or check if key exists
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// System instruction for our AI Character "عم بكر" (Uncle Bakr)
const uncleBakrInstruction = `
أنت "عم بكر"، الشيف والمضيف والعم التراثي الأصيل لمطعم "البيضة المقشرة واستكانة الشاي" الواقع في قلب جدة البلد التاريخية (سوق الندى، شارع شحاتة).
شخصيتك:
- تتحدث باللهجة الحجازية الجداوية التقليدية الدافئة المليئة بالحب والترحيب (مثل: "يا سيدي"، "يا واد"، "يا ستي"، "يا طعم"، "أبشر بسعدك"، "مجرى العافية"، "من عيوني").
- كريم جداً وفخور بالتراث الحجازي وحكاوي جدة القديمة والروشان والزقاق التاريخي.
- خفيف الظل، بشوش، تنادي الزبائن بـ "يا طيب" أو "يا ست الكل" أو "يا بطل".

منيو مطعم "البيضة المقشرة واستكانة الشاي":
1. المطبق:
   - مطبق خضار (سادة 8 ر.س، مع جبنة شيلي 10 ر.س، مع جبنة سائلة 10 ر.س، مع جبنة مالحة 10 ر.س، دبل خضار 12 ر.س).
   - مطبق متنوع: الزمن الجميل (12 ر.س)، مطبق البيضة المقشرة الخاص (14 ر.س)، مطبق تونة (10 ر.س).
   - مطبق حلو: حلو موز (8 ر.س)، حلو جبنة (8 ر.س)، حلو مالح (10 ر.س)، لبنة مع العسل (10 ر.س)، لبنة مع الزعتر (10 ر.س)، نوتيلا (12 ر.س).
2. الفطائر:
   - فطائر سادة وبيض: فطيرة سادة (1.5 ر.س)، فطيرة بيض (3 ر.س)، فطيرة بيض دبل (4.5 ر.س)، فطيرة أومليت بالمايونيز (10 ر.س)، أومليت بصلصة سيراتشا بالمايونيز (10 ر.س).
   - فطائر جبن: فطيرة جبنة (3 ر.س)، فطيرة جبنتين (4.5 ر.س)، جبنة بالمربى (4.5 ر.س)، جبنة وشيبس عمان عكاوي ولذيذ (5 ر.س)، جبنة مربى وشيبس عمان (6 ر.س)، جبنتين بالمربى (6 ر.س)، جبنتين شيبس عمان (6 ر.س)، دبل جبنة مربى شيبس عمان (7 ر.س).
   - فطائر أخرى: تونة (6 ر.س)، تونة جبن (7 ر.س)، تونة جبنتين (8 ر.س)، سمسم (3 ر.س)، مربى (3 ر.س)، كبدة بلدي (6 ر.س)، مقلقل (6 ر.س)، فطيرة البيضة المقشرة الخاصة (بيض، جبن، زيتون) بـ 6 ر.س فقط!، ملوح صاج (5 ر.س).
3. معصوب وعريكة ومرسى وفتة:
   - المعصوب: سادة (7 ر.س)، قشطة (10 ر.س)، قشطة عسل (12 ر.س)، صاج (12 ر.س)، سكري (15 ر.س)، معصوب البيضة المقشرة الفاخر (قشطة، عسل، سمن، جبن، مكسرات، كورن فليكس) بـ 22 ر.س.
   - العريكة: سادة (7 ر.س)، تمر وقشطة (10 ر.س)، قشطة جبن عسل (15 ر.س)، بالسمن البلدي (15 ر.س)، عريكة إسبيشل (قشطة، تمر، مكسرات، جبن) بـ 17 ر.س، عريكة البيضة المقشرة الإمبراطورية (قشطة، حليب مكثف، جبن، سمن، كورن فليكس، كاجو، عسل) بـ 20 ر.س.
   - المرسى: سادة (8 ر.س)، سمن عسل (12 ر.س)، مشكل (قشطة، موز، سمن، عسل) بـ 15 ر.س.
   - الفتة: فتة تمر سادة (5 ر.س)، فتة تمر بالقشطة والعسل (10 ر.س)، مكس (10 ر.س)، زبيدي (14 ر.س)، فتة إسبيشل (22 ر.س)، مغش فتة في قدر حجر تراثي بـ 25 ر.س.
4. الفول والفاصوليا والبازلاء والأطباق المتنوعة:
   - فول سادة (15 ر.س)، فاصوليا سادة (15 ر.س)، بازلاء سادة (15 ر.س).
   - مكس فاصوليا وفول وبازلاء (15 ر.س)، شكشوكة عدني حامية (15 ر.س)، بيض تركي (10 / 15 ر.س)، لحسة بيض وجبنة (15 ر.س)، تونة مطبوخة (15 ر.س).
5. الكبدة واللحوم:
   - كبدة بلدي طازة جاهزة (20 ر.س)، لحم مقلقل بلدي (20 ر.س)، لحم مفروم بلدي (20 ر.س).
   - عُقَد: عقدة دجاج (15 ر.س)، عقدة لحم (20 ر.س)، عقدة تونة (10 / 15 ر.س)، عقدة جمبري ممتازة (20 ر.س).
6. المشروبات الساخنة:
   - شاي جمر (5 ر.س)، شاي كرك هيل وزعفران (5 ر.س)، شاهي عدني بالحليب الهامور (1.5 ر.س)، شاهي عدني مفور (3 ر.س)، شاي برتقال وأعشاب مثل شاي بالزعتر (5 ر.س) أو شاي فتلة (10 ر.س)، شاي أخضر (2 ر.س).
   - تيرامس ترامس شاي جمر / كرك / عدني بسعات مختلفة للإخوة والجمعات (من 8 ر.س إلى 45 ر.س).
   - القهوة: تركي سادة / بالحليب (10 ر.س)، بن مفور (3 ر.س)، نسكافيه بالدواء (5 ر.س)، دلة قهوة سعودي تراثية تقدم مع التمر الفاخر (20 / 25 / 30 ر.س).
7. العصائر والخلطات الخاصة (خصوصاً خلطات الأفوكادو):
   - عصائر كلاسيكية طازجة (برتقال، مانجو، أناناس، عوار قلب، أصفهاني، كركديه بارد).
   - خلطات أفوكادو فريدة من نوعها: أفوكادو ملكي بالمكسرات والعسل (13 ر.س)، حب استوائي بالفراولة والموز والأفوكادو، طاقة خضراء مع الكاجو والكيوي.
   - عصائر صحية: عصير النضارة، ديتوكس منعش، وعصير بربر التراثي اليمني بالرطب والعسل والحلبة.
8. الأصناف الجانبية:
   - سحاوق جبن فاخر (5 ر.س)، بطاطس جيزاني أصيل، وبطاطس مدفون (من 5 إلى 15 ر.س).

أهدافك في الإجابة:
1. انصح الزوار بما يناسب مزاجهم أو جوهم (فطور حجازي متكامل، تحلية بعد العصر بـ معصوب أو عريكة مع استكانة شاهي كرك حار، عشاء خفيف كبده ومطبق).
2. حدثهم عن ذكريات جدة البلد، شارع شحاتة، سوق الندى، والبيوت القديمة مثل بيت نصيف.
3. وجّه الإجابة دائماً بروح سعودية حجازية أصيلة وودودة جداً.
4. حافظ على قصر الردود ولطافتها لتكون سهلة القراءة في صندوق الدردشة.
`;

// Gemini API Route to consult Uncle Bakr
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userMood } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'من فضلك ارسل قائمة بالرسائل لخدمتك.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return a graceful custom simulated fallback response if API key is missing
      const fallbackReplies = [
        "يا هلا ومرحبا بيك يا طيب! شكل مفتاح البركة (مفتاح API) مو مضبوط، لكن عمك بكر يرحب بيك ويقلك: جرب المطبق التراي والمعدّ بحب، أو عريكة البيضة المقشرة الإمبراطورية مع استكانة شاهي كرك هيل وزعفران! وش تحب أخدملك فيه يا سيدي؟",
        "يا ميت أهلاً وسهلا في بلدنا وجدة التاريخية! تبي الفطور الحجازي التمام؟ اطلب كبدة بلدي طازجة مع مغش فتة في قدر الحجر، ودفاها بجمال شاهي جمر دافئ. نورت حارتنا يا عسل!",
        "يسعد لي هالطلة يا طعم! المطبق بالجبن وشيبسي عمان حكاية تانية يرويها سوق الندى! ودك بحلو؟ مالك إلا معصوب البيضة المقشرة بالقشطة والعسل والكورن فليكس. تفضل تفضل اطلب ما تشتهي!"
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      res.json({ reply: randomReply });
      return;
    }

    // Prepare content query
    // Map existing messaging format into string or structured roles
    // We will build a single generation prompts combining context or use standard chat
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: uncleBakrInstruction,
        temperature: 0.9,
      },
    });

    // We can send the last user message and provide the history context or send the whole thread
    const userMessage = messages[messages.length - 1];
    const promptString = userMood
      ? `[مزاج الزائر الحالي: ${userMood}]. الرسالة: ${userMessage.content}`
      : userMessage.content;

    const response = await chat.sendMessage({
      message: promptString,
    });

    const replyText = response.text || "أبشر بسعدك يا غالي، جرب لقمة دافية وبلغني برأيك!";
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Error in chat API:', err);
    res.status(500).json({
      error: 'اعتذر منك يا سيدي، حصل أمر طارئ في مطبخي التراثي. جرب تسألني بعد شوية!',
      details: err.message,
    });
  }
});

// Real-time Order database state in-memory
interface OrderItem {
  id: string;
  name: string;
  price: number;
  count: number;
  selectedExtras: { name: string; price: number }[];
}

interface Order {
  id: string;
  userName: string;
  userPhone?: string;
  tableNumber?: string;
  orderMethod: 'dinein' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: string;
}

// In-memory orders array seeded with 3 beautiful historic heritage orders
const orders: Order[] = [
  {
    id: "NADA-102",
    userName: "أبو بندر الحجازي",
    userPhone: "0554321098",
    orderMethod: "delivery",
    items: [
      {
        id: "m7-",
        name: "مطبق البيضة المقشرة الخاص حقنا 🍳",
        price: 14,
        count: 2,
        selectedExtras: []
      },
      {
        id: "h6-",
        name: "عريكة البيضة المقشرة الإمبراطورية 🍯",
        price: 20,
        count: 1,
        selectedExtras: []
      }
    ],
    subtotal: 48,
    taxes: 7.2,
    total: 48,
    status: "preparing",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
  },
  {
    id: "NADA-101",
    userName: "العم ممدوح سندي",
    tableNumber: "طاولة 4 (الروشان القديم)",
    orderMethod: "dinein",
    items: [
      {
        id: "m1-",
        name: "مطبق خضار سادة 🫓",
        price: 8,
        count: 1,
        selectedExtras: [
          { name: "جبنة شيلي حارة", price: 2 }
        ]
      },
      {
        id: "d2-",
        name: "شاي كرك بالهيل والزعفران ☕",
        price: 5,
        count: 2,
        selectedExtras: []
      }
    ],
    subtotal: 20,
    taxes: 3.0,
    total: 20,
    status: "completed",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
  },
  {
    id: "NADA-103",
    userName: "الشيخة سارة الوجيه",
    tableNumber: "جلسة العائلة التاريخية",
    orderMethod: "dinein",
    items: [
      {
        id: "k5-",
        name: "كبدة بلدي طازة جاهزة بالطاوة 🥩",
        price: 20,
        count: 1,
        selectedExtras: []
      },
      {
        id: "h2-",
        name: "معصوب البيضة المقشرة السوبر الفاخر 🍌",
        price: 22,
        count: 1,
        selectedExtras: []
      }
    ],
    subtotal: 42,
    taxes: 6.3,
    total: 42,
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 mins ago
  }
];

let orderCounter = 104;

// API list orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API submit order
app.post('/api/orders', (req, res) => {
  try {
    const { userName, userPhone, tableNumber, orderMethod, items, subtotal, taxes, total } = req.body;
    
    if (!userName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'من فضلك املأ البيانات وحدد أصناف الطلب.' });
      return;
    }

    const newOrder: Order = {
      id: `NADA-${orderCounter++}`,
      userName,
      userPhone,
      tableNumber,
      orderMethod,
      items,
      subtotal,
      taxes,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder); // Add to the top of the list so new ones are seen first!
    res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: 'حدث عطل في إرسال طلبك للمطبخ التراثي.' });
  }
});

// API update order status
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'الحالة المدخلة للطلب غير سليمة.' });
    return;
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'لم نجد هذا الطلب في أرشيف سوق الندى.' });
    return;
  }

  order.status = status as any;
  res.json(order);
});

// API delete/cancel order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    res.status(404).json({ error: 'الطلب غير موجود.' });
    return;
  }

  orders.splice(orderIndex, 1);
  res.json({ message: 'تم إزالة الطلب من الأرشيف بنجاح.' });
});

// Implement Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`Heritage Al-Balad server running on port ${PORT}`);
  });
}

startServer();
