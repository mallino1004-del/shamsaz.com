/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Ribbon, 
  Sparkles, 
  Calendar, 
  Video, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Heart, 
  FileText, 
  ChevronLeft, 
  Activity, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  Apple, 
  Coffee, 
  HelpCircle,
  Search,
  PhoneCall,
  Share2,
  Bookmark,
  Users
} from 'lucide-react';
import { Doctor } from '../../../types';

export interface CategoryDetailViewProps {
  categoryId: string;
  onNavigate: (view: string) => void;
  onBookDoctor: (doctor: Doctor) => void;
  doctors: Doctor[];
}

interface CancerCategoryData {
  id: string;
  title: string;
  subtitle: string;
  latinName: string;
  colorTheme: {
    accent: string;
    badge: string;
    button: string;
    lightBg: string;
    border: string;
  };
  overview: string;
  curabilityText: string;
  keyStats: { label: string; value: string; desc: string }[];
  symptoms: {
    title: string;
    description: string;
    isUrgent?: boolean;
  }[];
  diagnostics: {
    name: string;
    targetAge: string;
    interval: string;
    description: string;
  }[];
  treatmentStages: {
    stage: string;
    description: string;
    primaryTreatment: string;
  }[];
  nutritionAndCare: {
    title: string;
    tips: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const CATEGORIES_DATA: Record<string, CancerCategoryData> = {
  'breast-cancer': {
    id: 'breast-cancer',
    title: 'سرطان پستان',
    subtitle: 'شایع‌ترین سرطان در بانوان با بالاترین میزان پاسخ به درمان و بهبودی در تشخیص زودهنگام',
    latinName: 'مرکز تخصصی بیماری‌های پستان و انکولوژی',
    colorTheme: {
      accent: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      lightBg: 'bg-rose-50/40',
      border: 'border-rose-200',
    },
    overview: 'سرطان پستان زمانی رخ می‌دهد که سلول‌های بافت پستان به صورت غیرطبیعی و خارج از کنترل رشد کنند. بیش از ۸۰ درصد توده‌های پستان خوش‌خیم هستند. با پیشرفت‌های چشمگیر پزشکی و پروتکل‌های نوین هدفمند، در صورت تشخیص زودهنگام بیش از ۹۵٪ از بیماران به بهبودی کامل و زندگی باکیفیت بازمی‌گردند.',
    curabilityText: 'تشخیص در مراحل اولیه به بیش از ۹۵٪ نرخ بقای طولانی‌مدت منجر می‌شود.',
    keyStats: [
      { label: 'شانس بهبودی در مرحله اول', value: '۹۶٪+', desc: 'با درمان به موقع و جراحی محافظت‌کننده' },
      { label: 'سن آغاز ماموگرافی دوره‌ای', value: '۴۰ سال', desc: 'هر ۱ الی ۲ سال یک‌بار برای تمام بانوان' },
      { label: 'روش‌های نوین درمان', value: '۴ گانه', desc: 'جراحی انکوپلاستیک، رادیوتراپی، شیمی‌درمانی و هورمون‌تراپی' },
      { label: 'پاسخ به تارگت‌تراپی', value: 'عالی', desc: 'برای تومورهای HER2 مثبت و گیرنده هورمونی' },
    ],
    symptoms: [
      { title: 'لمس توده بدون درد در پستان یا زیر بغل', description: 'شایع‌ترین علامت، لمس توده سفت، بدون حرکت و اغلب بدون درد است.', isUrgent: true },
      { title: 'تغییر در شکل، اندازه یا تقارن پستان', description: 'فرورفتگی پوست (حالت پوست پرتقالی)، کشیدگی نوک پستان به داخل یا برجستگی موضعی.' },
      { title: 'ترشح خودبه‌خودی از نوک پستان', description: 'به ویژه ترشحات خونی، آبکی شفاف یا فقط از یک مجرا خارج شود.', isUrgent: true },
      { title: 'پوسته‌ریزی، قرمزی یا خارش نوک پستان', description: 'پوسته‌پوسته شدن مشابه اگزما در هاله پستان که با پماد موضعی بهبود نمی‌یابد.' },
      { title: 'درد موضعی پایدار', description: 'درد پستان در بیشتر موارد به علت تغییرات هورمونی است اما هر درد نقطه‌ای مداوم نیازمند بررسی است.' },
    ],
    diagnostics: [
      { name: 'ماموگرافی دیجیتال', targetAge: 'بانوان بالای ۴۰ سال', interval: 'سالانه یا هر ۲ سال', description: 'تصویربرداری با اشعه ایکس با دوز بسیار پایین جهت شناسایی میکروکلسیفیکاسیون‌ها سال‌ها پیش از لمس توده.' },
      { name: 'سونوگرافی اختصاصی پستان', targetAge: 'زیر ۴۰ سال و بافت متراکم', interval: 'به عنوان مکمل', description: 'تفکیک کیست‌های حاوی مایع از توده‌های توپر جامد با امواج صوتی ایمن و بدون اشعه.' },
      { name: 'ام‌آر‌آی پستان (Breast MRI)', targetAge: 'افراد پرخطر با جهش BRCA', interval: 'بر اساس نظر پزشک', description: 'دقیق‌ترین تصویربرداری با ماده حاجب جهت غربالگری ناقلین ژن و پایش پاسخ به شیمی‌درمانی.' },
      { name: 'بیوپسی سوزنی (Core Needle Biopsy)', targetAge: 'در صورت مشاهده توده مشکوک', interval: 'تشخیصی قطعی', description: 'نمونه‌برداری دقیق با بی‌حسی موضعی جهت بررسی پاتولوژی و تعیین مارکرهای ER، PR، HER2 و Ki-67.' },
    ],
    treatmentStages: [
      { stage: 'مرحله ۰ (درجا - DCIS)', description: 'سلول‌های غیرطبیعی درون مجاری پستان قرار دارند و دست‌اندازی نکرده‌اند.', primaryTreatment: 'جراحی محدود محافظ پستان + پرتودرمانی اختیاری + دارودرمانی محافظتی' },
      { stage: 'مرحله ۱ (تومور کوچک، زیر ۲ سانتی‌متر)', description: 'تومور به غدد لنفاوی دست‌اندازی نکرده یا بسیار محدود است.', primaryTreatment: 'لامپکتومی (حفظ پستان) + ارزیابی لنف نود پیشاهنگ + رادیوتراپی و هورمون‌تراپی' },
      { stage: 'مرحله ۲ (تومور ۲ تا ۵ سانتی‌متر)', description: 'درگیری غدد لنفاوی زیر بغل خفیف است.', primaryTreatment: 'شیمی‌درمانی نئوادجوانت (پیش از عمل) یا جراحی + پرتودرمانی + تارگت‌تراپی' },
      { stage: 'مرحله ۳ (پیشرفته موضعی)', description: 'تومور بزرگ‌تر یا درگیری چند غده لنفاوی زیر بغل بدون دست‌اندازی دوردست.', primaryTreatment: 'کمیسیون تومور بورد چندتخصصی (MDT) + شیمی‌درمانی پیشرفته + جراحی + پرتودرمانی' },
    ],
    nutritionAndCare: [
      {
        title: 'تغذیه تقویت‌کننده در روزهای شیمی‌درمانی و پرتودرمانی',
        tips: [
          'مصرف پروتئین کافی (تخم‌مرغ آب‌پز، گوشت بوقلمون و ماهی تازه) برای ترمیم بافت‌ها و حفظ گلبول‌های سفید.',
          'استفاده از عصاره زنجبیل تازه یا دم‌نوش نعناع برای کنترل تهوع خفیف صبحگاهی.',
          'نوشیدن حداقل ۸ تا ۱۰ لیوان آب در طول روز جهت دفع بقایای متابولیکی داروها و محافظت از کلیه.',
          'پرهیز از سبزیجات خام نشسته در دوره‌های افت گلبول سفید (نوتروپنی) و استفاده از غذاهای کاملاً پخته.',
        ],
      },
      {
        title: 'پیشگیری و مدیریت تورم دست (لنف‌ادم)',
        tips: [
          'انجام ورزش‌های کششی ملایم شانه و بازو که توسط فیزیوتراپیست لنف‌ادم آموزش داده شده است.',
          'اجتناب از اندازه‌گیری فشار خون، خون‌گیری یا تزریق در سمت دست جراحی‌شده.',
          'مرطوب نگه داشتن مداوم پوست دست و استفاده از دستکش هنگام کار در آشپزخانه یا باغبانی.',
        ],
      },
    ],
    faqs: [
      { question: 'آیا هر توده‌ای در پستان نشانه سرطان است؟', answer: 'خیر، بیش از ۸۰ درصد توده‌های لمس‌شده در پستان خوش‌خیم هستند (مانند فیبروآدنوم یا کیست‌های فیبروکیستیک). با این حال، هر توده جدید باید حتماً توسط متخصص معاینه شود.' },
      { question: 'آیا با وجود سرطان پستان می‌توان پستان را حفظ کرد؟', answer: 'بله، امروزه با جراحی‌های نوین انکوپلاستیک (Oncoplastic Surgery) و شیمی‌درمانی کوچک‌کننده تومور، در اکثر موارد پستان کاملاً حفظ می‌شود و زیبایی ظاهری آن آسیب نمی‌بیند.' },
      { question: 'آیا اعضای خانواده بیمار باید آزمایش ژنتیک انجام دهند؟', answer: 'اگر در خانواده چند مورد ابتلا به سرطان پستان یا تخمدان در سنین پایین وجود دارد، انجام آزمایش ژنتیک جهش‌های BRCA1 و BRCA2 برای خانواده توصیه می‌شود.' },
    ],
  },

  'cervical-cancer': {
    id: 'cervical-cancer',
    title: 'سرطان دهانه رحم (سرویکس)',
    subtitle: 'یکی از قابل‌پیشگیری‌ترین سرطان‌ها در جهان با واکسیناسیون HPV و تست پاپ‌اسمیر',
    latinName: 'غربالگری سرویکس و پیشگیری با واکسیناسیون HPV',
    colorTheme: {
      accent: 'text-teal-600',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      button: 'bg-teal-600 hover:bg-teal-700 text-white',
      lightBg: 'bg-teal-50/40',
      border: 'border-teal-200',
    },
    overview: 'سرطان دهانه رحم در بیش از ۹۹ درصد موارد با عفونت پایدار گونه‌های پرخطر ویروس پاپیلومای انسانی (HPV انواع ۱۶ و ۱۸) مرتبط است. این سرطان سال‌ها مرحله پیش‌سرطانی (CIN) دارد که با آزمایش ساده پاپ‌اسمیر و HPV DNA به راحتی کشف و درمان سرپایی می‌شود.',
    curabilityText: 'در مراحل اولیه بیش از ۹۲٪ بهبودی قطعی با درمان‌های حفظ‌کننده باروری دارد.',
    keyStats: [
      { label: 'قابلیت پیشگیری با واکسن', value: 'تا ۹۰٪', desc: 'تزریق واکسن گارداسیل قبل از مواجهه' },
      { label: 'دقت آزمایش همزمان (Co-testing)', value: '۹۸٪', desc: 'پاپ‌اسمیر مایع + تست مولکولی HPV DNA' },
      { label: 'مدت زمان تبدیل ضایعه پیش‌سرطانی', value: '۵ الی ۱۰ سال', desc: 'فرصت طلایی برای درمان سرپایی و پیشگیری' },
      { label: 'درمان‌های حفظ باروری', value: 'در دسترس', desc: 'رویکرد تراکلکتومی در مراحل ابتدایی' },
    ],
    symptoms: [
      { title: 'خونریزی غیرعادی بین دوره‌های قاعدگی', description: 'هرگونه لکه‌بینی یا خونریزی نامنظم بین سیکل‌ها نیازمند توجه است.', isUrgent: true },
      { title: 'خونریزی پس از رابطه زناشویی (Contact Bleeding)', description: 'مهم‌ترین نشانه هشداردهنده بالینی که باید بلافاصله بررسی شود.', isUrgent: true },
      { title: 'خونریزی بعد از یائسگی', description: 'حتی یک قطره خونریزی پس از دوران یائسگی زنگ خطری مهم برای بررسی اندومتر و دهانه رحم است.', isUrgent: true },
      { title: 'ترشحات غیرعادی واژینال با بوی نامطبوع', description: 'ترشحات آبکی، غلیظ یا خونی که به درمان‌های معمول عفونت جواب نمی‌دهد.' },
      { title: 'درد مبهم در لگن یا پایین کمر', description: 'در مراحل پیشرفته‌تر ممکن است احساس فشار در لگن یا درد هنگام دفع بروز کند.' },
    ],
    diagnostics: [
      { name: 'پاپ اسمیر بر پایه مایع (LBC)', targetAge: 'از سن ۲۱ تا ۶۵ سالگی', interval: 'هر ۳ سال یک‌بار', description: 'بررسی سلول‌شناسی دهانه رحم در محیط مایع با دقت بالا جهت تشخیص دیسپلازی و تغییرات سلولی.' },
      { name: 'تست مولکولی HPV DNA Genotyping', targetAge: 'از ۳۰ سال به بالا', interval: 'هر ۵ سال یک‌بار (با پاپ‌اسمیر)', description: 'شناسایی ژنوتیپ‌های پرخطر ویروس پاپیلومای انسانی به ویژه سوش‌های ۱۶ و ۱۸.' },
      { name: 'کولپوسکوپی (Colposcopy) و بیوپسی', targetAge: 'در صورت نتیجه غیرطبیعی پاپ‌اسمیر', interval: 'تشخیصی در مطب', description: 'مشاهده دهانه رحم با بزرگ‌نمایی نوری و هدایت بیوپسی موضعی بدون درد.' },
      { name: 'کونیزاسیون / LEEP', targetAge: 'در ضایعات پیش‌سرطانی CIN 2/3', interval: 'درمانی-تشخیصی', description: 'برداشتن بافت تغییریافته با حلقه الکتریکی سرپایی که مانع از پیشرفت به سرطان می‌شود.' },
    ],
    treatmentStages: [
      { stage: 'ضایعه پیش‌سرطانی (CIN 1-3)', description: 'فقط در لایه پوششی مخاطی دهانه رحم است.', primaryTreatment: 'لیپ (LEEP) سرپایی یا کرایوتراپی با حفظ کامل رحم و باروری' },
      { stage: 'مرحله ۱ (محدود به دهانه رحم)', description: 'تومور به بافت‌های مجاور یا رحم گسترش نیافته است.', primaryTreatment: 'جراحی رادیکال هیسترکتومی یا تراکلکتومی (برای حفظ باروری مادر)' },
      { stage: 'مرحله ۲ و ۳ (گسترش به پارامتریوم یا دیواره لگن)', description: 'درگیری بافت‌های عمقی لگن بدون گسترش دوردست.', primaryTreatment: 'کمورادیوتراپی همزمان (پرتودرمانی خارجی + براکی‌تراپی داخلی + سیس‌پلاتین)' },
      { stage: 'مرحله ۴ (دست‌اندازی فراتر از لگن)', description: 'گسترش به مثانه، رکتوم یا سایر ارگان‌ها.', primaryTreatment: 'شیمی‌درمانی ترکیبی + ایمونوتراپی (پمبرولیزوماب) و تارگت‌تراپی' },
    ],
    nutritionAndCare: [
      {
        title: 'تقویت سیستم ایمنی برای پاکسازی ویروس HPV',
        tips: [
          'مصرف مداوم منابع آنتی‌اکسیدانی قوی نظیر مرکبات، فلفل دلمه‌ای، چای سبز و زردچوبه.',
          'قطع کامل مصرف دخانیات و قلیان (سیگار ماندگاری ویروس HPV را تا ۳ برابر افزایش می‌دهد).',
          'استفاده از مکمل‌های حاوی اسید فولیک، زینک و ویتامین C با نظر پزشک معالج.',
        ],
      },
      {
        title: 'مراقبت‌های دوران براکی‌تراپی و پرتودرمانی لگن',
        tips: [
          'استفاده از لباس‌های زیر نخی و گشاد برای جلوگیری از اصطکاک پوستی.',
          'پرهیز از غذاهای نفاخ و پرادویه برای کنترل التهاب روده ناشی از رادیوتراپی.',
          'مصرف مایعات فراوان جهت پیشگیری از التهاب مثانه (سیستیت تابشی).',
        ],
      },
    ],
    faqs: [
      { question: 'آیا ابتلا به ویروس HPV به معنای حتمی ابتلا به سرطان است؟', answer: 'خیر، در بیش از ۹۰ درصد موارد، سیستم ایمنی بدن ویروس HPV را ظرف ۱ تا ۲ سال به طور خودکار پاکسازی می‌کند. فقط در صورت ماندگاری سال‌ها ممکن است تغییرات سلولی ایجاد شود.' },
      { question: 'آیا تزریق واکسن گارداسیل بعد از سن ۳۰ سالگی فایده دارد؟', answer: 'بله، طبق گایدلاین‌های جدید تا ۴۵ سالگی تزریق واکسن در برابر سوش‌هایی که فرد هنوز به آنها آلوده نشده ایمنی ایجاد کرده و محافظت‌کننده است.' },
    ],
  },

  'ovarian-cancer': {
    id: 'ovarian-cancer',
    title: 'سرطان تخمدان و لوله‌های فالوپ',
    subtitle: 'شناخت زودهنگام علائم خاموش و پیشرفت‌های چشمگیر در داروهای مهارکننده PARP',
    latinName: 'انکولوژی تخمدان و لوله‌های فالوپ',
    colorTheme: {
      accent: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      lightBg: 'bg-indigo-50/40',
      border: 'border-indigo-200',
    },
    overview: 'سرطان تخمدان اغلب با علائم ملایم گوارشی آغاز می‌شود که در گذشته به عنوان «بیماری خاموش» شناخته می‌شد؛ اما امروزه مشخص شده که علائم هشداردهنده‌ای مانند نفخ مداوم و احساس پری زودهنگام وجود دارد. با ظهور جراحی‌های فوق‌تخصصی و داروهای هدفمند مهارکننده PARP، طول عمر و کیفیت زندگی بیماران تحول عظیمی یافته است.',
    curabilityText: 'درمان‌های نوین هدفمند مهارکننده PARP ماندگاری پاسخ درمانی را چند برابر کرده است.',
    keyStats: [
      { label: 'جهش‌های ژنتیکی شایع', value: 'BRCA1/2', desc: 'پاسخ فوق‌العاده به داروهای PARP Inhibitor' },
      { label: 'شاخص توموری اصلی', value: 'CA-125 و HE4', desc: 'محاسبه شاخص خطر بدخیمی رُما (ROMA Index)' },
      { label: 'رویکرد طلایی جراحی', value: 'سیتورداکتیو', desc: 'حذف کامل ماکروسکوپیک بافت توموری' },
      { label: 'شیمی‌درمانی صفاقی', value: 'HIPEC', desc: 'شیمی‌درمانی هایپرترمی گرم در حین عمل جراحی' },
    ],
    symptoms: [
      { title: 'نفخ شکمی پایدار و افزایش سایز دور کمر', description: 'نفخی که بیش از ۲ تا ۳ هفته طول کشیده و با درمان‌های معمول سوءهاضمه بهبود نیابد.', isUrgent: true },
      { title: 'احساس سیری زودهنگام و بی‌اشتهایی', description: 'احساس پری شدید در معده تنها پس از خوردن چند لقمه کوچک غذا.' },
      { title: 'درد یا فشار مداوم در ناحیه لگن و زیر شکم', description: 'احساس سنگینی، تیر کشیدن در لگن یا کمر که رفع نمی‌شود.' },
      { title: 'تغییر در عادات دفع ادرار یا اجابت مزاج', description: 'تکرر ادرار ناگهانی، احساس فوریت ادرار یا یبوست‌های جدید.' },
      { title: 'خستگی مفرط و کاهش وزن بدون دلیل', description: 'کاهش انرژی و تحلیل عضلانی بدون تغییر در رژیم غذایی.' },
    ],
    diagnostics: [
      { name: 'سونوگرافی ترنس‌واژینال با کالر داپلر', targetAge: 'در صورت علائم پایدار لگنی', interval: 'قدم اول تشخیصی', description: 'بررسی ساختار تخمدان‌ها، ضخامت دیواره، وجود اجزای جامد و الگوی خون‌رسانی عروقی.' },
      { name: 'آزمایش خون تومور مارکر CA-125 و HE4', targetAge: 'تکمیل ارزیابی توده تخمدان', interval: 'تشخیصی و پیگیری', description: 'اندازه‌گیری پروتئین‌های خونی مرتبط با بافت تخمدان و محاسبه ضریب خطر الگوریتم ROMA.' },
      { name: 'سی‌تی اسکن و ام‌آر‌آی لگن و شکم', targetAge: 'استیج‌بندی بالینی', interval: 'پیش از جراحی', description: 'بررسی کبد، پرده صفاق، روده و غدد لنفاوی جهت تدوین استراتژی جراحی دقیق.' },
      { name: 'توالی‌یابی ژنتیکی پنل HRD و BRCA', targetAge: 'کلیه مبتلایان به سرطان اپی‌تلیال تخمدان', interval: 'یک‌بار برای همیشه', description: 'تعیین وضعیت جهش ژنتیکی جهت انتخاب داروی هدفمند اولاپاریب و رژیم نگهدارنده.' },
    ],
    treatmentStages: [
      { stage: 'مرحله ۱ (محدود به یک یا دو تخمدان)', description: 'سلول سرطانی به کپسول خارجی یا صفاق نرسیده است.', primaryTreatment: 'جراحی دقیق استیجینگ + در موارد پرخطر شیمی‌درمانی کاربوپلاتین/پاکلی‌تاکسل' },
      { stage: 'مرحله ۲ (گسترش به احشای لگنی)', description: 'درگیری رحم، لوله‌ها یا مثانه و رکتوم بدون درگیری بالای لگن.', primaryTreatment: 'جراحی دبرایدینگ سیتورداکتیو + شیمی‌درمانی ترکیبی استاندارد' },
      { stage: 'مرحله ۳ (درگیری صفاق بالای لگن)', description: 'درگیری صفاق شکم یا غدد لنفاوی رتروپریتوئن.', primaryTreatment: 'جراحی سیتورداکتیو پیشرفته (Debulking) + شیمی‌درمانی + داروی مهارکننده PARP' },
      { stage: 'مرحله ۴ (دست‌اندازی به ارگان‌های دوردست)', description: 'افیوژن پلور خونی یا درگیری کبد و ریه.', primaryTreatment: 'شیمی‌درمانی نئوادجوانت کوچک‌کننده تومور + جراحی فاصله‌ای + تارگت‌تراپی' },
    ],
    nutritionAndCare: [
      {
        title: 'رژیم غذایی سبک برای مهار نفخ و سیری زودرس',
        tips: [
          'تقسیم وعده‌های غذایی به ۵ الی ۶ وعده کوچک و پرکالری در طول روز به جای ۳ وعده حجیم.',
          'مصرف اسموتی‌های حاوی موز، شیر کم‌لاکتوز یا شیر بادام، کره بادام‌زمینی و پودر پروتئین مرغوب.',
          'پرهیز از حبوبات نفاخ، کلم بروکلی خام و نوشابه‌های گازدار.',
        ],
      },
      {
        title: 'تسکین عوارض جانبی شیمی‌درمانی مبتنی بر پلاتین',
        tips: [
          'پوشیدن جوراب و دستکش‌های نخی نرم برای محافظت از انتهاهای عصبی (نوروپاتی محیطی).',
          'استفاده از کمپرس خنک و دهان‌شویه‌های ملایم بدون الکل جهت پیشگیری از زخم دهان.',
        ],
      },
    ],
    faqs: [
      { question: 'آیا بالا بودن مارکر CA-125 حتماً نشان‌دهنده سرطان تخمدان است؟', answer: 'خیر، مارکر CA-125 در شرایط غیرسرطانی مانند اندومتریوز، فیبروم رحمی، عفونت لگنی و حتی قاعدگی نیز می‌تواند بالا برود. ارزیابی همراه با سونوگرافی و HE4 الزامی است.' },
      { question: 'داروهای مهارکننده PARP چگونه عمل می‌کنند؟', answer: 'این داروها مکانیزم ترمیم DNA سلول سرطانی را مختل می‌کنند و به ویژه در افراد حامل جهش ژن BRCA باعث تخریب اختصاصی سلول‌های توموری با عوارض عمومی بسیار کمتر می‌شوند.' },
    ],
  },

  'uterine-cancer': {
    id: 'uterine-cancer',
    title: 'سرطان رحم و اندومتر',
    subtitle: 'شناسایی به موقع با علامت واضح خونریزی غیرعادی و درصد درمان‌پذیری بالا',
    latinName: 'انکولوژی رحم و آندومتر',
    colorTheme: {
      accent: 'text-fuchsia-600',
      badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
      lightBg: 'bg-fuchsia-50/40',
      border: 'border-fuchsia-200',
    },
    overview: 'سرطان اندومتر که از پوشش داخلی رحم منشأ می‌گیرد، به دلیل علامت زودهنگام و بارز «خونریزی پس از یائسگی»، در بیشتر از ۷۵٪ موارد در مراحل بسیار ابتدایی شناسایی می‌شود و با جراحی هیسترکتومی کامل به درمان قطعی می‌انجامد.',
    curabilityText: 'در بیش از ۸۵٪ موارد به علت تشخیص در مرحله یک، درمان قطعی حاصل می‌شود.',
    keyStats: [
      { label: 'علامت کلیدی تشخیصی', value: 'خونریزی یائسگی', desc: 'حتی یک لکه خون پس از قطع قاعدگی باید بررسی شود' },
      { label: 'روش طلایی نمونه‌برداری', value: 'پایپل سرپایی', desc: 'بیوپسی اندومتر بدون نیاز به بیهوشی در مطب' },
      { label: 'جراحی کم‌تهاجمی', value: 'لاپاراسکوپی', desc: 'ترخیص سریع و نقاهت کوتاه با جراحی لیزری' },
      { label: 'طبقه‌بندی مولکولی', value: 'TCGA نوین', desc: 'شامل POLE mutant، MMRd و p53 جهت تعیین درمان' },
    ],
    symptoms: [
      { title: 'خونریزی واژینال پس از دوران یائسگی', description: 'مهم‌ترین نشانه که در ۹۰٪ موارد وجود دارد و نیازمند بررسی سریع با سونوگرافی و نمونه‌برداری است.', isUrgent: true },
      { title: 'خونریزی غیرطبیعی و طولانی در سنین قبل از یائسگی', description: 'سیکل‌های ماهانه به شدت سنگین یا خونریزی مکرر بین دو عادت ماهانه.', isUrgent: true },
      { title: 'ترشحات آبکی یا صورتی رنگ واژینال', description: 'ترشحاتی که ممکن است قبل از شروع خونریزی بارز ظاهر شوند.' },
      { title: 'درد یا احساس سنگینی در زیر ناف و لگن', description: 'در مواردی که تومور بزرگ شده یا دهانه رحم مسدود شده باشد.' },
    ],
    diagnostics: [
      { name: 'سونوگرافی ترنس‌واژینال و ضخامت اندومتر', targetAge: 'بانوان یائسه با لکه‌بینی', interval: 'فوری', description: 'اندازه‌گیری ضخامت آندومتر؛ ضخامت بیش از ۴ میلی‌متر در خانم‌های یائسه نیاز به نمونه‌برداری دارد.' },
      { name: 'بیوپسی سرپایی با پایپل (Pipelle Biopsy)', targetAge: 'در صورت ضخامت غیرطبیعی اندومتر', interval: 'تشخیصی سرپایی', description: 'نمونه‌برداری سریع در مطب بدون نیاز به بستری یا بیهوشی برای بررسی بافت‌شناسی.' },
      { name: 'هیستروسکوپی و کورتاژ تشخیصی (D&C)', targetAge: 'در موارد نمونه ناکافی پایپل', interval: 'اتاق عمل سرپایی', description: 'مشاهده مستقیم داخل حفره رحم با دوربین باریک و برداشتن دقیق بافت‌های مشکوک.' },
      { name: 'ام‌آر‌آی لگن با ماده حاجب', targetAge: 'ارزیابی عمق تهاجم عضلانی', interval: 'پیش از جراحی', description: 'بررسی میزان نفوذ تومور به میومتر (عضله رحم) و غدد لنفاوی لگنی.' },
    ],
    treatmentStages: [
      { stage: 'مرحله ۱ (محدود به تنه رحم)', description: 'تومور به دهانه رحم یا بیرون رحم نرسیده است.', primaryTreatment: 'هیسترکتومی کامل توتال لاپاراسکوپیک + برداشتن تخمدان‌ها و لنف نود پیشاهنگ' },
      { stage: 'مرحله ۲ (تهاجم به استرومای سرویکس)', description: 'تومور دهانه رحم را درگیر کرده اما خارج از رحم نرفته.', primaryTreatment: 'جراحی رادیکال + براکی‌تراپی واژینال یا پرتودرمانی لگن' },
      { stage: 'مرحله ۳ (گسترش به تخمدان‌ها، واژن یا غدد لنفاوی)', description: 'درگیری اعضای مجاور لگنی.', primaryTreatment: 'جراحی سیتورداکتیو + کمورادیوتراپی ترکیبی' },
      { stage: 'مرحله ۴ (دست‌اندازی به مثانه یا ارگان‌های دور)', description: 'درگیری فراتر از لگن.', primaryTreatment: 'شیمی‌درمانی سیستمیک + هورمون‌تراپی (پروژسترون) و ایمونوتراپی' },
    ],
    nutritionAndCare: [
      {
        title: 'مدیریت وزن و اصلاح سبک زندگی',
        tips: [
          'کاهش وزن تدریجی؛ بافت چربی اضافه استروژن تولید می‌کند که محرک رشد بافت اندومتر است.',
          'پیروی از رژیم غذایی کم‌چرب و غنی از غلات کامل، فیبر و حبوبات.',
          'کنترل دقیق قند خون و فشار خون با کمک متخصص غدد و داخلی.',
        ],
      },
      {
        title: 'مراقبت‌های پس از جراحی هیسترکتومی',
        tips: [
          'پرهیز از بلند کردن اجسام سنگین‌تر از ۳ کیلوگرم به مدت ۶ تا ۸ هفته.',
          'پیاده‌روی روزانه ملایم در محیط منزل جهت جلوگیری از لخته شدن خون (DVT).',
        ],
      },
    ],
    faqs: [
      { question: 'آیا برداشتن رحم باعث پیری زودرس می‌شود؟', answer: 'خیر، رحم عضله‌ای برای بارداری است و هورمون ترشح نمی‌کند. در صورتی که تخمدان‌ها نیز در بانوان جوان برداشته شود، راهکارهای محافظتی و مکمل‌های غیرهورمونی توسط انکولوژیست تجویز می‌گردد.' },
      { question: 'آیا چاقی ریسک سرطان اندومتر را بالا می‌برد؟', answer: 'بله، چاقی به علت تبدیل آندروژن‌ها به استروژن در بافت چربی یکی از عوامل خطر شناخته‌شده است؛ اما با اصلاح وزن و ورزش این ریسک به طور چشمگیری کاهش می‌یابد.' },
    ],
  },

  'patient-support': {
    id: 'patient-support',
    title: 'خدمات حمایتی، روانشناسی و تغذیه سرطان',
    subtitle: 'آرامش روان، مدیریت تغذیه در دوران شیمی‌درمانی و امید به آینده در کنار شما',
    latinName: 'مراقبت‌های تسکینی، انکوپسیار و تغذیه بالینی',
    colorTheme: {
      accent: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      lightBg: 'bg-emerald-50/40',
      border: 'border-emerald-200',
    },
    overview: 'مسیر درمان بیماری فراتر از دارو و جراحی است. آرامش روان، خواب باکیفیت، تغذیه علمی جهت تحمل عوارض شیمی‌درمانی و حمایت گرم خانواده، ارکان اساسی بهبودی هستند. تیم همیاران بالینی شمساز در هر ساعت از شبانه‌روز حامی و پاسخگوی شماست.',
    curabilityText: 'روحیه امیدوار و تغذیه علمی توان تحمل درمان و سرعت بازسازی سلولی را تا ۴۰٪ افزایش می‌دهد.',
    keyStats: [
      { label: 'مشاوره روان‌تنی (Psycho-oncology)', value: 'رایگان', desc: 'جلسات آنلاین با روانشناسان متخصص سرطان' },
      { label: 'رژیم غذایی شخصی‌سازی‌شده', value: 'تخصصی', desc: 'برنامه تغذیه انطباقی بر پایه جواب آزمایش‌ها' },
      { label: 'خط گرم تلفنی آرامش', value: '۲۴ ساعته', desc: 'پاسخگویی به اضطراب‌ها و سوالات دارویی' },
      { label: 'گروه‌های همیار بهبودیافتگان', value: 'هفتگی', desc: 'اشتراک تجربیات با بانوانی که سرطان را شکست دادند' },
    ],
    symptoms: [
      { title: 'خستگی مداوم ناشی از درمان (Cancer-Related Fatigue)', description: 'احساس کمبود انرژی که با استراحت معمولی برطرف نمی‌شود؛ نیازمند برنامه‌ریزی فعالیت‌های سبک است.' },
      { title: 'اضطراب، دلشوره و بی‌خوابی شبانه', description: 'واکنش کاملاً طبیعی روان به تشخیص بیماری که با تکنیک‌های آرام‌سازی و گفت‌وگو تسکین می‌یابد.' },
      { title: 'تغییر طعم دهان و بی‌میلی به غذا', description: 'طعم فلزی یا تلخ در دهان به علت داروهای شیمی‌درمانی که با راهکارهای تغذیه‌ای بهبود می‌یابد.' },
      { title: 'نگرانی از تغییرات ظاهری و ریزش مو', description: 'یادآوری اینکه ریزش مو موقتی است و بلافاصله پس از پایان دوره‌ها با تراکم بیشتر رشد می‌کند.' },
    ],
    diagnostics: [
      { name: 'ارزیابی شاخص سنجش اضطراب HADS', targetAge: 'تمام بیماران در شروع و حین درمان', interval: 'ماهانه', description: 'پرسشنامه استاندارد روانشناسی انکولوژی جهت ارزیابی سطح تنش روانی و نیاز به مداخله.' },
      { name: 'پایش شاخص توده بدنی و آلبومین خون', targetAge: 'حین دوره‌های شیمی‌درمانی', interval: 'قبل از هر دوره', description: 'بررسی وضعیت پروتئین خون و پیشگیری از افت وزن و تحلیل عضله (کاشکسی).' },
      { name: 'ارزیابی کیفیت خواب و خستگی بالینی', targetAge: 'دوره‌های نقاهت', interval: 'پیوسته', description: 'تنظیم ساعت بیولوژیک بدن با تمرین‌های ذهن‌آگاهی و نوردرمانی صبحگاهی.' },
      { name: 'مشاوره سلامت زناشویی و تصویر بدن', targetAge: 'پس از جراحی‌های انکولوژی', interval: 'در صورت نیاز', description: 'راهنمایی‌های تخصصی برای بازگشت به زندگی زناشویی سالم و رضایت‌بخش.' },
    ],
    treatmentStages: [
      { stage: 'هفته‌های اول پس از تشخیص (مدیریت شوک و اضطراب)', description: 'کنترل افکار منفی، همراهی خانواده و انتخاب تیم پزشکی مطمئن.', primaryTreatment: 'جلسات مشاوره روانی، شفاف‌سازی نقشه درمان و پرهیز از جستجو در منابع نامعتبر اینترنتی' },
      { stage: 'حین دوره‌های درمان فعال (شیمی‌درمانی و رادیوتراپی)', description: 'تمرکز بر حفظ توان جسمی، مصرف مکمل‌های مجاز و تسکین تهوع.', primaryTreatment: 'برنامه تغذیه دقیق، آب‌رسانی پیوسته، ورزش‌های کششی سبک و ارتباط با همیاران' },
      { stage: 'دوران پس از پایان درمان (بقا و بازگشت به زندگی عادی)', description: 'غلبه بر ترس از عود بیماری و بازیابی کامل اعتماد به نفس و نشاط.', primaryTreatment: 'توانبخشی جسمی، چکاپ‌های منظم و شرکت در کارگاه‌های سبک زندگی سالم' },
    ],
    nutritionAndCare: [
      {
        title: 'دستورالعمل‌های طلایی رفع طعم بد دهان و تهوع',
        tips: [
          'استفاده از قاشق و چنگال غیرفلزی (چوبی یا پلاستیکی محکم) برای کاهش طعم فلزی دهان.',
          'مکیدن قطعات کوچک یخ میوه‌ای طبیعی (لیمو یا هندوانه) پیش از غذا.',
          'مصرف غذاها در دمای اتاق یا خنک؛ بوی غذای داغ می‌تواند تهوع را تشدید کند.',
          'شستشوی دهان قبل و بعد از غذا با محلول آب‌نمک بسیار رقیق و جوش‌شیرین خانگی.',
        ],
      },
      {
        title: 'تکنیک‌های آرامش عضلانی و خواب راحت',
        tips: [
          'تنفس عمیق شکمی ۴-۷-۸ پیش از خواب (۴ ثانیه دم، ۷ ثانیه حبس نفس، ۸ ثانیه بازدم آرام).',
          'گوش دادن به فایل‌های صوتی آرامش‌بخش و مراقبه اختصاصی پلتفرم شمساز.',
          'پرهیز از نگاه کردن به صفحات موبایل در تاریکی اتاق خواب حداقل ۱ ساعت قبل از خواب.',
        ],
      },
    ],
    faqs: [
      { question: 'چگونه می‌توانم با بیمارم درباره بیماری‌اش گفت‌وگو کنم بدون اینکه ناراحت شود؟', answer: 'به جای پنهان‌کاری یا گفتن جملات کلیشه‌ای مثل «غصه نخور همه چی خوب میشه»، شنونده همدل باشید. بگویید «من کنارت هستم، هر احساسی داری طبیعیه و با هم از این مسیر عبور می‌کنیم».' },
      { question: 'آیا مصرف مکمل‌های گیاهی در دوران شیمی‌درمانی مجاز است؟', answer: 'مصرف خودسرانه هر نوع گیاه دارویی یا آنتی‌اکسیدان با دوز بالا ممکن است با داروهای شیمی‌درمانی تداخل ایجاد کند. هر مکملی باید دقیقاً به اطلاع پزشک معالج برسد.' },
    ],
  },
};

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  categoryId,
  onNavigate,
  onBookDoctor,
  doctors,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'diagnostics' | 'treatments' | 'nutrition' | 'doctors'>('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Fallback to breast-cancer if key not found
  const data = CATEGORIES_DATA[categoryId] || CATEGORIES_DATA['breast-cancer'];

  // Filter doctors that match this specialty
  const relevantDoctors = doctors.filter(doc => {
    if (categoryId === 'breast-cancer') {
      return doc.specialty.includes('آنکولوژی') || doc.specialty.includes('جراحی') || doc.bio.includes('پستان');
    }
    if (categoryId === 'cervical-cancer' || categoryId === 'ovarian-cancer' || categoryId === 'uterine-cancer') {
      return doc.specialty.includes('زنان') || doc.specialty.includes('آنکولوژی');
    }
    return true;
  }).slice(0, 4);

  return (
    <div className="w-full bg-white text-slate-800 text-right font-sans pb-24" dir="rtl">
      
      {/* =========================================================================
          TOP BREADCRUMB & CONTEXT STRIP
          ========================================================================= */}
      <div className="bg-slate-50/80 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>صفحه اصلی</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">دانشنامه و راهنمای سرطان‌های زنان</span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-slate-900">{data.title}</span>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>بازگشت به لندینگ پیج</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          SERENE, BRIGHT WHITE HERO BANNER (White / Soft Light Tints)
          ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-white pt-10 pb-12 border-b border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left/Main Column: Title & Reassuring Headline */}
            <div className="space-y-4 max-w-3xl">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${data.colorTheme.badge}`}>
                  <Ribbon className="w-3.5 h-3.5 inline" />
                  <span>راهنمای جامع بالینی و مراقبت بیمار</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {data.latinName}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {data.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {data.subtitle}
              </p>

              {/* Reassuring Hope Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold">پیام امید و اطمینان علمی: </span>
                  {data.curabilityText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('screening')}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>شروع ارزیابی هوشمند علائم ({data.title})</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('doctors')}
                  className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>نوبت‌دهی پزشکان فوق‌تخصص</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('telemedicine')}
                  className="px-4 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-teal-600" />
                  <span>ویزیت تصویری آنلاین</span>
                </button>
              </div>

            </div>

            {/* Right Quick Info Card */}
            <div className="w-full lg:w-80 shrink-0 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">پشتیبانی و همراهی</div>
                  <div className="text-[11px] text-slate-500">پزشکان انکولوژیست ایران</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>وضعیت غربالگری:</span>
                  <span className="font-bold text-emerald-600">فعال و در دسترس</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>پزشکان آنلاین:</span>
                  <span className="font-bold text-indigo-600 font-mono">۲۴ متخصص فعال</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>مشاوره تلفنی:</span>
                  <span className="font-bold text-slate-800 font-mono">۰۲۱-۹۱۰۰۸۸۴۴</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => onNavigate('patient-portal')}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ثبت در پرونده سلامت من</span>
                </button>
              </div>
            </div>

          </div>

          {/* 4 Clean Key Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            {data.keyStats.map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-right">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          CONTENT TABS NAVIGATION
          ========================================================================= */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              درباره بیماری و تعاریف
            </button>

            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'symptoms'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              علائم و نشانه‌های هشدار
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'diagnostics'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              روش‌های غربالگری و آزمایش‌ها
            </button>

            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'treatments'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              مراحل و پروتکل‌های درمانی
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'nutrition'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              رژیم تغذیه و مراقبت از خود
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              پزشکان فوق‌تخصص و نوبت‌دهی
            </button>

          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              شناخت و تعاریف بالینی {data.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {data.overview}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold mb-3">
                  <Ribbon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">غربالگری بموقع</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تست‌های روتین دوره‌ای می‌توانند ضایعات اولیه را قبل از تبدیل شدن به تومورهای تهاجمی کشف کنند.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">درمان چندتخصصی (MDT)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تصمیم‌گیری مشترک جراح، انکولوژیست، رادیوتراپیست و پاتولوژیست بهترین پروتکل را تعیین می‌کند.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">کیفیت زندگی و امید</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  رویکردهای حفظ زیبایی، درمان‌های سرپایی کم‌عارضه و حمایت‌های روانی بازگشت سریع بیمار را تضمین می‌کنند.
                </p>
              </div>
            </div>
          </div>

          {/* Screening Call to action card */}
          <div className="bg-gradient-to-r from-rose-50 via-white to-pink-50 rounded-3xl p-6 sm:p-8 border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-right">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                ارزیابی فوری و رایگان
              </span>
              <h3 className="text-xl font-black text-slate-900">
                آیا علائم مشکوکی احساس می‌کنید؟
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                در پرسشنامه غربالگری هوشمند شمساز شرکت کنید؛ کارنامه ارزیابی بالینی شما بلافاصله صادر شده و در پرونده پزشکی شما جهت بررسی متخصص ثبت می‌گردد.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('screening')}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>ورود به غربالگری علائم</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: SYMPTOMS
          ========================================================================= */}
      {activeTab === 'symptoms' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          <div className="text-right space-y-2 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              علائم و نشانه‌های نیازمند بررسی پزشک در {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              مشاهده هر یک از این نشانه‌ها به منزله ابتلا قطعی به بیماری نیست، اما نشان‌دهنده لزوم معاینه بالینی دقیق توسط فوق‌تخصص است.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.symptoms.map((item, index) => (
              <div 
                key={index} 
                className={`p-5 rounded-2xl border transition-all text-right flex items-start gap-4 ${
                  item.isUrgent 
                    ? 'bg-rose-50/50 border-rose-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.isUrgent ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.isUrgent ? <AlertCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    {item.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold">
                        نیاز به ویزیت سریع
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => onNavigate('screening')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>ثبت این علائم در پرسشنامه غربالگری هوشمند</span>
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: DIAGNOSTICS & SCREENING
          ========================================================================= */}
      {activeTab === 'diagnostics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          <div className="text-right space-y-2 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              روش‌های استاندارد تشخیص، تصویربرداری و آزمایش‌های {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              بر اساس پروتکل‌های رسمی وزارت بهداشت و انجمن‌های بین‌المللی انکولوژی زنان (ASCO / NCCN).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.diagnostics.map((diag, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-right">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-base">
                    {diag.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
                    {diag.interval}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  گروه هدف: <span className="text-slate-800 font-bold">{diag.targetAge}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {diag.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 4: TREATMENT PROTOCOLS & STAGES
          ========================================================================= */}
      {activeTab === 'treatments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          <div className="text-right space-y-2 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              مراحل بالینی (Staging) و گزینه‌های درمانی {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              استراتژی درمان با توجه به مرحله بیماری، وضعیت گیرنده‌ها و تصمیم کمیسیون تومور بورد (MDT) تنظیم می‌شود.
            </p>
          </div>

          <div className="space-y-4">
            {data.treatmentStages.map((stg, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs font-mono">
                      {index + 1}
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      {stg.stage}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pr-9">
                    {stg.description}
                  </p>
                </div>

                <div className="md:w-80 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">پروتکل درمانی ارجح:</div>
                  <div className="text-xs font-black text-indigo-950 leading-relaxed">
                    {stg.primaryTreatment}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-indigo-950 text-sm">بررسی پرونده در کمیسیون مجازی تومور بورد (MDT)</div>
              <div className="text-xs text-indigo-800 mt-0.5">بررسی همزمان پرونده توسط تیم انکولوژیست، جراح و رادیوتراپیست</div>
            </div>
            <button
              onClick={() => onNavigate('tumor-board')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              ارسال مدارک به تومور بورد
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 5: NUTRITION & SELF-CARE
          ========================================================================= */}
      {activeTab === 'nutrition' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <div className="text-right space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              راهنمای تغذیه، خود‌مراقبتی و مدیریت عوارض در {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              توصیه‌های کاربردی تغذیه علمی برای بیماران در دوره‌های شیمی‌درمانی، جراحی و نقاهت.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.nutritionAndCare.map((block, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-right">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Apple className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {block.title}
                  </h3>
                </div>

                <ul className="space-y-3">
                  {block.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-right">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>پرسش‌های پرتکرار بیماران درباره {data.title}</span>
            </h3>

            <div className="space-y-3">
              {data.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                    className="w-full p-4 bg-slate-50/60 hover:bg-slate-100/60 text-right font-black text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 font-mono text-sm">{activeFaq === fIdx ? '−' : '+'}</span>
                  </button>
                  {activeFaq === fIdx && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 6: SPECIALIST DOCTORS
          ========================================================================= */}
      {activeTab === 'doctors' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="text-right space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                پزشکان فوق‌تخصص انکولوژی و جراحی زنان ({data.title})
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                امکان رزرو نوبت حضوری یا آنلاین با برجسته‌ترین اعضای هیات علمی و متخصصان کشور
              </p>
            </div>

            <button
              onClick={() => onNavigate('doctors')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>مشاهده تمام ۱۰۰ پزشک</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relevantDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-right group">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {doc.specialty}
                      </p>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        {doc.hospital}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                    {doc.bio}
                  </p>

                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl text-slate-500">
                    <span>سابقه: {doc.experienceYears} سال</span>
                    <span className="font-bold text-amber-600">★ {doc.rating}</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    رزرو نوبت
                  </button>
                  <button
                    onClick={() => onNavigate('telemedicine')}
                    className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer"
                    title="ویزیت آنلاین"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          BOTTOM ASSISTANCE BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-6 text-right">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-black text-slate-900">
                مرکز همراهی و صدای آرامش بیماران شمساز
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              اگر در خصوص نتایج آزمایش، نوبت پزشک یا عوارض دارویی سوالی دارید، هم‌اکنون با کارشناسان بالینی ما تماس بگیرید.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:02191008844"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-300 shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span className="font-mono">۰۲۱-۹۱۰۰۸۸۴۴</span>
            </a>
            <button
              onClick={() => onNavigate('patient-portal')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>میز کاربری من</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
