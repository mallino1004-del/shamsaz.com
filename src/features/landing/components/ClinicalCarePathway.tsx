/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Calendar, FileText, Activity, ArrowLeft } from 'lucide-react';

interface ClinicalCarePathwayProps {
  onSearchDoctors: () => void;
  onOpenRegistry: () => void;
}

export const ClinicalCarePathway: React.FC<ClinicalCarePathwayProps> = ({
  onSearchDoctors,
  onOpenRegistry,
}) => {
  const steps = [
    {
      step: '۰۱',
      title: 'جستجوی پزشک یا مرکز درمانی',
      description: 'انتخاب تخصص مورد نیاز، شهر، بیمارستان و نوع ویزیت بر اساس فیلترهای پیشرفته و امتیاز مراجعین قبلی.',
      icon: Search,
      actionText: 'جستجوی پزشکان',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      step: '۰۲',
      title: 'انتخاب زمان و رزرو نوبت',
      description: 'مشاهده تقویم کاری پزشک، انتخاب ساعت‌های خالی صبح یا عصر، و ثبت مشخصات بیمار با کد رهگیری اختصاصی.',
      icon: Calendar,
      actionText: 'مشاهده تقویم نوبت‌ها',
      color: 'from-indigo-600 to-teal-600'
    },
    {
      step: '۰۳',
      title: 'پرونده الکترونیک و ثبت مدارک',
      description: 'بارگذاری آسان تصاویر ماموگرافی، سونوگرافی و گزارش پاتولوژی با بالاترین ضریب محرمانگی و استاندارد بالینی.',
      icon: FileText,
      actionText: 'ثبت پرونده رجیستری',
      color: 'from-teal-600 to-emerald-600'
    },
    {
      step: '۰۴',
      title: 'ویزیت، نسخه و پیگیری هیات تومور',
      description: 'انجام ویزیت حضوری یا آنلاین، دریافت نسخه معتبر، و در صورت لزوم ارجاع پرونده به هیات مجازی تومور (MDT).',
      icon: Activity,
      actionText: 'پیگیری و مشاوره',
      color: 'from-emerald-600 to-blue-600'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            مسیر گام‌به‌گام مراقبت سلامت
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-3">
            از جستجوی اولیه تا درمان و پیگیری مستمر
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            فرآیند ساده و یکپارچه شمساز برای دسترسی سریع به مراقبت‌های تشخیصی و درمانی استاندارد
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between text-right relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <item.icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-mono group-hover:text-indigo-200 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={idx === 2 ? onOpenRegistry : onSearchDoctors}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{item.actionText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
