import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Order, OrderStatus, MenuItem } from '../types';

interface DashboardProps {
  onClose?: () => void;
  onRefreshAll?: () => void; // Triggers parent storefront state refresh
  lang?: 'ar' | 'en';
}

const RELEVANT_ICONS = [
  { name: 'Layers', label: 'طبقات (مطبق)' },
  { name: 'Egg', label: 'بيض (فطائر)' },
  { name: 'Flame', label: 'لهب ومبخر' },
  { name: 'Soup', label: 'حساء وإيدام' },
  { name: 'UtensilsCrossed', label: 'طعام ومنيو' },
  { name: 'Coffee', label: 'قهوة وشاهي' },
  { name: 'Cherry', label: 'عصير طبيعي' },
  { name: 'Cookie', label: 'جانبيات وبطاطس' },
  { name: 'Award', label: 'وسام ملوكي' },
  { name: 'Crown', label: 'تاج النخبة' },
  { name: 'Gem', label: 'ياقوت وأفودكادو' },
  { name: 'Droplet', label: 'عسل وقطرة' },
  { name: 'Sparkles', label: 'مطبخ سحري' },
  { name: 'Home', label: 'بيت ودكان' },
  { name: 'History', label: 'زمن قديم' }
];

const FONTS_LIST = [
  { value: 'Cairo', label: 'خط كايرو الحجازي (افتراضي عريض)' },
  { value: 'Tajawal', label: 'خط تجول اليدوي (ناعم وجذاب)' },
  { value: 'Amiri', label: 'خط أميري التراثي (أصيلي تاريخي)' },
  { value: 'Aref Ruqaa', label: 'خط عارف رقعة التاريخي (خط رقعة أصيل وجذاب)' },
  { value: 'Reem Kufi', label: 'خط ريم كوفي الحجازي العتيق (هندسي كوفي تراثي)' },
  { value: 'Inter', label: 'خط إنتر السلك الحجازي' }
];

