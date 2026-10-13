/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
  Bot,
  Activity,
  HeartPulse,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  PhoneCall,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  Video,
  Users
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  triageLevel?: 'green' | 'yellow' | 'red';
  actionTarget?: string;
  actionText?: string;
  detailsList?: string[];
}

interface AIAssistantWidgetProps {
  onNavigate: (view: string) => void;
}

// Symptom Triage Wizard step definitions
interface TriageOption {
  label: string;
  value: string;
  riskWeight: number; // 0=safe, 1=moderate, 2=high
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'symptom_checker' | 'faqs'>('chat');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: 'سلام مریم عزیز، من دستیار هوشمند سلامت و تریاژ بالینی «شمساز» هستم.\nمی‌توانم در پاسخ به سوالات پزشکی، تفسیر نتایج غربالگری (ماموگرافی، پاپ اسمیر)، تریاژ علائم بالینی، و هدایت به خدمات پلتفرم (نوبت‌دهی، ویزیت آنلاین یا هیات تومور) به شما کمک کنم.',
      timestamp: 'همین الان',
      triageLevel: 'green',
      detailsList: [
        'ارزیابی و تریاژ علائم مشکوک پستان و لگن',
        'گایدلاین‌های غربالگری ماموگرافی و واکسیناسیون HPV',
        'راهنمایی رزرو نوبت متخصصین و مشاوره آنلاین تصویری'
      ]
    }
  ]);

  // Symptom Checker interactive wizard state
  const [checkerCategory, setCheckerCategory] = useState<string>('breast');
  const [checkerAge, setCheckerAge] = useState<string>('30_45');
  const [checkerDuration, setCheckerDuration] = useState<string>('less_month');
  const [checkerPain, setCheckerPain] = useState<string>('painless');
  const [checkerRedFlags, setCheckerRedFlags] = useState<string[]>([]);
  const [checkerCompleted, setCheckerCompleted] = useState<boolean>(false);

  // Quick chips
  const quickPrompts = [
    { label: 'توده در پستان چه مراحلی دارد؟', icon: Stethoscope },
    { label: 'سن و شرایط ماموگرافی سالیانه', icon: HeartPulse },
    { label: 'خونریزی بعد از یائسگی', icon: AlertTriangle },
    { label: 'تفسیر نمره BI-RADS', icon: Activity },
    { label: 'رزرو ویزیت آنلاین یا هیات تومور', icon: Video },
  ];

  // Clinical FAQs library
  const medicalFAQs = [
    {
      q: 'سن استاندارد برای آغاز ماموگرافی غربالگری چه زمانی است؟',
      category: 'غربالگری',
      a: 'بر اساس پروتکل‌های شبکه ملی سرطان‌های زنان و NCCN، تمام بانوان از ۴۰ سالگی باید غربالگری ماموگرافی دیجیتال سالیانه را آغاز نمایند. در بانوانی که سابقه ابتلای بستگان درجه یک (مادر، خواهر، دختر) دارند، سن شروع غربالگری به ۱۰ سال قبل از سن ابتلای آن فرد، یا سن ۳۰ سالگی تقلیل می‌یابد.',
      target: 'doctors',
      targetText: 'مشاهده مراکز ماموگرافی'
    },
    {
      q: 'در صورت لمس توده جدید در پستان چه اقداماتی باید انجام شود؟',
      category: 'تریاژ علائم',
      a: 'بیش از ۸۰ درصد توده‌های لمس‌شده در بافت پستان خوش‌خیم هستند (کیست‌های ساده یا فیبروآدنوم). با این وجود معاینه زودهنگام توسط جراح پستان الزامی است. اقدامات تشخیصی پایه شامل سونوگرافی با رزولوشن بالا و ماموگرافی (در سنین بالای ۳۰ سال) و در صورت لزوم نمونه‌برداری سوزنی (Core Needle Biopsy) تحت هدایت سونوگرافی است.',
      target: 'doctors',
      targetText: 'رزرو نوبت فوق‌تخصص جراحی پستان'
    },
    {
      q: 'اعداد BI-RADS در سونوگرافی و ماموگرافی به چه معناست؟',
      category: 'تفسیر تصویربرداری',
      a: 'سیستم استاندارد گزارش‌دهی تصویربرداری پستان است:\n• BI-RADS 1: کاملاً نرمال (احتمال بدخیمی ۰٪)\n• BI-RADS 2: یافته کاملاً خوش‌خیم مثل کیست ساده یا فیبروآدنوم کهنه (احتمال بدخیمی ۰٪)\n• BI-RADS 3: احتمال بسیار بالا خوش‌خیم، پیگیری مجدد ۶ ماه بعد (احتمال زیر ۲٪)\n• BI-RADS 4: یافته مشکوک، نیازمند بیوپسی تشخیصی (۲ تا ۹۵٪)\n• BI-RADS 5: احتمال بدخیمی بسیار بالا (بالای ۹۵٪)',
      target: 'ai-cdss',
      targetText: 'بررسی شاخص‌های تشخیصی در سامانه'
    },
    {
      q: 'خونریزی یا لکه‌بینی بعد از دوران یائسگی چه معنایی دارد؟',
      category: 'اورژانس ژنیکولوژی',
      a: 'هرگونه خونریزی یا لکه‌بینی واژینال پس از قطع قاعدگی ناشی از یائسگی یک «علامت هشدار زرد/قرمز» است. اگرچه علت می‌تواند آتروفی اندومتر یا پولیپ خوش‌خیم باشد، اما برای رد سرطان اندومتر باید در اسرع وقت سونوگرافی ترانس‌واژینال (بررسی ضخامت اندومتر بالای ۴ میلی‌متر) و در صورت لزوم نمونه‌برداری سرپایی پایپل (Pipelle Biopsy) انجام شود.',
      target: 'telemedicine',
      targetText: 'ویزیت آنلاین فوری با متخصص زنان'
    },
    {
      q: 'واکسن HPV تا چه سنی قابل تزریق است و چه بیماری‌هایی را پیشگیری می‌کند؟',
      category: 'پیشگیری و ویروس‌شناسی',
      a: 'واکسیناسیون HPV (گارداسیل ۴ یا ۹ ظرفیتی یا پاپیلوگارد) از سن ۹ تا ۲۶ سالگی بیشترین کارایی را در پیشگیری از سرطان دهانه رحم و زگیل‌های تناسلی دارد. با این حال بر اساس دستورالعمل‌های جدید، افراد بین ۲۷ تا ۴۵ سال نیز با تصمیم پزشک می‌توانند از محافظت واکسن در برابر سویه‌هایی که هنوز آلوده نشده‌اند بهره‌مند شوند.',
      target: 'doctors',
      targetText: 'مشاوره واکسیناسیون با پزشک'
    },
    {
      q: 'جلسات هیات مجازی تومور (Virtual Tumor Board) چیست و چه کاربردی دارد؟',
      category: 'پلتفرم شمساز',
      a: 'کمیسیون مجازی تومور در شمساز جلسه‌ای چندتخصصی (MDT) است که در آن پرونده‌های پیچیده بیماران توسط جراح انکولوژیست، مدیکال انکولوژیست، رادیوتراپیست، پاتولوژیست و رادیولوژیست به اشتراک گذاشته شده و بهترین استراتژی درمان یکپارچه برای بیمار تدوین می‌گردد.',
      target: 'tumor-board',
      targetText: 'مشاهده تالار هیات مجازی تومور'
    }
  ];

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Robust triage detector based on keywords and symptoms
  const detectTriageLevel = (query: string, response: string): 'green' | 'yellow' | 'red' => {
    const combined = (query + ' ' + response).toLowerCase();
    
    // Red flags (immediate emergency)
    if (
      combined.includes('اورژانس') || 
      combined.includes('۱۱۵') || 
      combined.includes('خونریزی شدید') || 
      combined.includes('تنگی نفس حاد') || 
      combined.includes('پوست پرتقالی') ||
      combined.includes('فرورفتگی ناگهانی نوک پستان') ||
      combined.includes('کاهش هوشیاری') ||
      combined.includes('درد حاد غیرقابل تحمل') ||
      combined.includes('bi-rads 5')
    ) {
      return 'red';
    }

    // Yellow flags (priority physician consultation within 48-72h)
    if (
      combined.includes('توده') || 
      combined.includes('بیوپسی') || 
      combined.includes('سفتی') || 
      combined.includes('لکه‌بینی') || 
      combined.includes('یائسگی') || 
      combined.includes('bi-rads 4') || 
      combined.includes('hpv مثبت') || 
      combined.includes('پاپ اسمیر غیرطبیعی') || 
      combined.includes('ترشح خونی') || 
      combined.includes('افزایش ضخامت اندومتر') ||
      combined.includes('درد مداوم')
    ) {
      return 'yellow';
    }

    return 'green';
  };

  // Authoritative clinical fallback generator
  const getFallbackResponse = (userText: string): { 
    text: string; 
    triageLevel: 'green' | 'yellow' | 'red'; 
    actionTarget?: string; 
    actionText?: string;
    detailsList?: string[];
  } => {
    const lower = userText.toLowerCase();

    // 1. Breast Lump / Masses
    if (lower.includes('توده') || lower.includes('پستان') || lower.includes('سینه') || lower.includes('سفتی') || lower.includes('کیست')) {
      return {
        text: `در صورت احساس یا لمس هرگونه توده یا بافت سفت در پستان:\n\n۱. آرامش خود را حفظ نمایید؛ خوشبختانه بیش از ۸۰٪ توده‌های لمس‌شده ماهیت کاملاً غیرسرطانی دارند (کیست‌های ساده یا فیبروآدنوم خوش‌خیم).\n۲. ارزیابی فوری بالینی توسط فوق‌تخصص جراحی پستان الزامی است.\n۳. سونوگرافی با فرکانس بالا و در افراد بالای ۳۰-۳۵ سال، ماموگرافی دوطرفه استاندارد گام نخست تشخیص است.\n۴. در صورت وجود مشخصات نامنظم، بیوپسی سوزنی تحت هدایت تصویربرداری (Core Needle) انجام می‌پذیرد.`,
        triageLevel: 'yellow',
        actionTarget: 'doctors',
        actionText: 'رزرو نوبت فوق‌تخصص جراحی پستان',
        detailsList: [
          'عدم دستکاری یا ماساژ شدید موضع',
          'ثبت تاریخ دقیق چرخه قاعدگی (برخی توده‌ها با دوره ماهانه تغییر اندازه می‌دهند)',
          'همراه داشتن سونوگرافی یا ماموگرافی‌های قبلی جهت مقایسه مقطعی'
        ]
      };
    }

    // 2. Screening & Mammography
    if (lower.includes('ماموگرافی') || lower.includes('غربالگری') || lower.includes('سن ماموگرافی') || lower.includes('چکاپ')) {
      return {
        text: `پروتکل مصوب غربالگری سرطان پستان در پلتفرم شمساز و شبکه ملی:\n\n• سن شروع ماموگرافی سالیانه: از ۴۰ سالگی به صورت سالیانه.\n• سابقه خانوادگی درجه یک (مادر، خواهر): غربالگری ۱۰ سال قبل از سن ابتلای فرد مذکور آغاز می‌گردد.\n• خودآزمایی ماهانه (BSE): چند روز پس از اتمام دوره قاعدگی جهت آشنایی با بافت طبیعی.\n• مزیت ماموگرافی دیجیتال: کشف میکروکلسیفیکاسیون‌ها و ضایعات بسیار ریز سال‌ها پیش از قابل لمس شدن.`,
        triageLevel: 'green',
        actionTarget: 'doctors',
        actionText: 'مشاهده مراکز تصویربرداری و غربالگری',
        detailsList: [
          'بهترین زمان انجام: هفته اول پس از پایان قاعدگی (کاهش حساسیت و تورم بافتی)',
          'در روز مراجعه از مصرف اسپری، لوسیون یا پودر تالک در ناحیه زیربغل خودداری شود.'
        ]
      };
    }

    // 3. Bleeding & Menopause & Endometrium
    if (lower.includes('خونریزی') || lower.includes('یائسگی') || lower.includes('لکه‌بینی') || lower.includes('اندومتر') || lower.includes('رحم')) {
      return {
        text: `خونریزی یا لکه‌بینی واژینال پس از دوران یائسگی:\n\n• این وضعیت یک نشانه هشدار بالینی مهم است و نباید نادیده گرفته شود.\n• علت‌های احتمالی: آتروفی دیواره واژن یا اندومتر (شایع‌ترین)، پولیپ‌های رحمی، هایپرپلازی اندومتر و در حدود ۱۰٪ موارد سرطان اندومتر.\n• گام ضروری: سونوگرافی ترانس‌واژینال برای اندازه‌گیری ضخامت اندومتر.\n• اگر ضخامت بالاتر از ۴ الی ۵ میلی‌متر باشد، بیوپسی سرپایی اندومتر (پایپل) برای اطمینان کامل انجام می‌شود.`,
        triageLevel: 'yellow',
        actionTarget: 'telemedicine',
        actionText: 'ویزیت آنلاین تصویری با متخصص زنان',
        detailsList: [
          'یادداشت تعداد روزها و حجم لکه‌بینی',
          'پرهیز از مصرف خودسرانه داروهای هورمونی یا گیاهی فیتواستروژن'
        ]
      };
    }

    // 4. HPV & Pap Smear & Cervical
    if (lower.includes('hpv') || lower.includes('پاپ اسمیر') || lower.includes('سرویکس') || lower.includes('دهانه رحم') || lower.includes('واکسن')) {
      return {
        text: `راهنمای سلامت دهانه رحم و ویروس HPV:\n\n• غربالگری ترکیبی (Co-testing): تست پاپ اسمیر هر ۳ سال، یا تست همزمان پاپ‌اسمیر و HPV DNA هر ۵ سال در سنین ۳۰ تا ۶۵ سالگی.\n• انواع پرخطر HPV: سویه‌های ۱۶ و ۱۸ مسئول بیش از ۷۰٪ موارد بدخیمی سرویکس هستند.\n• در صورت مثبت بودن HPV پرخطر با پاپ‌اسمیر مشکوک (مانند ASC-US یا LSIL)، انجام کولپوسکوپی تشخیصی توصیه می‌گردد.\n• واکسیناسیون HPV حتی پس از تماس با ویروس برای محافظت در برابر سایر سویه‌های پرخطر ارزشمند است.`,
        triageLevel: 'green',
        actionTarget: 'doctors',
        actionText: 'مشاوره با متخصص زنان و انکولوژی',
        detailsList: [
          'عدم رابطه زناشویی و عدم مصرف دوش واژینال تا ۴۸ ساعت قبل از پاپ اسمیر',
          'انجام تست در زمانی خارج از دوران خونریزی قاعدگی'
        ]
      };
    }

    // 5. Ovarian & Pelvic fullness
    if (lower.includes('تخمدان') || lower.includes('کیست تخمدان') || lower.includes('نفخ مداوم') || lower.includes('اتساع') || lower.includes('ca125')) {
      return {
        text: `علائم و ارزیابی سلامت تخمدان:\n\n• علائم زودهنگام تخمدان اغلب غیراختصاصی هستند: نفخ و احساس پری مداوم شکم، سیری زودرس، تکرر ادرار و درد یا سنگینی لگن.\n• در صورت استمرار این علائم برای بیش از ۲ تا ۳ هفته، مراجعه به متخصص زنان و انجام سونوگرافی کالر داپلر لگنی و بررسی مارکر خونی CA-125 توصیه می‌شود.\n• بیشتر کیست‌های تخمدانی فانکشنال بوده و با پیگیری چند هفته‌ای برطرف می‌شوند، اما کیست‌های با جزئیات توپر یا جدار ضخیم نیاز به ارزیابی دقیق‌تر دارند.`,
        triageLevel: 'yellow',
        actionTarget: 'doctors',
        actionText: 'رزرو نوبت فوق تخصص انکولوژی زنان'
      };
    }

    // 6. Platform Navigation
    if (lower.includes('نوبت') || lower.includes('ویزیت') || lower.includes('تله‌مدیسین') || lower.includes('تومور') || lower.includes('پزشک')) {
      return {
        text: `پلتفرم سلامت شمساز خدمات یکپارچه‌ای برای شما فراهم کرده است:\n\n۱. نوبت‌دهی آنلاین: انتخاب پزشکان فوق‌تخصص بر اساس تخصص، شهر و زمان آزاد.\n۲. ویزیت آنلاین تصویری: مشاوره مستقیم از منزل با پزشک به همراه نسخه الکترونیک بیمه‌ای.\n۳. هیات مجازی تومور (MDT): بررسی کمیسیونی پرونده‌های پیچیده توسط اساتید آنکولوژی و جراحی.\n۴. سیستم تصمیم‌یار بالینی (CDSS): محاسبه منحنی بقا بر اساس داده‌های پاتولوژی.`,
        triageLevel: 'green',
        actionTarget: 'doctors',
        actionText: 'جستجوی پزشکان متخصص شمساز'
      };
    }

    // Default friendly assistant response
    return {
      text: `سلام و درود. من به عنوان دستیار هوشمند بالینی شمساز، در کنار شما هستم.\n\nشما می‌توانید سوالات بالینی، نتایج آزمایش‌ها، ماموگرافی، پاپ‌اسمیر یا علائم جسمی خود را مطرح بفرمایید تا ارزیابی تریاژ، رتبه خطر و نزدیک‌ترین مسیر درمانی به شما ارائه گردد.\n\nهمچنین با تب‌های بالای صفحه می‌توانید از ابزار ارزیابی مرحله‌ای علائم و پرسش‌های متداول تخصصی استفاده کنید.`,
      triageLevel: 'green',
      actionTarget: 'doctors',
      actionText: 'مشاهده لیست پزشکان متخصص'
    };
  };

  // Chat message send handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('API server unavailable');
      }

      const data = await response.json();
      let replyText = data.text;
      const fb = getFallbackResponse(query);

      let actionTarget = fb.actionTarget;
      let actionText = fb.actionText;
      let detailsList = fb.detailsList;

      if (data.fallback || !replyText) {
        replyText = fb.text;
      }

      const triageLevel = detectTriageLevel(query, replyText);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        triageLevel,
        actionTarget,
        actionText,
        detailsList,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Using intelligent medical fallback rules engine:', err);
      const fb = getFallbackResponse(query);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fb.text,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        triageLevel: fb.triageLevel,
        actionTarget: fb.actionTarget,
        actionText: fb.actionText,
        detailsList: fb.detailsList,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run symptom wizard evaluation
  const handleCalculateTriage = () => {
    let score = 0;
    if (checkerCategory === 'breast') score += 2;
    if (checkerCategory === 'post_meno_bleed') score += 4;
    if (checkerCategory === 'pelvic') score += 1;
    if (checkerCategory === 'pap_hpv') score += 2;

    if (checkerDuration === 'more_month') score += 2;
    if (checkerPain === 'painless') score += 1; // painless lumps are often more clinically concerning
    score += checkerRedFlags.length * 3;

    let level: 'green' | 'yellow' | 'red' = 'green';
    let recommendation = '';
    let target = 'doctors';
    let targetLabel = 'رزرو نوبت پزشک';

    if (score >= 6 || checkerRedFlags.length > 0 || checkerCategory === 'post_meno_bleed') {
      level = score >= 8 ? 'red' : 'yellow';
      if (level === 'red') {
        recommendation = 'بر اساس علائم علامت‌گذاری شده، وضعیت شما نیازمند ارزیابی فوری تخصصی حضوری یا مراجعه به مرکز درمانی در کمتر از ۲۴ تا ۴۸ ساعت آینده است. لطفا در اسرع وقت نوبت فوری رزرو نموده یا در صورت بروز علائم حاد سیستمیک با اورژانس ۱۱۵ تماس بگیرید.';
        target = 'doctors';
        targetLabel = 'رزرو نوبت فوری فوق‌تخصص';
      } else {
        recommendation = 'علائم شما در رده هشدار زرد (اولویت متوسط به بالا) ارزیابی گردید. توصیه جدی می‌شود ظرف ۳ تا ۷ روز آینده توسط متخصص زنان یا جراح پستان ویزیت شده و در صورت لزوم تصویربرداری تکمیلی (سونوگرافی/ماموگرافی) انجام دهید.';
        target = 'telemedicine';
        targetLabel = 'ویزیت آنلاین یا رزرو حضوری';
      }
    } else {
      level = 'green';
      recommendation = 'علائم گزارش‌شده در حال حاضر فوریت بحرانی نشان نمی‌دهد، با این حال پایش خودآزمایی ماهانه و رعایت جدول غربالگری استاندارد اکیداً توصیه می‌شود. در صورت تشدید هرگونه علامت فورا به پزشک مراجعه فرمایید.';
      target = 'doctors';
      targetLabel = 'مشاهده مراکز غربالگری';
    }

    const wizardMsg: ChatMessage = {
      id: `triage-eval-${Date.now()}`,
      sender: 'assistant',
      text: `📋 نتیجه ارزیابی خودکار چک‌لیست تریاژ:\n\n• سطح اولویت: ${level === 'red' ? 'قرمز (نیاز به ارزیابی فوری)' : level === 'yellow' ? 'زرد (نیازمند ویزیت تخصصی در روزهای آینده)' : 'سبز (غربالگری و پایش روتین)'}\n\n${recommendation}`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      triageLevel: level,
      actionTarget: target,
      actionText: targetLabel,
      detailsList: [
        `دسته بالینی انتخابی: ${checkerCategory === 'breast' ? 'تغییرات بافت پستان' : checkerCategory === 'post_meno_bleed' ? 'خونریزی پس از یائسگی' : checkerCategory === 'pap_hpv' ? 'پاپ اسمیر و HPV' : 'درد و نفخ لگنی'}`,
        `مدت زمان علائم: ${checkerDuration === 'less_week' ? 'کمتر از ۱ هفته' : checkerDuration === 'less_month' ? '۱ الی ۴ هفته' : 'بیشتر از ۱ ماه'}`,
        `علائم هشدار همراه: ${checkerRedFlags.length > 0 ? checkerRedFlags.join('، ') : 'موردی علامت نخورده'}`
      ]
    };

    setMessages(prev => [...prev, wizardMsg]);
    setActiveTab('chat');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#•\n]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fa-IR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setMessages([
      {
        id: 'm-reset',
        sender: 'assistant',
        text: 'تاریخچه مکالمه پاکسازی شد. چطور می‌توانم در خصوص ارزیابی علائم یا راهنمایی سامانه به شما کمک کنم؟',
        timestamp: 'همین الان',
        triageLevel: 'green',
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 text-right print:hidden font-sans" dir="rtl">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 py-3.5 px-4.5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-500 hover:from-indigo-800 hover:to-teal-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          aria-label="دستیار هوشمند سلامت شمساز"
        >
          {/* Animated pulsing status ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-400 border-2 border-white"></span>
          </span>

          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="text-right">
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>دستیار هوشمند سلامت</span>
              <span className="text-[9px] bg-teal-400/30 px-1.5 py-0.5 rounded text-teal-100 font-bold">هوشمند بالینی</span>
            </div>
            <div className="text-[10px] text-teal-200">تریاژ علائم، پاسخ به سوالات بالینی</div>
          </div>
        </button>
      )}

      {/* Expandable Chat Modal Window */}
      {isOpen && (
        <div className="w-88 sm:w-105 h-[580px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Bar Header */}
          <div className="bg-gradient-to-l from-indigo-950 via-indigo-800 to-teal-800 text-white p-3.5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-teal-300 ring-1 ring-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black flex items-center gap-1.5">
                  <span>دستیار سلامت و تریاژ شمساز</span>
                  <span className="text-[9px] bg-teal-500/25 text-teal-300 border border-teal-400/30 px-1.5 py-0.2 rounded font-mono">
                    Gemini 3.8 Flash
                  </span>
                </h3>
                <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  مبتنی بر شواهد بالینی و گایدلاین‌های NCCN
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="شروع مجدد گفتگو"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Header */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-bold shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>گفتگوی هوشمند</span>
            </button>
            <button
              onClick={() => setActiveTab('symptom_checker')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'symptom_checker'
                  ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>چک‌لیست تریاژ</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'faqs'
                  ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>سوالات پرتکرار</span>
            </button>
          </div>

          {/* TAB 1: CONVERSATIONAL CHAT */}
          {activeTab === 'chat' && (
            <>
              {/* Quick Prompts Bar */}
              <div className="bg-slate-50/80 border-b border-slate-100 p-2 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-none text-[11px]">
                {quickPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.label)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200/90 rounded-xl text-slate-700 hover:text-indigo-700 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Icon className="w-3 h-3 text-indigo-500" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {/* Triage Badge if applicable */}
                        {!isUser && m.triageLevel && (
                          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              m.triageLevel === 'red'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : m.triageLevel === 'yellow'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-teal-100 text-teal-800 border border-teal-300'
                            }`}>
                              {m.triageLevel === 'red' && 'سطح تریاژ: اورژانس فوری (Red Flag)'}
                              {m.triageLevel === 'yellow' && 'سطح تریاژ: نیازمند ویزیت تخصصی در اسرع وقت'}
                              {m.triageLevel === 'green' && 'سطح تریاژ: غربالگری، آموزش و خودمراقبتی'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => copyToClipboard(m.text, m.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title="کپی متن"
                              >
                                {copiedId === m.id ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => toggleSpeak(m.text)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title="خواندن صوتی"
                              >
                                {isSpeaking ? <VolumeX className="w-3 h-3 text-indigo-600" /> : <Volume2 className="w-3 h-3" />}
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                            </div>
                          </div>
                        )}

                        <div className="whitespace-pre-line text-xs font-normal">
                          {m.text}
                        </div>

                        {/* Structured details list */}
                        {!isUser && m.detailsList && m.detailsList.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 block">نکات کلیدی بالینی:</span>
                            {m.detailsList.map((item, i) => (
                              <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Button inside Assistant Bubble */}
                        {!isUser && m.actionTarget && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">اقدام بالینی پیشنهادی:</span>
                            <button
                              onClick={() => {
                                if (m.actionTarget) onNavigate(m.actionTarget);
                                setIsOpen(false);
                              }}
                              className="py-1 px-3 bg-gradient-to-r from-indigo-50 to-teal-50 hover:from-indigo-100 hover:to-teal-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>{m.actionText || 'مشاهده در سامانه'}</span>
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 px-1">
                          {m.timestamp}
                        </span>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 w-fit">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-150" />
                    <span>دستیار در حال تحلیل بالینی علائم و استخراج پاسخ...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Clinical Disclaimer Banner */}
              <div className="px-3 py-1.5 bg-amber-50/80 border-t border-amber-200/60 text-[10px] text-amber-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>پاسخ‌های هوش مصنوعی جنبه آموزشی و تریاژ دارد و جایگزین ویزیت پزشک نیست.</span>
                </div>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-200/50 px-1 rounded">اورژانس: ۱۱۵</span>
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="سوال پزشکی، علائم یا سن و وضعیت خود را بنویسید..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden text-right transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                  title="ارسال پیام"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: SYMPTOM CHECKER WIZARD */}
          {activeTab === 'symptom_checker' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/70">
              <div className="bg-indigo-50/80 border border-indigo-200/80 p-3 rounded-2xl flex items-start gap-2.5">
                <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-950 text-xs">چک‌لیست خودکار تریاژ علائم بالینی بانوان</h4>
                  <p className="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
                    با تکمیل موارد زیر، رتبه خطر علائم و لزوم فوریت مراجعه به مراکز درمانی به صورت هوشمند محاسبه می‌شود.
                  </p>
                </div>
              </div>

              {/* Step 1: Category */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">۱</span>
                  <span>علامت اصلی مورد نظر شما چیست؟</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'breast', label: 'توده یا سفتی در پستان' },
                    { id: 'post_meno_bleed', label: 'خونریزی پس از یائسگی' },
                    { id: 'pap_hpv', label: 'پاپ اسمیر یا HPV مشکوک' },
                    { id: 'pelvic', label: 'درد یا نفخ و اتساع لگن' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCheckerCategory(opt.id)}
                      className={`p-2 rounded-xl text-right transition-all cursor-pointer border ${
                        checkerCategory === opt.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Duration */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">۲</span>
                  <span>چه مدت است این علامت شروع شده؟</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'less_week', label: 'کمتر از ۱ هفته' },
                    { id: 'less_month', label: '۱ تا ۴ هفته' },
                    { id: 'more_month', label: 'بیش از ۱ ماه' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCheckerDuration(opt.id)}
                      className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                        checkerDuration === opt.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Pain / Characteristics */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">۳</span>
                  <span>ماهیت حس درد:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'painless', label: 'بدون درد (توده بدون درد)' },
                    { id: 'painful', label: 'همراه با درد موضعی یا تیرکشنده' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCheckerPain(opt.id)}
                      className={`p-2 rounded-xl text-right transition-all cursor-pointer border ${
                        checkerPain === opt.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Red flags checklist */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">۴</span>
                  <span>آیا هیچ‌یک از علائم هشدار زیر را دارید؟</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'skin_dimpling', label: 'فرورفتگی پوست یا نمای شبیه پوست پرتقال' },
                    { id: 'nipple_retraction', label: 'فرورفتگی جدید نوک پستان یا ترشح خونی' },
                    { id: 'severe_bleed', label: 'خونریزی شدید با خروج لخته یا ضعف عمومی' },
                    { id: 'weight_loss', label: 'کاهش وزن ناخواسته یا بی‌اشتهایی شدید' },
                  ].map((flag) => {
                    const checked = checkerRedFlags.includes(flag.label);
                    return (
                      <label
                        key={flag.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-colors cursor-pointer ${
                          checked ? 'bg-rose-50/60 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCheckerRedFlags([...checkerRedFlags, flag.label]);
                            } else {
                              setCheckerRedFlags(checkerRedFlags.filter(f => f !== flag.label));
                            }
                          }}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[11px]">{flag.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Triage Evaluation */}
              <button
                type="button"
                onClick={handleCalculateTriage}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Activity className="w-4 h-4" />
                <span>محاسبه و ارزیابی تریاژ علائم</span>
              </button>

              {/* Direct Full Clinical Screening Link */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('screening');
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Stethoscope className="w-4 h-4 text-pink-600" />
                  <span>ورود به فرم جامع غربالگری و صدور کارنامه پزشک</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL FAQS */}
          {activeTab === 'faqs' && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs bg-slate-50/70">
              <div className="text-[11px] text-slate-500 px-1 font-medium">
                پاسخ‌های تأییدشده بالینی به پرسش‌های پرتکرار مراجعین:
              </div>

              {medicalFAQs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-start gap-1.5 leading-snug">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h4>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0">
                      {faq.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {faq.a}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleSendMessage(faq.q)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>پرسش اختصاصی در گفتگو</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate(faq.target);
                        setIsOpen(false);
                      }}
                      className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{faq.targetText}</span>
                      <ArrowLeft className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
