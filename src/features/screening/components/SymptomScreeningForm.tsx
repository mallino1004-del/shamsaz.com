/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Stethoscope, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  User, 
  Printer, 
  Download, 
  Heart, 
  Activity, 
  Info, 
  Ribbon,
  AlertCircle,
  Video,
  Check,
  Building2,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';
import { ScreeningReport, ScreeningTriageLevel } from '../../../types';

interface SymptomScreeningFormProps {
  onSaveReportToPortal: (report: ScreeningReport) => void;
  onNavigateToBooking: (specialty: string) => void;
  onNavigateToTelemedicine: () => void;
  existingPatientName?: string;
  existingPatientNationalId?: string;
}

export const SymptomScreeningForm: React.FC<SymptomScreeningFormProps> = ({
  onSaveReportToPortal,
  onNavigateToBooking,
  onNavigateToTelemedicine,
  existingPatientName = 'مریم احمدی',
  existingPatientNationalId = '۰۰۲-۱۸۹۴۵۲-۱',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<ScreeningReport | null>(null);

  // --- Step 1: Patient Baseline & Genetics ---
  const [patientName, setPatientName] = useState(existingPatientName);
  const [patientNationalId, setPatientNationalId] = useState(existingPatientNationalId);
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientPhone, setPatientPhone] = useState('۰۹۱۲-۳۴۵-۶۷۸۹');
  const [menopauseStatus, setMenopauseStatus] = useState<'pre' | 'peri' | 'post'>('peri');
  const [familyCancerHistory, setFamilyCancerHistory] = useState<boolean>(true);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState('ابتلای خاله به سرطان پستان در سن ۴۹ سالگی');
  const [geneticMutationKnown, setGeneticMutationKnown] = useState<boolean>(false);

  // --- Step 2: Breast Symptoms ---
  const [breastLump, setBreastLump] = useState<'none' | 'soft_mobile' | 'hard_fixed'>('soft_mobile');
  const [breastSkinChanges, setBreastSkinChanges] = useState<boolean>(false); // Dimpling, orange-peel, retraction
  const [nippleDischarge, setNippleDischarge] = useState<'none' | 'milky_bilateral' | 'bloody_spontaneous'>('none');
  const [breastPainPersistent, setBreastPainPersistent] = useState<boolean>(true);
  const [lastMammography, setLastMammography] = useState<'less_1yr' | '1_to_2yrs' | 'over_2yrs' | 'never'>('1_to_2yrs');

  // --- Step 3: Cervix & Endometrium / Uterine Symptoms ---
  const [postmenopausalBleeding, setPostmenopausalBleeding] = useState<boolean>(false); // KEY RED FLAG
  const [postcoitalBleeding, setPostcoitalBleeding] = useState<boolean>(false); // Cervical red flag
  const [abnormalVaginalDischarge, setAbnormalVaginalDischarge] = useState<boolean>(false);
  const [lastPapSmearResult, setLastPapSmearResult] = useState<'normal' | 'abnormal_ascus' | 'hpv_positive' | 'never'>('normal');
  const [hpvVaccineStatus, setHpvVaccineStatus] = useState<'completed' | 'incomplete' | 'none'>('completed');
  const [tamoxifenOrHrtUsage, setTamoxifenOrHrtUsage] = useState<boolean>(false);

  // --- Step 4: Ovarian & Pelvic Symptoms ---
  const [earlySatiety, setEarlySatiety] = useState<boolean>(false); // Feeling full quickly
  const [persistentBloating, setPersistentBloating] = useState<boolean>(true); // >2-3 weeks
  const [pelvicOrBackPain, setPelvicOrBackPain] = useState<boolean>(false);
  const [urinaryUrgencyOrFrequency, setUrinaryUrgencyOrFrequency] = useState<boolean>(false);
  const [ovarianCystHistory, setOvarianCystHistory] = useState<boolean>(false);

  // Run Clinical Decision Inference
  const handleCalculateTriage = (e: React.FormEvent) => {
    e.preventDefault();

    let score = 15; // Baseline
    let triage: ScreeningTriageLevel = 'routine_green';
    let organ: 'breast' | 'cervix' | 'ovary' | 'endometrium' | 'general_screening' = 'general_screening';
    let organFa = 'غربالگری عمومی و پایش سلامت بانوان';
    const symptoms: string[] = [];
    const diagnostics: string[] = [];
    let urgency = 'غربالگری دوره‌ای روتین و خودمراقبتی سالیانه';
    let plan = 'ادامه غربالگری‌های روتین، خودآزمایی ماهانه پستان و ویزیت دوره‌ای سالیانه.';

    // Rule 1: Postmenopausal Bleeding (Immediate Endometrial Red Flag)
    if (menopauseStatus === 'post' && postmenopausalBleeding) {
      triage = 'urgent_red';
      score = 92;
      organ = 'endometrium';
      organFa = 'اندومتر و رحم (خونریزی پس از یائسگی)';
      symptoms.push('خونریزی یا لکه‌بینی واژینال پس از دوران یائسگی (نشانه هشدار انکولوژی)');
      diagnostics.push('سونوگرافی ترانس‌واژینال فوری (TVS) جهت اندازه‌گیری دقیق ضخامت اندومتر');
      diagnostics.push('بیوپسی سرپایی اندومتر با پایپل (Pipelle Endometrial Biopsy)');
      diagnostics.push('در صورت لزوم: هیستروسکوپی تشخیصی و کورتاژ تفکیکی (D&C)');
      urgency = 'مراجعه فوری به متخصص انکولوژی زنان ظرف ۲۴ الی ۴۸ ساعت';
      plan = 'به دلیل لکه‌بینی پس از یائسگی، انجام فوری سونوگرافی ترانس‌واژینال و بیوپسی اندومتر جهت رد یا تایید هایپرپلازی یا بدخیمی اندومتر الزامی است.';
    }

    // Rule 2: Hard fixed breast lump OR bloody discharge OR skin retraction
    else if (breastLump === 'hard_fixed' || nippleDischarge === 'bloody_spontaneous' || breastSkinChanges) {
      triage = 'urgent_red';
      score = 88;
      organ = 'breast';
      organFa = 'پستان (توده مشکوک یا ترشح خونی نوک پستان)';
      if (breastLump === 'hard_fixed') symptoms.push('توده لمس‌شده سفت و ثابت (Non-mobile) در بافت پستان');
      if (nippleDischarge === 'bloody_spontaneous') symptoms.push('ترشح خونی یا سروخونی خودبه‌خودی از یک مجرای نوک پستان');
      if (breastSkinChanges) symptoms.push('تغییرات پوستی (فرورفتگی نوک پستان یا نمای پوست پرتقالی)');
      diagnostics.push('ماموگرافی تشخیصی دیجیتال دوطرفه همراه با بزرگ‌نمایی موضعی (Diagnostic Mammography)');
      diagnostics.push('سونوگرافی با تفکیک بالا از ربع‌های پستان و غدد لنفاوی زیربغل (Axillary Ultrasound)');
      diagnostics.push('بیوپسی سوزنی تحت گاید سونوگرافی (Core Needle Biopsy - CNB)');
      urgency = 'مراجعه تشخیصی ظرف ۲۴ الی ۴۸ ساعت';
      plan = 'ارزیابی ۳ گانه بالینی (معاینه جراح، ماموگرافی/سونوگرافی و بیوپسی بافتی) در اسرع وقت انجام شود. از انجام FNA سطحی خودداری گردد.';
    }

    // Rule 3: Ovarian Symptoms Cluster (Persistent bloating + early satiety)
    else if (persistentBloating && earlySatiety) {
      triage = 'urgent_red';
      score = 82;
      organ = 'ovary';
      organFa = 'تخمدان و احشای لگنی (علائم مشکوک گوارشی-لگنی پایدار)';
      symptoms.push('نفخ و احساس پری مداوم شکم بیش از ۲ تا ۳ هفته');
      symptoms.push('احساس سیری زودرس و ناتوانی در مصرف وعده غذایی کامل');
      if (urinaryUrgencyOrFrequency) symptoms.push('تکرر و احساس فوریت دفع ادرار بدون سابقه عفونت');
      diagnostics.push('سونوگرافی کالر داپلر ترانس‌واژینال و شکمی از رحم و ادنکس‌ها');
      diagnostics.push('آزمایش خون بیومارکرهای توموری: CA-125 و HE4 (محاسبه الگوریتم ROMA)');
      diagnostics.push('سی‌تی‌اسکن مولتی‌دیتکتور لگن و شکم با کنتراست خوراکی و وریدی در صورت توده ادنکس');
      urgency = 'ویزیت تخصصی انکولوژی زنان ظرف ۴۸ الی ۷۲ ساعت';
      plan = 'بررسی سونوگرافی داپلر ادنکس‌ها جهت بررسی توده‌های توپر یا سپتوم‌دار تخمدان و سنجش بیومارکر سرمی CA-125.';
    }

    // Rule 4: Cervical Red Flags (Postcoital bleeding OR high-risk HPV)
    else if (postcoitalBleeding || lastPapSmearResult === 'hpv_positive' || lastPapSmearResult === 'abnormal_ascus') {
      triage = 'moderate_yellow';
      score = 65;
      organ = 'cervix';
      organFa = 'دهانه رحم (سرویکس - لکه‌بینی پس از تماس یا تست مشکوک)';
      if (postcoitalBleeding) symptoms.push('خونریزی یا لکه‌بینی تکرارشونده پس از نزدیکی زناشویی');
      if (lastPapSmearResult === 'hpv_positive') symptoms.push('نتیجه مثبت تست HPV سویه‌های پرخطر (۱۶ یا ۱۸)');
      if (lastPapSmearResult === 'abnormal_ascus') symptoms.push('نتیجه غیرطبیعی پاپ‌اسمیر (تغییرات آتیپیک سلول‌های سنگفرشی)');
      diagnostics.push('کولپوسکوپی تشخیصی همراه با بیوپسی هدفمند از زون تغییر شکل (Transformation Zone)');
      diagnostics.push('تست مجدد HPV Genotyping و بررسی کورتاژ داخل کانال سرویکس (ECC)');
      urgency = 'ویزیت تخصصی متخصص زنان و کولپوسکوپیست ظرف ۱ الی ۲ هفته';
      plan = 'مشاهده مستقیم دهانه رحم با درشت‌نمایی کولپوسکوپ و اسید استیک ۵٪ جهت شناسایی ضایعات دیسپلازی (CIN) و نمونه‌برداری.';
    }

    // Rule 5: Palpable soft lump or persistent breast pain with family history
    else if (breastLump === 'soft_mobile' || (breastPainPersistent && familyCancerHistory)) {
      triage = 'moderate_yellow';
      score = 52;
      organ = 'breast';
      organFa = 'پستان (توده متحرک یا درد موضعی با سابقه فامیلی)';
      if (breastLump === 'soft_mobile') symptoms.push('توده لمس‌شده با قوام نرم یا متحرک در پستان');
      if (breastPainPersistent) symptoms.push('درد پایدار موضعی در بافت پستان');
      if (familyCancerHistory) symptoms.push(`سابقه خانوادگی: ${familyHistoryDetails}`);
      diagnostics.push('سونوگرافی تشخیصی پستان و مقایسه با تصاویر پیشین');
      diagnostics.push('ماموگرافی غربالگری دیجیتال سالیانه در صورتی که سن بالای ۴۰ سال است');
      urgency = 'ویزیت غیراورژانسی جراح پستان ظرف ۲ هفته آینده';
      plan = 'سونوگرافی بافت پستان برای رد کیست ساده یا فیبروآدنوم، و توصیه به خودآزمایی ماهانه پس از اتمام دوره قاعدگی.';
    }

    // Rule 6: Routine Green Screening
    else {
      triage = 'routine_green';
      score = 20;
      organ = 'general_screening';
      organFa = 'غربالگری دوره‌ای استاندارد بانوان';
      symptoms.push('فاقد علائم هشداردهنده بالینی حاد');
      diagnostics.push('ماموگرافی سالیانه از سن ۴۰ سالگی');
      diagnostics.push('تست پاپ‌اسمیر هر ۳ سال یا تست همزمان HPV DNA هر ۵ سال');
      diagnostics.push('خودآزمایی ماهانه پستان (BSE) چند روز پس از پایان قاعدگی');
      urgency = 'پایش دوره‌ای سالیانه استاندارد';
      plan = 'شرایط بالینی پایدار است. رعایت تقویم چکاپ‌های دوره‌ای و رژیم غذایی سالم غنی از آنتی‌اکسیدان‌ها.';
    }

    const reportId = `SCR-${1403}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: ScreeningReport = {
      id: reportId,
      patientName,
      patientNationalId,
      patientAge,
      patientPhone,
      createdAt: '۱۴۰۳/۰۸/۲۲ - ساعت ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      triageLevel: triage,
      riskScore: score,
      suspectedOrgan: organ,
      suspectedOrganFa: organFa,
      primarySymptoms: symptoms,
      findingsSummary: `ارزیابی هوشمند علائم بانوان برای ${patientName} (${patientAge} ساله). وضعیت یائسگی: ${menopauseStatus === 'post' ? 'یائسه' : menopauseStatus === 'peri' ? 'در حال یائسگی' : 'قاعدگی فعال'}. رتبه خطر بالینی: ${score} از ۱۰۰.`,
      recommendedDiagnostics: diagnostics,
      physicianActionPlan: plan,
      referralUrgency: urgency,
      recordedInPortal: false,
      assignedDoctorName: organ === 'breast' ? 'دکتر سمیرا احمدی' : organ === 'cervix' ? 'دکتر مونا رضوانی' : 'دکتر فاطمه محمدی',
      notes: 'گزارش سیستم تصمیم‌یار بالینی شمساز منطبق بر گایدلاین‌های بالینی NCCN و وزارت بهداشت'
    };

    setGeneratedReport(newReport);
    setIsCompleted(true);
  };

  const handleSaveToPortal = () => {
    if (generatedReport) {
      const updated = { ...generatedReport, recordedInPortal: true };
      setGeneratedReport(updated);
      onSaveReportToPortal(updated);
      setIsSavedSuccessfully(true);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-right font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-l from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold border border-white/15">
              <Ribbon className="w-4 h-4 text-pink-400" />
              <span>سیستم تریاژ هوشمند و غربالگری سرطان‌های زنان</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              فرم تعاملی ارزیابی زودهنگام علائم و ثبت گزارش پزشک
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              این پرسشنامه هوشمند با سنجش علائم اختصاصی ۴ سرطان هدف (پستان، دهانه رحم، تخمدان و اندومتر)، سطح فوریت بالینی را ارزیابی کرده و یک گزارش مدون رسمی جهت ارائه به پزشک معالج در پرونده بیمار ثبت می‌نماید.
            </p>
          </div>

          {/* Stepper Wizard Bar */}
          {!isCompleted && (
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { step: 1, label: 'مشخصات و سوابق' },
                { step: 2, label: 'علائم پستان' },
                { step: 3, label: 'دهانه رحم و اندومتر' },
                { step: 4, label: 'تخمدان و لگن' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    currentStep === s.step
                      ? 'bg-white text-indigo-950 font-bold shadow-md'
                      : currentStep > s.step
                      ? 'bg-white/20 text-white font-medium'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <div className="font-mono text-[10px] mb-0.5">گام {s.step}</div>
                  <div className="truncate text-[11px]">{s.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            FORM VIEW: 4 Interactive Steps
            ------------------------------------------------------------- */}
        {!isCompleted ? (
          <form onSubmit={handleCalculateTriage} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
            
            {/* STEP 1: Demographics & Genetics */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>گام اول: مشخصات پایه، سن و سوابق خانوادگی</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">گام ۱ از ۴</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام و نام خانوادگی بیمار *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کد ملی بیمار *</label>
                    <input
                      type="text"
                      value={patientNationalId}
                      onChange={(e) => setPatientNationalId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سن بیمار (سال) *</label>
                    <input
                      type="number"
                      min={18}
                      max={95}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شماره تماس همراه *</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                </div>

                {/* Menopause Status */}
                <div className="space-y-2 text-xs pt-2">
                  <label className="block font-bold text-slate-800">وضعیت فیزیولوژیک قاعدگی و یائسگی:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'pre', label: 'قاعدگی فعال و منظم', desc: 'سنین باروری پیش از یائسگی' },
                      { id: 'peri', label: 'دوران انتقال (پری‌منوپاز)', desc: 'بی‌نظمی‌های قاعدگی حوالی ۴۵-۵۰ سال' },
                      { id: 'post', label: 'یائسه کامل (Menopause)', desc: 'بیش از ۱۲ ماه قطع کامل قاعدگی' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setMenopauseStatus(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                          menopauseStatus === item.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Family History */}
                <div className="space-y-2 text-xs pt-2">
                  <label className="block font-bold text-slate-800">
                    سابقه خانوادگی سرطان پستان، تخمدان یا رحم در بستگان درجه یک یا دو:
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={familyCancerHistory === true}
                        onChange={() => setFamilyCancerHistory(true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>بله، سابقه وجود دارد</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={familyCancerHistory === false}
                        onChange={() => setFamilyCancerHistory(false)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>خیر، فاقد سابقه خانوادگی</span>
                    </label>
                  </div>

                  {familyCancerHistory && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={familyHistoryDetails}
                        onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                        placeholder="مشخص فرمایید کدام عضو خانواده و در چه سنی (مثلاً مادر در ۵۲ سالگی)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>گام بعدی: علائم پستان</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Breast Health Symptoms */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Ribbon className="w-5 h-5 text-pink-600" />
                    <span>گام دوم: ارزیابی بالینی علائم پستان</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">گام ۲ از ۴</span>
                </div>

                {/* Breast Lump */}
                <div className="space-y-2 text-xs">
                  <label className="block font-bold text-slate-800">
                    ۱. آیا در لمس پستان یا ناحیه زیربغل، توده یا سفت‌شدگی غیرمعمولی احساس کرده‌اید؟
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'none', label: 'خیر، هیچ توده‌ای لمس نمی‌شود', desc: 'بافت یکنواخت و طبیعی' },
                      { id: 'soft_mobile', label: 'توده نرم یا متحرک', desc: 'احتمال کیست ساده یا فیبروآدنوم' },
                      { id: 'hard_fixed', label: 'توده سفت و چسبیده به بافت', desc: '⚠️ نیازمند ارزیابی فوری انکولوژی' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setBreastLump(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                          breastLump === item.id
                            ? 'border-pink-600 bg-pink-50/70 text-pink-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nipple Discharge */}
                <div className="space-y-2 text-xs pt-2">
                  <label className="block font-bold text-slate-800">
                    ۲. آیا ترشحی از نوک پستان مشاهده کرده‌اید؟
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'none', label: 'بدون ترشح', desc: 'وضیعت کاملاً طبیعی' },
                      { id: 'milky_bilateral', label: 'ترشح شیری یا دوطرفه با فشار', desc: 'معمولاً ناشی از پرولاکتین یا تغییرات هورمونی' },
                      { id: 'bloody_spontaneous', label: 'ترشح خونی یا شفاف خودبه‌خودی', desc: '⚠️ نشانه مهم تشخیصی در یک پستان' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setNippleDischarge(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                          nippleDischarge === item.id
                            ? 'border-pink-600 bg-pink-50/70 text-pink-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Changes Checkbox */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breastSkinChanges}
                      onChange={(e) => setBreastSkinChanges(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-pink-600 rounded-sm focus:ring-pink-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        تغییرات پوستی (فرورفتگی نوک پستان، حالت فرورفته پوست پرتقالی، یا قرمزی و اگزمای پایدار نوک پستان)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        در صورت وجود هرگونه تورفتگی بافت، قرمزی یا خارش مقاوم نوک پستان تیک بزنید.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Last Mammography */}
                <div className="space-y-2 text-xs pt-1">
                  <label className="block font-bold text-slate-800">
                    تاریخ آخرین ماموگرافی یا سونوگرافی پستان:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'less_1yr', label: 'کمتر از ۱ سال پیش' },
                      { id: '1_to_2yrs', label: '۱ تا ۲ سال پیش' },
                      { id: 'over_2yrs', label: 'بیش از ۲ سال پیش' },
                      { id: 'never', label: 'تاکنون انجام نداده‌ام' },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setLastMammography(m.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          lastMammography === m.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>گام بعدی: دهانه رحم و اندومتر</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Cervix & Endometrium Symptoms */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <span>گام سوم: ارزیابی علائم دهانه رحم (سرویکس) و اندومتر</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">گام ۳ از ۴</span>
                </div>

                {/* Postmenopausal Bleeding - Crucial Alert */}
                {menopauseStatus === 'post' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>پرسش حیاتی: آیا پس از یائسگی هرگونه لکه‌بینی یا خونریزی واژینال داشته‌اید؟</span>
                    </div>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-900">
                        <input
                          type="radio"
                          checked={postmenopausalBleeding === true}
                          onChange={() => setPostmenopausalBleeding(true)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>بله، لکه‌بینی یا خونریزی داشته‌ام (حتی در حد چند قطره)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                        <input
                          type="radio"
                          checked={postmenopausalBleeding === false}
                          onChange={() => setPostmenopausalBleeding(false)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>خیر، هیچ‌گونه لکه‌بینی نداشته‌ام</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Postcoital Bleeding */}
                <div className="space-y-2 text-xs">
                  <label className="block font-bold text-slate-800">
                    آیا سابقه لکه‌بینی یا خونریزی پس از تماس زناشویی (Postcoital bleeding) دارید؟
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={postcoitalBleeding === true}
                        onChange={() => setPostcoitalBleeding(true)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>بله، اتفاق افتاده است</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={postcoitalBleeding === false}
                        onChange={() => setPostcoitalBleeding(false)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>خیر</span>
                    </label>
                  </div>
                </div>

                {/* Last Pap Smear / HPV Result */}
                <div className="space-y-2 text-xs pt-2">
                  <label className="block font-bold text-slate-800">
                    نتیجه آخرین تست پاپ‌اسمیر و غربالگری ویروس پاپیلومای انسانی (HPV):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'normal', label: 'طبیعی و منفی (فاقد تغییرات سلولی)', desc: 'پاپ اسمیر نرمال' },
                      { id: 'hpv_positive', label: 'مثبت برای HPV پرخطر (سویه‌های ۱۶ یا ۱۸)', desc: '⚠️ نیازمند کولپوسکوپی' },
                      { id: 'abnormal_ascus', label: 'تغییرات مشکوک سلولی (ASC-US یا LSIL)', desc: 'پاپ‌اسمیر غیرطبیعی' },
                      { id: 'never', label: 'تاکنون تست پاپ‌اسمیر یا HPV نداده‌ام', desc: 'نیاز به غربالگری اولیه' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setLastPapSmearResult(item.id as any)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                          lastPapSmearResult === item.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HPV Vaccination Status */}
                <div className="space-y-2 text-xs pt-1">
                  <label className="block font-bold text-slate-800">وضعیت واکسیناسیون HPV (گارداسیل یا پاپیلوگارد):</label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'completed', label: 'تکمیل شده (۲ یا ۳ دوز کامل)' },
                      { id: 'incomplete', label: 'ناقص (۱ دوز)' },
                      { id: 'none', label: 'واکسینه نشده‌ام' },
                    ].map((v) => (
                      <label key={v.id} className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          checked={hpvVaccineStatus === v.id}
                          onChange={() => setHpvVaccineStatus(v.id as any)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>گام بعدی: تخمدان و لگن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Ovarian & Pelvic Symptoms */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-indigo-600" />
                    <span>گام چهارم: ارزیابی علائم تخمدان و احشای لگن</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">گام ۴ از ۴</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-xs">
                      لطفاً هر علامتی که در ماه اخیر به مدت بیش از ۲ تا ۳ هفته مداوم تجربه کرده‌اید را علامت بزنید:
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={persistentBloating}
                        onChange={(e) => setPersistentBloating(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800">احساس نفخ و پری مداوم شکم و افزایش سایز دور کمر</div>
                        <div className="text-[11px] text-slate-500">نفخ مستمر که با رژیم غذایی یا داروهای گوارشی برطرف نشده باشد.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={earlySatiety}
                        onChange={(e) => setEarlySatiety(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800">احساس سیری زودرس (Early Satiety)</div>
                        <div className="text-[11px] text-slate-500">ناتوانی در به پایان رساندن وعده غذایی معمولی به دلیل احساس پری شدید معده.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={pelvicOrBackPain}
                        onChange={(e) => setPelvicOrBackPain(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800">درد مبهم یا تیرکشنده در لگن یا پایین کمر</div>
                        <div className="text-[11px] text-slate-500">درد مداوم ناحیه لگنی که ارتباطی با سیکل ماهانه ندارد.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={urinaryUrgencyOrFrequency}
                        onChange={(e) => setUrinaryUrgencyOrFrequency(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800">تکرر یا احساس فوریت ناگهانی دفع ادرار</div>
                        <div className="text-[11px] text-slate-500">نیاز مکرر به تخلیه مثانه بدون وجود عفونت ادراری اثبات‌شده در آزمایش.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-rose-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    <span>تحلیل هوشمند و صدور گزارش بالینی پزشک</span>
                  </button>
                </div>
              </div>
            )}

          </form>
        ) : (
          /* -------------------------------------------------------------
             REPORT VIEW: Official Clinical Screening Summary for Physician
             ------------------------------------------------------------- */
          generatedReport && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Success Notification Bar */}
              {isSavedSuccessfully && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>این گزارش با موفقیت در میز کاربری و پرونده الکترونیک بیمار ثبت گردید.</span>
                  </div>
                  <span className="font-mono text-emerald-700 text-[11px]">شناسه: {generatedReport.id}</span>
                </div>
              )}

              {/* Official Printed Medical Report Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-200 space-y-6 print:m-0 print:border-none print:shadow-none">
                
                {/* Official Letterhead */}
                <div className="border-b-2 border-indigo-700 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">
                        کارنامه رسمی تریاژ و غربالگری سرطان‌های زنان
                      </div>
                      <div className="text-xs text-indigo-700 font-bold">
                        سامانه ملی پایش و غربالگری انکولوژی شمساز
                      </div>
                    </div>
                  </div>

                  <div className="text-left font-mono text-xs text-slate-500 space-y-0.5">
                    <div>کد پیگیری سند: <strong className="text-slate-900">{generatedReport.id}</strong></div>
                    <div>تاریخ صدور: {generatedReport.createdAt}</div>
                    <div className="text-[10px] text-teal-600 font-bold">اعتبارسنجی امنیتی: رمزنگاری AES-256</div>
                  </div>
                </div>

                {/* Patient Profile Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">نام بیمار:</span>
                    <strong className="text-slate-900">{generatedReport.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">کد ملی:</span>
                    <strong className="text-slate-900 font-mono">{generatedReport.patientNationalId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">سن در ارزیابی:</span>
                    <strong className="text-slate-900 font-mono">{generatedReport.patientAge} سال</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">شماره تماس:</span>
                    <strong className="text-slate-900 font-mono">{generatedReport.patientPhone}</strong>
                  </div>
                </div>

                {/* Triage Level Big Banner */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  generatedReport.triageLevel === 'urgent_red'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : generatedReport.triageLevel === 'moderate_yellow'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      generatedReport.triageLevel === 'urgent_red'
                        ? 'bg-rose-600 text-white'
                        : generatedReport.triageLevel === 'moderate_yellow'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {generatedReport.triageLevel === 'urgent_red' ? (
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                      ) : generatedReport.triageLevel === 'moderate_yellow' ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold opacity-80">سطح‌بندی تریاژ و اولویت بالینی:</div>
                      <div className="text-lg font-black mt-0.5">
                        {generatedReport.triageLevel === 'urgent_red'
                          ? 'سطح قرمز — نیازمند ویزیت تشخیصی فوری'
                          : generatedReport.triageLevel === 'moderate_yellow'
                          ? 'سطح زرد — نیازمند ارزیابی تکمیلی و اولویت‌دار'
                          : 'سطح سبز — غربالگری دوره‌ای و خودمراقبتی استاندارد'}
                      </div>
                      <div className="text-xs font-semibold mt-1">
                        دستور ارجاع: {generatedReport.referralUrgency}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-current/20 text-center shrink-0">
                    <div className="text-[10px] font-bold text-slate-500">امتیاز خطر بالینی:</div>
                    <div className="text-2xl font-black font-mono">
                      {generatedReport.riskScore} <span className="text-xs text-slate-400 font-sans">از ۱۰۰</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Section 1: Target Organ & Findings */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>۱. ارگان هدف و یافته‌های مثبت بالینی (Positive Clinical Findings):</span>
                    </h4>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-indigo-900 mb-1">
                        ارگان مورد ارزیابی: {generatedReport.suspectedOrganFa}
                      </div>
                      <ul className="space-y-1 list-disc pr-5 text-slate-700">
                        {generatedReport.primarySymptoms.map((sym, idx) => (
                          <li key={idx} className="font-semibold text-slate-900">{sym}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Clinical Section 2: Diagnostics */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>۲. پروتکل اقدامات پاراکلینیکی و تشخیصی پیشنهادی برای پزشک معالج:</span>
                    </h4>
                    <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1.5 text-teal-950">
                      <div className="text-[11px] font-bold text-teal-800">
                        اقدامات اولویت‌دار بر اساس گایدلاین NCCN:
                      </div>
                      <ul className="space-y-1 list-disc pr-5 font-semibold text-teal-900">
                        {generatedReport.recommendedDiagnostics.map((diag, i) => (
                          <li key={i}>{diag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Clinical Section 3: Physician Action Plan */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>۳. نقشه اقدام بالینی (Physician Clinical Action Plan):</span>
                    </h4>
                    <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed font-normal">
                      {generatedReport.physicianActionPlan}
                    </p>
                  </div>
                </div>

                {/* Seals & Signatures */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>ممهور به امضای دیجیتال سامانه تصمیم‌یار بالینی شمساز</span>
                  </div>
                  <div>
                    پزشک ارجاعی پیشنهادی: <strong className="text-slate-800">{generatedReport.assignedDoctorName}</strong>
                  </div>
                </div>

              </div>

              {/* Action Buttons Toolbar */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                
                <div className="flex flex-wrap items-center gap-2">
                  {!isSavedSuccessfully ? (
                    <button
                      onClick={handleSaveToPortal}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>ثبت مستقیم در پرونده الکترونیک بیمار</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>در پرونده ثبت گردید</span>
                    </div>
                  )}

                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>چاپ و ذخیره گزارش</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigateToBooking(
                      generatedReport.suspectedOrgan === 'breast' ? 'جراحی زنان و زایمان' : 'آنکولوژی'
                    )}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>رزرو نوبت فوق‌تخصص بر اساس این گزارش</span>
                  </button>

                  <button
                    onClick={onNavigateToTelemedicine}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>ویزیت تصویری آنلاین</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCompleted(false);
                      setIsSavedSuccessfully(false);
                      setCurrentStep(1);
                    }}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
                  >
                    انجام غربالگری جدید
                  </button>
                </div>

              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
