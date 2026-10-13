/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Clock, 
  Share2, 
  Heart, 
  Tag,
  Stethoscope,
  ChevronLeft
} from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  tag: string;
  fullContent: string[];
  keyRecommendations: string[];
  scientificRef: string;
}

interface CancerEducationArticlesProps {
  onReadArticle?: (articleId: string) => void;
  onNavigate?: (view: string) => void;
}

export const CancerEducationArticles: React.FC<CancerEducationArticlesProps> = ({
  onReadArticle,
  onNavigate,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const articles: ArticleItem[] = [
    {
      id: 'art-1',
      title: 'راهنمای جامع غربالگری ماموگرافی؛ از چه سنی و هر چند وقت یک‌بار؟',
      category: 'غربالگری پستان',
      readTime: '۵ دقیقه مطالعه',
      date: 'آبان ۱۴۰۳',
      summary: 'ماموگرافی سالیانه از سن ۴۰ سالگی استاندارد طلایی کشف توده‌های زیر ۲ سانتی‌متر است؛ توده‌هایی که سال‌ها قبل از لمس با دست قابل ردیابی هستند.',
      tag: 'پیشگیری اولیه',
      fullContent: [
        'ماموگرافی دیجیتال یکی از موثرترین ابزارهای پزشکی مدرن برای کاهش چشمگیر مرگ‌ومیر ناشی از سرطان پستان است. بر اساس گایدلاین‌های بالینی شبکه ملی و سازمان جهانی بهداشت (WHO)، غربالگری دوره‌ای امکان کشف ضایعات بسیار ریز (میکروکلسیفیکاسیون‌ها) را در مراحل صفر یا یک فراهم می‌کند.',
        'زنانی که سابقه خانوادگی درجه یک (مادر یا خواهر مبتلا به سرطان پستان یا تخمدان) دارند، باید غربالگری را ۱۰ سال زودتر از سن ابتلای خویشاوند خود آغاز نمایند.',
        'انجام خودآزمایی ماهانه پستان (BSE) ۲ الی ۳ روز پس از اتمام دوره قاعدگی توصیه می‌شود تا فرد با بافت طبیعی پستان خود آشنا شده و هرگونه فرورفتگی، تغییر رنگ پوست، ترشح خونی نوک پستان یا توده بدون درد را سریعاً به پزشک معالج گزارش کند.'
      ],
      keyRecommendations: [
        'شروع ماموگرافی از سن ۴۰ سالگی به صورت سالیانه برای تمام زنان با ریسک استاندارد',
        'عدم استفاده از اسپری، مام یا پودر تالک در ناحیه زیربغل در روز انجام ماموگرافی',
        'نگهداری تصاویر و پرونده‌های قبلی ماموگرافی برای مقایسه دقیق تغییرات ساختاری در سال‌های بعد'
      ],
      scientificRef: 'راهنمای بالینی شبکه ملی جامع سرطان (NCCN): غربالگری و تشخیص سرطان پستان (نسخه ۲۰۲۴)'
    },
    {
      id: 'art-2',
      title: 'واکسیناسیون HPV؛ گامی قطعی برای ریشه‌کنی سرطان دهانه رحم',
      category: 'پیشگیری و واکسیناسیون',
      readTime: '۴ دقیقه مطالعه',
      date: 'مهر ۱۴۰۳',
      summary: 'انواع پرخطر ویروس پاپیلومای انسانی (به‌ویژه ۱۶ و ۱۸) عامل اصلی ۹۹٪ سرطان‌های دهانه رحم هستند. با واکسیناسیون به‌موقع و پاپ اسمیر منظم، این بیماری کاملاً قابل ریشه‌کنی است.',
      tag: 'سلامت عمومی',
      fullContent: [
        'سرطان دهانه رحم (سرویکس) از نادر سرطان‌هایی است که عامل اولیه ویروسی مشخص دارد و بنابراین با واکسیناسیون مؤثر و غربالگری منظم تقریباً ۱۰۰٪ قابل پیشگیری است.',
        'واکسن‌های گارداسیل (Gardasil 4 و Gardasil 9) و پاپیلوگارد علیه سویه‌های پرخطر ۱۶ و ۱۸ ایمنی طولانی‌مدت ایجاد می‌کنند. بهترین زمان تزریق پیش از آغاز فعالیت جنسی در سنین ۹ تا ۱۴ سالگی است، اما تزریق آن تا سن ۴۵ سالگی نیز برای محافظت در برابر سویه‌های جدید توصیه می‌گردد.',
        'غربالگری ترکیبی شامل تست پاپ‌اسمیر هر ۳ سال یا تست همزمان پاپ‌اسمیر و HPV DNA هر ۵ سال در سنین ۳۰ تا ۶۵ سالگی استاندارد قطعی شناسایی تغییرات پیش‌بدخیم است.'
      ],
      keyRecommendations: [
        'تزریق واکسن در ۲ دوز (برای سنین زیر ۱۵ سال) و ۳ دوز (برای سنین بالای ۱۵ سال)',
        'ادامه غربالگری دوره‌ای پاپ‌اسمیر حتی پس از تکمیل دوره‌های واکسیناسیون',
        'مراجعه فوری به متخصص زنان در صورت لکه‌بینی پس از تماس زناشویی یا ترشحات غیرعادی'
      ],
      scientificRef: 'راهبرد جهانی سازمان بهداشت جهانی (WHO) جهت ریشه‌کنی سرطان دهانه رحم'
    },
    {
      id: 'art-3',
      title: 'جهش‌های ژنی BRCA1 و BRCA2؛ چه کسانی باید آزمایش ژنتیک بدهند؟',
      category: 'ژنتیک و انکولوژی',
      readTime: '۶ دقیقه مطالعه',
      date: 'شهریور ۱۴۰۳',
      summary: 'بررسی ضرورت مشاوره ژنتیک در خانواده‌هایی با سابقه ابتلای بستگان درجه یک به سرطان‌های پستان و تخمدان در سنین جوانی.',
      tag: 'تخصصی',
      fullContent: [
        'ژن‌های BRCA1 و BRCA2 در ترمیم شکستگی‌های DNA سلولی نقش حیاتی دارند. وقوع جهش‌های بیماری‌زا در این ژن‌ها شانس ابتلا به سرطان پستان را تا ۷۰٪ و سرطان تخمدان را تا ۴۰٪ در طول عمر افزایش می‌دهد.',
        'آزمایش ژنتیک NGS در مواردی توصیه می‌شود که فرد دارای سابقه خانوادگی چند مورد ابتلا به سرطان پستان قبل از سن ۵۰ سالگی، سرطان تخمدان در هر سنی، یا ابتلای سرطان پستان در مردان خانواده باشد.',
        'شناسایی جهش ژنی امکان پیشگیری هدفمند، از جمله ماموگرافی و MRI سالیانه متناوب از سن ۲۵ سالگی، دارودرمانی محافظتی و در صورت تمایل جراحی‌های کاهش‌دهنده ریسک را فراهم می‌سازد.'
      ],
      keyRecommendations: [
        'انجام مشاوره ژنتیک پیش از اقدام به آزمایش خون برای بررسی شجره‌نامه خانوادگی',
        'پایش ویژه تخمدان‌ها با سونوگرافی داپلر و آزمایش خون CA-125 هر ۶ ماه پس از ۳۵ سالگی',
        'بررسی اعضای درجه یک خانواده در صورت اثبات جهش در فرد مبتلا'
      ],
      scientificRef: 'شیوه‌نامه رسمی انجمن انکولوژی بالینی آمریکا (ASCO): آزمایش ژنتیک و استعداد ارثی سرطان'
    },
    {
      id: 'art-4',
      title: 'رژیم‌های شیمی‌درمانی نئوادجوانت؛ حفظ بافت پستان قبل از عمل جراحی',
      category: 'درمان‌های نوین',
      readTime: '۵ دقیقه مطالعه',
      date: 'مرداد ۱۴۰۳',
      summary: 'درمان دارویی قبل از عمل جراحی (Neoadjuvant) امکان کوچک‌سازی تومورهای بزرگ‌تر و تبدیل عمل ماستکتومی به جراحی حفظ پستان (BCS) را میسر می‌سازد.',
      tag: 'پروتکل بالینی',
      fullContent: [
        'شیمی‌درمانی نئوادجوانت به تجویز رژیم‌های دارویی سیستمیک پیش از جراحی قطعی تومور اطلاق می‌شود. این رویکرد به ویژه در تومورهای تریپل‌منفی (Triple-Negative) و تومورهای با HER2 مثبت با موفقیت چشمگیری همراه بوده است.',
        'با کوچک شدن توده و کاهش درگیری غدد لنفاوی زیربغل، جراح می‌تواند با اطمینان کامل حاشیه‌های سالم را حفظ کرده و بدون تخلیه کامل بافت، جراحی انکوپلاستیک را به انجام رساند.',
        'دستیابی به پاسخ کامل پاتولوژیک (pCR) در جراحی پس از شیمی‌درمانی، یکی از قدرتمندترین شاخص‌های بالینی بقای طولانی‌مدت بیمار است.'
      ],
      keyRecommendations: [
        'تعبیه کلیپس فلزی یا مارکر نشانه‌گذار در مرکز تومور پیش از آغاز نخستین جلسه شیمی‌درمانی',
        'بررسی مجدد اندازه ضایعه با سونوگرافی یا MRI در نیمه دوره درمان دارویی',
        'تشکیل جلسه کمیسیون هیات تومور پیش از تصمیم‌گیری نهایی درباره تکنیک جراحی'
      ],
      scientificRef: 'اجماع بین‌المللی سن‌گالن (St. Gallen): پروتکل‌های اولیه درمان سرطان پستان'
    }
  ];

  const categories = ['all', 'غربالگری پستان', 'پیشگیری و واکسیناسیون', 'ژنتیک و انکولوژی', 'درمان‌های نوین'];

  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const handleOpenArticle = (art: ArticleItem) => {
    setSelectedArticle(art);
    if (onReadArticle) onReadArticle(art.id);
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-right font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>پایگاه دانش بالینی و آموزش سلامت</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              دانشنامه سلامت بانوان و گایدلاین‌های غربالگری سرطان
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              مجموعه دستورالعمل‌های معتبر، مبتنی بر شواهد علمی (NCCN, WHO) و مورد تأیید اساتید انکولوژی شبکه ملی شمساز.
            </p>
          </div>

          {onNavigate && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('doctors')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>رزرو نوبت غربالگری</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 ml-1">دسته‌بندی موضوعی:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'همه مقالات' : cat}
            </button>
          ))}
        </div>

        {/* 4 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {art.category}
                  </span>
                  <span className="font-mono text-slate-400">{art.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">{art.date}</span>
                <button
                  onClick={() => handleOpenArticle(art)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>مطالعه کامل مقاله</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Detail Modal Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-right space-y-6 shadow-2xl border border-slate-200 relative">
            
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold">
                <span>{selectedArticle.category}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">{selectedArticle.readTime}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">{selectedArticle.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>
            </div>

            {/* Content paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              {selectedArticle.fullContent.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Key recommendations callout */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>نکات کلیدی و توصیه‌های بالینی:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 pr-5 list-disc">
                {selectedArticle.keyRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Scientific source */}
            <div className="text-[11px] text-slate-400 font-mono border-t border-slate-100 pt-3">
              مرجع علمی: {selectedArticle.scientificRef}
            </div>

            {/* Footer action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>

              {onNavigate && (
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    onNavigate('doctors');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>رزرو نوبت پزشک متخصص</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
