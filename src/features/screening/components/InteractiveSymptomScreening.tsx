/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Calendar, 
  FileText, 
  User, 
  Sparkles, 
  Heart, 
  Ribbon, 
  Printer, 
  Download, 
  Activity, 
  Share2, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Check, 
  RefreshCw,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { ScreeningReport, ScreeningTriageLevel, Doctor } from '../../../types';

interface InteractiveSymptomScreeningProps {
  onSaveReport: (report: ScreeningReport) => void;
  onBookDoctor?: (doctorName?: string, organ?: string) => void;
  onViewInPortal?: () => void;
  existingPatientName?: string;
}

export const InteractiveSymptomScreening: React.FC<InteractiveSymptomScreeningProps> = ({
  onSaveReport,
  onBookDoctor,
  onViewInPortal,
  existingPatientName = 'مریم احمدی'
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState<boolean>(false);
  const [copyNotice, setCopyNotice] = useState<boolean>(false);

  // Step 1: Patient Demographic & Baseline Profile
  const [patientName, setPatientName] = useState<string>(existingPatientName);
  const [patientNationalId, setPatientNationalId] = useState<string>('۰۰۲-۱۸۹۴۵۲-۱');
  const [patientPhone, setPatientPhone] = useState<string>('۰۹۱۲-۳۴۵-۶۷۸۹');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [menopausalStatus, setMenopausalStatus] = useState<'pre' | 'peri' | 'post'>('peri');
  const [firstDegreeFamilyHistory, setFirstDegreeFamilyHistory] = useState<boolean>(true);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState<string>('سابقه سرطان پستان در خاله و مادر');
  const [knownGeneticMutation, setKnownGeneticMutation] = useState<'none' | 'brca1' | 'brca2' | 'lynch' | 'unknown'>('unknown');
  const [hrtHistory, setHrtHistory] = useState<boolean>(false);

  // Step 2: Primary Organ & Symptoms Checklist
  const [targetOrgan, setTargetOrgan] = useState<'all' | 'breast' | 'cervix' | 'ovary' | 'endometrium'>('all');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Step 3: Red Flags & Timeline
  const [symptomDuration, setSymptomDuration] = useState<'less_2_weeks' | '2_to_6_weeks' | 'more_2_months' | 'cyclical'>('2_to_6_weeks');
  const [massConsistency, setMassConsistency] = useState<'soft_mobile' | 'firm_fixed' | 'no_mass'>('soft_mobile');
  const [hasPostmenopausalBleeding, setHasPostmenopausalBleeding] = useState<boolean>(false);
  const [unexplainedWeightLoss, setUnexplainedWeightLoss] = useState<boolean>(false);
  const [chronicFatigueAnemia, setChronicFatigueAnemia] = useState<boolean>(false);
  const [persistentBloatingTriad, setPersistentBloatingTriad] = useState<boolean>(false);

  // Step 4: Prior Screening History
  const [lastMammography, setLastMammography] = useState<'within_year' | '1_to_2_years' | 'more_2_years' | 'never'>('1_to_2_years');
  const [lastPapSmearHpv, setLastPapSmearHpv] = useState<'normal_recent' | 'overdue_3y' | 'abnormal_past' | 'never'>('normal_recent');
  const [lastPelvicUltrasound, setLastPelvicUltrasound] = useState<'normal_recent' | 'not_performed'>('normal_recent');

  // Generated Report Cache
  const [generatedReport, setGeneratedReport] = useState<ScreeningReport | null>(null);

  // Pre-defined Symptoms List with clinical metadata
  const SYMPTOMS_LIST = [
    {
      id: 'br_lump',
      organ: 'breast',
      organFa: 'پستان',
      title: 'توده جدید یا سفت‌شدگی غیرمعمول در بافت پستان یا زیربغل',
      desc: 'لمس گره یا بافت متراکم متمایز از سایر بخش‌های پستان',
      severity: 'high',
      weight: 35
    },
    {
      id: 'br_skin_dimpling',
      organ: 'breast',
      organFa: 'پستان',
      title: 'فرورفتگی پوست یا نمای پوست پرتقالی (Peau d\'orange)',
      desc: 'کشیدگی یا چین‌خوردگی موضعی پوست پستان',
      severity: 'high',
      weight: 30
    },
    {
      id: 'br_nipple_retraction',
      organ: 'breast',
      organFa: 'پستان',
      title: 'فرورفتگی یا انحراف جدید نوک پستان (Nipple Inversion)',
      desc: 'تغییر جهت ناگهانی یا کشیده شدن نوک پستان به داخل',
      severity: 'high',
      weight: 25
    },
    {
      id: 'br_discharge',
      organ: 'breast',
      organFa: 'پستان',
      title: 'ترشح خودبه‌خودی خونی یا آبکی زلال از یک نوک پستان',
      desc: 'خروج مایع بدون فشار دادن یا تحریک فیزیکی',
      severity: 'high',
      weight: 30
    },
    {
      id: 'br_mastalgia',
      organ: 'breast',
      organFa: 'پستان',
      title: 'درد موضعی یکطرفه مداوم و بدون ارتباط با دوره پریود',
      desc: 'احساس سوزش یا سنگینی موضعی در یک نقطه مشخص',
      severity: 'moderate',
      weight: 15
    },
    {
      id: 'cx_postcoital_bleed',
      organ: 'cervix',
      organFa: 'دهانه رحم (سرویکس)',
      title: 'خونریزی یا لکه‌بینی پس از رابطه زناشویی (Postcoital Bleeding)',
      desc: 'مشاهده لکه‌های خونی روشن بلافاصله بعد از نزدیکی',
      severity: 'high',
      weight: 30
    },
    {
      id: 'cx_intermenstrual_bleed',
      organ: 'cervix',
      organFa: 'دهانه رحم (سرویکس)',
      title: 'لکه‌بینی یا خونریزی غیرمعمول بین دو قاعدگی',
      desc: 'خونریزی در روزهایی خارج از تقویم معمول پریود',
      severity: 'moderate',
      weight: 20
    },
    {
      id: 'cx_discharge',
      organ: 'cervix',
      organFa: 'دهانه رحم (سرویکس)',
      title: 'ترشحات غیرطبیعی، آبکی، صورتی‌رنگ یا با بوی نامطبوع مداوم',
      desc: 'افزایش مداوم ترشحات بدون پاسخ به درمان ضدعفونت معمول',
      severity: 'moderate',
      weight: 20
    },
    {
      id: 'ov_bloating',
      organ: 'ovary',
      organFa: 'تخمدان',
      title: 'احساس مداوم نفخ یا اتساع شکم بیش از ۲ الی ۳ هفته',
      desc: 'بزرگی سایز دور کمر و ورم شکمی که علیرغم استراحت کاهش نمی‌یابد',
      severity: 'high',
      weight: 25
    },
    {
      id: 'ov_satiety',
      organ: 'ovary',
      organFa: 'تخمدان',
      title: 'احساس سیری زودرس و ناتوانی در خوردن یک وعده غذای معمولی',
      desc: 'پر شدن سریع معده پس از چند لقمه غذا',
      severity: 'moderate',
      weight: 20
    },
    {
      id: 'ov_pelvic_pain',
      organ: 'ovary',
      organFa: 'تخمدان',
      title: 'دردهای مبهم اما مداوم و روزمره در ناحیه لگن و زیر شکم',
      desc: 'احساس فشار دائمی یا تیر کشیدن در ناحیه تحتانی لگن',
      severity: 'moderate',
      weight: 20
    },
    {
      id: 'ov_urinary',
      organ: 'ovary',
      organFa: 'تخمدان',
      title: 'تکرر ادرار یا فوریت ادراری بدون وجود عفونت ادراری',
      desc: 'احساس نیاز مداوم به دفع ادرار ناشی از فشار بر مثانه',
      severity: 'low',
      weight: 15
    },
    {
      id: 'ut_pmb',
      organ: 'endometrium',
      organFa: 'رحم و اندومتر',
      title: 'هرگونه خونریزی یا لکه‌بینی پس از یائسگی (حتی یک قطره)',
      desc: 'علامت هشداردهنده کلیدی (Red Flag) نیازمند بررسی فوری بیوپسی',
      severity: 'high',
      weight: 45
    },
    {
      id: 'ut_heavy_bleeding',
      organ: 'endometrium',
      organFa: 'رحم و اندومتر',
      title: 'خونریزی‌های بسیار سنگین، طولانی یا نامنظم در سنین بالای ۴۵ سال',
      desc: 'دفع لخته‌های خونی بزرگ و کم‌خونی ناشی از خونریزی',
      severity: 'moderate',
      weight: 25
    }
  ];

  const toggleSymptom = (title: string) => {
    if (selectedSymptoms.includes(title)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== title));
    } else {
      setSelectedSymptoms([...selectedSymptoms, title]);
    }
  };

  // Smart Clinical Calculation Engine
  const calculateClinicalReport = (): ScreeningReport => {
    let score = 15; // baseline population screening risk
    const detectedOrgans: Record<string, number> = {
      breast: 0,
      cervix: 0,
      ovary: 0,
      endometrium: 0
    };

    // 1. Age Factor
    if (patientAge >= 50) score += 10;
    else if (patientAge >= 40) score += 5;

    // 2. Family History
    if (firstDegreeFamilyHistory) {
      score += 15;
      detectedOrgans.breast += 10;
      detectedOrgans.ovary += 10;
    }
    if (knownGeneticMutation === 'brca1' || knownGeneticMutation === 'brca2') {
      score += 25;
      detectedOrgans.breast += 20;
      detectedOrgans.ovary += 20;
    }

    // 3. Symptoms aggregation
    SYMPTOMS_LIST.forEach(sym => {
      if (selectedSymptoms.includes(sym.title)) {
        score += sym.weight;
        detectedOrgans[sym.organ] = (detectedOrgans[sym.organ] || 0) + sym.weight;
      }
    });

    // 4. Red Flag additions
    if (hasPostmenopausalBleeding || (menopausalStatus === 'post' && selectedSymptoms.some(s => s.includes('خونریزی') || s.includes('لکه‌بینی')))) {
      score += 35;
      detectedOrgans.endometrium += 35;
    }
    if (massConsistency === 'firm_fixed') {
      score += 25;
      detectedOrgans.breast += 20;
    }
    if (unexplainedWeightLoss) score += 15;
    if (persistentBloatingTriad && patientAge >= 45) {
      score += 20;
      detectedOrgans.ovary += 25;
    }

    // 5. Prior screening history penalties
    if (lastMammography === 'more_2_years' || lastMammography === 'never') score += 10;
    if (lastPapSmearHpv === 'overdue_3y' || lastPapSmearHpv === 'never') score += 10;

    // Cap score at 98
    const finalScore = Math.min(Math.max(score, 12), 98);

    // Determine highest suspected organ
    let highestOrgan: 'breast' | 'cervix' | 'ovary' | 'endometrium' | 'general_screening' = 'general_screening';
    let highestOrganFa = 'ارزیابی عمومی سلامت زنان';
    let assignedDoc = 'دکتر سمیرا احمدی';

    let maxOrganScore = 0;
    for (const [org, orgScore] of Object.entries(detectedOrgans)) {
      if (orgScore > maxOrganScore) {
        maxOrganScore = orgScore;
        highestOrgan = org as 'breast' | 'cervix' | 'ovary' | 'endometrium';
      }
    }

    if (highestOrgan === 'breast') {
      highestOrganFa = 'پستان (پایش و ارزیابی بافتی)';
      assignedDoc = 'دکتر سمیرا احمدی (فوق‌تخصص جراحی پستان)';
    } else if (highestOrgan === 'cervix') {
      highestOrganFa = 'دهانه رحم (کولپوسکوپی و غربالگری سرویکس)';
      assignedDoc = 'دکتر پریسا شمس (فوق‌تخصص انکولوژی زنان)';
    } else if (highestOrgan === 'ovary') {
      highestOrganFa = 'تخمدان و صفاق (بررسی سونوگرافی و تومورمارکرها)';
      assignedDoc = 'دکتر علی رضایی (فوق‌تخصص مدیکال آنکولوژی)';
    } else if (highestOrgan === 'endometrium') {
      highestOrganFa = 'رحم و اندومتر (ارزیابی خونریزی و ضخامت اندومتر)';
      assignedDoc = 'دکتر پریسا شمس (فوق‌تخصص انکولوژی زنان)';
    }

    // Triage Level determination
    let triageLevel: ScreeningTriageLevel = 'routine_green';
    let referralUrgency = 'ویزیت و غربالگری روتین سالیانه';
    let physicianActionPlan = 'ادامه برنامه مراقبت سالیانه؛ ماموگرافی و آزمایش‌های روتین بر اساس رده سنی.';

    if (
      finalScore >= 65 ||
      hasPostmenopausalBleeding ||
      massConsistency === 'firm_fixed' ||
      selectedSymptoms.some(s => s.includes('خونی') || s.includes('پوست پرتقالی') || s.includes('توده'))
    ) {
      triageLevel = 'urgent_red';
      referralUrgency = 'ارجاع اولویت‌دار فوری — حداکثر ظرف ۷ روز کاری';
      physicianActionPlan = 'معاینه بالینی دقیق (CBE/Pelvic Exam)، درخواست آنی اقدامات تصویربرداری اختصاصی و در صورت لزوم تعیین وقت نمونه‌برداری پاتولوژی.';
    } else if (finalScore >= 40 || selectedSymptoms.length > 0) {
      triageLevel = 'moderate_yellow';
      referralUrgency = 'بررسی و ویزیت تخصصی در ۲ هفته آینده';
      physicianActionPlan = 'ویزیت توسط متخصص جهت رد علل خوش‌خیم (فیبروآدنوم، پولیپ، کیست) و تجویز تصویربرداری تکمیلی.';
    }

    // Recommended Diagnostics Array
    const diagnostics: string[] = [];
    if (highestOrgan === 'breast' || selectedSymptoms.some(s => s.includes('پستان') || s.includes('توده'))) {
      diagnostics.push('ماموگرافی دیجیتال دوطرفه (Bilateral Full-Field Digital Mammogram)');
      diagnostics.push('سونوگرافی با رزولوشن بالا از پستان و نواحی آگزیلاری');
      if (triageLevel === 'urgent_red') {
        diagnostics.push('بیوپسی سوزنی تحت گاید سونوگرافی (Core Needle Biopsy) در صورت تایید BI-RADS 4/5');
      }
    }

    if (highestOrgan === 'cervix' || selectedSymptoms.some(s => s.includes('نزدیکی') || s.includes('دهانه رحم'))) {
      diagnostics.push('تست ترکیبی Liquid-based Cytology (پاپ‌اسمیر بر پایه مایع) + تایپینگ ژنتیکی HPV 16/18');
      if (triageLevel === 'urgent_red') {
        diagnostics.push('کولپوسکوپی و بیوپسی هدایت‌شده با اسید استیک');
      }
    }

    if (highestOrgan === 'ovary' || selectedSymptoms.some(s => s.includes('نفخ') || s.includes('سیری') || s.includes('لگن'))) {
      diagnostics.push('سونوگرافی ترانس‌واژینال و شکمی با ارزیابی داپلر عروقی (TVS + Doppler)');
      diagnostics.push('پنل تومورمارکرهای سرمی: CA-125 و HE4 جهت محاسبه نمره ROMA');
    }

    if (highestOrgan === 'endometrium' || hasPostmenopausalBleeding || selectedSymptoms.some(s => s.includes('یائسگی') || s.includes('سنگین'))) {
      diagnostics.push('سونوگرافی ترانس‌واژینال برای اندازه‌گیری دقیق ضخامت اندومتر (Endometrial Stripe Thickness)');
      diagnostics.push('نمونه‌برداری سرپایی از پوشش رحم با پایپل (Pipelle Endometrial Biopsy)');
    }

    if (diagnostics.length === 0) {
      diagnostics.push('ماموگرافی چکاپ غربالگری دوطرفه سالیانه');
      diagnostics.push('چکاپ دوره‌ای زنان و پاپ‌اسمیر روتین');
    }

    const now = new Date();
    const formattedDate = `۱۴۰۳/۰۸/${(now.getDate() % 28) + 1} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const reportCode = `SCR-1403-${Math.floor(1000 + Math.random() * 9000)}`;

    const report: ScreeningReport = {
      id: reportCode,
      patientName,
      patientNationalId,
      patientAge,
      patientPhone,
      createdAt: formattedDate,
      triageLevel,
      riskScore: finalScore,
      suspectedOrgan: highestOrgan,
      suspectedOrganFa: highestOrganFa,
      primarySymptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['چکاپ روتین غربالگری و سوابق دوره‌ای'],
      findingsSummary: `بیمار خانم ${patientName}، سن ${patientAge} سال (${menopausalStatus === 'post' ? 'یائسه' : menopausalStatus === 'peri' ? 'در آستانه یائسگی' : 'پیش از یائسگی'}). ${firstDegreeFamilyHistory ? 'دارای سابقه مثبت خانوادگی سرطان در بستگان درجه ۱/۲.' : 'فاقد سابقه خانوادگی بارز.'} علائم کلیدی شامل: ${selectedSymptoms.slice(0, 3).join('، ') || 'ارزیابی خوداظهاری دوره‌ای'}. وضعیت قوام بافت/توده: ${massConsistency === 'firm_fixed' ? 'سفت و چسبنده' : massConsistency === 'soft_mobile' ? 'نرم یا متحرک' : 'بدون لمس توده'}.`,
      recommendedDiagnostics: diagnostics,
      physicianActionPlan,
      referralUrgency,
      recordedInPortal: false,
      assignedDoctorName: assignedDoc,
      notes: 'گزارش ارزیابی غربالگری اولیه شمساز بر پایه الگوریتم‌های استاندارد بالینی NCCN و گایدلاین وزارت بهداشت'
    };

    return report;
  };

  const handleFinishScreening = () => {
    const report = calculateClinicalReport();
    setGeneratedReport(report);
    setCurrentStep(5);
  };

  // Save report into patient portal records
  const handleSaveToRecord = () => {
    if (!generatedReport) return;
    const updated = { ...generatedReport, recordedInPortal: true };
    setGeneratedReport(updated);
    setIsSaved(true);
    onSaveReport(updated);
  };

  // Simulate AI Deep Assessment
  const handleTriggerAIAssessment = async () => {
    if (!generatedReport) return;
    setIsAnalyzingAI(true);
    try {
      // Simulate quick clinical reasoning synthesis
      setTimeout(() => {
        const aiSummary = `بر اساس تجزیه و تحلیل الگوریتمی داده‌های بیمار خانم ${generatedReport.patientName} (سن ${generatedReport.patientAge} سال):
۱. همپوشانی علائم با شاخص‌های استراتیفیکاسیون خطر NCCN نشان می‌دهد ارگان هدف نیازمند تمرکز اولیه «${generatedReport.suspectedOrganFa}» می‌باشد.
۲. با توجه به نمره ریسک (${generatedReport.riskScore}/100) و سابقه خانوادگی، توصیه موکد به پرهیز از تأخیر بیش از ۱۰ روز در انجام تصویربرداری تشخیصی دوطرفه است.
۳. یادداشت پیشنهادی برای پزشک معالج (SOAP Note Draft):
   - S (شکایت بیمار): ${generatedReport.primarySymptoms.join('، ')}.
   - O (معاینه اولیه): ارزیابی سیستمیک، توصیه به لمس دقیق غدد لنفاوی و معاینه دوطرفه.
   - A (ارزیابی): تریاژ سطح ${generatedReport.triageLevel === 'urgent_red' ? 'قرمز (Red Alert)' : 'زرد (توصیه به ارزیابی اختصاصی)'}.
   - P (طرح اقدام): درخواست اولویت‌دار: ${generatedReport.recommendedDiagnostics.slice(0, 2).join(' و ')}.`;
        setAiAnalysisResult(aiSummary);
        setIsAnalyzingAI(false);
      }, 1200);
    } catch (e) {
      setIsAnalyzingAI(false);
    }
  };

  // Filter symptoms based on target organ
  const filteredSymptoms = targetOrgan === 'all' 
    ? SYMPTOMS_LIST 
    : SYMPTOMS_LIST.filter(s => s.organ === targetOrgan);

  return (
    <div className="py-8 bg-slate-50 min-h-screen text-right" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header Breadcrumb & Mission Banner */}
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-rose-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-rose-200">
                <Ribbon className="w-3.5 h-3.5 text-rose-300" />
                <span>سامانه هوشمند پایش و غربالگری سرطان‌های زنان</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                پرسشنامه تعاملی غربالگری اولیه و ارزیابی علائم
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                با پاسخ به چند پرسش هوشمند، سطح خطر علائم پستان، دهانه رحم، تخمدان و اندومتر ارزیابی شده و کارنامه استاندارد بالینی جهت ارائه به پزشک معالج در پرونده بیمار ثبت می‌شود.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs text-white">
              <ShieldCheck className="w-5 h-5 text-teal-300 shrink-0" />
              <div>
                <div className="font-bold">ثبت معتبر در پرونده</div>
                <div className="text-[11px] text-indigo-200">مطابق گایدلاین‌های NCCN و وزارت بهداشت</div>
              </div>
            </div>
          </div>

          {/* Stepper Wizard Bar */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            {[
              { step: 1, label: '۱. مشخصات و سابقه' },
              { step: 2, label: '۲. ارزیابی علائم' },
              { step: 3, label: '۳. زنگ خطر و زمان' },
              { step: 4, label: '۴. سوابق چکاپ' },
              { step: 5, label: '۵. کارنامه بالینی پزشک' },
            ].map(item => (
              <div
                key={item.step}
                className={`py-2 px-3 rounded-xl transition-all font-semibold ${
                  currentStep === item.step
                    ? 'bg-white text-indigo-900 shadow-md font-bold'
                    : currentStep > item.step
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: PATIENT PROFILE & BASELINE RISK */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">گام اول: مشخصات هویتی و سوابق پایه بیمار</h3>
                <p className="text-xs text-slate-500">اطلاعات پرونده و فاکتورهای زمینه‌ای موثر در استراتیفیکاسیون ریسک</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">نام و نام خانوادگی بیمار:</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900"
                  placeholder="مثلاً مریم احمدی"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">کد ملی بیمار:</label>
                <input
                  type="text"
                  value={patientNationalId}
                  onChange={(e) => setPatientNationalId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 font-mono text-right"
                  placeholder="۰۰۲-۱۸۹۴۵۲-۱"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">شماره تماس همراه:</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 font-mono text-right"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                />
              </div>
            </div>

            {/* Age & Menopause */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>سن تقویمی بیمار:</span>
                  <span className="text-indigo-600 font-mono text-sm">{patientAge} سال</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>۲۰ سال</span>
                  <span>۴۰ سال (آغاز غربالگری پستان)</span>
                  <span>۸۵ سال</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">وضعیت قاعدگی و یائسگی:</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'pre', label: 'پیش از یائسگی' },
                    { id: 'peri', label: 'در آستانه (پری‌منوپوز)' },
                    { id: 'post', label: 'یائسه شده' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMenopausalStatus(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                        menopausalStatus === item.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Family & Genetic History */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-900">سابقه خانوادگی ابتلا به سرطان در بستگان درجه ۱ یا ۲:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFirstDegreeFamilyHistory(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      firstDegreeFamilyHistory ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    بله دارم
                  </button>
                  <button
                    type="button"
                    onClick={() => setFirstDegreeFamilyHistory(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      !firstDegreeFamilyHistory ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    خیر ندارم
                  </button>
                </div>
              </div>

              {firstDegreeFamilyHistory && (
                <div className="text-xs pt-2">
                  <input
                    type="text"
                    value={familyHistoryDetails}
                    onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none text-slate-800"
                    placeholder="نسبت فامیلی و نوع سرطان (مثلاً: ابتلای مادر به سرطان پستان در ۵۰ سالگی)"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>مرحله بعد: بررسی هوشمند علائم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SMART SYMPTOM ASSESSMENT */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">گام دوم: بررسی علائم بالینی به تفکیک ارگان</h3>
                  <p className="text-xs text-slate-500">هر علامتی را که در هفته‌های اخیر تجربه کرده‌اید علامت بزنید</p>
                </div>
              </div>

              {/* Organ Filter Chips */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'همه ارگان‌ها' },
                  { id: 'breast', label: 'پستان' },
                  { id: 'cervix', label: 'دهانه رحم' },
                  { id: 'ovary', label: 'تخمدان' },
                  { id: 'endometrium', label: 'رحم و اندومتر' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTargetOrgan(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      targetOrgan === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSymptoms.map((sym) => {
                const isChecked = selectedSymptoms.includes(sym.title);
                return (
                  <div
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.title)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 relative ${
                      isChecked
                        ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-900 leading-snug">
                          {sym.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-slate-200/80 text-slate-700">
                          {sym.organFa}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                        {sym.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSymptoms.length === 0 && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>اگر علامت مشکوک خاصی ندارید، این ارزیابی به عنوان غربالگری روتین و پیشگیرانه محاسبه خواهد شد.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>مرحله بعد: زنگ خطرهای بالینی</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RED FLAGS & TIMELINE */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">گام سوم: زمان‌مندی علائم و نشانه‌های هشداردهنده (Red Flags)</h3>
                <p className="text-xs text-slate-500">شاخص‌های با ارزش پیشگویی‌کننده بالا در تعیین ضرورت ارجاع فوری</p>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                مدت زمان سپری‌شده از آغاز یا لمس علائم:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'less_2_weeks', label: 'کمتر از ۲ هفته' },
                  { id: '2_to_6_weeks', label: 'بین ۲ تا ۶ هفته' },
                  { id: 'more_2_months', label: 'بیش از ۲ ماه مداوم' },
                  { id: 'cyclical', label: 'دوره‌ای و همزمان با قاعدگی' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSymptomDuration(item.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                      symptomDuration === item.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mass Consistency */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                قوام و خصوصیات لمسی توده (در صورت وجود توده در پستان یا لگن):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'no_mass', label: 'توده‌ای لمس نمی‌شود', desc: 'صرفاً سایر علائم یا چکاپ' },
                  { id: 'soft_mobile', label: 'نرم، کشسان یا متحرک زیر دست', desc: 'بیشتر منطبق با کیست یا فیبروآدنوم خوش‌خیم' },
                  { id: 'firm_fixed', label: 'سفت، سنگ‌مانند، بدون حرکت یا چسبنده', desc: 'نشانگر هشداردهنده بافت مشکوک' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMassConsistency(item.id as any)}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      massConsistency === item.id
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Crucial Red Flags Checklist */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-rose-900">
                بررسی نشانه‌های هشداردهنده حیاتی (در صورت وجود تیک بزنید):
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasPostmenopausalBleeding}
                    onChange={(e) => setHasPostmenopausalBleeding(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">خونریزی یا لکه‌بینی واژینال پس از دوران یائسگی (حتی به میزان اندک)</span>
                    <span className="text-slate-500 block text-[11px]">نیاز به نمونه‌برداری اندومتر جهت رد یا تایید هایپرپلازی/کارسینوما</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={unexplainedWeightLoss}
                    onChange={(e) => setUnexplainedWeightLoss(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">کاهش وزن ناگهانی و بدون دلیل (بیش از ۵ کیلو در چند ماه اخیر)</span>
                    <span className="text-slate-500 block text-[11px]">بدون تغییر در رژیم غذایی یا فعالیت بدنی معمول</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={persistentBloatingTriad}
                    onChange={(e) => setPersistentBloatingTriad(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">توالی مداوم نفخ شدید، احساس زودهنگام پری شکم و کاهش اشتها بیش از ۳ هفته</span>
                    <span className="text-slate-500 block text-[11px]">علائم سه‌گانه احتمالی بدخیمی تخمدانی در سنین بالای ۴۵ سال</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>مرحله بعد: سوابق غربالگری قبلی</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRIOR SCREENING HISTORY */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">گام چهارم: سوابق تصویربرداری و غربالگری‌های قبلی</h3>
                <p className="text-xs text-slate-500">تاریخچه آزمایش‌های روتین به پزشک معالج در مقایسه دقیق کمک می‌کند</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Mammography History */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  آخرین باری که ماموگرافی انجام داده‌اید چه زمانی بوده است؟
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'within_year', label: 'کمتر از ۱ سال قبل' },
                    { id: '1_to_2_years', label: '۱ تا ۲ سال قبل' },
                    { id: 'more_2_years', label: 'بیش از ۲ سال قبل' },
                    { id: 'never', label: 'تاکنون انجام نداده‌ام' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLastMammography(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                        lastMammography === item.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pap Smear / HPV */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  وضعیت آخرین تست پاپ اسمیر یا تست ویروس HPV:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'normal_recent', label: 'طبیعی در ۳ سال اخیر' },
                    { id: 'overdue_3y', label: 'بیش از ۳ سال گذشته' },
                    { id: 'abnormal_past', label: 'سابقه تست غیرطبیعی' },
                    { id: 'never', label: 'تاکنون انجام نداده‌ام' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLastPapSmearHpv(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                        lastPapSmearHpv === item.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pelvic Ultrasound */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  سونوگرافی لگن یا ترانس‌واژینال:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'normal_recent', label: 'در ۶ ماه گذشته انجام شده (طبیعی یا کیست ساده)' },
                    { id: 'not_performed', label: 'انجام نشده یا بیش از ۱ سال گذشته' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLastPelvicUltrasound(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                        lastPelvicUltrasound === item.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>

              <button
                type="button"
                onClick={handleFinishScreening}
                className="py-3 px-8 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>محاسبه و صدور کارنامه غربالگری پزشک</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: COMPREHENSIVE CLINICAL PHYSICIAN REPORT */}
        {currentStep === 5 && generatedReport && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Top Action Ribbon for Saving to Record */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              isSaved 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-black">
                    {isSaved ? 'گزارش غربالگری با موفقیت در پرونده بیمار ثبت شد' : 'نتیجه ارزیابی هوشمند آماده ثبت در پرونده بالینی بیمار است'}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isSaved 
                      ? 'پزشک معالج هنگام ویزیت آنلاین یا حضوری به این ارزیابی دسترسی کامل خواهد داشت.' 
                      : 'برای نگهداری در پرونده مریم احمدی و اطلاع پزشک، روی دکمه ثبت در پرونده کلیک کنید.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isSaved ? (
                  <button
                    onClick={handleSaveToRecord}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت در پرونده بیمار</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 font-mono">
                      کد سند: {generatedReport.id}
                    </span>
                    {onViewInPortal && (
                      <button
                        onClick={onViewInPortal}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>مشاهده در میز کاربری</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Official Medical Report Document Sheet */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 text-right space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              
              {/* Report Header */}
              <div className="border-b-2 border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Stethoscope className="w-7 h-7 text-rose-300" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-rose-600 tracking-wider">
                      پلتفرم سلامت شمساز · سامانه غربالگری و تریاژ ملی
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      کارنامه ارزیابی اولیه علائم و تریاژ غربالگری سرطان‌های زنان
                    </h2>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      سند ملی تریاژ و غربالگری سرطان‌های زنان — شبکه سلامت شمساز
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0">
                  <QrCode className="w-10 h-10 text-slate-700 shrink-0" />
                  <div className="space-y-0.5 text-right text-slate-600">
                    <div>شناسه سند: <strong className="text-indigo-900 font-bold">{generatedReport.id}</strong></div>
                    <div>تاریخ ارزیابی: <strong>{generatedReport.createdAt}</strong></div>
                    <div>وضعیت پرونده: <span className="text-teal-600 font-bold">تایید و ثبت‌شده</span></div>
                  </div>
                </div>
              </div>

              {/* Patient Meta Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">نام بیمار:</span>
                  <span className="font-bold text-slate-900">{generatedReport.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">کد ملی:</span>
                  <span className="font-bold text-slate-900 font-mono">{generatedReport.patientNationalId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">سن و وضعیت فیزیولوژیک:</span>
                  <span className="font-bold text-slate-900">{generatedReport.patientAge} سال ({menopausalStatus === 'post' ? 'یائسه' : menopausalStatus === 'peri' ? 'پری‌منوپوز' : 'پیش از یائسگی'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">شماره تماس پرونده:</span>
                  <span className="font-bold text-slate-900 font-mono">{generatedReport.patientPhone}</span>
                </div>
              </div>

              {/* Triage Tier & Risk Meter Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Triage Level Card */}
                <div className={`p-5 rounded-2xl border text-right space-y-2 ${
                  generatedReport.triageLevel === 'urgent_red'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : generatedReport.triageLevel === 'moderate_yellow'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="text-[10px] font-bold opacity-70">سطح تریاژ بالینی (Triage Priority):</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full animate-ping ${
                      generatedReport.triageLevel === 'urgent_red' ? 'bg-rose-600' : generatedReport.triageLevel === 'moderate_yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-base font-black">
                      {generatedReport.triageLevel === 'urgent_red' 
                        ? 'تریاژ سرخ (ارجاع اولویت‌دار فوری)' 
                        : generatedReport.triageLevel === 'moderate_yellow' 
                        ? 'تریاژ زرد (پیگیری در دو هفته آینده)' 
                        : 'تریاژ سبز (غربالگری روتین)'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed font-normal">
                    {generatedReport.referralUrgency}
                  </p>
                </div>

                {/* Risk Score Meter */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>شاخص محاسبه‌شده ریسک بالینی:</span>
                    <span className="font-mono text-sm font-black text-indigo-700">{generatedReport.riskScore} / ۱۰۰</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        generatedReport.riskScore >= 65 
                          ? 'bg-gradient-to-r from-amber-500 to-rose-600' 
                          : generatedReport.riskScore >= 40 
                          ? 'bg-gradient-to-r from-teal-500 to-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${generatedReport.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>پایه (۰-۳۰)</span>
                    <span>متوسط (۳۰-۶۰)</span>
                    <span>بالا (۶۰-۱۰۰)</span>
                  </div>
                </div>

                {/* Target Organ */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-600">ارگان هدف تحت پایش:</div>
                  <div className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                    <Ribbon className="w-4 h-4 text-indigo-700" />
                    <span>{generatedReport.suspectedOrganFa}</span>
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1">
                    <strong>پزشک ناظر پیشنهادی:</strong> {generatedReport.assignedDoctorName}
                  </div>
                </div>

              </div>

              {/* Symptoms & Clinical Findings */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>خلاصه علائم ثبت‌شده و وضعیت بالینی بیمار:</span>
                </h4>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>{generatedReport.findingsSummary}</p>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                    <span className="font-bold text-slate-900 text-[11px]">علائم مثبت گزارش‌شده:</span>
                    {generatedReport.primarySymptoms.map((s, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority Paraclinical Workup Plan (Physician Action Plan) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-indigo-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>اقدامات تشخیصی و پاراکلینیک پیشنهادی جهت دستور پزشک معالج:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {generatedReport.recommendedDiagnostics.map((diag, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-indigo-950 leading-relaxed">{diag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines Citation & Official Stamp */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500">
                <div className="space-y-0.5">
                  <div>استاندارد مرجع: <strong>گایدلاین‌های غربالگری بالینی NCCN 2024 و وزارت بهداشت درمان</strong></div>
                  <div>این سند صرفاً برای تسهیل تصمیم‌گیری بالینی تدوین شده و نیازمند تایید پزشک معالج است.</div>
                </div>

                <div className="text-right sm:text-left border-r sm:border-r-0 sm:border-l border-slate-200 pr-4 sm:pr-0 sm:pl-4">
                  <div className="font-bold text-slate-900">سامانه سلامت دیجیتال شمساز</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">مهر دیجیتال و امضای تاییدیه الکترونیک</div>
                </div>
              </div>

            </div>

            {/* AI Deep Clinical Synthesis Box */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      تحلیل تکمیلی هوش مصنوعی بالینی (Gemini Clinical Copilot)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      تفسیر کمکی و تدوین پیش‌نویس یادداشت پزشکی (SOAP Note) برای درج در پرونده
                    </p>
                  </div>
                </div>

                {!aiAnalysisResult && (
                  <button
                    onClick={handleTriggerAIAssessment}
                    disabled={isAnalyzingAI}
                    className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAnalyzingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>{isAnalyzingAI ? 'در حال استخراج شواهد...' : 'تفسیر هوشمند علائم'}</span>
                  </button>
                )}
              </div>

              {aiAnalysisResult && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 font-normal leading-relaxed whitespace-pre-line animate-in fade-in">
                  {aiAnalysisResult}
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>چاپ / دانلود PDF کارنامه</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopyNotice(true);
                    setTimeout(() => setCopyNotice(false), 3000);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>{copyNotice ? 'لینک کپی گردید ✓' : 'اشتراک‌گذاری گزارش'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setGeneratedReport(null);
                    setIsSaved(false);
                    setAiAnalysisResult(null);
                  }}
                  className="py-2.5 px-4 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  غربالگری مجدد
                </button>

                {onBookDoctor && (
                  <button
                    onClick={() => onBookDoctor(generatedReport.assignedDoctorName, generatedReport.suspectedOrgan)}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>رزرو نوبت با {generatedReport.assignedDoctorName?.split('(')[0] || 'پزشک متخصص'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
