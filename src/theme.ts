/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * theme.ts - پالت رنگی سازمانی آرامش‌بخش، روشن و مینیمال ویژه بیماران انکولوژی
 * طراحی شده بر اساس اصول روانشناسی رنگ در مراکز درمان سرطان:
 * - سفید شیری و کرم ملایم (Milky White / Soft Ivory) جهت کاهش خستگی چشم و القای تمیزی و آرامش
 * - آبی آسمانی روشن (Calm Sky Blue) برای القای آرامش ذهنی، کاهش استرس و امیدواری
 * - صورتی بسیار ملایم (Soft Hope Pink) نماد روبان آگاهی‌بخشی سرطان پستان و زنان با جلوه‌ای ملایم
 * - سبز نعنایی ملایم (Healing Mint) نماد شفا و نشاط زیستی
 */

export interface ColorDefinition {
  hex: string;
  name: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export const oncologyTheme = {
  // ۱. رنگ‌های سازمانی پایه
  colors: {
    // سفید شیری و عاجی ملایم (Milky White)
    milkyWhite: {
      light: '#FDFAF5',
      main: '#FAF7F2',
      surface: '#FFFFFF',
      border: '#EFEBE4',
      name: 'سفید شیری ملایم',
    },
    // آبی آسمانی روشن (Sky Blue)
    skyBlue: {
      soft: '#F0F9FF',
      light: '#E0F2FE',
      main: '#38BDF8',
      deep: '#0284C7',
      name: 'آبی آسمانی آرامش‌بخش',
    },
    // صورتی بسیار ملایم و شکوفه‌ای (Soft Blossom Pink)
    softPink: {
      soft: '#FFF1F2',
      light: '#FFE4E6',
      main: '#FB7185',
      deep: '#E11D48',
      name: 'صورتی بسیار ملایم امید',
    },
    // سبز مریم‌گلی و شفا (Healing Sage / Mint)
    healingMint: {
      soft: '#F0FDF4',
      light: '#DCFCE7',
      main: '#34D399',
      deep: '#059669',
      name: 'سبز مریم‌گلی شفا',
    },
    // یاسی و لوندر ملایم (Gentle Lavender)
    gentleLavender: {
      soft: '#FAF5FF',
      light: '#F3E8FF',
      main: '#C084FC',
      deep: '#9333EA',
      name: 'یاسی تسکین‌دهنده',
    },
    // رنگ‌های متنی چشم‌نواز بدون کنتراست خشن و تیز
    text: {
      primary: '#0F172A',   // تیره ملایم به جای مشکی خالص
      secondary: '#334155', // خاکستری سربی خوانا
      muted: '#64748B',     // خاکستری ملایم راهنما
      subtle: '#94A3B8',    // کم‌رنگ بدون خیرگی
    },
  },

  // کلاس‌های از پیش‌آماده Tailwind برای استایل‌دهی یکپارچه و مینیمالیستی
  styles: {
    // پس‌زمینه سراسری صفحه
    pageBg: 'bg-[#FCFBF9] min-h-screen text-slate-800',
    
    // کانتینر کارت‌های مینیمال
    cardMinimal: 'bg-white rounded-2xl border border-[#ECE7DF] shadow-xs hover:border-[#D8CFBF] hover:shadow-sm transition-all duration-200',
    
    // کارت دسته بندی آیکون‌دار با نهایت سادگی و خلوتی
    categoryCard: 'group relative p-5 bg-white rounded-2xl border border-[#EBE6DD] hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer',
    
    // نشان‌ها (بج‌ها)
    badgePink: 'bg-rose-50/80 text-rose-700 border border-rose-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full',
    badgeSky: 'bg-sky-50/80 text-sky-700 border border-sky-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full',
    badgeMint: 'bg-emerald-50/80 text-emerald-700 border border-emerald-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full',
    badgeLavender: 'bg-purple-50/80 text-purple-700 border border-purple-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full',
    
    // دکمه‌های کنشی آرام
    buttonPrimaryPink: 'bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-2xs',
    buttonPrimarySky: 'bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-2xs',
    buttonSoft: 'bg-[#F5F2EB] hover:bg-[#EDE8DE] text-slate-700 font-medium px-4 py-2 rounded-xl transition-colors',
  }
};

export default oncologyTheme;
