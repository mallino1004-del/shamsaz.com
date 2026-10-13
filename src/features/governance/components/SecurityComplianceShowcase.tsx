/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Server, 
  FileCheck2, 
  KeyRound,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Layers,
  Heart
} from 'lucide-react';

interface SecurityComplianceShowcaseProps {
  onNavigate?: (view: string) => void;
}

export const SecurityComplianceShowcase: React.FC<SecurityComplianceShowcaseProps> = ({
  onNavigate,
}) => {
  const standards = [
    {
      title: 'رمزنگاری داده‌ها در حالت سکون و انتقال (AES-256 & TLS 1.3)',
      desc: 'کلیه سوابق هویتی، پرونده‌های بالینی، اسلایدهای پاتولوژی و تصاویر ماموگرافی با کلیدهای امن و مستقل ۲۵۶ بیتی رمزنگاری می‌شوند.',
      icon: Lock,
      tag: 'امنیت سخت‌افزاری',
      details: ['رمزنگاری سخت‌افزاری پایگاه داده', 'تبادل ایمن پایانه‌به‌پایانه (E2EE)', 'مدیریت مجزای کلیدهای رمزنگاری KMS']
    },
    {
      title: 'انطباق با الزامات بین‌المللی سلامت دیجیتال (HIPAA / GDPR)',
      desc: 'جداسازی داده‌های هویتی از اطلاعات بالینی، کنترل دسترسی مبتنی بر نقش (RBAC) و حفظ حریم خصوصی مراجعین.',
      icon: ShieldCheck,
      tag: 'محرمانگی داده',
      details: ['حفظ ناشناسی در تحلیل‌های آماری ملی', 'رضایت‌نامه آگاهانه دیجیتال بیمار', 'تفکیک دسترسی پزشک، کارشناس و ناظر']
    },
    {
      title: 'تعامل‌پذیری و استانداردهای HL7, FHIR و DICOM',
      desc: 'قابلیت تبادل استاندارد پرونده سلامت با سیستم‌های اطلاعات بیمارستانی (HIS)، پکس (PACS) و سامانه‌های آزمایشگاهی (LIS).',
      icon: Database,
      tag: 'تعامل‌پذیری بالینی',
      details: ['پروتکل تبادل سریع منابع بالینی FHIR R4', 'نمایشگر استاندارد تصاویر پزشکی DICOM', 'همگام‌سازی نسخه‌ها با بیمه سلامت و تامین']
    },
    {
      title: 'ممیزی متمرکز، پشتیبان‌گیری چندلایه و پایداری ۹۹.۹٪',
      desc: 'ثبت تغییرناپذیر لاگ دسترسی‌ها (Audit Logging) و پشتیبان‌گیری ساعتی و روزانه جهت تداوم خدمت‌رسانی بدون وقفه.',
      icon: Server,
      tag: 'پایداری بالینی',
      details: ['لاگ تغییرناپذیر تمام تراکنش‌های بالینی', 'پشتیبان‌گیری در مراکز داده مستقل', 'طرح تداوم کسب‌وکار و بازیابی فاجعه (DRP)']
    }
  ];

  return (
    <div className="w-full bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 text-right font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>امنیت، حاکمیت داده و تعامل‌پذیری سلامت</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
            زیرساخت امنیتی، استانداردهای ملی و محرمانگی بالینی شمساز
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            طراحی مهندسی‌شده پلتفرم شمساز بر پایه اصول سخت‌گیرانه امنیت سلامت دیجیتال، رمزنگاری AES-256 و حاکمیت داده‌های پزشکی بیماران سراسر کشور.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standards.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <item.icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-900/50 px-2 py-0.5 rounded-md border border-teal-800">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {item.desc}
                </p>

                <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
                  {item.details.map((d, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/60 text-[11px] text-teal-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>پروتکل فعال و اعتبارسنجی‌شده بالینی</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Contact / Return Action */}
        {onNavigate && (
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-slate-300">
              جهت استعلام گواهی‌های امنیتی یا هماهنگی اتصال سامانه‌های بیمارستانی (HIS)، با مرکز پایش تماس حاصل فرمایید.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به صفحه اصلی</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
