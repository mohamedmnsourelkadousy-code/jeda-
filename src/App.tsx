import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Info, 
  Phone, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Share2, 
  Award, 
  Coffee, 
  Grid,
  ChevronDown,
  Sparkles,
  Utensils,
  Maximize2
} from 'lucide-react';

import { MenuItem, CartItem } from './types';
import { MENU_CATEGORIES as defaultCategories, MENU_ITEMS as defaultItems, TESTIMONIALS } from './menuData';
import { 
  UI_TRANSLATIONS, 
  CATEGORIES_TRANSLATIONS, 
  STORIES_TRANSLATIONS, 
  TESTIMONIALS_TRANSLATIONS, 
  ITEMS_TRANSLATIONS, 
  translateMenuItem 
} from './translations';

// Modular component imports
import ThreeDTiltCard from './components/ThreeDTiltCard';
import HeritageHero from './components/HeritageHero';
import StorySection from './components/StorySection';
import UncleBakrChat from './components/UncleBakrChat';
import CartDrawer from './components/CartDrawer';
import Dashboard from './components/Dashboard';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('albaydah_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('albaydah_lang', lang);
  }, [lang]);

  const t = (key: keyof typeof UI_TRANSLATIONS['ar']) => {
    return UI_TRANSLATIONS[lang][key] || UI_TRANSLATIONS['ar'][key];
  };

  const [currentView, setCurrentView] = useState<'store' | 'dashboard'>('store');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('albaydah_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCategory, setActiveCategory] = useState('mutabbaq');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [onlySpecials, setOnlySpecials] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Floating high-contrast notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic state declarations
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultItems);
  const [menuCategories, setMenuCategories] = useState<any[]>(defaultCategories);
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

  // Pull all live modifications from database folders
  const loadShopData = async () => {
    try {
      const configResp = await fetch('/api/config');
      if (configResp.ok) {
        const configData = await configResp.json();
        setConfig(configData);
      }
      const itemsResp = await fetch('/api/items');
      if (itemsResp.ok) {
        const itemsData = await itemsResp.json();
        setMenuItems(itemsData);
      }
      const catsResp = await fetch('/api/categories');
      if (catsResp.ok) {
        const catsData = await catsResp.json();
        setMenuCategories(catsData);
      }
    } catch (err) {
      console.error('Error fetching admin content dynamically:', err);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  // Sync cart to localstorage
  useEffect(() => {
    localStorage.setItem('albaydah_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = (item: MenuItem, selectedExtras: { name: string; price: number }[]) => {
    const translatedItem = translateMenuItem(item, lang);
    const extrasKey = selectedExtras.map(e => e.name).sort().join('_');
    const uniqueId = `${item.id}-${extrasKey}`;

    const extrasPrice = selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
    const addedPrice = item.price + extrasPrice;

    setCart(prev => {
      const exists = prev.find(i => i.id === uniqueId);
      if (exists) {
        showToast(lang === 'en' ? `Increased quantity of ${translatedItem.name} in cart! ✨` : `تم زيادة كمية ${translatedItem.name} في السلة البلدي! ✨`);
        return prev.map(i => i.id === uniqueId ? { ...i, count: i.count + 1 } : i);
      } else {
        showToast(lang === 'en' ? `Added ${translatedItem.name} to your table! 🥘` : `أضفنا ${translatedItem.name} إلى فطورك الهانئ! 🥘`);
        return [
          ...prev,
          {
            id: uniqueId,
            itemId: item.id,
            name: translatedItem.name,
            basePrice: item.price,
            price: addedPrice,
            count: 1,
            selectedExtras: selectedExtras
          }
        ];
      }
    });
  };

  // Helper mechanism when Uncle Bakr adds a special item dynamically by name
  const handleAddSpecialItemByName = (itemName: string) => {
    const found = menuItems.find(i => i.name.includes(itemName) || itemName.includes(i.name));
    if (found) {
      handleAddToCart(found, []);
      setIsCartOpen(true);
    } else {
      // Find default special مطبق البيضة المقشرة
      const special = menuItems.find(i => i.id === 'm7');
      if (special) {
        handleAddToCart(special, []);
        setIsCartOpen(true);
      }
    }
  };

  const handleUpdateCount = (id: string, newCount: number) => {
    if (newCount <= 0) {
      handleRemoveItem(id);
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, count: newCount } : item));
    }
  };

  const handleRemoveItem = (id: string) => {
    const found = cart.find(i => i.id === id);
    if (found) {
      showToast(lang === 'en' ? `Removed ${found.name} from cart.` : `تم إزالة ${found.name} من السلة.`);
    }
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    showToast(lang === 'en' ? "Cart emptied successfully." : "تم إفراغ سلة التجهيز بنجاح.");
  };

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter & Sort core process
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.section && item.section.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecials = !onlySpecials || item.accentColor === 'amber';
    return matchesCategory && matchesSearch && matchesSpecials;
  }).sort((a, b) => {
    if (priceSort === 'asc') return a.price - b.price;
    if (priceSort === 'desc') return b.price - a.price;
    return 0; // default order
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.count, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#4a3b2c] font-sans antialiased overflow-x-hidden selection:bg-[#d4a373] selection:text-white pb-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Theme Color Injection Tag */}
      <style>{`
        :root {
          --primary: ${config.primaryColor || '#584430'};
          --primary-hover: ${config.primaryColorHover || '#3d2e1f'};
          --secondary: ${config.secondaryColor || '#c49258'};
          --bg-main: ${config.backgroundColor || '#fcf9f2'};
          --text-color: ${config.textColor || '#4a3b2c'};
          --font-sans: "${config.fontFamily || 'Cairo'}", system-ui, -apple-system, sans-serif;
        }
        
        body, html, input, button, textarea, select, div, span, p, h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-sans) !important;
        }
        
        body, .min-h-screen {
          background-color: var(--bg-main) !important;
        }

        .bg-\[\#584430\] {
          background-color: var(--primary) !important;
        }
        .hover\:bg-\[\#3d2e1f\]:hover {
          background-color: var(--primary-hover) !important;
        }
        .text-\[\#584430\] {
          color: var(--primary) !important;
        }
        .text-\[\#4a3b2c\] {
          color: var(--text-color) !important;
        }
        .border-\[\#ebdcb3\] {
          border-color: var(--secondary) !important;
        }
        .text-\[\#c49258\] {
          color: var(--secondary) !important;
        }
        .bg-\[\#3d2e1f\] {
          background-color: var(--primary-hover) !important;
        }
        .bg-\[\#3e2f21\] {
          background-color: var(--primary-hover) !important;
        }
        .text-\[\#ebdcb3\] {
          color: var(--secondary) !important;
          filter: brightness(1.2);
        }
        button.bg-\[\#584430\] {
          background-color: var(--primary) !important;
        }
        button.bg-\[\#584430\]:hover {
          background-color: var(--primary-hover) !important;
        }
      `}</style>
      
      {/* Top Beautiful Announcement Bar */}
      <div className="bg-[#3d2e1f] text-white py-2 px-4 text-center text-xs font-bold relative z-25 flex justify-center items-center gap-1 border-b border-[#c49258]/30">
        <Sparkles className="w-4 h-4 text-[#fedc97] animate-pulse" />
        <span className="font-display">
          {lang === 'en' && (config.topNotification === "يسعدنا استقبالكم في فرع جدة البلد (استكانة مجانية لطلب فطور الفجر!)" || config.topNotification.includes("يسعدنا استقبالكم") || config.topNotification.includes("فطور الفجر"))
            ? t('topNotification')
            : config.topNotification}
        </span>
      </div>

      {/* Main Decorative Header */}
      <header className="sticky top-0 z-30 bg-[#fdfaf2]/90 backdrop-blur-md border-b-2 border-[#f1e4c3] shadow-xs px-4 md:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left Side: Traditional Cart Trigger & Live Dashboard Toggle Switch */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#584430] hover:bg-[#3d2e1f] text-white w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            id="cart_sticky_head_trigger"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            
            {/* Animate-ping badge count */}
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-[#e76f51] border-2 border-[#fdfaf2] text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartItemsCount}
              </span>
            )}
          </button>
          
          {/* Symmetrical Dual State Switcher */}
          <div className="flex items-center bg-[#f0e7d0]/40 p-1.5 rounded-full border border-[#ebdcb3] shadow-inner select-none shrink-0 scale-90 sm:scale-100 origin-right">
            <button
              onClick={() => setCurrentView('store')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:cursor-pointer flex items-center gap-1 ${
                currentView === 'store'
                  ? 'bg-[#584430] text-white shadow-sm font-extrabold'
                  : 'text-[#8c7b6c] hover:text-[#584430]'
              }`}
            >
              <span>🏠</span>
              <span className="hidden xs:inline">{t('storeFront')}</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:cursor-pointer flex items-center gap-1 ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-tr from-amber-600 to-[#c49258] text-white shadow-sm font-extrabold'
                  : 'text-[#8c7b6c] hover:text-[#584430]'
              }`}
            >
              <span>📊</span>
              <span className="hidden xs:inline">{t('dashboard')}</span>
            </button>
          </div>

          {/* Compact English/Arabic Toggle Selector */}
          <button
            onClick={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 rounded-full text-xs font-black border border-[#ebdcb3] bg-white text-[#584430] hover:bg-[#ebdcb3]/20 shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 scale-90 sm:scale-100"
            title={lang === 'ar' ? "Switch to English" : "التحويل للعربية"}
          >
            <span>🌐</span>
            <span>{t('langLabel')}</span>
          </button>

          {cartItemsCount > 0 && (
            <div className="hidden lg:flex flex-col text-left text-xs text-[#584430] font-bold">
              <span className="text-[10px] text-[#a1907e] uppercase">{t('cartTotal')}</span>
              <span>{cartTotalPrice} {t('currencyUnit')}</span>
            </div>
          )}
        </div>

        {/* Center: Beautiful Traditional Hand-drawn Style Text Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xl md:text-2xl font-black text-[#584430] font-serif tracking-tight pr-1">
              {lang === 'en' && (config.appName === "الدُّكَّان التُّرَاثِي" || !config.appName || config.appName.includes("الدكان"))
                ? t('originalAppTitle')
                : config.appName}
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4a373] to-[#e76f51] flex items-center justify-center text-white text-md shadow-md">
              🍳
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#c49258] font-bold font-display mt-0.5">
            {lang === 'en' && (config.appSubtitle === "البيضة المقشرة ومقهى الشاي" || !config.appSubtitle || config.appSubtitle.includes("البيضة المقشرة"))
              ? t('originalAppSubtitle')
              : config.appSubtitle}
          </span>
        </div>

        {/* Right Side: Simple Address & Reservation Shortcut */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-[#8c7b6c] block font-semibold">{t('address')}</span>
            <span className="text-xs font-bold text-[#4a3b2c] font-display">
              {lang === 'en' && (config.addressText === "سوق الندى - شارع شحاتة" || !config.addressText || config.addressText.includes("سوق الندى"))
                ? t('exactAddressVal')
                : config.addressText}
            </span>
          </div>
          <a
            href={`tel:${config.phoneNumber || '0530370440'}`}
            className="bg-[#ebdcb3]/40 border border-[#c49258]/30 hover:bg-[#c49258]/10 px-4 py-2.5 rounded-full text-xs font-black text-[#584430] transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{config.phoneNumber}</span>
          </a>
        </div>
      </header>

      {currentView === 'store' ? (
        <>
          {/* Hero Visual Display with clocks and 3D fanoos shapes */}
          <HeritageHero onScrollToMenu={scrollToMenu} lang={lang} />

          {/* Primary Section: Filter, Search and 3D Food cards list */}
          <main className="max-w-6xl mx-auto px-4 py-12" ref={menuRef}>
            
            {/* Tab Filter Control Row */}
            <div className="space-y-6">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-[#c49258] uppercase tracking-wider block mb-1">{t('makerTitle')}</span>
                <h2 className="text-2xl md:text-3xl font-black text-[#584430] font-serif">{t('makerSubtitle')}</h2>
                <p className="text-xs text-[#8c7b6c] mt-1">{t('makerDesc')}</p>
              </div>

              {/* Symmetrical scrollable Arabic-themed filters menu tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start md:justify-center">
                {menuCategories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  const displayCatName = lang === 'en' ? (CATEGORIES_TRANSLATIONS[cat.id]?.en || cat.name) : cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery(''); // Clear search on tab click to avoid empty traps
                      }}
                      className={`border hover:cursor-pointer transition-all duration-300 px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm transform hover:scale-[1.03] active:scale-95 ${
                        isActive
                          ? 'bg-[#584430] text-white border-[#584430]'
                          : 'bg-white text-[#8c7b6c] border-[#ebdcb3] hover:border-[#c49258] hover:text-[#584430]'
                      }`}
                    >
                      <span className="text-sm">
                        {cat.id === 'mutabbaq' ? '🫓' : cat.id === 'fatair' ? '🥐' : cat.id === 'heritage' ? '🍯' : cat.id === 'platters' ? '🍳' : cat.id === 'meats' ? '🥩' : cat.id === 'hot_drinks' ? '☕' : cat.id === 'cold_drinks' ? '🍹' : '🍿'}
                      </span>
                      <span>{displayCatName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inline Live Filters: Search with sorting and Specials only checkbox */}
              <div className="bg-[#fdfbfa] border-2 border-[#f3e9d2] p-4 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center shadow-xs">
                {/* Search Input widget */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-amber-50/40 focus:bg-white border-2 border-[#f3e9d2] focus:border-[#c49258] text-right text-xs rounded-2xl pl-4 pr-10 py-2.5 outline-none font-sans"
                  />
                  <Search className="w-4 h-4 text-[#8c7b6c] absolute right-3.5 top-3.5" />
                </div>

                {/* Price sort option */}
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] text-[#8c7b6c] font-semibold">{t('priceSort')}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPriceSort('asc')}
                      className={`text-[10px] hover:cursor-pointer font-bold px-2.5 py-1.5 rounded-xl border ${
                        priceSort === 'asc' ? 'bg-[#c49258] text-white border-[#c49258]' : 'bg-white text-[#8c7b6c] border-[#f3e9d2] hover:border-[#c49258]'
                      }`}
                    >
                      {t('sortAsc')}
                    </button>
                    <button
                      onClick={() => setPriceSort('desc')}
                      className={`text-[10px] hover:cursor-pointer font-bold px-2.5 py-1.5 rounded-xl border ${
                        priceSort === 'desc' ? 'bg-[#c49258] text-white border-[#c49258]' : 'bg-white text-[#8c7b6c] border-[#f3e9d2] hover:border-[#c49258]'
                      }`}
                    >
                      {t('sortDesc')}
                    </button>
                    <button
                      onClick={() => setPriceSort('default')}
                      className={`text-[10px] hover:cursor-pointer font-bold px-2.5 py-1.5 rounded-xl border ${
                        priceSort === 'default' ? 'bg-[#c49258] text-white border-[#c49258]' : 'bg-white text-[#8c7b6c] border-[#f3e9d2] hover:border-[#c49258]'
                      }`}
                    >
                      {t('sortDefault')}
                    </button>
                  </div>
                </div>

                {/* Signature specials checkbox */}
                <div className="flex items-center justify-end gap-2 pr-2">
                  <label htmlFor="specials_toggle" className="text-xs font-bold text-[#5c4a36] hover:cursor-pointer select-none">
                    {t('onlySpecials')}
                  </label>
                  <input
                    type="checkbox"
                    id="specials_toggle"
                    checked={onlySpecials}
                    onChange={e => setOnlySpecials(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-[#c49258] border-[#c49258] focus:ring-[#c49258] hover:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Items Cards List containing 3D Mouse orientation mechanics */}
            <div className="mt-8">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#eedfaf] p-8 max-w-md mx-auto space-y-4 shadow-sm">
                  <Utensils className="w-12 h-12 text-[#c49258] mx-auto opacity-40 animate-pulse" />
                  <h4 className="font-extrabold text-md text-[#5c4a36] font-display">{t('noItemsFound')}</h4>
                  <p className="text-xs text-[#8c7b6c] leading-relaxed">
                    {t('noItemsDesc')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setOnlySpecials(false);
                      setPriceSort('default');
                    }}
                    className="bg-amber-100 hover:bg-amber-200 text-[#584430] text-[10px] font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('resetFilters')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredItems.map(item => (
                    <ThreeDTiltCard
                      key={item.id}
                      item={translateMenuItem(item, lang) as any}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Al-Balad Historical Narrative and local folklore landmarks */}
          <StorySection lang={lang} />

          {/* Community Testimonials & local reviews with lovely traditional avatar icons */}
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#c49258] block mb-1">{t('testimonialsTitle')}</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#584430] font-serif">{t('testimonialsHeader')}</h2>
              <p className="text-xs text-[#8c7b6c] mt-1">{t('testimonialsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS_TRANSLATIONS.map((tItem, idx) => {
                const displayName = lang === 'en' ? tItem.name_en : tItem.name_ar;
                const displayRole = lang === 'en' ? tItem.role_en : tItem.role_ar;
                const displayText = lang === 'en' ? tItem.text_en : tItem.text_ar;
                const displayDate = lang === 'en' ? tItem.date_en : tItem.date_ar;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#ebdcb3] rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3 text-right ltr:text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-[10px] font-sans">{displayDate}</span>
                        <div className="flex gap-1">
                          {[...Array(tItem.rating)].map((_, i) => (
                            <span key={i} className="text-amber-400 text-xs">⭐</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#5d4c3b] leading-relaxed italic text-justify">
                        "{displayText}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 justify-end ltr:justify-start mt-4 pt-4 border-t border-slate-50 text-right ltr:text-left">
                      <div className="ltr:text-left">
                        <h4 className="text-xs font-black text-[#4a3b2c]">{displayName}</h4>
                        <p className="text-[10px] text-[#9a8571] mt-0.5">{displayRole}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#fdfaf2] border border-[#ebdcb3] flex items-center justify-center text-xl">
                        {tItem.avatar}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
          <Dashboard onRefreshAll={loadShopData} lang={lang} />
        </div>
      )}

      {/* Traditional footer detailing locations, hotlines, and credentials */}
      <footer className="bg-[#3e2f21] text-[#ebdcb3] pt-12 pb-6 px-4 md:px-8 relative overflow-hidden text-right ltr:text-left">
        {/* Lattice styling watermark bottom */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ebdcb3_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#ebdcb3]/10">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end ltr:justify-start">
              <span className="text-md font-black font-serif">
                {lang === 'en' && (config.appName === "الدُّكَّان التُّرَاثِي" || !config.appName || config.appName.includes("الدكان"))
                  ? t('originalAppTitle')
                  : config.appName}
              </span>
              <span className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-xs">🍳</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#c3b4a2] max-w-xs md:mr-auto ltr:md:ml-auto">
              {lang === 'en' ? t('footerBio') : "بوابة النظافة والجودة التراثية في سائر دكاكين الفطور والعشاء الحجازي بجدة البلد التاريخية. نرحب بكم بكل بركة ولطف."}
            </p>
            <p className="text-[10px] text-[#c49258] font-bold">
              {lang === 'en' && (config.footerCopyrightText === "حقوق الطبع محفوظة ٢٠٢٦ © دكان مطعم البيضة المقشرة واستكانة الشاي" || !config.footerCopyrightText || config.footerCopyrightText.includes("حقوق الطبع محفوظة"))
                ? t('footerCopyright')
                : config.footerCopyrightText}
            </p>
          </div>

          {/* Col 2: Useful links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold border-b border-[#ebdcb3]/10 pb-2">{t('usefulLinks')}</h4>
            <ul className="space-y-2 text-xs text-[#c3b4a2] pr-1 ltr:pl-1">
              {lang === 'en' ? (
                <>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">Plain & Sweet Mutabbaq</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">Griddle Saj Egg & Cheese Fatair</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">Deluxe Heavy Imperial Masoub</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">Royal Saffron Karak Tea & Coffee</button></li>
                </>
              ) : (
                <>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">مطبق خضار وحلو</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">فطائر صاج وجبن وشيبس عمان</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">معصوب البيضة المقشرة السوبر</button></li>
                  <li><button onClick={scrollToMenu} className="hover:text-white transition-colors hover:cursor-pointer">عريكة إمبراطورية بالكاجو وعسل</button></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Contact & address */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold border-b border-[#ebdcb3]/10 pb-2">{t('hoursTitle')}</h4>
            <div className="space-y-2 text-xs text-[#c3b4a2]">
              <div className="flex items-center justify-end gap-1.5 ltr:justify-start">
                <span>{t('hoursText')}</span>
                <Clock className="w-3.5 h-3.5 text-[#c49258]" />
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[#fff8ea] ltr:justify-start">
                <span>{config.phoneNumber}</span>
                <Phone className="w-3.5 h-3.5 text-[#c49258]" />
              </div>
              <p className="text-[10px] text-[#a1907e] text-right md:-mr-1 ltr:text-left">
                {lang === 'en' ? "Follow our historical journey @albaydah_jeddah" : `يسعدنا مشاركة اللحظات على الوسم التراثي @${config.instagramLink || 'البيضة_المقشرة'}`}
              </p>
            </div>
          </div>

          {/* Col 4: Locality credentials info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold border-b border-[#ebdcb3]/10 pb-2">{t('heritageEntrance')}</h4>
            <div className="space-y-2 text-xs text-[#c3b4a2] flex flex-col items-end ltr:items-start">
              <div className="flex items-start justify-end gap-1.5 ltr:justify-start">
                <span className="text-right ltr:text-left">
                  {lang === 'en' ? "Souq Al-Nada, Shehata Street next to Nasif Historic House" : `${config.addressText}، بجانب رواشين آل نصيف التاريخية - جدة البلد`}
                </span>
                <MapPin className="w-4 h-4 text-[#c49258] shrink-0 mt-0.5" />
              </div>
              <div className="bg-amber-950/20 border border-[#c49258]/20 p-2.5 rounded-xl text-[10px] text-[#c49258] mt-1 text-center w-full">
                👑 <b>{t('pledgeTitle')}</b> {t('pledgeText')}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-6 text-[10px] text-[#a39383] font-sans">
          {t('footerBottom')}
        </div>
      </footer>

      {/* Floating high-contrast Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#c49258] border-2 border-white text-white px-5 py-3.5 rounded-2xl shadow-2xl font-sans text-xs font-bold flex items-center gap-2"
          >
            <div className="bg-white/10 rounded-full p-1 leading-none">✨</div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uncle Bakr chatbot dialog drawer */}
      <UncleBakrChat onAddSpecialItemToCartByName={handleAddSpecialItemByName} lang={lang} />

      {/* Cart Drawer and receipt sheet */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateCount={handleUpdateCount}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        lang={lang}
      />
    </div>
  );
}
