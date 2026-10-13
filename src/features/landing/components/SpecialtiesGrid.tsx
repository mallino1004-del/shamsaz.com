/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  HeartPulse, 
  Baby, 
  Activity, 
  FlaskConical, 
  Scan, 
  Stethoscope, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface SpecialtiesGridProps {
  onSelectSpecialty: (specialtyName: string) => void;
  onViewAll: () => void;
}

export const SpecialtiesGrid: React.FC<SpecialtiesGridProps> = ({
  onSelectSpecialty,
  onViewAll,
}) => {
  const specialties = [
    { id: '1', title: 'پزشکی عمومی', icon: HeartPulse, count: '۱۲۰ پزشک' },
    { id: '2', title: 'زنان و زایمان', icon: Baby, count: '۸۴ پزشک', highlight: true },
    { id: '3', title: 'طب داخلی', icon: Activity, count: '۶۵ پزشک' },
    { id: '4', title: 'آنکولوژی', icon: FlaskConical, count: '۴۲ متخصص', highlight: true },
    { id: '5', title: 'جراحی زنان و زایمان', icon: Sparkles, count: '۳۸ جراح' },
    { id: '6', title: 'پاتولوژی', icon: Stethoscope, count: '۲۹ پاتولوژیست' },
    { id: '7', title: 'رادیولوژی و تصویربرداری', icon: Scan, count: '۵۱ متخصص' },
    { id: '8', title: 'اورولوژی', icon: Activity, count: '۳۳ متخصص' },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              دسته‌بندی‌های تخصصی
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              دسترسی سریع به پزشکان بر اساس تخصص بالینی مورد نیاز
            </p>
          </div>

          <button 
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <span>مشاهده همه تخصص‌ها</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Category Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {specialties.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectSpecialty(item.title)}
              className={`p-4 rounded-2xl border text-center transition-all group flex flex-col items-center justify-center cursor-pointer ${
                item.highlight
                  ? 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-200/80 hover:border-indigo-400 hover:shadow-md'
                  : 'bg-slate-50/70 hover:bg-white border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                item.highlight 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'bg-white text-slate-600 shadow-xs border border-slate-100'
              }`}>
                <item.icon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                {item.count}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
