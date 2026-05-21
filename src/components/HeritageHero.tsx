import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Landmark, Volume2, VolumeX, ArrowDownCircle, Compass, Anchor } from 'lucide-react';

interface HeritageHeroProps {
  onScrollToMenu: () => void;
  lang?: 'ar' | 'en';
}

// 3D Traditional Jeddah Balad Historic Scene with Rawashin (الرواشين) and hanging lanterns
export function TraditionalFanoos() {
  return (
    <div className="relative w-72 md:w-[480px] h-60 md:h-72 flex items-center justify-center pointer-events-none select-none">
      {/* City glow sunset atmosphere */}
      <div className="absolute w-56 h-36 rounded-full bg-amber-500/15 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      
      {/* Elegant floating/swing effect */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-full h-full flex items-center justify-center relative"
      >
        <svg className="w-full h-full drop-shadow-xl text-[#d4a373]" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Definitions for Gradients */}
          <defs>
            <radialGradient id="roshanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff2cc" />
              <stop offset="50%" stopColor="#ffbf00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e28743" stopOpacity="0.1" />
            </radialGradient>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ebdcb3" />
              <stop offset="100%" stopColor="#c49258" />
            </linearGradient>
            <linearGradient id="roshanWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5c4432" />
              <stop offset="100%" stopColor="#3d2c1e" />
            </linearGradient>
          </defs>

          {/* BACKGROUND: Soft silhouette of old city towers & minarets */}
          <path d="M10,200 L10,140 L30,110 L50,140 L50,200 Z" fill="#ebdcb3" opacity="0.3" />
          <path d="M260,200 L260,110 L280,70 L300,110 L300,200 Z" fill="#ebdcb3" opacity="0.3" />
          {/* Minaret Crescent */}
          <path d="M280,68 C282,68 284,70 284,72 L276,72 C276,70 278,68 280,68 Z" fill="#584430" opacity="0.4" />

          {/* PALM TREE: Swaying Jeddah Palm */}
          <g className="origin-bottom focus:scale-105" style={{ transformOrigin: '40px 190.0px' }}>
            <motion.g
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Trunk */}
              <path d="M38,190 Q34,140 45,100 Q48,140 42,190 Z" fill="#584430" opacity="0.6" />
              {/* Palm Fronds */}
              <circle cx="45" cy="100" r="2" fill="#584430" />
              <path d="M45,100 Q20,95 10,105" stroke="#584430" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <path d="M45,100 Q25,80 20,75" stroke="#584430" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M45,100 Q55,75 65,72" stroke="#584430" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <path d="M45,100 Q70,95 80,102" stroke="#584430" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M45,100 Q55,115 60,125" stroke="#584430" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M45,100 Q30,115 22,122" stroke="#584430" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            </motion.g>
          </g>

          {/* MAIN HISTORIC BUILDING LAYER: Old Jeddah stone architecture */}
          <rect x="80" y="50" width="160" height="150" rx="10" fill="url(#wallGradient)" stroke="#584430" strokeWidth="2" />
          {/* Stones mortar detail lines */}
          <line x1="80" y1="100" x2="110" y2="100" stroke="#584430" strokeWidth="1" opacity="0.4" />
          <line x1="210" y1="100" x2="240" y2="100" stroke="#584430" strokeWidth="1" opacity="0.4" />
          <line x1="130" y1="170" x2="190" y2="170" stroke="#584430" strokeWidth="1" opacity="0.4" />
          <line x1="80" y1="150" x2="120" y2="150" stroke="#584430" strokeWidth="1" opacity="0.4" />

          {/* MAIN ARCHED GATEWAY (باب مكة / باب الروشان) */}
          <path d="M120,200 L120,150 C120,125 200,125 200,150 L200,200 Z" fill="#584430" />
          {/* Inner details of Gateway */}
          <path d="M125,200 L125,152 C125,133 195,133 195,152 L195,200 Z" fill="#3d2c1e" />
          {/* Glowing lantern within gateway arch */}
          <circle cx="160" cy="145" r="8" fill="url(#roshanGlow)" />
          {/* Traditional wooden door design with brass studs */}
          <path d="M125,200 L125,152 C125,145 145,145 150,148 L150,200 Z" fill="#3d2e1f" stroke="#584430" strokeWidth="1" opacity="0.9" />
          <path d="M195,200 L195,152 C195,145 175,145 170,148 L170,200 Z" fill="#3d2e1f" stroke="#584430" strokeWidth="1" opacity="0.9" />

          {/* THE ROUSHAN (الروشان الحجازي التقليدي) hanging on second floor */}
          {/* Background light glow from within Rawasheen */}
          <rect x="110" y="60" width="100" height="60" rx="3" fill="url(#roshanGlow)" />

          {/* Beautiful wooden lattice structure (الروشان) overlay */}
          <rect x="110" y="60" width="100" height="60" rx="3" fill="url(#roshanWood)" stroke="#312217" strokeWidth="2.5" opacity="0.95" />
          {/* Traditional Windows open slits showing breathing glow */}
          <g>
            {/* Left window pane */}
            <rect x="120" y="68" width="22" height="42" rx="2" fill="url(#roshanGlow)" stroke="#312217" strokeWidth="1.5" />
            {/* Wooden latticework hashes on left pane */}
            <line x1="120" y1="75" x2="142" y2="75" stroke="#312217" strokeWidth="1" />
            <line x1="120" y1="82" x2="142" y2="82" stroke="#312217" strokeWidth="1" />
            <line x1="120" y1="89" x2="142" y2="89" stroke="#312217" strokeWidth="1" />
            <line x1="120" y1="96" x2="142" y2="96" stroke="#312217" strokeWidth="1" />
            <line x1="120" y1="103" x2="142" y2="103" stroke="#312217" strokeWidth="1" />
            <line x1="131" y1="68" x2="131" y2="110" stroke="#312217" strokeWidth="1.5" />

            {/* Right window pane */}
            <rect x="178" y="68" width="22" height="42" rx="2" fill="url(#roshanGlow)" stroke="#312217" strokeWidth="1.5" />
            {/* Wooden latticework hashes on right pane */}
            <line x1="178" y1="75" x2="200" y2="75" stroke="#312217" strokeWidth="1" />
            <line x1="178" y1="82" x2="200" y2="82" stroke="#312217" strokeWidth="1" />
            <line x1="178" y1="89" x2="200" y2="89" stroke="#312217" strokeWidth="1" />
            <line x1="178" y1="96" x2="200" y2="96" stroke="#312217" strokeWidth="1" />
            <line x1="178" y1="103" x2="200" y2="103" stroke="#312217" strokeWidth="1" />
            <line x1="189" y1="68" x2="189" y2="110" stroke="#312217" strokeWidth="1.5" />

            {/* Central elegant vertical pillar with small star cut-out */}
            <rect x="152" y="64" width="16" height="52" fill="#5c4432" stroke="#312217" strokeWidth="1" />
            <polygon points="160,82 163,88 169,89 164,93 166,99 160,96 154,99 156,93 151,89 157,88" fill="#ffd880" />
          </g>

          {/* Detailed top shade eave of Roshan */}
          <path d="M102,60 L218,60 L206,50 L114,50 Z" fill="#3d2c1e" stroke="#1d140e" strokeWidth="1.5" />
          {/* Bottom supporting wooden bracket corbels */}
          <rect x="122" y="120" width="8" height="10" fill="#3d2c1e" />
          <rect x="156" y="120" width="8" height="10" fill="#3d2c1e" />
          <rect x="190" y="120" width="8" height="10" fill="#3d2c1e" />

          {/* SWAYING LANTERNS (فوانيس معلقة) flanking the gate */}
          {/* Left lantern swaying */}
          <g style={{ transformOrigin: '98px 105px' }}>
            <motion.g
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <line x1="98" y1="105" x2="98" y2="135" stroke="#584430" strokeWidth="1.5" />
              {/* Lantern Shape */}
              <path d="M92,135 L104,135 L108,145 L88,145 Z" fill="#584430" />
              <rect x="91" y="145" width="14" height="16" fill="url(#roshanGlow)" stroke="#584430" />
              <line x1="98" y1="145" x2="98" y2="161" stroke="#584430" />
              <path d="M91,161 L107,161 L102,168 L94,168 Z" fill="#584430" />
            </motion.g>
          </g>

          {/* Right lantern swaying */}
          <g style={{ transformOrigin: '222px 105px' }}>
            <motion.g
              animate={{ rotate: [4, -4, 4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <line x1="222" y1="105" x2="222" y2="135" stroke="#584430" strokeWidth="1.5" />
              {/* Lantern Shape */}
              <path d="M216,135 L228,135 L232,145 L212,145 Z" fill="#584430" />
              <rect x="215" y="145" width="14" height="16" fill="url(#roshanGlow)" stroke="#584430" />
              <line x1="222" y1="145" x2="222" y2="161" stroke="#584430" />
              <path d="M215,161 L231,161 L226,168 L218,168 Z" fill="#584430" />
            </motion.g>
          </g>

          {/* CELESTIAL ELEMENTS (Twinkling stars & Crescent Moon in the empty sky slots) */}
          <g>
            {/* Deep historic crescent moon */}
            <path d="M70,25 C75,25 80,28 82,32 C76,33 72,28 70,25" fill="#fcf9f2" opacity="0.85" />

            {/* Twinkling star 1 */}
            <motion.circle
              cx="100" cy="25" r="1.5" fill="#fdfae2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Twinkling star 2 */}
            <motion.circle
              cx="250" cy="35" r="2" fill="#fdfae2"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            {/* Twinkling star 3 */}
            <motion.circle
              cx="220" cy="15" r="1.5" fill="#fdfae2"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}

// Gorgeous Traditional Islamic / Arabic Arch Outline to surround content
export function TraditionalArchPortal() {
  return (
    <svg className="absolute inset-0 w-full h-full text-[#c49258]/5 pointer-events-none select-none" viewBox="0 0 1000 1000" fill="currentColor">
      <path d="M500,50 C220,50 50,150 50,350 L50,1000 L950,1000 L950,350 C950,150 780,50 500,50 Z M500,80 C750,80 910,180 910,360 L910,970 L90,970 L90,360 C90,180 250,80 500,80 Z" />
    </svg>
  );
}

export default function HeritageHero({ onScrollToMenu, lang = 'ar' }: HeritageHeroProps) {
  const [greeting, setGreeting] = useState('يا هلا بيك يا طعم!');
  const [jeddahTime, setJeddahTime] = useState('');

  useEffect(() => {
    // Jeddah is UTC+3. Let's calculate and display traditional greeting based on hours
    const updateTime = () => {
      const utc = new Date();
      const offset = 3; // Jeddah time (GMT+3)
      const jdDate = new Date(utc.getTime() + offset * 3600000);
      const hours = jdDate.getUTCHours();
      const minutes = jdDate.getUTCMinutes().toString().padStart(2, '0');
      
      setJeddahTime(`${hours.toString().padStart(2, '0')}:${minutes}`);

      if (hours >= 5 && hours < 11) {
        setGreeting('صباح الورد والبركة الجداوية.. وقت المطبق الحار وشاي الكرك والروقان! ☀️🌅');
      } else if (hours >= 11 && hours < 16) {
        setGreeting('يسعد لي هالطلة والضحكة الغالية.. حياك على غدا حجازي ثقيل ومعد بحب! 🥘⛱️');
      } else if (hours >= 16 && hours < 20) {
        setGreeting('عصرية ريقة وسوالف دافية.. استمتع بأحلى معصوب وعريكة مع كوب شاهي جمر معتق! ☕🧁');
      } else {
        setGreeting('يا هلا وميت مرحب بيك ليلاً في دكان الحارة دافية.. منورنا بأطعم قعدة كبدة ومطبق! 🌙✨');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-br from-[#fdf9f0] via-[#f7ebd1] to-[#eedfaf] text-[#4a3b2c] border-b-4 border-[#c49258]">
      {/* Traditional Arch frame framing the hero */}
      <TraditionalArchPortal />

      {/* Scattered particles/stars simulating dusty desert dusk atmosphere */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#c49258_1.2px,transparent_1.2px)] [background-size:24px_24px] z-0" />

      {/* Symmetrical Left & Right Corner Traditional Hanger Decorations */}
      <div className="absolute top-4 right-4 md:right-10 pointer-events-none hidden md:block">
        <svg className="w-16 h-40 text-[#584430]/30" viewBox="0 0 50 150" fill="currentColor">
          <line x1="25" y1="0" x2="25" y2="120" stroke="currentColor" strokeWidth="2" />
          <circle cx="25" cy="120" r="4" />
          <path d="M10,120 Q25,100 40,120 L25,145 Z" />
        </svg>
      </div>
      <div className="absolute top-4 left-4 md:left-10 pointer-events-none hidden md:block">
        <svg className="w-16 h-40 text-[#584430]/30" viewBox="0 0 50 150" fill="currentColor">
          <line x1="25" y1="0" x2="25" y2="120" stroke="currentColor" strokeWidth="2" />
          <circle cx="25" cy="120" r="4" />
          <path d="M10,120 Q25,100 40,120 L25,145 Z" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 space-y-8 mt-6">
        
        {/* Flag Card for Realtime Jeddah local time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-[#5d4037]/10 border border-[#c49258]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#5c4936] shadow-sm font-sans"
        >
          <Clock className="w-4 h-4 text-[#c49258] animate-spin-slow" />
          <span>توقيت جدة البلد الحالي: {jeddahTime || '11:20 م'} ⏱️</span>
        </motion.div>

        {/* 3D Floating Traditional Lantern */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-2 relative"
        >
          <TraditionalFanoos />
          {/* Circular Arabic Frame border around lantern */}
          <div className="absolute -inset-4 border border-dashed border-[#c49258]/30 rounded-full animate-spin-slow pointer-events-none" />
        </motion.div>

        {/* Traditional Arabic Calligraphy simulation styled header */}
        <div className="space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#c49258] uppercase bg-[#fdf0d5] border border-[#ebdcb3] px-3.5 py-1 rounded-full">
            أهلاً بيك في سوق الندى التاريخي 🌴
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-[#3d2e1f] font-serif leading-[1.25] pr-1">
            <span className="text-[#c49258] relative">
              البيضة المقشرة
              {/* Underline calligraphy vector */}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#e76f51] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>{' '}
            واستكانة الشاي
          </h1>
        </div>

        {/* Dynamic Greeting */}
        <motion.p
          key={greeting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm md:text-md text-[#5d4c3a] font-black max-w-2xl px-4 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-[#ebdcb3]"
        >
          {greeting}
        </motion.p>

        {/* Description */}
        <p className="text-xs md:text-sm text-[#8c7b6c] max-w-xl leading-relaxed">
          نصنع اللقمة بنظافة وصدق ومحبة، على طريقة أجدادنا الأكرمين في قلب جدة التاريخية. نوفر مطبق رقيق، فطائر زكية بنكهات مختلفة، بالإضافة إلى دسم المعصوب والعريكة.
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md pt-4">
          <button
            onClick={onScrollToMenu}
            className="flex-1 hover:cursor-pointer bg-[#5b4037] hover:bg-[#3d2e1f] text-white px-8 py-3.5 rounded-full font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 text-center font-sans tracking-wide"
          >
            تصفح القُويم واطلب المنيو 🥘
          </button>
          <a
            href="#heritage_stories"
            className="flex-1 hover:cursor-pointer bg-white hover:bg-amber-50 text-[#5b4037] border-2 border-[#5b4037]/50 px-8 py-3 rounded-full font-extrabold text-xs shadow-md transition-transform hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 font-sans"
          >
            <Landmark className="w-4 h-4 text-[#c49258]" />
            <span>حكايا جدة القديمة 🏛️</span>
          </a>
        </div>

        {/* Down Arrow indicators */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="pt-6 cursor-pointer text-[#c49258]/60 hover:text-[#c49258] transition-colors flex flex-col items-center"
          onClick={onScrollToMenu}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase mb-1 font-sans">اسحب للأسفل</span>
          <ArrowDownCircle className="w-7 h-7 stroke-[1.5]" />
        </motion.div>
      </div>

      {/* Symmetrical Waves/Cloud bottom dividers */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 120%22 preserveAspectRatio=%22none%22 fill=%22%23fbf8f0%22><path d=%22M0,0 C150,90 350,90 500,0 C650,90 850,90 1000,0 C1150,90 1200,40 1200,40 L1200,120 L0,120 Z%22/></svg>')] bg-cover opacity-100 z-10" />
    </section>
  );
}
