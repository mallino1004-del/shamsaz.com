/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Quote, CheckCircle2, Award, Heart } from 'lucide-react';

export const PatientStoriesAndEvidence: React.FC = () => {
  const testimonials = [
    {
      id: 't-1',
      name: 'مریم کمالی',
      age: '۴۸ ساله · تهران',
      diagnosis: 'بهبودیافته سرطان پستان (Stage IIA)',
      comment: 'در ماموگرافی دوره‌ای سال گذشته یک توده کوچک کشف شد. از طریق شمساز در کمتر از ۲۴ ساعت نوبت بیوپسی و ویزیت فوق تخصص گرفتم. جراحی حفظ پستان انجام شد و اکنون دوره‌های هورمون‌تراپی را سپری می‌کنم. همراهی پلتفرم و یادآوری آزمایش‌ها فوق‌العاده بود.',
      rating: 5,
      date: '۲ ماه پیش'
    },
    {
      id: 't-2',
      name: 'پروانه رضوی',
      age: '۵۴ ساله · مشهد',
      diagnosis: 'بیمار درمان‌شده سرطان اندومتر (Stage IA)',
      comment: 'با علائم خونریزی غیرطبیعی سریعاً مشاوره آنلاین تله‌مدیسین گرفتم. پزشک بلافاصله بیوپسی پایپل را توصیه کرد که منجر به تشخیص در مرحله بسیار زودهنگام شد. با جراحی لاپاراسکوپی بدون نیاز به شیمی‌درمانی بهبود یافتم.',
      rating: 5,
      date: '۳ ماه پیش'
    },
    {
      id: 't-3',
      name: 'فاطمه موسوی',
      age: '۴۲ ساله · اصفهان',
      diagnosis: 'مراجعه‌کننده غربالگری دوره‌ای و پاپ اسمیر',
      comment: 'خیلی نگران تفسیر تست HPV و پاپ اسمیر بودم. با دکتر سمیرا احمدی مشاوره تصویری داشتم که با آرامش کامل و تخصص بالا راهنمایی کردند. ارسال نسخه الکترونیک و داروها به داروخانه محل سکونتم همه‌چیز را بی‌نهایت آسان کرد.',
      rating: 5,
      date: '۱ ماه پیش'
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            تجربه مراجعین و پیامدهای درمان
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-3">
            داستان‌های امید، تشخیص زودهنگام و بهبودی
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            گوشه‌ای از تجربیات واقعی بیماران و همراهان در مسیر تشخیص، درمان و بازگشت به زندگی سالم
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-200 rotate-180" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-6 font-normal">
                  «{item.comment}»
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.age}</div>
                  <div className="text-[10px] font-semibold text-teal-700 mt-0.5">{item.diagnosis}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quantified Rigor Metrics Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center font-mono">
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-teal-400 tabular-nums">۹۸.۶٪</div>
            <div className="text-xs text-slate-300 font-sans mt-1">رضایت‌مندی مراجعین</div>
          </div>
          <div className="p-2 border-r border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 tabular-nums">۵۸</div>
            <div className="text-xs text-slate-300 font-sans mt-1">بیمارستان و مرکز تخصصی همکار</div>
          </div>
          <div className="p-2 border-r border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-pink-400 tabular-nums">&lt; ۲ ساعت</div>
            <div className="text-xs text-slate-300 font-sans mt-1">میانگین زمان انتظار مشاوره آنلاین</div>
          </div>
          <div className="p-2 border-r border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">۱۰۰٪</div>
            <div className="text-xs text-slate-300 font-sans mt-1">تاییدیه مدارک نظام پزشکی</div>
          </div>
        </div>

      </div>
    </section>
  );
};
