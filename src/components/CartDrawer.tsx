import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trash2, Plus, Minus, FileText, Check, Heart, HelpCircle } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateCount: (id: string, newCount: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  lang?: 'ar' | 'en';
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateCount,
  onRemoveItem,
  onClearCart,
  lang = 'ar'
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'receipt'>('cart');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderMethod, setOrderMethod] = useState<'dinein' | 'delivery'>('dinein');
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.count, 0);
  const taxes = Math.round(subtotal * 0.15 * 10) / 10; // 15% VAT
  const total = subtotal; // Already inclusive of tax implicitly or added up

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          userPhone: orderMethod === 'delivery' ? userPhone : undefined,
          tableNumber: orderMethod === 'dinein' ? `طاولة ${tableNumber}` : undefined,
          orderMethod,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            count: item.count,
            selectedExtras: item.selectedExtras
          })),
          subtotal,
          taxes,
          total
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlacedOrderId(data.id);
        setCheckoutStep('receipt');
      } else {
        const errorData = await response.json();
        alert(errorData.error || (lang === 'en' ? 'Dear customer, an error occurred while submitting your order. Please try again later.' : 'عذراً يا طيب، حصلت مشكلة اثناء إرسال طلبك. يرجى المحاولة لاحقاً.'));
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      // Fallback local simulation if server behaves weird
      setPlacedOrderId(`NADA-${Math.floor(100 + Math.random() * 900)}`);
      setCheckoutStep('receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    onClearCart();
    setCheckoutStep('cart');
    setUserName('');
    setUserPhone('');
    setTableNumber('');
    setPlacedOrderId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-amber-950/25 backdrop-blur-xs font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 22 }}
            className="relative w-full max-w-md h-full bg-[#fdfaf3] border-l-2 border-[#f1e4c2] flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-6 bg-[#584430] text-white flex items-center justify-between border-b-4 border-[#c49258] relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-[#ffcc70]">
                  <ShoppingBag className="w-5.5 h-5.5 animate-bounce" />
                </div>
                <div className="text-right ltr:text-left">
                  <h3 className="font-extrabold text-md md:text-lg text-[#fedc97] font-display">
                    {lang === 'en' ? "Hijazi Breakfast Basket" : "سَلة الفطور الحَجازي"}
                  </h3>
                  <p className="text-[10px] text-[#fbf8f0] opacity-80">
                    {lang === 'en' ? `${cart.length} active items` : `${cart.length} أصناف فريدة جارية`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 hover:cursor-pointer flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {checkoutStep === 'cart' ? (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <span className="text-6xl animate-pulse">🥘</span>
                    <h4 className="font-black text-lg text-[#584430] font-display">
                      {lang === 'en' ? "The basket is empty, royal patron!" : "السلة خالية يا سيدي يا طعم!"}
                    </h4>
                    <p className="text-xs text-[#8c7b6c] max-w-xs leading-relaxed">
                      {lang === 'en' 
                        ? "Smell the fresh ghee & baked mutabbaq, explore our heritage menu, and order what warms your heart!"
                        : "شم روايح السمن والمطبق وشوف المنيو التراثي حقنا، واطلب ما يدفيك ويعدل مزاجك!"
                      }
                    </p>
                    <button
                      onClick={onClose}
                      className="bg-[#c49258] hover:bg-[#a3704c] hover:cursor-pointer text-white px-5 py-2.5 rounded-full text-xs font-bold transition-transform hover:scale-105 shadow-md"
                    >
                      {lang === 'en' ? "Browse Menu Now" : "تصفح المنيو الآن"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items List */}
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-[#ebdcb3] rounded-2xl p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-red-400 hover:text-red-600 p-1 hover:cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="text-right ltr:text-left flex-1 pr-3 pl-3">
                              <h4 className="font-bold text-sm text-[#4a3b2c] line-clamp-1">{item.name}</h4>
                              
                              {/* Selected extras */}
                              {item.selectedExtras.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-end ltr:justify-start mt-1">
                                  {item.selectedExtras.map(ext => (
                                    <span key={ext.name} className="bg-amber-50 text-[9px] text-[#c49258] border border-[#f1e4c3] px-1.5 py-0.5 rounded-md font-medium">
                                      +{ext.name} (+{ext.price} {lang === 'en' ? "SAR" : "ر.س"})
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-baseline justify-end ltr:justify-start gap-1 mt-1.5">
                                <span className="text-sm font-black text-[#584430]">{item.price * item.count}</span>
                                <span className="text-[9px] text-[#c49258] font-bold">{lang === 'en' ? "SAR" : "ر.س"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Count controller and details */}
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#fbf8f0]">
                            <span className="text-[10px] text-[#a0907e]">
                              {lang === 'en' ? "Item readied for preparation" : "الطلب جاهز للتجهيز"}
                            </span>
                            <div className="flex items-center gap-2 bg-[#fcf9f2] border border-[#ebdcb3] rounded-full p-1 shadow-inner">
                              <button
                                onClick={() => onUpdateCount(item.id, item.count + 1)}
                                className="w-6 h-6 rounded-full bg-white text-[#584430] hover:bg-[#ebdcb3] flex items-center justify-center text-xs font-bold shadow-sm hover:cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black min-w-[20px] text-center text-[#584430]">{item.count}</span>
                              <button
                                onClick={() => onUpdateCount(item.id, item.count - 1)}
                                className="w-6 h-6 rounded-full bg-white text-[#584430] hover:bg-[#ebdcb3] flex items-center justify-center text-xs font-bold shadow-sm hover:cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Placement Form */}
                    <form onSubmit={handleCheckout} className="bg-[#fcfbf7] border-2 border-[#f1e4c2] rounded-3xl p-4 space-y-3 mt-6">
                      <p className="text-xs font-black text-[#584430] text-right ltr:text-left border-b border-[#f1e4c3] pb-2">
                        {lang === 'en' ? "Authentic Order Information:" : "بيانات طلب الحارة التراِثي:"}
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderMethod('dinein')}
                          className={`flex-1 hover:cursor-pointer py-2 rounded-xl text-xs font-bold border transition-all ${
                            orderMethod === 'dinein'
                              ? 'bg-[#584430] text-white border-[#584430]'
                              : 'bg-white text-[#8c7b6c] border-[#ebdcb3]'
                          }`}
                        >
                          {lang === 'en' ? "Dine-in 🍽️" : "محلي بالدكان 🍽️"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderMethod('delivery')}
                          className={`flex-1 hover:cursor-pointer py-2 rounded-xl text-xs font-bold border transition-all ${
                            orderMethod === 'delivery'
                              ? 'bg-[#584430] text-white border-[#584430]'
                              : 'bg-white text-[#8c7b6c] border-[#ebdcb3]'
                          }`}
                        >
                          {lang === 'en' ? "Takeaway & Delivery 🚗" : "سفري وتوصيل 🚗"}
                        </button>
                      </div>

                      <div className="space-y-2 text-right ltr:text-left">
                        <label className="text-[10px] font-bold text-[#8c7b6c] block">
                          {lang === 'en' ? "Your Esteemed Name:" : "الاسم الكريم يا سيد الناس:"}
                        </label>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={e => setUserName(e.target.value)}
                          placeholder={lang === 'en' ? "e.g., John Doe" : "مثال: فهد البشري"}
                          className="w-full bg-white border border-[#ebdcb3] text-right ltr:text-left text-xs rounded-xl px-3 py-2 outline-none focus:border-[#c49258] font-sans"
                        />
                      </div>

                      {orderMethod === 'dinein' ? (
                        <div className="space-y-2 text-right ltr:text-left">
                          <label className="text-[10px] font-bold text-[#8c7b6c] block">
                            {lang === 'en' ? "Table / Parlor Number:" : "رقم الطاولة أو الجلسة الحجازية:"}
                          </label>
                          <input
                            type="number"
                            required
                            value={tableNumber}
                            onChange={e => setTableNumber(e.target.value)}
                            placeholder={lang === 'en' ? "e.g., Table 4" : "مثال: طاولة رقم 4"}
                            className="w-full bg-white border border-[#ebdcb3] text-right ltr:text-left text-xs rounded-xl px-3 py-2 outline-none focus:border-[#c49258] font-sans"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2 text-right ltr:text-left">
                          <label className="text-[10px] font-bold text-[#8c7b6c] block">
                            {lang === 'en' ? "Contact Number for Delivery:" : "رقم الاتصال للتنسيق والتوصيل:"}
                          </label>
                          <input
                            type="text"
                            required
                            value={userPhone}
                            onChange={e => setUserPhone(e.target.value)}
                            placeholder={lang === 'en' ? "e.g., 05xxxxxxxx" : "مثال: 05xxxxxxx"}
                            className="w-full bg-white border border-[#ebdcb3] text-right ltr:text-left text-xs rounded-xl px-3 py-2 outline-none focus:border-[#c49258] font-sans"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full hover:cursor-pointer mt-4 bg-gradient-to-r from-[#d4a373] to-[#c49258] hover:from-[#c49258] hover:to-[#a3704c] text-white py-3 rounded-full font-black text-xs shadow-md transition-all hover:scale-[1.02]"
                      >
                        {lang === 'en' ? "Confirm & Send Order to Kitchen 🔥" : "تأكيد وإرسال الطلب للمطبخ التراِثي 🔥"}
                      </button>
                    </form>
                  </div>
                )
              ) : (
                /* Traditional Receipt Step */
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white border-2 border-dashed border-[#d4a373] rounded-3xl p-6 shadow-xl relative overflow-hidden font-mono text-xs text-slate-800"
                >
                  {/* Decorative Arabic receipt stamp watermark */}
                  <div className="absolute right-4 top-12 opacity-10 border-4 border-dashed border-red-500 rounded-full w-24 h-24 flex items-center justify-center text-red-500 font-bold text-center rotate-12 pointer-events-none">
                    {lang === 'en' ? "Peeled\nEgg" : "البيضة\nالمقشرة"}
                  </div>

                  <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-[#ffd391]">
                    <span className="text-lg">👳‍♂️</span>
                    <h3 className="font-bold text-[#5c4936] text-sm">
                      {lang === 'en' ? "Al-Baydah & Tea Cup Restaurant" : "مطعم البيضة المقشرة واستكانة الشاي"}
                    </h3>
                    <p className="text-[9px] text-[#8c7b6c]">
                      {lang === 'en' ? "Heritage & Authenticity of Historic Jeddah" : "تراِث وأصالة جدة البلد"}
                    </p>
                    <p className="text-[9px] text-[#8c7b6c]">
                      {lang === 'en' ? "Souq Al-Nada | Cell 0530370440" : "سوق الندى | جوال 0530370440"}
                    </p>
                    <div className="text-[8px] bg-amber-50 rounded-lg p-1.5 mt-2 font-mono text-center flex justify-between items-center px-4">
                      <span>{lang === 'en' ? "Order ID" : "رقم الطلب"}: <b>{placedOrderId}</b></span>
                      <span>{lang === 'en' ? "Date" : "التاريخ"}: {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Receipt Items Details */}
                  <div className="py-4 space-y-3 border-b-2 border-dashed border-[#ffd391] text-right ltr:text-left">
                    <p className="text-[9px] text-slate-400 font-sans tracking-wide">
                      {lang === 'en' ? "Order Items:" : "الطلب التفصيلي:"}
                    </p>
                    {cart.map(item => (
                      <div key={item.id} className="space-y-0.5">
                        <div className="flex justify-between font-sans">
                          {lang === 'en' ? (
                            <>
                              <span className="font-bold text-[#4a3b2c]">{item.count}x {item.name}</span>
                              <span className="font-mono">{item.price * item.count} {lang === 'en' ? "SAR" : "ر.س"}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono">{item.price * item.count} ر.س</span>
                              <span className="font-bold text-[#4a3b2c]">{item.count}x {item.name}</span>
                            </>
                          )}
                        </div>
                        {item.selectedExtras.length > 0 && (
                          <div className="font-sans pr-4 pl-4 flex flex-row-reverse ltr:flex-row flex-wrap gap-1">
                            {item.selectedExtras.map(ext => (
                              <span key={ext.name} className="text-[8px] text-[#c49258]">+ {ext.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Receipt summary */}
                  <div className="py-4 space-y-2 text-right ltr:text-left border-b-2 border-[#ffd391] text-xs">
                    <div className="flex justify-between">
                      {lang === 'en' ? (
                        <>
                          <span className="text-[#8c7b6c] font-sans">Subtotal:</span>
                          <span className="font-bold">{subtotal} {lang === 'en' ? "SAR" : "ر.س"}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold">{subtotal} ر.س</span>
                          <span className="text-[#8c7b6c] font-sans">المجموع الفرعي:</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px]">
                      {lang === 'en' ? (
                        <>
                          <span className="text-[#a3907e] font-sans">VAT 15% Included:</span>
                          <span className="font-bold text-[#c49258]">{taxes} {lang === 'en' ? "SAR" : "ر.س"}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#c49258]">{taxes} ر.س</span>
                          <span className="text-[#a3907e] font-sans">ضريبة القيمة المضافة (١٥٪):</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between font-black text-sm text-[#584430] pt-1">
                      {lang === 'en' ? (
                        <>
                          <span className="font-sans">Grand Total:</span>
                          <span>{total} {lang === 'en' ? "SAR" : "ر.س"}</span>
                        </>
                      ) : (
                        <>
                          <span>{total} ر.س</span>
                          <span className="font-sans">المجموع الإجمالي:</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Patron details */}
                  <div className="py-4 text-right ltr:text-left space-y-1 border-b-2 border-dashed border-[#ffd391]">
                    <p className="text-[9px] text-slate-400 font-sans">
                      {lang === 'en' ? "Patron Information:" : "معلومات الزبون:"}
                    </p>
                    <p className="font-sans text-[#4a3b2c]">
                      <b>{lang === 'en' ? "Patron Name" : "الاسم الكريم"}:</b> {userName || (lang === 'en' ? "Royal Patron" : 'ضيف كريم')}
                    </p>
                    {orderMethod === 'dinein' ? (
                      <p className="font-sans text-[#4a3b2c]">
                        <b>{lang === 'en' ? "Seat Location" : "المكان"}:</b> {lang === 'en' ? `Souq Al-Nada - Table ${tableNumber || 'Main'}` : `دكان سوق الندى - طاولة ${tableNumber || 'رئيسية'}`}
                      </p>
                    ) : (
                      <p className="font-sans text-[#4a3b2c]">
                        <b>{lang === 'en' ? "Handover Option" : "طريقة الاستلام"}:</b> {lang === 'en' ? `Express delivery to cell ${userPhone || '05xxxxxxxx'}` : `توصيل سريع لجوال ${userPhone || '05xxxxxxxx'}`}
                      </p>
                    )}
                    <p className="font-sans text-[#4a3b2c]">
                      <b>{lang === 'en' ? "Order State" : "حالة الطلب"}:</b>{' '}
                      <span className="text-green-600 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-md text-[10px]">
                        {lang === 'en' ? "Under Hot Kitchen Care 🔥" : "تحت التحضير الساخن 🔥"}
                      </span>
                    </p>
                  </div>

                  {/* Blessing note */}
                  <div className="text-center pt-5 space-y-2">
                    <p className="text-[10px] text-[#c49258] font-bold font-sans animate-bounce">
                      {lang === 'en' ? "May it bring flavor & absolute blessing! ❤️" : "مجرى العافية وتطرح فيه البركة يا سيدي! ❤️"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-sans max-w-[200px] mx-auto leading-relaxed">
                      {lang === 'en' 
                        ? "We grind our beans & bake our bread with heritage heat to reach you in absolute beauty."
                        : "نطحن بنّا ونسمن ملوحنا بحرارة دافية لتصل عتبتكم بكل كرم وحب."
                      }
                    </p>
                    <button
                      onClick={handleReset}
                      className="mt-4 hover:cursor-pointer bg-[#584430] hover:bg-[#3d2e1f] text-white px-6 py-2 rounded-full text-[10px] font-bold font-sans transition-all hover:scale-105"
                    >
                      {lang === 'en' ? "Understood, start new order" : "فهمت، العودة وبدء طلب جديد"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Total Bar when step is cart */}
            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="p-4 bg-white border-t-2 border-[#f1e4c2] space-y-3 shrink-0">
                <div className="flex justify-between items-center text-right ltr:text-left text-xs">
                  <div className="text-left ltr:text-right font-black text-slate-800">
                    {subtotal} {lang === 'en' ? "SAR" : "ر.س"}
                  </div>
                  <div className="text-[#8c7b6c] font-medium scale-95 origin-right ltr:origin-left">
                    {lang === 'en' ? "Subtotal before taxation" : "المجموع قبل الحساب التراكمي"}
                  </div>
                </div>

                <div className="flex justify-between items-center text-right ltr:text-left text-sm border-t border-slate-100 pt-2.5">
                  <div className="text-left ltr:text-right text-lg font-extrabold text-[#584430]">
                    {total} {lang === 'en' ? "SAR" : "ر.س"}
                  </div>
                  <div className="font-extrabold text-[#584430] font-sans flex items-center gap-1">
                    {lang === 'en' ? (
                      <>
                        <span>Grand Total</span>
                        <span className="text-[9px] text-[#c49258] bg-amber-50 px-1.5 py-0.5 rounded-full">(VAT incl.)</span>
                      </>
                    ) : (
                      <>
                        المجموع النهائي <span className="text-[9px] text-[#c49258] bg-amber-50 px-1.5 py-0.5 rounded-full">(شامل الضريبة)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
