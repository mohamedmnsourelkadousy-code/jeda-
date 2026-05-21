import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ALBALAD_STORIES } from '../menuData';
import { STORIES_TRANSLATIONS, UI_TRANSLATIONS } from '../translations';

interface StorySectionProps {
  lang?: 'ar' | 'en';
}

// Traditional rawshan wooden screen SVG motif to use as decoration
export function RawshanPattern() {
  return (
    <svg className="w-full h-full opacity-10 text-[#584430]" viewBox="0 0 100 100" fill="currentColor">
      <defs>
        <pattern id="rawshanPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" />
          <path d="M 0 10 L 20 10 M 10 0 L 10 20 M 0 0 L 20 20 M 20 0 L 0 20" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#rawshanPattern)" />
    </svg>
  );
}

// Beautiful vector of traditional building Rawshan window outline
export function RawshanWindow() {
  return (
    <svg className="w-48 h-64 text-[#c49258]/30" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arch */}
      <path d="M10,40 Q50,0 90,40 L90,120 L10,120 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Wooden lattices */}
      <line x1="10" y1="40" x2="90" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="65" x2="90" y2="65" stroke="currentColor" strokeWidth="1" />
      <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="1" />
      {/* Vertical bars */}
      <line x1="30" y1="40" x2="30" y2="120" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="18" x2="50" y2="120" stroke="currentColor" strokeWidth="1.5" />
      <line x1="70" y1="40" x2="70" y2="120" stroke="currentColor" strokeWidth="1" />
      {/* Diagonal screens */}
      <path d="M30,40 L50,65 L70,40 M30,65 L50,90 L70,65 M30,90 L50,115 L70,90" stroke="currentColor" strokeWidth="0.8" />
      {/* Base details */}
      <rect x="25" y="120" width="50" height="6" rx="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export default function StorySection({ lang = 'ar' }: StorySectionProps) {
  return (
    <section className="relative py-16 px-4 md:px-8 bg-[#fbf8f0] overflow-hidden border-t-2 border-b-2 border-[#f3e9d2]" id="heritage_stories">
      {/* Rawshan Lattice Watermark on background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <RawshanPattern />
      </div>

      <div className="max-w-6xl mx-auto relative text-right ltr:text-left">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-10 h-[1.5px] bg-[#c49258]"></div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#c49258] font-sans">
              {lang === 'en' ? UI_TRANSLATIONS.en.storiesTitle : "عبق التاريخ والجغرافيا"}
            </span>
            <div className="w-10 h-[1.5px] bg-[#c49258]"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#584430] font-serif leading-tight">
            {lang === 'en' ? UI_TRANSLATIONS.en.storiesHeader : "حكاوي حارتنا وسوق الندى القديم"}
          </h2>
          <p className="text-sm text-[#8c7b6c] mt-3 max-w-2xl mx-auto">
            {lang === 'en' ? UI_TRANSLATIONS.en.storiesSubtitle : "منذ أكثر من مئة عام، ونحن جزء من نسيج جدة البلد التاريخية. ننقل لكم حكاية كل روشان وعتبة دكان ومذاق نقي يحمله عمالقة الفطور."}
          </p>
        </div>

        {/* Story Bento-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ALBALAD_STORIES.map((story, idx) => {
            const IconComponent = (LucideIcons as any)[story.iconName || 'History'] || LucideIcons.History;
            const transStory = STORIES_TRANSLATIONS[story.id];
            const displayTitle = lang === 'en' && transStory ? transStory.title.en : story.title;
            const displayText = lang === 'en' && transStory ? transStory.text.en : story.text;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative rounded-3xl p-6 bg-[#fdfcf8] border border-[#f3e9d2] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden text-right ltr:text-left"
              >
                {/* Traditional Corner Bracket Border Decorations */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent group-hover:border-[#c49258]/30 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-transparent group-hover:border-[#c49258]/30 transition-all duration-300" />

                {/* Animated Glowing Icon circle */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#d4a373] to-[#c49258] shadow-md group-hover:rotate-12 transition-transform duration-300 mb-5">
                  <IconComponent className="w-6 h-6 stroke-[1.5]" />
                </div>

                <h3 className="text-lg font-bold text-[#4a3b2c] font-display group-hover:text-[#c49258] transition-colors mb-3">
                  {displayTitle}
                </h3>
                
                <p className="text-xs text-[#8c7b6c] leading-relaxed mb-4 text-justify">
                  {displayText}
                </p>

                {/* Visual Simulated Map or Address Marker line */}
                <div className="mt-4 pt-4 border-t border-[#f4eedb] flex items-center gap-2 text-[10px] text-[#c49258] font-bold justify-end ltr:justify-start">
                  <LucideIcons.MapPin className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? "Al-Balad, Al-Mazloom Neighborhood" : "جدة التاريخية، حارة المظلوم"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Giant Retro Traditional Arch Illustration Decoration */}
        <div className="mt-16 bg-[#fdfcf9] rounded-3xl border border-[#eedfaf] p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          {/* Subtle warm decoration layer */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block opacity-60">
            <RawshanWindow />
          </div>

          <div className="flex-1 relative z-10 text-right md:text-right ltr:text-left ltr:md:text-left">
            <div className="text-xs font-bold text-[#c49258] bg-[#fdf0d5] border border-[#ece1c5] px-3 py-1 rounded-full w-fit mb-3">
              {lang === 'en' ? UI_TRANSLATIONS.en.baladLocationTag : "📍 موقعنا التراثي بجدة البلد"}
            </div>
            <h3 className="text-2xl font-black text-[#584430] font-serif leading-snug">
              {lang === 'en' ? UI_TRANSLATIONS.en.baladArchTitle : "متواجدون بانتظاركم في سوق الندى التاريخي"}
            </h3>
            <p className="text-xs text-[#8c7b6c] mt-2 max-w-xl leading-relaxed">
              {lang === 'en' ? UI_TRANSLATIONS.en.baladArchDesc : "تجدوننا بجانب المعالم التاريخية وبين عتبات البيوت الحجازية القديمة. عائلتنا تفتح أبواب الدكان لكم من ساعات الفجر الأولى لتناول أطيب الأكلات الشعبية ونهاية بوجبات العشاء الحامية والمبخرة."}
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-amber-100/40 border border-amber-200/50 rounded-2xl px-4 py-2.5">
                <span className="text-[10px] text-[#a08975] block">{lang === 'en' ? UI_TRANSLATIONS.en.exactAddressLabel : "العنوان الدقيق:"}</span>
                <span className="text-xs font-bold text-[#5c4936]">
                  {lang === 'en' ? UI_TRANSLATIONS.en.exactAddressVal : "سوق الندى، شارع شحاتة، مواجه لزقاق الحجاز"}
                </span>
              </div>
              <div className="bg-amber-100/40 border border-amber-200/50 rounded-2xl px-4 py-2.5">
                <span className="text-[10px] text-[#a08975] block">{lang === 'en' ? UI_TRANSLATIONS.en.workHoursLabel : "ساعات العمل:"}</span>
                <span className="text-xs font-bold text-[#5c4936]">
                  {lang === 'en' ? UI_TRANSLATIONS.en.workHoursVal : "من الساعة ٥:٠٠ ص حتى ١٢:٠٠ منتصف الليل"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto relative z-10 flex flex-col gap-3 justify-center">
            {/* Quick action maps lookup */}
            <div className="bg-white border border-[#ebdcb3] p-4 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-[#5d4037]/10 text-[#5d4037] rounded-full flex items-center justify-center mx-auto mb-2">
                <LucideIcons.PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <span className="text-[10px] text-[#8c7b6c] block font-medium">
                {lang === 'en' ? UI_TRANSLATIONS.en.hotlineLabel : "خط الاتصال الساخن للتوصيل أو الحجز"}
              </span>
              <span className="text-sm font-black text-[#3d2e1f] tracking-wider block font-sans mt-0.5">053 037 0440</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
