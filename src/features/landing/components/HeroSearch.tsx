/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  User, 
  Ribbon, 
  ShieldCheck, 
  Clock, 
  Award, 
  HeartHandshake,
  ArrowLeft,
  Video,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';
import { HeroMotionBanner } from './HeroMotionBanner';

interface HeroSearchProps {
  onSearch: (query: { doctorName: string; specialty: string; city: string }) => void;
  onOpenRegistry: () => void;
  onSelectTag: (tag: string) => void;
  onOpenTelemedicine?: () => void;
  onOpenTumorBoard?: () => void;
  onOpenAICDSS?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  onOpenRegistry,
  onSelectTag,
  onOpenTelemedicine,
  onOpenTumorBoard,
  onOpenAICDSS,
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'in_person' | 'online'>('all');

  const specialtiesList = [
    { value: '', label: 'همه تخصص‌ها' },
    { value: 'زنان و زایمان', label: 'متخصص زنان و زایمان' },
    { value: 'آنکولوژی', label: 'فوق تخصص آنکولوژی و سرطان' },
    { value: 'پاتولوژی', label: 'متخصص پاتولوژی و سیتولوژی' },
    { value: 'رادیولوژی و تصویربرداری', label: 'رادیولوژی و تصویربرداری' },
    { value: 'جراحی زنان و زایمان', label: 'جراحی سرطان‌های زنان' },
    { value: 'طب داخلی', label: 'متخصص طب داخلی' },
  ];

  const citiesList = [
    { value: '', label: 'همه شهرها' },
    { value: 'تهران', label: 'تهران' },
    { value: 'اصفهان', label: 'اصفهان' },
    { value: 'مشهد', label: 'مشهد' },
    { value: 'شیراز', label: 'شیراز' },
    { value: 'تبریز', label: 'تبریز' },
    { value: 'اهواز', label: 'اهواز' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ doctorName, specialty, city });
  };

  const quickTags = [
    'متخصص زنان و زایمان',
    'ماموگرافی دیجیتال',
    'جراح سرطان پستان',
    'پزشک آنلاین تصویری',
    'بیوپسی و پاتولوژی',
  ];

  return (
    <section className="relative overflow-hidden bg-slate-50">
      
      {/* 1. Full-Screen Motion Graphics Carousel Banner */}
      <HeroMotionBanner
        onOpenRegistry={onOpenRegistry}
        onOpenTelemedicine={onOpenTelemedicine}
        onOpenTumorBoard={onOpenTumorBoard}
        onOpenAICDSS={onOpenAICDSS}
        onSearchDoctors={() => onSearch({ doctorName, specialty, city })}
      />

      {/* 2. Below-Hero Search Console & National Metrics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 lg:-mt-20 pb-14 relative z-20">
        
        {/* National Stats Strip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 px-5 py-3 shadow-lg text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900">سامانه پایش ملی سرطان‌های زنان شمساز</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-slate-600">
            <span>
              <strong className="text-indigo-700 font-bold ml-1 font-sans">۱۲,۸۷۳</strong> پرونده بالینی ثبت‌شده
            </span>
            <span>·</span>
            <span>
              <strong className="text-teal-700 font-bold ml-1 font-sans">۵۸</strong> بیمارستان و کلینیک همکار
            </span>
            <span>·</span>
            <span>
              <strong className="text-slate-900 font-bold ml-1 font-sans">+۴۵۰</strong> متخصص و جراح سرطان
            </span>
          </div>
        </div>

        {/* Enhanced Search Console Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-200/90 p-4 sm:p-6 mb-8">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-xs font-bold">
            <button
              onClick={() => setSearchMode('all')}
              className={`py-1.5 px-3.5 rounded-xl transition-all ${
                searchMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه ویزیت‌ها
            </button>
            <button
              onClick={() => setSearchMode('in_person')}
              className={`py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 ${
                searchMode === 'in_person'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>ویزیت حضوری مطب و کلینیک</span>
            </button>
            <button
              onClick={() => setSearchMode('online')}
              className={`py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 ${
                searchMode === 'online'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>مشاوره آنلاین تصویری (تله‌مدیسین)</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Input 1: Doctor Name */}
            <div className="lg:col-span-4 relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 pr-1 text-right">
                نام پزشک یا بیمارستان
              </label>
              <div className="relative flex items-center">
                <User className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="مثلاً دکتر سمیرا احمدی..."
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all text-right"
                />
              </div>
            </div>

            {/* Input 2: Specialty Dropdown */}
            <div className="lg:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 pr-1 text-right">
                تخصص پزشکی
              </label>
              <div className="relative flex items-center">
                <Stethoscope className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all text-right appearance-none cursor-pointer"
                >
                  {specialtiesList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input 3: City Dropdown */}
            <div className="lg:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 pr-1 text-right">
                شهر و استان
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all text-right appearance-none cursor-pointer"
                >
                  {citiesList.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Button: Search */}
            <div className="lg:col-span-2 pt-5 sm:pt-0 sm:self-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>جستجو</span>
              </button>
            </div>
          </form>

          {/* Quick search chips */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-right">
            <span className="text-[11px] font-bold text-slate-400">جستجوهای پرطرفدار:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] text-slate-600 font-medium transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Trust Value Proposition Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-900">دسترسی آسان</h4>
              <p className="text-[11px] text-slate-500">از هر کجا و در هر زمان</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-900">پزشکان معتبر</h4>
              <p className="text-[11px] text-slate-500">با تایید مدارک و سوابق علمی</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-900">پشتیبانی ۲۴ ساعته</h4>
              <p className="text-[11px] text-slate-500">همیشه در کنار شما</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-900">امنیت اطلاعات</h4>
              <p className="text-[11px] text-slate-500">مطابق استانداردهای جهانی سلامت</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
