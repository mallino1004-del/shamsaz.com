/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Video, 
  Pill, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  FileCheck2, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';

interface TelemedicineShowcaseProps {
  onStartTelemedicine: () => void;
  onViewOnlineDoctors: () => void;
}

export const TelemedicineShowcase: React.FC<TelemedicineShowcaseProps> = ({
  onStartTelemedicine,
  onViewOnlineDoctors,
}) => {
  return (
    <section className="py-16 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Right Column: Copy & Value Propositions (7 Cols) */}
          <div className="lg:col-span-7 text-right space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-semibold">
              <Video className="w-3.5 h-3.5 text-teal-600" />
              <span>ویزیت آنلاین تصویری و نسخه الکترونیک</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              مشاوره مستقیم با برترین متخصصان، <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 via-indigo-600 to-blue-700">
                از هر نقطه کشور بدون نیاز به سفر
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              با استفاده از زیرساخت تله‌مدیسین شمساز، بیماران در دورترین نقاط می‌توانند بدون تحمل هزینه‌ها و سختی‌های تردد به پایتخت، پرونده ماموگرافی و آزمایش‌های پاتولوژی خود را به صورت تصویری با اساتید برجسته انکولوژی و جراحی بررسی نمایند.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">نسخه الکترونیک معتبر بیمه</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    ثبت آنی اقلام دارویی در سامانه بیمه سلامت و ارسال کد رهگیری به پیامک بیمار.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">بررسی زنده آزمایش و تصویر</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    امکان مشاهده هم‌زمان تصاویر ماموگرافی و اسلایدهای بافتی در طول جلسه ویزیت.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">امنیت و محرمانگی ارتباط</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    رمزنگاری دوسویه نشست ویدیویی منطبق با استانداردهای حریم خصوصی پزشکی.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">صرفه‌جویی در زمان و هزینه</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    شروع ویزیت در موعد مقرر بدون معطلی در سالن‌های انتظار مراکز درمانی.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartTelemedicine}
                className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>ورود به اتاق ویزیت آنلاین تله‌مدیسین</span>
              </button>
              <button
                onClick={onViewOnlineDoctors}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>مشاهده پزشکان دارای نوبت آنلاین</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Left Column: Visual Telemedicine Room Presentation (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 lg:aspect-5/4">
              <img
                src={ASSET_PATHS.telemedicineScene}
                alt="مشاوره تله‌مدیسین و ویزیت آنلاین شمساز"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              {/* Real-time Video Call Overlay Mockup */}
              <div className="absolute bottom-4 right-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center justify-between text-right">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">جلسه فعال مشاوره آنلاین</div>
                    <div className="text-[11px] text-slate-500">پزشک معالج: دکتر سمیرا احمدی</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  HD · رمزنگاری شده
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
