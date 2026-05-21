import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Smile, Coffee, Heart, Landmark, HelpCircle } from 'lucide-react';
import { Message } from '../types';

interface UncleBakrChatProps {
  onAddSpecialItemToCartByName: (itemName: string) => void;
  lang?: 'ar' | 'en';
}

export default function UncleBakrChat({ onAddSpecialItemToCartByName, lang = 'ar' }: UncleBakrChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMood, setUserMood] = useState<string>('raiq');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const greetingText = lang === 'en'
    ? "A hundred warm welcomes, my dear traveler! I am your traditional host, Uncle Bakr. What shall we prepare for you today? A savory hot mutabbaq, or some sweet Masoub to delight you? Talk to me, I am at your service! ☕✨"
    : "يا ميت أهلاً وسهلا بيك يا طيب في دكاننا التراثي بجدة التاريخية! أنا عمك بكر، الشيف والمضيف هنا. وش ودك تفطر اليوم؟ تبي شي مالح يبسطك وإلا معصوب يحلّي أيامك؟ سولف معاي وأنا تحت أمرك يا سيدي! ☕✨";

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: greetingText,
        timestamp: new Date()
      }
    ]);
  }, [lang]);

  const MOODS = lang === 'en' ? [
    { label: 'Calm & Cozy 😌', value: 'relaxed' },
    { label: 'Hungry & Rushed 🦁', value: 'starving_fast' },
    { label: 'Craving Sweets 🍯', value: 'sweet_tooth' },
    { label: 'Woke Up Tired 🥱', value: 'tired_low_energy' }
  ] : [
    { label: 'رايق ومروق 😌', value: 'رايق' },
    { label: 'جوعان وعجلان 🦁', value: 'جوعان وعجلان' },
    { label: 'ودي بحاجة حلوة 🍯', value: 'أبحث عن تحلية ممتازة' },
    { label: 'صاحي بدري كسلان 🥱', value: 'كسلان وبحاجة لدفعة طاقة' }
  ];

  const QUICK_PROMPTS = lang === 'en' ? [
    { text: 'Recommend a rich royal Hijazi breakfast! 👑', mood: 'starving_fast' },
    { text: 'What is the absolute best sweet Masoub? 🍯', mood: 'sweet_tooth' },
    { text: 'Tell me about Shehata Street and Al-Balad stories! 🏛️', mood: 'relaxed' },
    { text: 'What drink will wake me up and fix my head? ☕', mood: 'tired_low_energy' }
  ] : [
    { text: 'انصحني بفطور ملوكي حجازي دسم 👑', mood: 'جوعان وعجلان' },
    { text: 'وش أحلى معصوب أو عريكة عندكم؟ 🍯', mood: 'أبحث عن تحلية ممتازة' },
    { text: 'كلمنا عن شارع شحاتة وسر اسم البيضة المقشرة 🏛️', mood: 'رايق' },
    { text: 'وش المشروب اللي يعدل الدماغ والراس؟ ☕', mood: 'كسلان وبحاجة لدفعة طاقة' }
  ];

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          userMood: userMood
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'model',
          content: data.reply,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      console.error(err);
      const fallbackText = lang === 'en'
        ? "Dear guest, there is a slight mist in the tea steam. But I guarantee our special Peeled Egg Mutabbaq will delight your heart! Add it from the menu and taste the true folklore! ☕✨"
        : 'يا طيب حصل غبش بسيط في موجات الشاي، لكني أضمن لك مطبق البيضة المقشرة الخاص حقنا ينور قلبك ودماغك! اطلبه الآن من المنيو وذوق الطعم البلدي الحقيقي! ☕✨';
      setMessages(prev => [...prev, {
        role: 'model',
        content: fallbackText,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Sticky Button / Uncle Bakr Head Avatar */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-tr from-[#584430] to-[#c49258] hover:from-[#3d2e1f] hover:to-[#a3704c] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:cursor-pointer group border-2 border-[#fff3d4]"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-bold font-sans max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 white-space-nowrap">
          {lang === 'en' ? "Ask Uncle Bakr 👳‍♂️" : "اسأل بكر التراثي 👳‍♂️"}
        </span>
      </motion.button>

      {/* Slide-out Heritage Dialogue Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-amber-950/20 backdrop-blur-xs font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Backdrop Closer */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-md h-full bg-[#fdfaf2] border-r-2 border-[#f1e4c3] flex flex-col shadow-2xl"
            >
              {/* Drawer Header Design */}
              <div className="p-6 bg-[#584430] text-white relative overflow-hidden flex items-center justify-between border-b-4 border-[#c49258]">
                {/* Visual Traditional Lattice Motif watermark inside header */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#c49258_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full border-2 border-[#f3e9d2] bg-white text-[#584430] flex items-center justify-center text-3xl shadow-inner">
                    👳‍♂️
                  </div>
                  <div className="text-right ltr:text-left">
                    <h3 className="font-extrabold text-md md:text-lg text-[#fedc97] font-display">
                      {lang === 'en' ? "Neighborhood Host: Uncle Bakr" : "مضيف الحارة: عم بكر"}
                    </h3>
                    <p className="text-[10px] text-[#fbf8f0] opacity-80">
                      {lang === 'en' ? "Keeper of local folklore & historic Al-Balad tales" : "سليل الفنون الشعبية وحكاوي البلد القديمة"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 hover:cursor-pointer flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Traditional Banner Greeting Note */}
                <div className="bg-[#f0e7d0]/40 border border-[#e4d6b4] rounded-2xl p-3 text-[11px] text-[#78644c] text-center leading-relaxed">
                  📢 <b>{lang === 'en' ? "Uncle Bakr's Advice:" : "نصيحة عمك بكر:"}</b>{" "}
                  {lang === 'en' 
                    ? "Choose your current mood state below and talk with me about our authentic cuisine. I will arrange a royal plate just for you!"
                    : "اكتب مزاجك بالأسفل وسولف معاي عن فطور وغدا جدة الأصيل، نضبط لك طلب ملوكي!"
                  }
                </div>

                {/* Mood Selector Chips */}
                <div className="space-y-1.5 text-right ltr:text-left">
                  <p className="text-[10px] font-bold text-[#8c7b6c]">
                    {lang === 'en' ? "Choose your state or appetite:" : "اختر حالتك ومزاجك الحاليين:"}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setUserMood(m.value)}
                        className={`text-[11px] hover:cursor-pointer px-2.5 py-1.5 rounded-lg border text-right ltr:text-left transition-all duration-200 ${
                          userMood === m.value
                            ? 'bg-[#c49258] text-white border-[#c49258] font-bold shadow-sm'
                            : 'bg-[#fcfbf7] text-[#8c7b6c] border-[#ecdcb3] hover:border-[#c49258]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="space-y-4 pt-2">
                  {messages.map((m, idx) => {
                    const isModel = m.role === 'model';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-2.5 ${isModel ? 'flex-row-reverse' : 'flex-row'} items-start`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 border border-[#f1e4c3] ${
                          isModel ? 'bg-amber-100' : 'bg-[#584430] text-white'
                        }`}>
                          {isModel ? '👳‍♂️' : '👤'}
                        </div>
                        <div className="flex flex-col max-w-[80%] text-right ltr:text-left">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                            isModel
                              ? 'bg-white text-[#4a3b2c] border-[#f1e4c3] rounded-tr-none'
                              : 'bg-gradient-to-l from-[#584430] to-[#735a42] text-white border-[#584430] rounded-tl-none'
                          }`}>
                            {m.content}
                          </div>
                          <span className="text-[9px] text-[#a0907e] mt-1 pr-1 pl-1">
                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex gap-2.5 flex-row-reverse items-start">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 bg-amber-100 border border-[#f1e4c3]">
                        👳‍♂️
                      </div>
                      <div className="p-3 bg-white border border-[#f1e4c3] rounded-2xl rounded-tr-none text-xs text-[#8c7b6c] flex items-center gap-1.5">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce [animation-delay:0.2s]">●</span>
                        <span className="animate-bounce [animation-delay:0.4s]">●</span>
                        <span className="text-[10px] font-medium mr-1 ml-1">
                          {lang === 'en' ? "Uncle Bakr is typing recommendations..." : "بكر يحضر استكانة الشاي وينصحك..."}
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Quick Prompt Suggestions Panel */}
              <div className="p-3 bg-amber-50/60 border-t border-[#f1e4c3] space-y-1.5 shrink-0">
                <p className="text-[10px] font-bold text-[#8c7b6c] text-right ltr:text-left">
                  {lang === 'en' ? "Quick exploration paths & stories:" : "إرشادات سريعة وحكايا تراثية:"}
                </p>
                <div className="flex flex-col gap-1">
                  {QUICK_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setUserMood(p.mood);
                        handleSend(p.text);
                      }}
                      className="text-[10px] hover:cursor-pointer text-[#584430] bg-[#fcf9f2] hover:bg-[#ebdcb3]/40 border border-[#ebdcb3] p-1.5 rounded-lg text-right ltr:text-left transition-colors line-clamp-1"
                    >
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t-2 border-[#f1e4c2] flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-[#584430] hover:bg-[#3d2e1f] text-white hover:cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors rotate-180"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={lang === 'en' ? "Ask about our traditional recipes or heritage..." : "اسأل عمك بكر عن الأكل أو سوق البلد..."}
                  className="flex-1 bg-amber-50/40 border-2 border-[#f1e4c3] focus:border-[#c49258] text-right ltr:text-left text-xs rounded-xl px-4 py-2.5 outline-none font-sans text-[#4a3b2c]"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
