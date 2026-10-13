/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Ribbon, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Video, 
  Users, 
  Cpu, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  HeartHandshake, 
  CheckCircle2, 
  Stethoscope, 
  BarChart3,
  Award,
  Zap
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';

interface HeroMotionBannerProps {
  onOpenRegistry: () => void;
  onOpenTelemedicine?: () => void;
  onOpenTumorBoard?: () => void;
  onOpenAICDSS?: () => void;
  onSearchDoctors?: () => void;
}

export const HeroMotionBanner: React.FC<HeroMotionBannerProps> = ({
  onOpenRegistry,
  onOpenTelemedicine,
  onOpenTumorBoard,
  onOpenAICDSS,
  onSearchDoctors,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const autoPlayTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  const slides = [
    // Slide 0: National Women's Cancer Registry & Pink Ribbon Awareness
    {
      id: 'slide-registry',
      category: 'شبکه ملی سلامت بانوان',
      tag: 'غربالگری زودهنگام و پیشگیری هدفمند',
      tagBadgeColor: 'bg-pink-100 text-pink-800 border-pink-200/80',
      title: 'سلامت، حق هر زن است...',
      highlightTitle: 'شبکه ملی سرطان‌های زنان',
      description: 'شمساز با پیوند بیش از ۵۸ مرکز بیمارستانی و ۴۵۰ فوق‌تخصص برجسته، جامع‌ترین سامانه مراقبت بالینی در ۴ سرطان هدف (پستان، دهانه رحم، تخمدان و اندومتر) را برای ارتقای بقا و پیشگیری زودهنگام به ارمغان آورده است.',
      image: ASSET_PATHS.heroBanner,
      imageAlt: 'پزشک متخصص سلامت بانوان شمساز در کلینیک تخصصی',
      gradientBg: 'from-slate-900/90 via-pink-950/70 to-indigo-950/90',
      accentGlow: 'bg-pink-500/25',
      primaryAction: {
        label: 'ورود به سامانه رجیستری ملی',
        onClick: onOpenRegistry,
        icon: Ribbon,
        className: 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white shadow-pink-500/25'
      },
      secondaryAction: {
        label: 'رزرو نوبت غربالگری و چکاپ',
        onClick: onSearchDoctors,
        icon: Calendar,
        className: 'bg-white/10 hover:bg-white/20 text-white border-white/25'
      },
      stats: [
        { label: 'پرونده بالینی ثبت‌شده', value: '۱۲,۸۷۳', icon: Activity, valueColor: 'text-pink-300' },
        { label: 'مراکز درمانی همکار', value: '۵۸ مرکز', icon: ShieldCheck, valueColor: 'text-teal-300' },
        { label: 'نرخ بقای ۵ ساله با غربالگری', value: '۹۴٪', icon: Award, valueColor: 'text-amber-300' },
      ],
      floatingBadge1: {
        title: 'روبان صورتی آگاهی‌بخشی',
        desc: 'پایش فعال ۴ سرطان هدف',
        icon: Ribbon,
        iconBg: 'bg-pink-500 text-white',
      },
      floatingBadge2: {
        title: '۱۲,۸۷۳ پرونده فعال',
        desc: 'پایش مستمر بقا و پیامدها',
        dotPulse: true,
      }
    },

    // Slide 1: Virtual Tumor Board (MDT Case Review)
    {
      id: 'slide-tumor-board',
      category: 'کمیسیون چندتخصصی سرطان (MDT)',
      tag: 'بالاترین استاندارد تصمیم‌گیری بالینی',
      tagBadgeColor: 'bg-purple-100 text-purple-800 border-purple-200/80',
      title: 'هیات مجازی تومور (MDT)؛',
      highlightTitle: 'هم‌اندیشی برترین اساتید سرطان',
      description: 'بررسی کمیسیونی پرونده‌های پیچیده بالینی با حضور همزمان فوق‌تخصص جراحی سرطان، مدیکال آنکولوژیست، رادیوتراپیست و پاتولوژیست بر پایه گایدلاین‌های بالینی بین‌المللی NCCN جهت تدوین دقیق‌ترین پروتکل درمانی شخصی‌سازی‌شده.',
      image: ASSET_PATHS.medicalScan,
      imageAlt: 'بررسی تصاویر سونوگرافی و پاتولوژی در ایستگاه کاری هیات تومور',
      gradientBg: 'from-slate-900/90 via-purple-950/70 to-indigo-950/90',
      accentGlow: 'bg-purple-500/25',
      primaryAction: {
        label: 'مشاهده جلسات هیات مجازی تومور',
        onClick: onOpenTumorBoard,
        icon: Users,
        className: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/25'
      },
      secondaryAction: {
        label: 'مشاوره با تیم آنکولوژی',
        onClick: onSearchDoctors,
        icon: Stethoscope,
        className: 'bg-white/10 hover:bg-white/20 text-white border-white/25'
      },
      stats: [
        { label: 'نرخ تطابق با NCCN', value: '۹۸.۴٪', icon: CheckCircle2, valueColor: 'text-purple-300' },
        { label: 'اساتید و متخصصین عضو', value: '+۴۵۰', icon: Users, valueColor: 'text-teal-300' },
        { label: 'پرونده‌های بررسی‌شده', value: '۱,۴۲۰', icon: BarChart3, valueColor: 'text-amber-300' },
      ],
      floatingBadge1: {
        title: 'ایستگاه کاری تصویربرداری',
        desc: 'تحلیل پاتولوژی و ماموگرافی زنده',
        icon: Activity,
        iconBg: 'bg-purple-600 text-white',
      },
      floatingBadge2: {
        title: 'کمیسیون زنده ۴ تخصصی',
        desc: 'اجماع بر سر رژیم نئوادجوانت',
        dotPulse: true,
      }
    },

    // Slide 2: Online Telemedicine & Video Consultation
    {
      id: 'slide-telemedicine',
      category: 'پزشکی از راه دور و سلامت دیجیتال',
      tag: 'ویزیت تصویری بدون مرز و امن',
      tagBadgeColor: 'bg-teal-100 text-teal-800 border-teal-200/80',
      title: 'ویزیت تصویری با پزشکان فوق‌تخصص؛',
      highlightTitle: 'از منزل تا بهبودی کامل',
      description: 'مشاوره آنلاین تصویری ویزیت با کیفیت HD، ارسال ایمن مدارک پزشکی، صدور آنی نسخه الکترونیک معتبر متصل به سامانه‌های بیمه‌ای کشور و ارسال داروی درب منزل با پیک اختصاصی شمساز.',
      image: ASSET_PATHS.telemedicineScene,
      imageAlt: 'جلسه ویزیت آنلاین تصویری تله‌مدیسین پزشک و بیمار',
      gradientBg: 'from-slate-900/90 via-teal-950/70 to-indigo-950/90',
      accentGlow: 'bg-teal-500/25',
      primaryAction: {
        label: 'ورود به اتاق ویزیت آنلاین فوری',
        onClick: onOpenTelemedicine,
        icon: Video,
        className: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white shadow-teal-500/25'
      },
      secondaryAction: {
        label: 'جستجوی پزشکان آماده ویزیت',
        onClick: onSearchDoctors,
        icon: Calendar,
        className: 'bg-white/10 hover:bg-white/20 text-white border-white/25'
      },
      stats: [
        { label: 'کیفیت ارتباط تصویری', value: 'HD ایمن', icon: Video, valueColor: 'text-teal-300' },
        { label: 'زمان اتصال میانگین', value: 'کمتر از ۵ دقیقه', icon: Zap, valueColor: 'text-amber-300' },
        { label: 'رضایت کاربران سامانه', value: '۴.۹ از ۵', icon: HeartHandshake, valueColor: 'text-pink-300' },
      ],
      floatingBadge1: {
        title: 'رمزنگاری داده‌های پزشکی',
        desc: 'استاندارد HIPAA و وزارت بهداشت',
        icon: ShieldCheck,
        iconBg: 'bg-teal-600 text-white',
      },
      floatingBadge2: {
        title: 'نسخه الکترونیک متصل به بیمه',
        desc: 'پیک دارویی مستقیم درب منزل',
        dotPulse: true,
      }
    },

    // Slide 3: AI Survival Analytics & CDSS
    {
      id: 'slide-ai-cdss',
      category: 'هوش مصنوعی و بیوانفورماتیک سرطان',
      tag: 'سامانه تصمیم‌یار بالینی (CDSS)',
      tagBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200/80',
      title: 'تحلیل هوشمند بقا (کاپلان-مایر)؛',
      highlightTitle: 'سیستم تصمیم‌یار بالینی AI',
      description: 'مدل‌سازی یادگیری ماشین برای پیش‌بینی شانس بقای ۱ تا ۵ ساله، تحلیل اختصاصی بیومارکرهای ER، PR، HER2 و شاخص Ki-67 و کمک به انکولوژیست‌ها جهت انتخاب بهینه‌ترین مسیر شیمی‌درمانی و هورمون‌تراپی.',
      image: ASSET_PATHS.cancerScreeningCenter,
      imageAlt: 'مرکز غربالگری سرطان و سامانه هوش مصنوعی تصمیم‌یار بالینی',
      gradientBg: 'from-slate-900/90 via-blue-950/70 to-indigo-950/90',
      accentGlow: 'bg-blue-500/25',
      primaryAction: {
        label: 'اجرای شبیه‌ساز بقای هوش مصنوعی',
        onClick: onOpenAICDSS,
        icon: Cpu,
        className: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-blue-500/25'
      },
      secondaryAction: {
        label: 'مشاهده داشبورد آماری کشور',
        onClick: onOpenRegistry,
        icon: BarChart3,
        className: 'bg-white/10 hover:bg-white/20 text-white border-white/25'
      },
      stats: [
        { label: 'شاخص C-Index دقت مدل', value: '۰.۸۹', icon: Cpu, valueColor: 'text-blue-300' },
        { label: 'پرونده‌های اعتبارسنجی', value: '۱۲,۸۰۰+', icon: Activity, valueColor: 'text-teal-300' },
        { label: 'افق پیش‌بینی بالینی', value: '۵ ساله', icon: Sparkles, valueColor: 'text-amber-300' },
      ],
      floatingBadge1: {
        title: 'مدل یادگیری عمیق بالینی',
        desc: 'تحلیل بیومارکرهای اختصاصی تومور',
        icon: Cpu,
        iconBg: 'bg-blue-600 text-white',
      },
      floatingBadge2: {
        title: 'منحنی بقای کاپلان-مایر',
        desc: 'محاسبه دینامیک ریسک عود',
        dotPulse: true,
      }
    }
  ];

  // Auto-play interval logic
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(autoPlayTimerRef.current);
      clearInterval(progressTimerRef.current);
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const current = slides[currentSlide];
  const PrimaryIcon = current.primaryAction.icon;
  const SecondaryIcon = current.secondaryAction.icon;

  return (
    <div 
      className="relative w-full min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] overflow-hidden text-right select-none transition-colors duration-700 flex flex-col justify-between"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      dir="rtl"
    >
      
      {/* Background Image Layer with smooth cross-fade */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt={current.imageAlt}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Multi-layered Gradient Darkening */}
        <div className={`absolute inset-0 bg-gradient-to-r ${current.gradientBg} mix-blend-multiply transition-colors duration-700`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        
        {/* Animated Glow Orbs */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${current.accentGlow} rounded-full blur-3xl animate-pulse-glow pointer-events-none`} />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Decorative SVG Medical Grid Wave in Background */}
      <div className="absolute inset-0 z-1 opacity-15 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>
      </div>

      {/* Main Slide Content Canvas - Centered in wide container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-28 lg:pb-32 min-h-[calc(100vh-4.5rem)] flex flex-col justify-between">
        
        {/* Top Header Row of the Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Slide Tag Category */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${current.tagBadgeColor}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{current.category}</span>
            </span>
            <span className="hidden sm:inline-block text-slate-300 text-xs font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {current.tag}
            </span>
          </div>

          {/* Interactive Play/Pause & Slide Counter Control */}
          <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl text-xs text-white">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer p-0.5"
              title={isPlaying ? 'توقف خودکار' : 'پخش خودکار'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="h-3 w-px bg-white/20" />
            <span className="font-mono font-bold text-[11px] text-teal-300">
              ۰{currentSlide + 1} / ۰{slides.length}
            </span>
          </div>

        </div>

        {/* Center Grid: Story Headline & Visual Motion Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-4 sm:my-6">
          
          {/* Right Column: Titles, Descriptions & CTAs */}
          <div className="lg:col-span-7 space-y-4 text-white">
            
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.3] text-balance">
              <span>{current.title} </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 via-indigo-200 to-pink-300 block sm:inline">
                {current.highlightTitle}
              </span>
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-normal max-w-2xl text-balance opacity-95">
              {current.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={current.primaryAction.onClick}
                className={`py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 active:scale-98 ${current.primaryAction.className}`}
              >
                <PrimaryIcon className="w-4 h-4 stroke-[2.2]" />
                <span>{current.primaryAction.label}</span>
                <ArrowLeft className="w-4 h-4 mr-0.5" />
              </button>

              <button
                onClick={current.secondaryAction.onClick}
                className={`py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98 border ${current.secondaryAction.className}`}
              >
                <SecondaryIcon className="w-4 h-4 text-slate-200" />
                <span>{current.secondaryAction.label}</span>
              </button>
            </div>

            {/* Micro Stats Row inside the Hero */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/10 max-w-xl">
              {current.stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-right">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                      <Icon className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </div>
                    <div className={`text-base sm:text-lg font-black font-mono tabular-nums mt-0.5 ${s.valueColor}`}>
                      {s.value}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Left Column: Motion Graphics Floating Interactive Preview Card */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto max-w-md lg:max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-4/3 group">
              <img
                src={current.image}
                alt={current.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Floating Badge 1: Top Right */}
              <div className="absolute top-3.5 right-3.5 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-xl flex items-center gap-2 animate-float-slow">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${current.floatingBadge1.iconBg || 'bg-teal-500 text-white'}`}>
                  {React.createElement(current.floatingBadge1.icon, { className: 'w-4 h-4' })}
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-black text-white">{current.floatingBadge1.title}</div>
                  <div className="text-[9px] text-slate-300">{current.floatingBadge1.desc}</div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Left */}
              <div className="absolute bottom-3.5 left-3.5 bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-xl flex items-center gap-2.5 animate-float-delayed">
                {current.floatingBadge2.dotPulse && (
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
                <div className="text-right">
                  <div className="text-[11px] font-black text-white">{current.floatingBadge2.title}</div>
                  <div className="text-[9px] text-emerald-300 font-semibold">{current.floatingBadge2.desc}</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Carousel Controls: Thumbnail Pills & Navigation Arrows */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Thumbnails Navigation with Animated Progress Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border overflow-hidden ${
                    isActive
                      ? 'bg-white/20 text-white border-white/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {/* Active Slide Progress Fill */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-pink-400 transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="font-mono text-[10px] text-slate-400">۰{idx + 1}</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{s.category}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={prevSlide}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/15 text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="اسلاید قبلی"
              aria-label="اسلاید قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/15 text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="اسلاید بعدی"
              aria-label="اسلاید بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