export default function Dashboard({ onClose, onRefreshAll, lang = 'ar' }: DashboardProps) {
  // Admin Login Credentials State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('albaydah_admin_token') === 'albaydah_secret_admin_token_2026';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // General Dashboard Navigation Tab
  // 'orders' (Live order tracking) or 'settings' (Branding and colors) or 'menu' (Add/edit food items)
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'menu'>('orders');

  // Shared state loaded from APIs
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
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
    fontFamily: "Cairo",
    footerCopyrightText: "حقوق الطبع محفوظة ٢٠٢٦ © دكان مطعم البيضة المقشرة واستكانة الشاي",
    instagramLink: "albaydah_jeddah",
    snapchatLink: "albaydah_snap"
  });

  // Orders table filters
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Save Feedback message State
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Menu item Form State
  const [itemForm, setItemForm] = useState({
    id: '', // empty string indicates we are adding a new product
    name: '',
    price: 10,
    category: 'mutabbaq',
    section: 'أصناف مختارة',
    description: '',
    imageIcon: 'Layers',
    imageUrl: '', // attached Base64 or external url image
    accentColor: '', // empty or 'amber'
    extras: [] as { name: string; price: number }[]
  });
  
  // Auxiliary menu item state
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState(2);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Fetch orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    else setIsRefreshing(true);
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setOrdersError(null);
      } else {
        throw new Error('فشل جلب قائمة الطلبات');
      }
    } catch (err: any) {
      setOrdersError(err.message || 'حدث خطأ في ربط لوحة التحكم بالخادم');
    } finally {
      setLoadingOrders(false);
      setIsRefreshing(false);
    }
  };

  // Fetch configs and items list
  const fetchConfigAndMenu = async () => {
    try {
      // Config fetch
      const cfResp = await fetch('/api/config');
      if (cfResp.ok) {
        const data = await cfResp.json();
        setConfig(data);
      }
      
      // Items fetch
      const itemsResp = await fetch('/api/items');
      if (itemsResp.ok) {
        const data = await itemsResp.json();
        setMenuItems(data);
      }

      // Categories fetch
      const catsResp = await fetch('/api/categories');
      if (catsResp.ok) {
        const data = await catsResp.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching admin modules data", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchConfigAndMenu();
      
      const interval = setInterval(() => {
        fetchOrders(true);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Admin Login trigger
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        localStorage.setItem('albaydah_admin_token', data.token);
        setIsLoggedIn(true);
        setLoginError(null);
      } else {
        setLoginError(data.error || 'فصل الاتصال بالخادم، اسم المستخدم أو الرمز خاطئ');
      }
    } catch (err) {
      setLoginError('فشل خط الأمان التراثي، تأكد من اتصال الخادم.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Admin Logout trigger
  const handleLogout = () => {
    localStorage.removeItem('albaydah_admin_token');
    setIsLoggedIn(false);
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        triggerToastFeedback('تم تحديث حالة الطلب بنجاح يا مروق!');
      } else {
        alert('فشل تحديث حالة الصحن');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ شبكي لم يتلق الطلب تحديثاً');
    }
  };

  // Delete live order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('مؤكد حذف الطلب نهائياً وتطهير سجل سوق الندى؟')) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        triggerToastFeedback('تم حذف الطلب نهائياً.');
      } else {
        alert('فشل حذف الطلب');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Dynamic Style Branding settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (resp.ok) {
        triggerToastFeedback('تم تحديث الألوان والفونتات والتفاصيل حية في الواجهة! 🎉');
        if (onRefreshAll) onRefreshAll(); // Propagate to parent client-only state
      } else {
        alert('حدثت مشكلة في الخادم لحفظ الإعدادات');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ شبكي لحفظ المظهر');
    }
  };

  // File drag & drop and selector helpers for food images
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('من فضلك ارفع ملف صورة صالح عافاك الله!');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً يا سيدي! يرجى رفع صورة أقل من 4 ميجابايت لتوفير سعة الخادم.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setItemForm(prev => ({ ...prev, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Save / Edit / Add food item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.category) {
      alert('خطأ: من فضلك حدد الاسم والتصنيف الأساسي للمأكولات');
      return;
    }
    try {
      const resp = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm)
      });
      if (resp.ok) {
        const data = await resp.json();
        setMenuItems(data.items || currentItemsFromFormPatch(itemForm));
        triggerToastFeedback(itemForm.id ? 'تم تعديل المأكول باقتدار! 🍛' : 'أضفنا صنفاً جديداً للمنيو! 🍳');
        setItemForm({
          id: '',
          name: '',
          price: 10,
          category: categories[0]?.id || 'mutabbaq',
          section: 'أصناف النخبة',
          description: '',
          imageIcon: 'Layers',
          imageUrl: '',
          accentColor: '',
          extras: []
        });
        if (onRefreshAll) onRefreshAll();
      } else {
        alert('فشل تسجيل المنيو بالخادم.');
      }
    } catch (err) {
      console.error(err);
      alert('فشل ربط البيانات لحفظ الأصناف');
    }
  };

  // helper to fallback locally if backend replies with generic success
  const currentItemsFromFormPatch = (form: typeof itemForm) => {
    if (form.id) {
      return menuItems.map(it => it.id === form.id ? { ...it, ...form } : it);
    } else {
      return [...menuItems, { ...form, id: 'temp-' + Date.now() }];
    }
  };

  // Edit item action (populates form)
  const handleEditItemAction = (item: any) => {
    setItemForm({
      id: item.id || '',
      name: item.name || '',
      price: item.price || 10,
      category: item.category || 'mutabbaq',
      section: item.section || 'أصناف مختارة',
      description: item.description || '',
      imageIcon: item.imageIcon || 'Layers',
      imageUrl: item.imageUrl || '',
      accentColor: item.accentColor || '',
      extras: item.extras || []
    });
    // Scroll smoothly to item form
    const itemFormContainer = document.getElementById('food-item-form-anchor');
    if (itemFormContainer) {
      itemFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete food item permanently
  const handleDeleteItemAction = async (itemId: string) => {
    if (!window.confirm('هل أنت متأكد من مسح هذا الصنف من منيو الدكان نهائياً؟ لن تظهر للعملاء.')) return;
    try {
      const resp = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        const data = await resp.json();
        setMenuItems(data.items || menuItems.filter(it => it.id !== itemId));
        triggerToastFeedback('تم حذف الصنف من المنيو بنجاح.');
        if (onRefreshAll) onRefreshAll();
      } else {
        alert('فشل عملية الحذف من المنيو');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addExtraToFormList = () => {
    if (!newExtraName.trim()) return;
    setItemForm(prev => ({
      ...prev,
      extras: [...prev.extras, { name: newExtraName.trim(), price: Number(newExtraPrice) || 0 }]
    }));
    setNewExtraName('');
    setNewExtraPrice(2);
  };

  const removeExtraFromFormList = (extName: string) => {
    setItemForm(prev => ({
      ...prev,
      extras: prev.extras.filter(e => e.name !== extName)
    }));
  };

  const triggerToastFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Order metrics computing
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = 
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.id && o.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.userPhone && o.userPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const filteredMenuItems = menuItems.filter(it => {
    const term = menuSearchQuery.toLowerCase();
    return it.name.toLowerCase().includes(term) || 
           (it.description && it.description.toLowerCase().includes(term)) ||
           it.category.toLowerCase().includes(term);
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-amber-200">⏳ جاري الانتظار</span>;
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">👨‍🍳 بالمقايل والنار</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-200">✅ تم التلقيم</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-full border border-slate-200">❌ ملغي</span>;
    }
  };

  // ----------------------------------------------------
  // ----------------------------------------------------
  // ADMIN LOGIN PANEL (If not logged in)
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#fdfaf2] rounded-3xl border-2 border-[#ebdcb3] shadow-2xl relative overflow-hidden text-right ltr:text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 ltr:right-auto ltr:left-0 w-32 h-32 bg-[#ebdcb3]/10 rounded-bl-full ltr:rounded-br-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 ltr:left-auto ltr:right-0 w-24 h-24 bg-[#c49258]/5 rounded-tr-full ltr:rounded-tl-full pointer-events-none" />
        
        {/* Plate Icon illustration */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4a373] to-[#ebdcb3] flex items-center justify-center text-3xl shadow-md mb-3">
            🗝️
          </div>
          <h2 className="text-xl font-black text-[#584430] font-sans">
            {lang === 'en' ? "Heritage Admin Portal" : "بوابة الإدارة التراثية"}
          </h2>
          <p className="text-[10px] text-[#9a8571] font-bold mt-1">
            {lang === 'en' ? "Historic Hijazi Shop Dashboard | Al-Baydah & Tea" : "الدُّكَّان التُّراثي للبيضة المقشرة ومقهى الشاي"}
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-[#5c4936] mb-1.5 text-right ltr:text-left">
              {lang === 'en' ? "Admin Username 👤" : "اسم أدمن المحراب 👤"}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'en' ? "e.g., admin" : "مثال: admin"}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full text-right ltr:text-left px-4 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden focus:border-[#c49258] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5c4936] mb-1.5 text-right ltr:text-left">
              {lang === 'en' ? "Secret Password 🔑" : "رمز الدخول السري 🔑"}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full text-right ltr:text-left px-4 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden focus:border-[#c49258] transition-colors"
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-lg text-xs bg-red-50 text-red-700 font-bold border border-red-100 leading-relaxed text-right ltr:text-left">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full hover:cursor-pointer bg-[#584430] hover:bg-[#3d2e1f] text-white py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-102"
          >
            {loginLoading ? (
              <span>{lang === 'en' ? "Connecting to Sanctuary..." : "جاري الفك والربط..."}</span>
            ) : (
              <>
                <span>{lang === 'en' ? "Open Admin Panel 🛠️" : "افتح لوحة الإدارة 🛠️"}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-[#9a8571] mt-6 leading-relaxed">
          {lang === 'en' 
            ? "* Default workspace credentials (Username: admin, Password: admin123)."
            : "* الإعدادات الافتراضية للرمز السري هي (المستخدم: admin والرمز: admin123) ويمكن تعديلها عبر ملفات الخادم بأي لحظة."
          }
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN ADMIN PANEL CONTROLS
  // ----------------------------------------------------
  return (
    <div className="bg-white/95 rounded-3xl border-2 border-[#ebdcb3]/60 shadow-xl p-4 md:p-8 animate-fade-in relative text-right ltr:text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Saving Notification Toast */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#c49258] text-white text-xs font-extrabold px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-2"
          >
            <span>✨</span>
            <span>{saveSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel with Stats & User Logout */}
      <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#ebdcb3] mb-6">
        <div className="text-right ltr:text-left">
          <h2 className="text-xl font-extrabold text-[#584430] font-sans">
            {lang === 'en' ? "Complete Sovereignty Panel 🏮" : "التحكم الحجازي الكامل للدكان الأصيل 🏮"}
          </h2>
          <p className="text-[10px] text-[#8c7b6c] font-semibold mt-0.5">
            {lang === 'en' ? "Edit menu items, upload photos, refine brand styling and coordinate receipts" : "تعديل المنيو والواجهة والمظهر والطلب في آن واحد"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-rose-50 hover:bg-rose-100 hover:cursor-pointer text-rose-700 text-xs font-black px-3 py-1.5 rounded-full border border-rose-200 transition-colors flex items-center gap-1"
          >
            <span>{lang === 'en' ? "Sign out" : "خروج الأدمن"}</span>
            <LucideIcons.LogOut className="w-3.5 h-3.5" />
          </button>
          
          <div className="bg-[#f0e7d0]/40 px-3 py-1.5 rounded-full border border-[#cbd5e1]/40 text-xs text-right ltr:text-left">
            🛡️ <span className="font-bold text-[#5c4936]">{lang === 'en' ? "Welcome back, Admin" : "أهلاً بك يا أدمن"}</span>
          </div>
        </div>
      </div>

      {/* Core Tabs Navigator Bar - ORDERS or CONFIG SETTINGS or MENU ITEMS */}
      <div className="flex flex-row-reverse border-b border-[#f3e9d2] mb-6 select-none bg-slate-50/70 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 hover:cursor-pointer py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#584430] text-white shadow-md'
              : 'text-[#8c7b6c] hover:bg-slate-100 hover:text-[#584430]'
          }`}
        >
          <span>
            {lang === 'en' ? "📋 Live Orders" : "📋 الطلبات الحية"}
            {orders.length > 0 && <span className="text-[10px] bg-amber-500 text-white rounded-full px-1.5 py-0.2 ml-1 mr-1">{orders.length}</span>}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 hover:cursor-pointer py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-[#584430] text-white shadow-md'
              : 'text-[#8c7b6c] hover:bg-slate-100 hover:text-[#584430]'
          }`}
        >
          <span>{lang === 'en' ? "🍳 Foods & Picture Uploads" : "🍳 إضافة المأكولات والصور"}</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 hover:cursor-pointer py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#584430] text-white shadow-md'
              : 'text-[#8c7b6c] hover:bg-slate-100 hover:text-[#584430]'
          }`}
        >
          <span>{lang === 'en' ? "🎨 Styling & Font Core" : "🎨 المظهر والألوان والفونتات"}</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: LIVE ORDERS QUEUE */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#fcfaf5] border border-[#ebdcb3]/60 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-[#8c7b6c] font-black uppercase">إجمالي مبيعات الدكان اليوم</span>
              <h3 className="text-xl font-mono font-black text-emerald-700 mt-1">{totalRevenue} <span className="text-[10px] font-bold font-sans">ر.س</span></h3>
            </div>
            <div className="bg-[#fcfaf5] border border-[#ebdcb3]/60 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-[#8c7b6c] font-black uppercase">الطلبات الجديدة المستلمة</span>
              <h3 className="text-xl font-mono font-black text-amber-600 mt-1">{pendingCount}</h3>
            </div>
            <div className="bg-[#fcfaf5] border border-[#ebdcb3]/60 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-[#8c7b6c] font-black uppercase">طلبات تحت التحضير</span>
              <h3 className="text-xl font-mono font-black text-blue-600 mt-1">{preparingCount}</h3>
            </div>
            <div className="bg-[#fcfaf5] border border-[#ebdcb3]/60 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-[#8c7b6c] font-black uppercase">مجموع الطلبات الكلي بجدة</span>
              <h3 className="text-xl font-mono font-black text-slate-700 mt-1">{orders.length}</h3>
            </div>
          </div>

          {/* Table Filters header */}
          <div className="flex flex-col md:flex-row-reverse justify-between items-stretch md:items-center gap-4 mb-4 bg-slate-50 p-4 rounded-2xl border border-[#ebdcb3]/30">
            {/* Search inputs */}
            <div className="relative flex-1 max-w-md">
              <SearchQueryInput val={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Order status filters */}
            <div className="flex flex-wrap flex-row-reverse items-center gap-1.5">
              <span className="text-xs text-slate-500 font-bold ml-1">تصفية حسب:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold hover:cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-[#584430] text-white shadow-sm' : 'bg-white border text-[#584430] hover:bg-slate-100'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold hover:cursor-pointer transition-colors ${
                  statusFilter === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                المعلقة ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('preparing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold hover:cursor-pointer transition-colors ${
                  statusFilter === 'preparing' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                قيد التجهيز ({preparingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold hover:cursor-pointer transition-colors ${
                  statusFilter === 'completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                الملقمة والمنتهية
              </button>
            </div>
          </div>

          {/* Orders list grids */}
          {loadingOrders ? (
            <div className="text-center py-12 text-[#9a8571] font-bold">
              <p className="animate-pulse">جاري فحص دفتار طلبات "البيضة المقشرة" من المطابخ...</p>
            </div>
          ) : ordersError ? (
            <div className="p-4 bg-red-100/60 text-red-800 rounded-xl text-center text-xs font-bold">{ordersError}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-[#9a8571] border-2 border-dashed border-[#ebdcb3] rounded-2xl bg-[#faf7f0]">
              <span className="text-3xl">🫓</span>
              <p className="text-xs font-black mt-2">لا يوجد طلبات تطابق معايير التصفية يا طيب!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-[#faf8f2] border border-[#ebdcb3] p-5 rounded-2xl text-right transition-shadow hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#f1e5cc]/80 pb-3 mb-3">
                    <span className="font-mono text-xs font-black bg-[#584430] text-white px-2.5 py-1 rounded-sm shadow-xs">
                      {order.id}
                    </span>
                    <div className="flex flex-col text-right">
                      <h4 className="text-xs font-black text-slate-800">{order.userName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#8c7b6c] justify-end">
                        {order.orderMethod === 'dinein' ? (
                          <span className="bg-[#f0e7d0] px-2 py-0.5 rounded-md font-bold text-[#5c4936]">🍽️ {order.tableNumber || 'طاولة رئيسية'}</span>
                        ) : (
                          <span className="bg-amber-100/60 px-2 py-0.5 rounded-md font-bold text-[#5c4936]">🚗 التوصيل: {order.userPhone}</span>
                        )}
                        <span>⏱️ {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-white/70 p-3 rounded-xl border border-dashed border-[#ebdcb3]/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-500">{item.price * item.count} ر.س</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{item.count}x {item.name}</span>
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="text-[10px] text-amber-700 mt-0.5 flex flex-row-reverse gap-1 flex-wrap">
                              {item.selectedExtras.map((ext, eidx) => (
                                <span key={eidx} className="bg-[#fdfaf2] px-1.5 py-0.2 rounded border border-[#ebdcb3]/50 font-medium">+{ext.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-1">
                    <div className="flex items-baseline gap-1 text-[#584430]">
                      <span className="text-xs text-[#8c7b6c] ml-1">إجمالي الصحن:</span>
                      <span className="text-md font-black font-mono">{order.total}</span>
                      <span className="text-[10px] text-[#c49258] font-bold">ر.س</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          👨‍🍳 إرسال للمطبخ
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'preparing') && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white hover:cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✅ تم التلقيم
                        </button>
                      )}

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-[#8c7b6c] hover:cursor-pointer text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200"
                        >
                          ❌ إلغاء
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-400 hover:text-red-700 hover:bg-red-50 hover:cursor-pointer p-1.5 rounded-lg transition-colors"
                        title="حذف من الأرشيف تماماً"
                      >
                        <LucideIcons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: BRANDING AND COLOR SETTINGS CUSTOMIZER */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="space-y-6 font-sans animate-fade-in text-right">
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-right leading-relaxed mb-4 text-xs text-[#5c4936]">
            ℹ️ <b>أداة تخصيص المظهر الحجازي:</b> يمكن للأدمن الآن التحكم الكامل بجميع ألوان الواجهة والخطوط الرئيسية، وجميع النصوص وشعار المحل. يتم تحديث الواجهة فورياً للزبائن دون إعادة تشغيل الخادم!
          </div>

          {/* Texts Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-black text-[#584430] border-b pb-2 mb-4">🏠 عناوين المتجر وتفاصيل الترويسة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الدكان الرئيسي</label>
                <input
                  type="text"
                  value={config.appName}
                  onChange={e => setConfig({ ...config, appName: e.target.value })}
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شعار العنوان التنسيقي</label>
                <input
                  type="text"
                  value={config.appSubtitle}
                  onChange={e => setConfig({ ...config, appSubtitle: e.target.value })}
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">شريط الإعلان المتحرك بالأعلى 💡</label>
                <input
                  type="text"
                  value={config.topNotification}
                  onChange={e => setConfig({ ...config, topNotification: e.target.value })}
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Theme Colors Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-black text-[#584430] border-b pb-2 mb-4">🎨 الألوان وعموميات الثيم والخطوط</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اللون الأساسي (أزرار ونصوص وتزيين)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-10 h-8 p-0 cursor-pointer rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-full text-center text-xs px-2.5 py-1.5 rounded-xl border border-[#ebdcb3]"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">لون التمييز والزخارف (الأصفر/الذهبي)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="w-10 h-8 p-0 cursor-pointer rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="w-full text-center text-xs px-2.5 py-1.5 rounded-xl border border-[#ebdcb3]"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">لون خلفية المتجر الرئيسية</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-10 h-8 p-0 cursor-pointer rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-full text-center text-xs px-2.5 py-1.5 rounded-xl border border-[#ebdcb3]"
                  />
                </div>
              </div>

              {/* Font Family Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نمط ونوع خط الكتابة (Font) ✍️</label>
                <select
                  value={config.fontFamily}
                  onChange={e => setConfig({ ...config, fontFamily: e.target.value })}
                  className="w-full text-right px-4 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                >
                  {FONTS_LIST.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Tekxt Color selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">لون خط نصوص الوصف الفرعية</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.textColor || '#4a3b2c'}
                    onChange={e => setConfig({ ...config, textColor: e.target.value })}
                    className="w-10 h-8 p-0 cursor-pointer rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={config.textColor || '#4a3b2c'}
                    onChange={e => setConfig({ ...config, textColor: e.target.value })}
                    className="w-full text-center text-xs px-2.5 py-1.5 rounded-xl border border-[#ebdcb3]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts and Footer */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-black text-[#584430] border-b pb-2 mb-4">📞 معلومات التواصل السريعة وعناصر الفوتر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف والاتصال</label>
                <input
                  type="text"
                  value={config.phoneNumber}
                  onChange={e => setConfig({ ...config, phoneNumber: e.target.value })}
                  placeholder="مثال: 0530370440"
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم واتساب لوضع سلة مباشرة</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={e => setConfig({ ...config, whatsappNumber: e.target.value })}
                  placeholder="مثال: 0530370440"
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البلدة والعنوان العيني (الفوتر)</label>
                <input
                  type="text"
                  value={config.addressText}
                  onChange={e => setConfig({ ...config, addressText: e.target.value })}
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حساب انستغرام</label>
                <input
                  type="text"
                  value={config.instagramLink}
                  onChange={e => setConfig({ ...config, instagramLink: e.target.value })}
                  placeholder="username_here"
                  className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">حقوق الملكية والنص التعريفي بالفوتر 📝</label>
                <textarea
                  value={config.footerCopyrightText}
                  onChange={e => setConfig({ ...config, footerCopyrightText: e.target.value })}
                  rows={2}
                  className="w-full text-right px-4 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 hover:cursor-pointer bg-[#584430] hover:bg-[#3d2e1f] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-md hover:scale-101 shrink-0"
          >
            <span>حفظ وتعميم التغييرات في الواجهة الرئيسية 🏛️</span>
          </button>
        </form>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 3: MENU ITEMS (FOOD LIST) MANAGER (ADD/EDIT/DELETE) */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'menu' && (
        <div className="space-y-8 font-sans animate-fade-in text-right">
          
          {/* Add Item Form Anchor Panel */}
          <div 
            id="food-item-form-anchor" 
            className="bg-[#fcfaf5] p-6 rounded-3xl border-2 border-dashed border-[#ebdcb3]">
            <h3 className="text-sm font-black text-[#584430] border-b pb-2 mb-4 flex items-center justify-between flex-row-reverse">
              <span>🍳 {itemForm.id ? 'تعديل الصنف المحدد حالياً' : 'إضافة صنف طعام جديد للمنيو'}</span>
              {itemForm.id && (
                <button
                  type="button"
                  onClick={() => setItemForm({
                    id: '',
                    name: '',
                    price: 10,
                    category: categories[0]?.id || 'mutabbaq',
                    section: 'أصناف مختارة',
                    description: '',
                    imageIcon: 'Layers',
                    imageUrl: '',
                    accentColor: '',
                    extras: []
                  })}
                  className="text-amber-700 hover:text-red-700 text-[10px] font-black underline hover:cursor-pointer"
                >
                  إلغاء التعديل والبدء بصنف جديد
                </button>
              )}
            </h3>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصنف (مثال: مطبق نوتيلا دبل)</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر شامل الضريبة (ر.س)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemForm.price}
                    onChange={e => setItemForm({ ...itemForm, price: Number(e.target.value) || 0 })}
                    className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3]"
                  />
                </div>

                {/* Main Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف الأساسي في التبويب</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full text-right px-4 py-2 text-xs bg-white rounded-xl border border-[#ebdcb3]"
                  >
                    {categories.length > 0 ? (
                      categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      <option value="mutabbaq">المطبق الفريد</option>
                    )}
                  </select>
                </div>

                {/* Sub section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم الفرعي المقرمش (مثال: مطبق حلو)</label>
                  <input
                    type="text"
                    value={itemForm.section}
                    onChange={e => setItemForm({ ...itemForm, section: e.target.value })}
                    className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3]"
                  />
                </div>

                {/* Description of item */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف الصنف وخلطته الخاصة (مثال: جبن شيدر بلدي مالح بالدقة الحجازية)</label>
                  <input
                    type="text"
                    value={itemForm.description}
                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full text-right px-4.5 py-2 text-xs rounded-xl bg-white border border-[#ebdcb3]"
                  />
                </div>
              </div>

              {/* Custom Image Uploader section with Drag & Drop and Preview */}
              <div className="bg-[#fdfdfc] p-4 rounded-2xl border border-[#ebdcb3]/60">
                <label className="block text-xs font-black text-[#584430] mb-2 text-right">صورة الصنف الحجازية (اختياري) 📸</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  
                  {/* Upload Dropzone Area (takes md:col-span-3) */}
                  <div className="md:col-span-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[100px] ${
                        isDragging
                          ? 'border-[#c49258] bg-[#fdf0d5]'
                          : 'border-[#ebdcb3] hover:border-[#c49258] hover:bg-amber-50/20'
                      }`}
                      onClick={() => document.getElementById('food-image-uploader-input')?.click()}
                    >
                      <input
                        type="file"
                        id="food-image-uploader-input"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1 text-amber-800 text-sm">
                        📤
                      </div>
                      <p className="text-[11px] font-bold text-[#5c4936]">
                        اسحب صورة الأكلة وأفلتها هنا، أو اضغط لتحديدها من جهازك
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        ندعم صيغ الصور (PNG, JPG, WebP) لتظهر فوراً للعملاء
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="flex flex-col items-center justify-center p-2 border border-slate-100 bg-white rounded-xl h-[100px] relative overflow-hidden">
                    {itemForm.imageUrl ? (
                      <div className="w-full h-full flex items-center justify-center group relative">
                        <img
                          src={itemForm.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setItemForm(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl text-slate-300">🍲</span>
                        <p className="text-[9px] text-slate-400 mt-1">لا توجد صورة</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Dynamic Extras Creator */}
              <div className="bg-white p-4 rounded-xl border border-[#ebdcb3]/60">
                <p className="text-xs font-extrabold text-[#5c4936] mb-2 border-b border-dashed pb-1">➕ إضافات اختيارية لتخصيص الزبون (مثال: دبل جبن، كرات زيادة)</p>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={addExtraToFormList}
                    className="bg-[#c49258] hover:bg-[#584430] text-white text-xs font-black px-4 py-1.5 rounded-lg hover:cursor-pointer transition-colors"
                  >
                    إضافة
                  </button>
                  <input
                    type="number"
                    value={newExtraPrice}
                    onChange={e => setNewExtraPrice(Number(e.target.value) || 0)}
                    placeholder="السعر (مثال: 2)"
                    className="w-24 text-center px-2 py-1 text-xs border rounded-lg focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={newExtraName}
                    onChange={e => setNewExtraName(e.target.value)}
                    placeholder="اسم الإضافة (مثال: دبل جبنة سائلة)"
                    className="flex-1 text-right px-3 py-1 text-xs border rounded-lg focus:outline-hidden"
                  />
                </div>

                {/* current form extras preview */}
                {itemForm.extras.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-end mt-1">
                    {itemForm.extras.map(e => (
                      <span key={e.name} className="bg-amber-50 text-[#584430] border border-[#ebdcb3]/60 text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 flex-row-reverse">
                        <button
                          type="button"
                          onClick={() => removeExtraFromFormList(e.name)}
                          className="text-red-600 hover:text-red-900 font-extrabold text-[12px] hover:cursor-pointer"
                        >
                          ×
                        </button>
                        <span>{e.name} (+{e.price} ر.س)</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-[#9a8571] text-right italic">لا توجد إضافات حالية لهذا الصنف.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 hover:cursor-pointer bg-[#584430] hover:bg-[#3d2e1f] text-white text-xs font-black rounded-xl shadow-md transition-all font-display hover:scale-101"
              >
                {itemForm.id ? '💾 تحديث تفاصيل الصنف بالمنيو والملقمات' : '🍳 حفظ وإدراج الصنف الجديد في قائمة المتجر'}
              </button>
            </form>
          </div>

          {/* Current Items List Display */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-right">
            <div className="flex flex-col sm:flex-row-reverse justify-between items-stretch sm:items-center gap-4 border-b pb-4 mb-4">
              <div className="text-right">
                <h4 className="text-sm font-black text-[#584430]">📌 أصناف المأكولات الحالية المنشورة بالمطعم ({menuItems.length})</h4>
                <p className="text-[10px] text-[#8c7b6c] mt-0.5 font-bold">💡 لتعديل أي صنف وإضافة أو تغيير صورته، اضغط على زر "تعديل وإضافة صورة 📸" بالأسفل وسيفتح لك النموذج بالأعلى فوراً!</p>
              </div>
              <div className="relative max-w-xs shrink-0 self-end sm:self-auto">
                <input
                  type="text"
                  placeholder="ابحث عن صنف لتمضية السعر أو حذفه..."
                  value={menuSearchQuery}
                  onChange={e => setMenuSearchQuery(e.target.value)}
                  className="w-full text-right pl-3 pr-8 py-1.5 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden"
                />
                <LucideIcons.Search className="w-3.5 h-3.5 absolute top-2.5 right-2.5 text-slate-400" />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-1">
              {filteredMenuItems.map(item => {
                const catObj = categories.find(c => c.id === item.category);
                return (
                  <div key={item.id} className="flex justify-between items-center py-3 hover:bg-white/40 px-3 rounded-xl transition-colors">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditItemAction(item)}
                        className="bg-amber-100/60 text-amber-900 border border-amber-200 hover:bg-[#c49258] hover:text-white transition-colors hover:cursor-pointer px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteItemAction(item.id)}
                        className="bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-600 hover:text-white transition-colors hover:cursor-pointer px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                      >
                        حذف نهائي
                      </button>
                    </div>

                    <div className="flex items-center gap-3 justify-end text-right">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {item.accentColor === 'amber' && (
                            <span className="text-[8px] bg-amber-500 text-white font-extrabold px-1 py-0.2 rounded-sm uppercase">ملوكي</span>
                          )}
                          <span className="text-xs text-[#8c7b6c] bg-[#ebdcb3]/30 px-2 rounded-full font-medium">{catObj?.name || item.category}</span>
                          <h5 className="text-xs font-black text-[#584430]">{item.name}</h5>
                        </div>
                        <p className="text-[10px] font-bold text-[#c49258] mt-0.5">{item.price} ر.س • {item.description ? item.description.substring(0, 48) + '...' : 'بلدي بامتياز'}</p>
                      </div>

                      {/* Display current item picture or icon placeholder */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#ebdcb3] shrink-0 bg-slate-100 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-lg" title="لا توجد صورة، سيتم عرض الأيقونة الافتراضية">
                            🍲
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Instructions details formatting */}
      <div className="mt-8 pt-4 border-t border-[#ebdcb3] text-center text-[10px] text-[#a0907e] font-sans">
        📌 <b>نصيحة التشغيل الجداوي:</b> عند إجراء أي تعديل للخطوط أو الستايلات، يتم تحديث المتجر في الوقت الفعلي لكل الزوار وبسرعة ناصعة البياض ببركة الربط! 🧡
      </div>
    </div>
  );
}

// Search inputs layout formatting
function SearchQueryInput({ val, onChange }: { val: string, onChange: (v: string) => void }) {
  return (
    <>
      <input
        type="text"
        placeholder="ابحث هاتفياً باسم العميل، الطاولة، أو رقم الطلب..."
        value={val}
        onChange={e => onChange(e.target.value)}
        className="w-full text-right pl-4 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#ebdcb3] focus:outline-hidden focus:border-[#c49258] transition-colors"
      />
      <LucideIcons.Search className="w-4 h-4 absolute top-3 right-3 text-[#c49258]" />
    </>
  );
}
