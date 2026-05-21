import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { MenuItem } from '../types';

interface ThreeDTiltCardProps {
  key?: React.Key;
  item: MenuItem;
  onAddToCart: (item: MenuItem, selectedExtras: { name: string; price: number }[]) => void;
}

export default function ThreeDTiltCard({ item, onAddToCart }: ThreeDTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);

  // Dynamically resolve icon from lucide-react
  const IconComponent = (LucideIcons as any)[item.imageIcon || 'Utensils'] || LucideIcons.Utensils;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Absolute mouse coordinates relative to the card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const normalizedX = (mouseX / width) - 0.5;
    const normalizedY = (mouseY / height) - 0.5;
    
    // Compute rotations (max 15 degrees tilt)
    setRotateY(normalizedX * 18 * -1); // rotate on Y axis based on X mouse pos
    setRotateX(normalizedY * 18);     // rotate on X axis based on Y mouse pos
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const toggleExtra = (extra: { name: string; price: number }) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const activePrice = item.price + selectedExtras.reduce((sum, ext) => sum + ext.price, 0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative perspective-1000 w-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className={`relative rounded-3xl p-6 transition-all duration-300 ease-out transform-style-3d bg-[#fdfaf2] border-2 border-[#f3e9d2] hover:border-[#d4a373]/80 hover:shadow-2xl ${
          item.accentColor === 'amber' ? 'shadow-lg shadow-[#d4a373]/5 ring-1 ring-[#e9c46a]/20' : 'shadow-md shadow-amber-950/5'
        }`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Glow effect matching active state */}
        <div
          className={`absolute -inset-0.5 rounded-3xl opacity-0 transition-opacity duration-300 pointer-events-none blur-md bg-gradient-to-r ${
            item.accentColor === 'amber' ? 'from-[#e9c46a] via-[#f4a261] to-[#e76f51]' : 'from-[#d4a373]/30 to-[#f3e9d2]/10'
          }`}
          style={{
            opacity: isHovered ? 0.25 : 0,
            transform: 'translateZ(-10px)',
          }}
        />

        {/* Section Tag */}
        <div className="flex justify-between items-center mb-4" style={{ transform: 'translateZ(20px)' }}>
          <span className="text-xs font-medium text-[#c49258] bg-[#fdf0d5] border border-[#f3e9d2] px-3 py-1 rounded-full">
            {item.section}
          </span>
          {item.accentColor === 'amber' && (
            <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#d4a373] to-[#c49258] px-2.5 py-1 rounded-full animate-pulse">
              طلب ملوكي ✨
            </span>
          )}
        </div>

        {/* Food Plate Graphic and Icon */}
        <div 
          className="relative h-36 flex items-center justify-center my-4 transform-style-3d"
          style={{ transform: 'translateZ(35px)' }}
        >
          {/* Traditional Pattern BG Circle representing the plate */}
          <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-[#e9d6b5]/50 flex items-center justify-center transition-transform duration-700 bg-amber-50/20 group hover:rotate-45">
            {/* Inner Arabic Style Pattern */}
            <div className="absolute w-24 h-24 rounded-full border border-dotted border-[#d4a373]/30" />
          </div>

          {/* Glowing Shadow under plate */}
          <div className="absolute bottom-6 w-16 h-4 bg-amber-950/10 blur-md rounded-full transform scale-y-50" />

          {/* The Plate Content */}
          <motion.div
            animate={{
              y: isHovered ? -8 : 0,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-white bg-gradient-to-br overflow-hidden ${
              item.accentColor === 'amber'
                ? 'from-[#f4a261] to-[#e76f51]'
                : 'from-[#d4a373] to-[#a3704c]'
            }`}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <IconComponent className="w-10 h-10 stroke-[1.5]" />
            )}
          </motion.div>
        </div>

        {/* Item Title and Description */}
        <div className="text-center mt-2 transform-style-3d" style={{ transform: 'translateZ(15px)' }}>
          <h3 className="text-lg font-bold text-[#4a3b2c] font-display hover:text-[#c49258] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-[#8c7b6c] mt-2 leading-relaxed min-h-[40px] line-clamp-2 px-1">
            {item.description || 'وصف طعام تراثي متميز بحرفية وأيدي ماهرة.'}
          </p>
        </div>

        {/* Extras Options Selectors */}
        {item.extras && item.extras.length > 0 && (
          <div 
            className="mt-4 pt-3 border-t border-[#f1e5cc]/80 transform-style-3d"
            style={{ transform: 'translateZ(10px)' }}
          >
            <p className="text-[10px] font-semibold text-[#8c7b6c] text-right mb-2">إضافات بلدية متاحة:</p>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {item.extras.map((extra) => {
                const isSelected = selectedExtras.some(e => e.name === extra.name);
                return (
                  <button
                    key={extra.name}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`text-[10px] hover:cursor-pointer font-medium px-2 py-1 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#c49258] text-white border-[#c49258]'
                        : 'bg-[#fcfaf5] text-[#8c7b6c] border-[#ece1c5] hover:border-[#c49258]/50'
                    }`}
                  >
                    {extra.name} (+{extra.price} ر.س)
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price and Add Button */}
        <div 
          className="flex items-center justify-between mt-5 pt-3 border-t border-[#f1e5cc]"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="text-right">
            <span className="text-[10px] text-[#a3907e] block font-medium">السعر شامل الضريبة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#584430]">{activePrice}</span>
              <span className="text-[10px] font-bold text-[#c49258]">ر.س</span>
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(item, selectedExtras);
              // Clean selection but let the ripple highlight proceed
              setSelectedExtras([]);
            }}
            className={`flex items-center gap-1.5 hover:cursor-pointer px-4 py-2.5 rounded-full font-bold text-xs transition-all duration-300 transform shadow-md hover:shadow-lg ${
              item.accentColor === 'amber'
                ? 'bg-gradient-to-r from-[#d4a373] to-[#e76f51] hover:from-[#c49258] hover:to-[#d65f40] text-white hover:scale-105 active:scale-95'
                : 'bg-[#584430] hover:bg-[#3d2e1f] text-[#fdfbf7] hover:scale-105 active:scale-95'
            }`}
          >
            <LucideIcons.Plus className="w-4.5 h-4.5" />
            <span>أضف للطلب</span>
          </button>
        </div>
      </div>
    </div>
  );
}
