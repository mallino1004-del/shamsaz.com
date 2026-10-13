/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Ribbon, 
  ArrowLeft, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Dna,
  ShieldCheck
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';

interface NationalNetworkPillarsProps {
  onOpenRegistry: () => void;
  onOpenTumorBoard: () => void;
  onOpenAI: () => void;
}

export const NationalNetworkPillars: React.FC<NationalNetworkPillarsProps> = ({
  onOpenRegistry,
  onOpenTumorBoard,
  onOpenAI,
}) => {
  const cancerDomains = [
    {
      id: 'breast',
      title: 'سرطان پستان',
      englishTitle: 'Breast Carcinoma (C50.9)',
      percentage: '۵۳٪ موارد ثبت‌شده',
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
      borderColor: 'hover:border-pink-300',
      protocols: [
        'ماموگرافی سه‌بعدی توموسنتز و سونوگرافی الاستوگرافی',
        'بیوپسی Core Needle تحت گاید رادیولوژی',
        'پنل بیومارکرهای ER, PR, HER2 و Ki-67',
        'جراحی حفظ پستان (BCS) و لنف‌نود نگهبان (SLNB)'
      ],
      description: 'شایع‌ترین سرطان زنان با امکان درمان قطعی بالای ۹۰٪ در صورت تشخیص در مراحل اولیه (Stage I و II).'
    },
    {
      id: 'cervix',
      title: 'سرطان دهانه رحم',
      englishTitle: 'Cervical Carcinoma (C53.9)',
      percentage: '۲۱٪ موارد ثبت‌شده',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      borderColor: 'hover:border-teal-300',
      protocols: [
        'غربالگری دوره‌ای پاپ اسمیر بر پایه مایع (LBC)',
        'تست مولکولی HPV-DNA برای ژنوتیپ‌های پرخطر ۱۶ و ۱۸',
        'کولپوسکوپی دیجیتال و بیوپسی پانچ',
        'هیسترکتومی رادیکال و رادیوشیمی‌درمانی هم‌زمان'
      ],
      description: 'تنها سرطان زنانه با قابلیت پیشگیری ۱۰۰٪ از طریق واکسیناسیون HPV و غربالگری منظم پیش‌سرطانی.'
    },
    {
      id: 'ovary',
      title: 'سرطان تخمدان',
      englishTitle: 'Ovarian Carcinoma (C56)',
      percentage: '۱۶٪ موارد ثبت‌شده',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      borderColor: 'hover:border-purple-300',
      protocols: [
        'سونوگرافی ترانس‌واژینال رنگی (TVUS)',
        'مارکرهای بیوشیمیایی سرمی CA-125 و پروتئین HE4',
        'آزمایش ژنتیک جهش‌های BRCA1 و BRCA2',
        'جراحی سیتورداکتیو کامل و شیمی‌درمانی تارگت (PARP inhibitors)'
      ],
      description: 'تشخیص زودهنگام در افراد پرخطر ژنتیکی، تعیین استیج جراحی دقیق و شیمی‌درمانی‌های هدفمند.'
    },
    {
      id: 'endometrium',
      title: 'سرطان اندومتر (رحم)',
      englishTitle: 'Endometrial Carcinoma (C54.1)',
      percentage: '۱۰٪ موارد ثبت‌شده',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      borderColor: 'hover:border-amber-300',
      protocols: [
        'اندازه‌گیری ضخامت اندومتر با سونوگرافی ترانس‌واژینال',
        'بیوپسی سرپایی آندومتر با پایپل (Pipelle Biopsy)',
        'پاتولوژی هیستوپاتولوژی گرید ۱ تا ۳',
        'هیسترکتومی لاپاراسکوپیک (TLH+BSO)'
      ],
      description: 'علامت شایع خونریزی غیرطبیعی در سنین یائسگی که با مراجعه سریع منجر به کشف در مراحل اولیه می‌گردد.'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white via-pink-50/20 to-slate-50 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3 border border-pink-200">
              <Ribbon className="w-4 h-4 text-pink-600" />
              <span>شبکه ملی سرطان‌های زنان — پروتکل‌های تشخیصی و درمانی</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              مدیریت یکپارچه ۴ سرطان اصلی زنان در کشور
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              زیرساخت ثبت استاندارد بالینی، تطبیق با کدهای بین‌المللی ICD-10 و پایش گام‌به‌گام فرایند غربالگری، پاتولوژی، استیج‌بندی و پیگیری بقای بیماران.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenRegistry}
              className="py-2.5 px-5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>ورود به سامانه ثبت رجیستری</span>
            </button>
            <button
              onClick={onOpenTumorBoard}
              className="py-2.5 px-5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>جلسات هیات تومور (MDT)</span>
            </button>
          </div>
        </div>

        {/* 4 Cancer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cancerDomains.map((cancer) => (
            <div
              key={cancer.id}
              className={`bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between ${cancer.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${cancer.badgeColor}`}>
                    {cancer.percentage}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ICD-10 Target</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5">
                  {cancer.title}
                </h3>
                <div className="text-[11px] font-mono text-slate-500 mb-3">
                  {cancer.englishTitle}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {cancer.description}
                </p>

                <div className="space-y-2 border-t border-slate-100 pt-3 mb-4">
                  <div className="text-[11px] font-bold text-slate-700">پروتکل‌های تشخیصی و پایش:</div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 pr-1">
                    {cancer.protocols.map((proto, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{proto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={onOpenRegistry}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-pink-50 hover:text-pink-700 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>مشاهده پرونده‌ها و فرم ثبت</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Feature Spotlight Banner: AI & National Clinical Infrastructure */}
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
              <Dna className="w-4 h-4" />
              <span>هوش مصنوعی و کلان‌داده سلامت</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              تحلیل بقای کاپلان-مایر و مدل رگرسیون کاکس برای پیش‌آگهی بیماران
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              پلتفرم شمساز با تحلیل چندمتغیره شاخص‌های بالینی (سن، استیج TNM، درجه تمایز تومور و مارکرهای ER/PR/HER2)، مدل‌های پیش‌بینی نرخ عود و بقای ۱ تا ۵ ساله را به عنوان سیستم تصمیم‌یار بالینی (CDSS) در اختیار پزشکان معالج قرار می‌دهد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onOpenAI}
              className="py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>اجرای شبیه‌ساز بقای کاپلان-مایر</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
