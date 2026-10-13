import { PublicFeaturedPractitioners } from "./PublicFeaturedPractitioners";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Calendar, 
  Video, 
  Users, 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Activity, 
  Stethoscope, 
  Hospital, 
  Ribbon,
  BookOpen,
  CheckCircle2, 
  Pill, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  BarChart3, 
  Award, 
  Clock, 
  FileText,
  Star,
  MapPin,
  Shield,
  HeartPulse,
  Building2,
  User,
  UserCheck,
  Baby,
  Scan,
  Phone,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Quote,
  Check,
  Compass,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Sun,
  Zap,
  ThumbsUp
} from 'lucide-react';
import { Doctor } from '../../../types';
import oncologyTheme from '../../../theme';
import { ASSET_PATHS } from '../../../data/assets';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSearch: (query: { doctorName: string; specialty: string; city: string }) => void;
  onBookDoctor: (doctor: Doctor) => void;
  featuredDoctors: Doctor[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSearch,
  onBookDoctor,
  featuredDoctors = [],
}) => {
  // جستجوی هدر / هیرو
  const [doctorNameInput, setDoctorNameInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [cityInput, setCityInput] = useState('تهران');
  const [searchMode, setSearchMode] = useState<'all' | 'in_person' | 'online'>('all');

  // ابزارک تعاملی ارزیابی سریع در لندینگ پیج (Interactive Symptom Quick-Check)
  const [quickOrgan, setQuickOrgan] = useState<'breast' | 'cervix' | 'ovary'>('breast');
  const [quickSymptom, setQuickSymptom] = useState<string>('');

  // ابزارک نظرسنجی روزانه حال و احوال سلامت بیماران (Daily Wellness Quick Poll)
  const [pollMood, setPollMood] = useState<string | null>(null);
  const [pollEnergy, setPollEnergy] = useState<string | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState<boolean>(false);
  const [pollVotes, setPollVotes] = useState({
    great: 142,
    good: 320,
    tired: 184,
    anxious: 95,
  });

  // فیلتر شهر برای پزشکان منتخب

  // وضعیت سوالات متداول (FAQ Accordion)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const specialtiesList = [
    { value: '', label: 'همه تخصص‌ها' },
    { value: 'زنان و زایمان', label: 'متخصص زنان و زایمان' },
    { value: 'آنکولوژی', label: 'فوق تخصص آنکولوژی و سرطان' },
    { value: 'پاتولوژی', label: 'متخصص پاتولوژی و بیوپسی' },
    { value: 'رادیولوژی و تصویربرداری', label: 'رادیولوژی و ماموگرافی' },
    { value: 'جراحی زنان و زایمان', label: 'جراحی سرطان‌های زنان' },
    { value: 'طب داخلی', label: 'متخصص طب داخلی' },
  ];

  const quickSearchTags = [
    { label: 'متخصص زنان و زایمان', specialty: 'زنان و زایمان' },
    { label: 'فوق تخصص آنکولوژی', specialty: 'آنکولوژی' },
    { label: 'ماموگرافی دیجیتال', specialty: 'رادیولوژی و تصویربرداری' },
    { label: 'غربالگری هوشمند', targetView: 'screening' },
    { label: 'ویزیت آنلاین تصویری', targetView: 'telemedicine' },
  ];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      doctorName: doctorNameInput.trim(),
      specialty: specialtyInput,
      city: cityInput,
    });
  };

  // =========================================================================
  // دسته‌بندی‌های تخصصی ۸‌گانه (با استایل مینیمال، آیکون و لینک سریع)
  // =========================================================================
  const specialtyCategories = [
    { 
      id: 'spec-1', 
      title: 'زنان و زایمان', 
      icon: Baby, 
      count: '۸۴ پزشک', 
      target: 'specialty',
      specialtyName: 'زنان و زایمان',
      iconBg: 'bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-500 group-hover:text-white',
    },
    { 
      id: 'spec-2', 
      title: 'آنکولوژی و سرطان', 
      icon: Ribbon, 
      count: '۴۲ فوق‌تخصص', 
      target: 'view',
      targetView: 'breast-cancer',
      iconBg: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600 group-hover:text-white',
    },
    { 
      id: 'spec-3', 
      title: 'غربالگری هوشمند', 
      icon: Sparkles, 
      count: 'تریاژ آنلاین', 
      target: 'view',
      targetView: 'screening',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
    },
    { 
      id: 'spec-4', 
      title: 'تله‌مدیسین و ویزیت', 
      icon: Video, 
      count: '۲۴/۷ شبانه‌روز', 
      target: 'view',
      targetView: 'telemedicine',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-600 group-hover:text-white',
    },
    { 
      id: 'spec-5', 
      title: 'جراحی و تومور بورد', 
      icon: Users, 
      count: '۳۸ جراح', 
      target: 'view',
      targetView: 'tumor-board',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
    },
    { 
      id: 'spec-6', 
      title: 'رادیولوژی و ماموگرافی', 
      icon: Scan, 
      count: '۵۱ مرکز', 
      target: 'specialty',
      specialtyName: 'رادیولوژی و تصویربرداری',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white',
    },
    { 
      id: 'spec-7', 
      title: 'داروها و داروخانه‌ها', 
      icon: Pill, 
      count: '۲۱۰ داروخانه', 
      target: 'view',
      targetView: 'patient-portal',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
    },
    { 
      id: 'spec-8', 
      title: 'حمایت روانی و تغذیه', 
      icon: Heart, 
      count: 'همراهی درمان', 
      target: 'view',
      targetView: 'patient-support',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    },
  ];

  // ۴ پزشک برتر برای سکشن پزشکان منتخب (با امکان فیلتر بر اساس شهر در صورت تمایل)

  // =========================================================================
  // اسلایدهای پرمحتوا و جامع در پایین صفحه (با آیکون، آمار و دکمه ورود به صفحه)
  // =========================================================================
  const bottomSlides = [
    {
      id: 'slide-breast',
      title: 'شبکه ملی سلامت و پیشگیری از سرطان پستان',
      highlightWord: 'روبان صورتی امید',
      category: 'سرطان پستان (Breast Cancer)',
      tagBadge: 'بیش از ۹۶٪ شانس بهبودی در مراحل اولیه',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: Ribbon,
      iconColor: 'bg-rose-500 text-white',
      targetView: 'breast-cancer',
      image: ASSET_PATHS.heroBanner,
      imageAlt: 'پزشک متخصص سلامت بانوان و غربالگری پستان',
      description: 'پوشش جامع مراحل تشخیصی، ماموگرافی دیجیتال، روش‌های خودآزمایی ماهانه و اتصال به برترین انکولوژیست‌ها و جراحان ترمیمی انکوپلاستیک برای آرامش خاطر شما.',
      stats: [
        { label: 'شانس بهبودی اولیه', value: '۹۶٪+', icon: Award },
        { label: 'سن آغاز ماموگرافی', value: '۴۰ سال', icon: Clock },
        { label: 'مراکز تخصصی همکار', value: '۵۸ بیمارستان', icon: Hospital },
      ],
      primaryCta: 'ورود به صفحه اختصاصی سرطان پستان',
      secondaryCta: 'شروع غربالگری و چکاپ علائم',
      secondaryTarget: 'screening',
    },
    {
      id: 'slide-cervical',
      title: 'پیشگیری قطعی و واکسیناسیون HPV دهانه رحم',
      highlightWord: 'واکسیناسیون و پاپ‌اسمیر',
      category: 'سرطان دهانه رحم (Cervical Cancer)',
      tagBadge: 'تا ۹۰٪ قابل پیشگیری با واکسن گارداسیل',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Activity,
      iconColor: 'bg-emerald-600 text-white',
      targetView: 'cervical-cancer',
      image: ASSET_PATHS.cancerScreeningCenter,
      imageAlt: 'مرکز غربالگری پیشگیری و واکسیناسیون HPV',
      description: 'تست‌های تشخیصی دقیق HPV DNA، پاپ‌اسمیر بر پایه مایع (LBC)، معرفی مراکز مجاز تزریق واکسن گارداسیل ۴ و ۹ ظرفیتی و کلینیک‌های کولپوسکوپی تشخیصی.',
      stats: [
        { label: 'نرخ پیشگیری با واکسن', value: '۹۰٪+', icon: ShieldCheck },
        { label: 'فواصل تست دوره‌ای', value: '۳ تا ۵ سال', icon: Clock },
        { label: 'دقت آزمایش مولکولی', value: '۹۹٪', icon: CheckCircle2 },
      ],
      primaryCta: 'ورود به صفحه اختصاصی دهانه رحم',
      secondaryCta: 'تست آنلاین ارزیابی علائم',
      secondaryTarget: 'screening',
    },
    {
      id: 'slide-screening',
      title: 'تریاژ هوشمند علائم و صدور گزارش بالینی',
      highlightWord: 'غربالگری فوری و رایگان',
      category: 'سامانه تریاژ تعاملی علائم',
      tagBadge: 'سیستم استاندارد ۳ سطحی و ارجاع بالینی',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Sparkles,
      iconColor: 'bg-sky-500 text-white',
      targetView: 'screening',
      image: ASSET_PATHS.medicalScan,
      imageAlt: 'سامانه تصویربرداری و تریاژ هوشمند علائم سرطان',
      description: 'پرسشنامه بالینی گام‌به‌گام برای ارزیابی علائم مشکوک پستان، تخمدان، دهانه رحم و رحم با صدور آنی کارنامه سلامت و ذخیره امن در پرونده بیمار جهت بررسی پزشک معالج.',
      stats: [
        { label: 'زمان ارزیابی', value: '۳ دقیقه', icon: Clock },
        { label: 'سطوح تریاژ بالینی', value: '۳ سطح هوشمند', icon: Sparkles },
        { label: 'صدور کارنامه پزشک', value: 'آنی و رایگان', icon: FileText },
      ],
      primaryCta: 'ورود به صفحه غربالگری هوشمند',
      secondaryCta: 'مشاهده در پنل کاربری بیمار',
      secondaryTarget: 'patient-portal',
    },
    {
      id: 'slide-telemedicine',
      title: 'ویزیت تصویری تله‌مدیسین با پزشکان فوق‌تخصص',
      highlightWord: 'مشاوره آنلاین ۲۴ ساعته',
      category: 'پزشکی از راه دور و سلامت دیجیتال',
      tagBadge: 'ارتباط مستقیم HD با نسخه الکترونیک بیمه‌ای',
      tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Video,
      iconColor: 'bg-teal-600 text-white',
      targetView: 'telemedicine',
      image: ASSET_PATHS.telemedicineScene,
      imageAlt: 'جلسه ویزیت آنلاین تصویری فوق‌تخصصی',
      description: 'امکان ویزیت از هر کجای کشور بدون نیاز به حضور فیزیکی در مطب. ارسال سوابق ماموگرافی و آزمایش‌ها، گفتگو با پزشک و صدور نسخه الکترونیک با پوشش کامل بیمه‌ای.',
      stats: [
        { label: 'کیفیت و امنیت مکالمه', value: 'HD رمزنگاری‌شده', icon: ShieldCheck },
        { label: 'زمان اتصال میانگین', value: 'کمتر از ۵ دقیقه', icon: Clock },
        { label: 'رضایت بیماران', value: '۴.۹ از ۵', icon: Heart },
      ],
      primaryCta: 'ورود به اتاق ویزیت تصویری آنلاین',
      secondaryCta: 'جستجو و نوبت‌دهی پزشکان',
      secondaryTarget: 'doctors',
    },
    {
      id: 'slide-tumorboard',
      title: 'کمیسیون هیات مجازی تومور بورد (MDT)',
      highlightWord: 'کنسلیوم چندرشته‌ای اساتید',
      category: 'تصمیم‌گیری چندتخصصی سرطان (MDT)',
      tagBadge: 'بالاترین استاندارد تصمیم‌گیری بالینی NCCN',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Users,
      iconColor: 'bg-purple-600 text-white',
      targetView: 'tumor-board',
      image: ASSET_PATHS.medicalScan,
      imageAlt: 'بررسی تصاویر و پرونده در کمیسیون تومور بورد',
      description: 'بررسی پرونده‌های پیچیده بالینی با حضور همزمان فوق‌تخصص جراحی سرطان، مدیکال آنکولوژیست، رادیوتراپیست و پاتولوژیست برای تدوین دقیق‌ترین پروتکل درمانی شخصی‌سازی‌شده.',
      stats: [
        { label: 'تطابق با گایدلاین NCCN', value: '۹۸.۴٪', icon: CheckCircle2 },
        { label: 'تخصص‌های همزمان', value: '۴ تخصص بالینی', icon: Users },
        { label: 'پرونده‌های بررسی‌شده', value: '+۱,۴۲۰', icon: BarChart3 },
      ],
      primaryCta: 'ورود به جلسات تومور بورد',
      secondaryCta: 'ثبت پرونده در رجیستری ملی',
      secondaryTarget: 'registry',
    },
    {
      id: 'slide-medication',
      title: 'مدیریت داروها، یادآور روزانه و تحلیل پیشرفت درمان',
      highlightWord: 'پایش مستمر بهبودی',
      category: 'میز کار پرونده و خودمراقبتی بیمار',
      tagBadge: 'یادآور ساعات مصرف و ثبت عوارض شیمی‌درمانی',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Pill,
      iconColor: 'bg-sky-600 text-white',
      targetView: 'patient-portal',
      image: ASSET_PATHS.doctorFemale,
      imageAlt: 'مدیریت درمان و همراهی پزشک معالج با بیمار',
      description: 'تنظیم هشدارهای مصرف داروهای هدفمند و هورمون‌تراپی، ثبت علائم و عوارض جانبی شیمی‌درمانی و مشاهده نمودارهای روند بهبودی و پاسخ تومور به درمان در طول زمان.',
      stats: [
        { label: 'یادآور خودکار داروها', value: 'روزانه و منظم', icon: Pill },
        { label: 'نمودار روند درمان', value: 'Recharts تحلیلی', icon: BarChart3 },
        { label: 'ثبت عوارض جانبی', value: 'ارسال مستقیم به پزشک', icon: Activity },
      ],
      primaryCta: 'ورود به پرونده بیمار و مدیریت داروها',
      secondaryCta: 'مشاهده داروخانه‌های منتخب',
      secondaryTarget: 'medical-centers',
    },
  ];

  // اسلایدر خودکار
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<any>(null);

  useEffect(() => {
    if (!isAutoPlaying) {
      clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % bottomSlides.length);
    }, 7000);

    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, bottomSlides.length]);

  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % bottomSlides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + bottomSlides.length) % bottomSlides.length);
  };

  const activeSlide = bottomSlides[currentSlideIndex];
  const ActiveSlideIcon = activeSlide.icon;

  // =========================================================================
  // داده‌های بخش جدید: راهنمای مسیر بیمار (Patient Care Pathway - 4 Steps)
  // =========================================================================
  const patientPathwaySteps = [
    {
      step: '۰۱',
      title: 'غربالگری و ارزیابی اولیه علائم',
      desc: 'پرسشنامه بالینی ۳ دقیقه‌ای بدون نیاز به حضور فیزیکی جهت بررسی سوابق و ریسک‌فاکتورها.',
      targetView: 'screening',
      btnLabel: 'شروع ارزیابی آنلاین',
      icon: Sparkles,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      step: '۰۲',
      title: 'نوبت‌دهی آنلاین یا ویزیت تصویری',
      desc: 'انتخاب بهترین فوق‌تخصص و تعیین نوبت حضوری در مطب یا مشاوره ویدیویی امن از منزل.',
      targetView: 'doctors',
      btnLabel: 'مشاهده پزشکان و نوبت‌ها',
      icon: Calendar,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      step: '۰۳',
      title: 'تشکیل پرونده و کنسلیوم تومور بورد',
      desc: 'بررسی چندتخصصی پرونده توسط جراح، پاتولوژیست و آنکولوژیست جهت انتخاب بهترین پروتکل.',
      targetView: 'tumor-board',
      btnLabel: 'اطلاعات تومور بورد MDT',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      step: '۰۴',
      title: 'پایش مستمر دارو، عوارض و بهبودی',
      desc: 'یادآور مصرف دارو، ثبت عوارض جانبی و نمودار روند پاسخ بالینی در پنل کاربری بیمار.',
      targetView: 'patient-portal',
      btnLabel: 'ورود به پنل بیمار',
      icon: Pill,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  // =========================================================================
  // داده‌های بخش داستان‌های موفقیت و تجربیات بیماران (Success Stories & Recovery Highlights)
  // =========================================================================
  const patientStories = [
    {
      id: 1,
      name: 'ف. م.',
      tag: 'ناشناس · پایش ۲ ساله',
      age: '۴۷ ساله',
      diagnosis: 'بهبودیافته سرطان پستان (مرحله ۲A)',
      recoveryHighlight: 'بهبودی کامل و حفظ بافت پستان با انکوپلاستی',
      treatmentType: 'جراحی انکوپلاستی + رادیوتراپی هدفمند',
      comment: 'غربالگری زودهنگام در سامانه باعث شد توده‌ام در ابتدای شکل‌گیری تشخیص داده بشه. با راهنمایی به موقع و جلسات تومور بورد بدون استرس درمان شدم و الان در سلامت کامل به زندگی برگشتم.',
      hospital: 'مرکز درمان امید تهران',
      doctorRef: 'دکتر سمیرا احمدی',
      rating: 5,
    },
    {
      id: 2,
      name: 'م. ک.',
      tag: 'ناشناس · پیشگیری موفق',
      age: '۳۹ ساله',
      diagnosis: 'پیشگیری و پاکسازی کامل HPV پرخطر دهانه رحم',
      recoveryHighlight: 'منفی شدن تست بعد از ۱۲ ماه درمان محافظه‌کارانه',
      treatmentType: 'کولپوسکوپی تشخیصی + پروتکل ایمنی‌درمانی',
      comment: 'با مشاوره ویزیت تصویری آنلاین تونستم نمونه پاپ‌اسمیر LBC و واکسیناسیون رو به موقع پیگیری کنم. رفتار صبورانه پزشکان و راهنمای دقیق پیگیری استرس من و خانواده‌ام رو کاملاً برطرف کرد.',
      hospital: 'بیمارستان مهر تهران',
      doctorRef: 'دکتر مژگان ناصری',
      rating: 5,
    },
    {
      id: 3,
      name: 'ز. ن.',
      tag: 'ناشناس · تکمیل دوره شیمی‌درمانی',
      age: '۵۳ ساله',
      diagnosis: 'تکمیل دوره‌های شیمی‌درمانی و پایش درمان تخمدان',
      recoveryHighlight: 'طبیعی شدن نشانگر CA-125 و خاموشی کامل بیماری',
      treatmentType: 'کموتراپی ترکیبی + هورمون‌تراپی نگهدارنده',
      comment: 'بخش یادآور روزانه داروها و امکان ثبت عوارض جانبی باعث شد پزشکم دوز داروم رو به سرعت تنظیم کنه و روند درمانم خیلی راحت‌تر سپری بشه. احساس تنهایی نکردم.',
      hospital: 'بیمارستان رضوی مشهد',
      doctorRef: 'دکتر فرزانه کریمی',
      rating: 5,
    },
    {
      id: 4,
      name: 'س. ر.',
      tag: 'ناشناس · جراحی موفقیت‌آمیز',
      age: '۴۲ ساله',
      diagnosis: 'تشخیص توده خوش‌خیم فیبروآدنوم پیش‌سرطانی',
      recoveryHighlight: 'تخلیه کم‌تهاجمی بدون اسکار و ترخیص در همان روز',
      treatmentType: 'بیوپسی تحت هدایت سونوگرافی و جراحی سرپایی',
      comment: 'سرعت نوبت‌دهی و شفافیت پرونده الکترونیک فوق‌العاده بود. کمتر از ۴۸ ساعت از ثبت ماموگرافی تا ملاقات با فوق‌تخصص طول کشید و همین سرعت آرامش خاطر بزرگی به همراه داشت.',
      hospital: 'کلینیک تخصصی نور تهران',
      doctorRef: 'دکتر الهام رسولی',
      rating: 5,
    },
  ];

  // =========================================================================
  // داده‌های بخش جدید: سوالات متداول بیماران و همراهان (FAQ Accordion)
  // =========================================================================
  const faqs = [
    {
      q: 'آیا غربالگری آنلاین جایگزین ماموگرافی یا معاینه پزشک می‌شود؟',
      a: 'خیر، سامانه غربالگری هوشمند شمساز یک ابزار تریاژ بالینی استاندارد است که به شما کمک می‌کند سطح ضرورت معاینه را بدانید و با کارنامه مدون به پزشک متخصص ارجاع داده شوید.',
    },
    {
      q: 'آیا نسخه‌های صادر شده در ویزیت تصویری تله‌مدیسین مشمول بیمه می‌شوند؟',
      a: 'بله، تمامی پزشکان سامانه کد نظام پزشکی و دسترسی به سامانه نسخه الکترونیک (تأمین اجتماعی، بیمه سلامت و نیروهای مسلح) را دارند و نسخه شما با پوشش کامل ثبت می‌گردد.',
    },
    {
      q: 'کمیسیون هیات مجازی تومور بورد (MDT) چگونه کار می‌کند؟',
      a: 'در پرونده‌های نیازمند تصمیم‌گیری دقیق، تیمی از فوق‌تخصص جراحی انکولوژی، مدیکال آنکولوژیست، رادیوتراپیست و پاتولوژیست تصاویر و مدارک را بررسی و تصمیم واحد درمانی اتخاذ می‌کنند.',
    },
    {
      q: 'چگونه می‌توانم از بخش یادآور داروها و ثبت عوارض استفاده کنم؟',
      a: 'با ورود به پنل کاربری بیمار و رفتن به تب «مدیریت داروها»، می‌توانید ساعات مصرف، یادآور پیامکی/درون‌برنامه‌ای و فرم ثبت عوارض شیمی‌درمانی را برای پزشکتان فعال کنید.',
    },
  ];

  return (
    <div className="w-full bg-[#FCFBF9] text-slate-800 text-right font-sans min-h-[calc(100vh-64px)] overflow-x-clip" dir="rtl">
      
      {/* =========================================================================
          1. HERO SECTION: مدرن، آرامش‌بخش، تصویر پزشک، کنسول جستجوی یکپارچه و آمار ملی
          مطابق با نمونه درخواستی کاربر
          ========================================================================= */}
      <section aria-label="جست‌وجوی پزشک" className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <h1 className="sr-only">شمساز؛ همراه مسیر مراقبت سلامت زنان</h1>
        <div className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-teal-900">پزشک مناسب خود را پیدا کنید</h2>
              <p className="mt-1 text-xs leading-6 text-slate-500">جست‌وجو در فهرست پزشکان تهران و ثبت درخواست ویزیت</p>
            </div>
            <button onClick={() => onNavigate('doctors')} className="flex items-center gap-2 text-xs font-bold text-teal-700">مشاهدهٔ همهٔ پزشکان<ArrowLeft size={15}/></button>
          </div>
          <form onSubmit={handleHeroSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  {/* فیلد ۱: نام پزشک یا بیمارستان */}
                  <div className="sm:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 pr-1 text-right">
                      نام پزشک یا بیمارستان
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="مثلاً دکتر سمیرا احمدی..."
                        value={doctorNameInput}
                        onChange={(e) => setDoctorNameInput(e.target.value)}
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* فیلد ۲: تخصص */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 pr-1 text-right">
                      تخصص بالینی
                    </label>
                    <div className="relative flex items-center">
                      <Stethoscope className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden transition-all text-right appearance-none cursor-pointer"
                      >
                        {specialtiesList.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* فیلد ۳: دکمه جستجو */}
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>جستجو</span>
                    </button>
                  </div>
                </form>
        </div>
      </section>

      {/* =========================================================================
          2. SPECIALTIES SECTION: دسته‌بندی‌های تخصصی ۸ گانه
          شامل هدر با لینک «مشاهده همه ←» و گرید ۸ کارتی مینیمال
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        
        {/* هدر بخش دسته‌بندی‌های تخصصی */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-right">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              دسته‌بندی‌های تخصصی
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              دسترسی سریع به پزشکان و خدمات بر اساس نیاز بالینی
            </p>
          </div>

          <button 
            onClick={() => onNavigate('doctors')}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
          >
            <span>مشاهده همه تخصص‌ها</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* گرید ۸ تایی کارت‌های دسته‌بندی با استایل مینیمال و آرامش‌بخش */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {specialtyCategories.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.target === 'view' && item.targetView) {
                    onNavigate(item.targetView);
                  } else if (item.target === 'specialty' && item.specialtyName) {
                    onSearch({ doctorName: '', specialty: item.specialtyName, city: 'تهران' });
                  }
                }}
                className="group p-3.5 rounded-2xl bg-white border border-[#EBE6DD] hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer relative"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-200 border ${item.iconBg}`}>
                  <ItemIcon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-1 leading-snug">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

      </section>

      <PublicFeaturedPractitioners onViewAll={() => onNavigate('doctors')} />

      {/* =========================================================================
          4. INTERACTIVE SYMPTOM QUICK-CHECK WIDGET: ابزارک ارزیابی سریع و فوری در لندینگ
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="rounded-3xl bg-gradient-to-r from-sky-50/70 via-rose-50/40 to-teal-50/60 border border-[#E5DEC9] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* توضیحات ابزارک ارزیابی فوری */}
            <div className="lg:col-span-5 text-right space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-700">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>بررسی هوشمند علائم بانوان</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                نگران علائمی هستید؟ ارزیابی سریع را امتحان کنید
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                عضو مورد نظر را انتخاب کنید تا متداول‌ترین علائم و گام بعدی پیشگیری و معاینه به شما نشان داده شود.
              </p>
            </div>

            {/* کنترل‌های تعاملی انتخاب عضو و اقدام بالینی */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#ECE7DF] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">انتخاب ناحیه بررسی:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setQuickOrgan('breast'); setQuickSymptom(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      quickOrgan === 'breast' ? 'bg-rose-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    پستان
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuickOrgan('cervix'); setQuickSymptom(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      quickOrgan === 'cervix' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    دهانه رحم
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuickOrgan('ovary'); setQuickSymptom(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      quickOrgan === 'ovary' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    تخمدان
                  </button>
                </div>
              </div>

              {/* گزینه‌های علائم بر اساس عضو */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 text-right">علائم مشاهده‌شده خود را مشخص کنید:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {quickOrgan === 'breast' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('لمس توده بدون درد')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'لمس توده بدون درد' ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        لمس توده بدون درد
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('ترشح خونی نوک پستان')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'ترشح خونی نوک پستان' ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        ترشح خونی نوک پستان
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('تغییر پوست و فرورفتگی')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'تغییر پوست و فرورفتگی' ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        تغییر پوست و فرورفتگی
                      </button>
                    </>
                  )}
                  {quickOrgan === 'cervix' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('خونریزی پس از نزدیکی')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'خونریزی پس از نزدیکی' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        خونریزی پس از نزدیکی
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('ترشحات واژینال مقاوم')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'ترشحات واژینال مقاوم' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        ترشحات واژینال مقاوم
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('نتیجه مثبت تست HPV')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'نتیجه مثبت تست HPV' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        نتیجه مثبت تست HPV
                      </button>
                    </>
                  )}
                  {quickOrgan === 'ovary' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('نفخ مداوم شکم بیش از ۳ هفته')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'نفخ مداوم شکم بیش از ۳ هفته' ? 'border-purple-400 bg-purple-50 text-purple-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        نفخ مداوم بیش از ۳ هفته
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('احساس سیری زودرس')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'احساس سیری زودرس' ? 'border-purple-400 bg-purple-50 text-purple-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        احساس سیری زودرس
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSymptom('تکرر ادرار ناگهانی')}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                          quickSymptom === 'تکرر ادرار ناگهانی' ? 'border-purple-400 bg-purple-50 text-purple-800 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        تکرر ادرار ناگهانی
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* اکشن هدایت به تریاژ کامل یا نوبت‌دهی */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>پاسخ‌ها محرمانه بوده و گزارش آنی تحویل می‌گردد.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('screening')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>ادامه ارزیابی جامع در سامانه غربالگری</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4.5. DAILY WELLNESS QUICK POLL: ابزارک نظرسنجی روزانه حال و احوال و روند سلامت
          ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="rounded-3xl bg-white border border-[#E8E2D5] shadow-xs p-6 sm:p-7 relative overflow-hidden">
          {/* تزئین ظریف رنگی در حاشیه */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-teal-400 via-sky-400 to-rose-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* سمت راست: عنوان و هدف ابزارک */}
            <div className="lg:col-span-5 text-right space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs font-bold text-teal-800">
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                <span>نبض سلامت روزانه بیماران (ناشناس)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                امروز از نظر جسمی و روحی چه حالی دارید؟
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                با ثبت حال روزانه‌تان در کمتر از ۵ ثانیه، به تیم درمانی شمساز کمک می‌کنید روندهای ملی بهبود کیفیت زندگی بیماران سرطانی را تحلیل کنند. هیچ نام یا هویتی ذخیره نمی‌شود.
              </p>

              {/* آمار خلاصه مشارکت */}
              <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-500 font-sans" />
                  <span className="font-sans font-bold text-slate-700">{pollVotes.great + pollVotes.good + pollVotes.tired + pollVotes.anxious}</span>
                  <span className="font-sans">پاسخ ثبت‌شده امروز</span>
                </span>
                <span>·</span>
                <span className="font-sans text-emerald-600 font-medium">۱۰۰٪ ناشناس و امن</span>
              </div>
            </div>

            {/* سمت چپ: کارت تعاملی ثبت حال یا نتایج بعد از ثبت */}
            <div className="lg:col-span-7 bg-[#FCFBF9] rounded-2xl p-5 border border-[#ECE7DF]">
              {!pollSubmitted ? (
                <div className="space-y-4">
                  {/* سوال ۱: وضعیت روحی و حال عمومی */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2.5 text-right">
                      ۱. وضعیت روحی و انگیزه امروز:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPollMood('great')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          pollMood === 'great'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50/50'
                        }`}
                      >
                        <Smile className={`w-5 h-5 ${pollMood === 'great' ? 'text-white' : 'text-emerald-500'}`} />
                        <span className="text-xs">عالی و پرامید</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPollMood('good')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          pollMood === 'good'
                            ? 'bg-sky-500 text-white border-sky-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50/50'
                        }`}
                      >
                        <Sun className={`w-5 h-5 ${pollMood === 'good' ? 'text-white' : 'text-sky-500'}`} />
                        <span className="text-xs">خوب و آرام</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPollMood('tired')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          pollMood === 'tired'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50'
                        }`}
                      >
                        <Meh className={`w-5 h-5 ${pollMood === 'tired' ? 'text-white' : 'text-amber-500'}`} />
                        <span className="text-xs">کمی خسته</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPollMood('anxious')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          pollMood === 'anxious'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50/50'
                        }`}
                      >
                        <Frown className={`w-5 h-5 ${pollMood === 'anxious' ? 'text-white' : 'text-rose-500'}`} />
                        <span className="text-xs">نگران / مضطرب</span>
                      </button>
                    </div>
                  </div>

                  {/* سوال ۲: سطح انرژی جسمی */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 text-right">
                      ۲. توان جسمانی امروز برای فعالیت روزمره:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'high', label: 'انرژی مطلوب', icon: Zap },
                        { id: 'medium', label: 'متوسط و کنترل‌شده', icon: Activity },
                        { id: 'low', label: 'نیاز به استراحت بیشتر', icon: Clock },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPollEnergy(item.id)}
                          className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            pollEnergy === item.id
                              ? 'bg-slate-900 text-white border-slate-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* دکمه ارسال نظرسنجی */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/70">
                    <span className="text-[11px] text-slate-400">
                      ثبت رایگان بدون نیاز به ورود یا ثبت‌نام
                    </span>
                    <button
                      type="button"
                      disabled={!pollMood}
                      onClick={() => {
                        if (pollMood) {
                          setPollVotes((prev) => ({
                            ...prev,
                            [pollMood as keyof typeof prev]: prev[pollMood as keyof typeof prev] + 1,
                          }));
                          setPollSubmitted(true);
                        }
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        pollMood
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>ثبت وضعیت و مشاهده روند روز</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* نمایش نتایج آماری نظرسنجی سلامت روز */
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>نظر شما با موفقیت و به‌صورت کاملاً ناشناس ثبت شد. سپاسگزاریم!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPollSubmitted(false)}
                      className="text-[11px] text-sky-600 hover:underline font-medium cursor-pointer"
                    >
                      تغییر پاسخ
                    </button>
                  </div>

                  {/* نمودارهای درصد پاسخ‌های جامعه بیماران */}
                  <div className="space-y-2 pt-1 text-right">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      توزیع وضعیت سلامت و روحیه بیماران در امروز:
                    </span>
                    
                    {(() => {
                      const total = pollVotes.great + pollVotes.good + pollVotes.tired + pollVotes.anxious;
                      const items = [
                        { label: 'خوب و آرام', count: pollVotes.good, color: 'bg-sky-500', barBg: 'bg-sky-100', textCol: 'text-sky-700' },
                        { label: 'عالی و پرامید', count: pollVotes.great, color: 'bg-emerald-500', barBg: 'bg-emerald-100', textCol: 'text-emerald-700' },
                        { label: 'کمی خسته', count: pollVotes.tired, color: 'bg-amber-500', barBg: 'bg-amber-100', textCol: 'text-amber-700' },
                        { label: 'نگران / مضطرب', count: pollVotes.anxious, color: 'bg-rose-500', barBg: 'bg-rose-100', textCol: 'text-rose-700' },
                      ];

                      return items.map((it, idx) => {
                        const pct = Math.round((it.count / total) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className={`font-bold ${it.textCol}`}>{it.label}</span>
                              <span className="text-slate-500 font-mono">{pct}٪ ({it.count} نفر)</span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${it.barBg} overflow-hidden`}>
                              <div
                                className={`h-full rounded-full ${it.color} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* پیام حمایتی و دکمه راهنمایی بیشتر */}
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      اگر احساس اضطراب یا خستگی دارید، مشاوران روان‌شناسی سلامت در کنار شما هستند.
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('patient-support')}
                      className="text-teal-700 font-bold hover:underline cursor-pointer"
                    >
                      گفتگو با پشتیبان سلامت ←
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PATIENT CARE PATHWAY: مسیر ۴ مرحله‌ای سلامت بیمار
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 mb-2">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>گام‌به‌گام از غربالگری تا بهبودی</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            مسیر استاندارد مراقبت بالینی در پلتفرم شمساز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            یکپارچگی تمام مراحل تشخیصی و درمانی برای آسودگی خاطر بیمار و خانواده
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {patientPathwaySteps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white rounded-2xl border border-[#ECE7DF] p-5 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all text-right group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black font-mono text-slate-400 group-hover:text-sky-600 transition-colors">
                      {step.step}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${step.color}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(step.targetView)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{step.btnLabel}</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM SLIDERS SECTION: اسلایدهای تعاملی و پرمحتوا در پایین صفحه
          شامل اسلایدر خودکار، آیکون‌های تک‌تک اسلایدها و لینک مستقیم به صفحات اختصاصی
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        
        {/* هدر بخش اسلایدهای اصلی */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 mb-1.5">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>راهنماهای چندرسانه‌ای و بنرهای اختصاصی شمساز</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              اسلایدهای جامع و معرفی صفحات تخصصی
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              روی هر اسلاید یا دکمه‌های آیکون‌دار زیر کلیک کنید تا صفحه مربوط به همان بخش بلافاصله باز شود
            </p>
          </div>

          {/* کلیدهای کنترل اسلایدر (Play/Pause, Next, Prev) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 rounded-xl bg-white border border-[#E0D9CE] text-slate-600 hover:bg-[#F5F1E8] transition-colors cursor-pointer text-xs flex items-center gap-1"
              title={isAutoPlaying ? 'توقف موقت اسلاید خودکار' : 'پخش خودکار اسلایدها'}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4 text-slate-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline text-[11px] font-medium">{isAutoPlaying ? 'توقف' : 'پخش'}</span>
            </button>
            <button
              type="button"
              onClick={goToPrevSlide}
              className="p-2 rounded-xl bg-white border border-[#E0D9CE] text-slate-700 hover:bg-[#F5F1E8] hover:text-sky-600 transition-colors cursor-pointer"
              title="اسلاید قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-500 px-1">
              {currentSlideIndex + 1} / {bottomSlides.length}
            </span>
            <button
              type="button"
              onClick={goToNextSlide}
              className="p-2 rounded-xl bg-white border border-[#E0D9CE] text-slate-700 hover:bg-[#F5F1E8] hover:text-sky-600 transition-colors cursor-pointer"
              title="اسلاید بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* کارت اصلی اسلاید انتخابی */}
        <div className="relative rounded-3xl bg-white border border-[#ECE7DF] shadow-xs overflow-hidden transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* ستون متن و اکشن‌های اسلاید (۷ از ۱۲) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between text-right">
              <div>
                
                {/* ردیف تگ و آیکون اسلاید */}
                <div className="flex flex-wrap items-center gap-2 mb-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${activeSlide.iconColor}`}>
                    <ActiveSlideIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeSlide.tagColor}`}>
                    {activeSlide.category}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                    {activeSlide.tagBadge}
                  </span>
                </div>

                {/* تیتر اسلاید */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-snug tracking-tight mb-2.5">
                  {activeSlide.title}
                </h3>

                {/* متن توضیح روان و آرامش‌بخش */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {activeSlide.description}
                </p>

                {/* آمار و شاخص‌های کلیدی اسلاید */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 px-3.5 rounded-2xl bg-[#FAF7F2] border border-[#ECE7DF] mb-5">
                  {activeSlide.stats.map((st, idx) => {
                    const StatIcon = st.icon;
                    return (
                      <div key={idx} className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
                          <StatIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{st.label}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-slate-900">
                          {st.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* دکمه‌های اکشن مستقیم به صفحه اختصاصی اسلاید */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate(activeSlide.targetView)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
                >
                  <ActiveSlideIcon className="w-4 h-4" />
                  <span>{activeSlide.primaryCta}</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </button>

                {activeSlide.secondaryCta && activeSlide.secondaryTarget && (
                  <button
                    type="button"
                    onClick={() => onNavigate(activeSlide.secondaryTarget!)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#E0D9CE] hover:bg-[#F5F1E8] text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{activeSlide.secondaryCta}</span>
                  </button>
                )}
              </div>

            </div>

            {/* ستون تصویر و پیش‌نمایش گرافیکی اسلاید (۵ از ۱۲) */}
            <div 
              className="lg:col-span-5 relative bg-slate-100 min-h-[220px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-r border-[#ECE7DF] group cursor-pointer"
              onClick={() => onNavigate(activeSlide.targetView)}
            >
              <img 
                src={activeSlide.image} 
                alt={activeSlide.imageAlt}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-medium text-white/80 flex items-center gap-1 mb-1">
                  <ActiveSlideIcon className="w-3.5 h-3.5 text-white" />
                  کلیک جهت ورود مستقیم به این صفحه
                </span>
                <span className="text-xs font-bold line-clamp-1">
                  {activeSlide.highlightWord}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* نوارهای آیکون‌دار انتخاب سریع اسلاید */}
        <div className="mt-4 pt-3 border-t border-[#ECE7DF]/70">
          <div className="text-[11px] font-semibold text-slate-500 mb-2.5">
            انتخاب سریع هر اسلاید با آیکون:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {bottomSlides.map((sl, index) => {
              const SlideIcon = sl.icon;
              const isActive = index === currentSlideIndex;
              return (
                <button
                  key={sl.id}
                  type="button"
                  onClick={() => {
                    setCurrentSlideIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs font-bold'
                      : 'bg-white border-[#ECE7DF] text-slate-600 hover:bg-[#F9F6F0]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? sl.iconColor : 'bg-slate-100 text-slate-600'
                  }`}>
                    <SlideIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] leading-tight line-clamp-1">
                    {sl.category.split('(')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </section>

      {/* =========================================================================
          7. CLINICAL BANNERS & PARTNER CENTERS: ۳ بنر کاربردی در انتهای صفحه
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="text-right mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            مراکز همکار، داروخانه‌ها و دانشنامه علمی
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* بنر ۱: پزشکان و نوبت‌دهی */}
          <div 
            onClick={() => onNavigate('doctors')}
            className="p-5 rounded-2xl bg-white border border-[#ECE7DF] hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                ۱۰۰ فوق‌تخصص برتر
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 group-hover:text-sky-700 transition-colors">
                نوبت‌دهی آنلاین انکولوژیست‌ها
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                جستجوی مستقیم بر اساس تخصص، بیمارستان، بیمه و روزهای حضور در کلینیک
              </p>
              <div className="mt-2 text-[11px] font-semibold text-sky-600 flex items-center gap-1">
                <span>مشاهده لیست پزشکان</span>
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* بنر ۲: مراکز درمانی و داروخانه‌ها */}
          <div 
            onClick={() => onNavigate('medical-centers')}
            className="p-5 rounded-2xl bg-white border border-[#ECE7DF] hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Hospital className="w-5 h-5" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                داروخانه‌ها و بیمارستان‌ها
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                بانک ۵۰ بیمارستان و ۲۱۰ داروخانه
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                استعلام تلفنی، آدرس روی نقشه، بخش شیمی‌درمانی و دسترسی به داروهای خاص
              </p>
              <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span>ورود به بانک مراکز درمانی</span>
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* بنر ۳: دانشنامه سلامت و مقالات علمی */}
          <div 
            onClick={() => onNavigate('articles')}
            className="p-5 rounded-2xl bg-white border border-[#ECE7DF] hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                گایدلاین‌های علمی و رژیم
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 group-hover:text-rose-700 transition-colors">
                دانشنامه و مقالات سلامت بانوان
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                راهنماهای تغذیه، پاسخ به سوالات متداول شیمی‌درمانی و مراقبت‌های خانگی
              </p>
              <div className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <span>مشاهده کتابخانه مقالات</span>
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. SUCCESS STORIES & RECOVERY HIGHLIGHTS: داستان‌های امید، بهبودی و اعتماد
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>داستان‌های امید، بهبودی و اعتماد بیماران</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تجربیات ناشناس بیماران و دستاوردهای بهبودی
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              روایت‌های واقعی از غربالگری زودهنگام، تصمیم‌گیری در تومور بورد و تکمیل دوره‌های درمان که امیدبخش مسیر بیماران جدید است.
            </p>
          </div>

          {/* شاخص اعتماد ملی */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-[#ECE7DF] shadow-2xs flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">۹۸.۴٪ میزان رضایت و امید به درمان</div>
              <div className="text-[10px] text-slate-400">بر اساس نظرسنجی ترخیص و پیگیری دوره‌ای</div>
            </div>
          </div>
        </div>

        {/* گرید ۴ کارته داستان‌های بهبودی با هایلایت بالینی و حفظ محرمانگی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {patientStories.map((story) => (
            <div
              key={story.id}
              className="p-5 rounded-2xl bg-white border border-[#ECE7DF] shadow-2xs hover:shadow-md hover:border-rose-200 transition-all flex flex-col justify-between text-right relative group"
            >
              <div>
                {/* هدر کارت: بج ناشناس و امتیاز */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    <span>{story.tag}</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* هایلایت کلیدی بهبودی (Recovery Highlight) */}
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-right">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>دستاورد درمان:</span>
                  </div>
                  <div className="text-[11px] text-emerald-900 font-medium leading-snug">
                    {story.recoveryHighlight}
                  </div>
                </div>

                {/* نقل‌قول بیمار */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-4">
                  «{story.comment}»
                </p>
              </div>

              {/* فوتر کارت: نام ناشناس، سن، تشخیص و پروتکل */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{story.name} ({story.age})</span>
                  <span className="text-slate-400 truncate max-w-[120px]">{story.hospital}</span>
                </div>
                <div className="text-[10px] text-rose-700 font-semibold leading-tight line-clamp-1">
                  {story.diagnosis}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>پروتکل: {story.treatmentType.split('+')[0]}</span>
                  <span className="text-sky-600 font-medium">{story.doctorRef}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* بنر امیدبخش زیر داستان‌ها */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-teal-50/60 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Ribbon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">شما هم داستان بهبودی خود را تجربه خواهید کرد</span>
              <span className="text-[11px] text-slate-500">تشخیص زودهنگام در ۹۶٪ موارد امکان بازگشت کامل به زندگی باکیفیت را فراهم می‌آورد.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('screening')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>شروع مسیر سلامت با غربالگری رایگان</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          9. FAQ ACCORDION: سوالات متداول بیماران در لندینگ پیج
          ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#ECE7DF]">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>پاسخ به سوالات شما</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            پرسش‌های متداول بیماران و همراهان
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            هر آنچه لازم است درباره نوبت‌دهی، تله‌مدیسین و مدیریت پرونده بدانید
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#ECE7DF] overflow-hidden transition-all text-right"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3 bg-[#FAF8F5]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          10. SUPPORT & CONFIDENTIALITY BAR: پشتیبانی و حفظ محرمانگی
          ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ECE7DF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">پشتیبانی تلفنی و همراهی شبانه‌روزی بیماران:</span>
            <a 
              href="tel:02191008844" 
              className="font-bold text-emerald-700 hover:text-emerald-800 dir-ltr inline-block"
            >
              ۰۲۱-۹۱۰۰۸۸۴۴
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              حفظ کامل محرمانگی پرونده بیمار
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              مطابق گایدلاین‌های بالینی وزارت بهداشت
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
