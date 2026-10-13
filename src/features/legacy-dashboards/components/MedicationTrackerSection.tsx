/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pill, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  RefreshCw, 
  FileText, 
  PhoneCall, 
  MessageSquare, 
  HeartHandshake, 
  HelpCircle, 
  Stethoscope,
  Info,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { 
  DailyMedicationReminder, 
  MedicationSideEffectLog, 
  PatientPrescription, 
  NotificationItem 
} from '../../../types';
import { MOCK_DAILY_REMINDERS, MOCK_SIDE_EFFECT_LOGS } from '../../../data/mockData';

interface MedicationTrackerSectionProps {
  prescriptions?: PatientPrescription[];
  onTriggerNotification?: (notif: NotificationItem) => void;
  onRequestRefill?: (med: PatientPrescription) => void;
  onOpenTelemedicine?: () => void;
}

export const MedicationTrackerSection: React.FC<MedicationTrackerSectionProps> = ({
  prescriptions = [],
  onTriggerNotification,
  onRequestRefill,
  onOpenTelemedicine
}) => {
  // Reminders state
  const [reminders, setReminders] = useState<DailyMedicationReminder[]>(MOCK_DAILY_REMINDERS);
  const [activeSlotFilter, setActiveSlotFilter] = useState<'all' | 'morning' | 'noon' | 'evening' | 'night'>('all');
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

  // New Reminder form state
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newDosage, setNewDosage] = useState('۱ قرص');
  const [newSlot, setNewSlot] = useState<'morning' | 'noon' | 'evening' | 'night'>('morning');
  const [newTime, setNewTime] = useState('۰۸:۰۰');
  const [newInstructions, setNewInstructions] = useState('همراه با آب کافی بعد از غذا');
  const [newTotalPills, setNewTotalPills] = useState('30');

  // Side Effects state
  const [sideEffects, setSideEffects] = useState<MedicationSideEffectLog[]>(MOCK_SIDE_EFFECT_LOGS);
  const [isLogSideEffectOpen, setIsLogSideEffectOpen] = useState(false);
  const [sideEffectSuccessMsg, setSideEffectSuccessMsg] = useState<string | null>(null);

  // New Side Effect Form State
  const [seMedication, setSeMedication] = useState('تاموکسیفن ۲۰ میلی‌گرم');
  const [seType, setSeType] = useState('گرگرفتگی و تعریق شبانه (Hot Flashes)');
  const [seSeverity, setSeSeverity] = useState<'mild' | 'moderate' | 'severe' | 'emergency'>('mild');
  const [seDate, setSeDate] = useState('۱۴۰۳/۰۸/۲۵');
  const [seTime, setSeTime] = useState('۱۴:۳۰');
  const [seNotes, setSeNotes] = useState('');

  // Adherence calculation
  const totalReminders = reminders.length;
  const takenReminders = reminders.filter(r => r.taken).length;
  const adherencePercent = totalReminders > 0 ? Math.round((takenReminders / totalReminders) * 100) : 100;

  // Filtered Reminders
  const filteredReminders = reminders.filter(r => {
    if (activeSlotFilter === 'all') return true;
    return r.timeSlot === activeSlotFilter;
  });

  // Toggle "Taken" state for a reminder
  const handleToggleTaken = (id: string) => {
    setReminders(prev => prev.map(rem => {
      if (rem.id === id) {
        const nextTaken = !rem.taken;
        const nowFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        return {
          ...rem,
          taken: nextTaken,
          takenAt: nextTaken ? nowFa : undefined,
          streakDays: nextTaken ? rem.streakDays + 1 : Math.max(0, rem.streakDays - 1),
          remainingPills: nextTaken ? Math.max(0, rem.remainingPills - 1) : rem.remainingPills + 1
        };
      }
      return rem;
    }));

    const target = reminders.find(r => r.id === id);
    if (target && !target.taken && onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'ثبت مصرف دارو',
        message: `مصرف داروی ${target.medicationNameFa} با موفقیت در یادآور امروز ثبت شد.`,
        timestamp: 'همین الان',
        read: false,
        priority: 'normal'
      });
    }
  };

  // Add custom reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;

    const slotLabels: Record<string, string> = {
      morning: 'صبحگاهی',
      noon: 'ظهر',
      evening: 'عصر',
      night: 'شبانه'
    };

    const newRem: DailyMedicationReminder = {
      id: `rem-${Date.now()}`,
      medicationId: `med-cust-${Date.now()}`,
      medicationNameFa: newMedName,
      genericName: newGenericName || newMedName,
      dosage: newDosage,
      timeSlot: newSlot,
      timeSlotFa: slotLabels[newSlot],
      scheduledTime: newTime,
      instructions: newInstructions,
      taken: false,
      streakDays: 0,
      remainingPills: parseInt(newTotalPills, 10) || 30
    };

    setReminders(prev => [...prev, newRem]);
    setIsAddReminderOpen(false);
    setNewMedName('');
    setNewGenericName('');

    if (onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'یادآور داروی جدید افزوده شد',
        message: `یادآور ${newRem.medicationNameFa} در ساعت ${newTime} به جدول روزانه اضافه گردید.`,
        timestamp: 'همین الان',
        read: false,
        priority: 'normal'
      });
    }
  };

  // Handle logging a side effect
  const handleSaveSideEffect = (e: React.FormEvent) => {
    e.preventDefault();

    const severityLabels: Record<string, string> = {
      mild: 'خفیف (Grade 1)',
      moderate: 'متوسط (Grade 2)',
      severe: 'شدید (Grade 3)',
      emergency: 'اورژانسی (Grade 4)'
    };

    const recommendedAction = seSeverity === 'severe' || seSeverity === 'emergency'
      ? 'ارجاع فوری به آنکولوژیست کشیک و تماس با پشتیبانی ۲۴ ساعته ۰۲۱-۹۱۰۰۸۸۴۴'
      : seSeverity === 'moderate'
      ? 'پایش علائم تا ۲۴ ساعت آینده و در میان گذاشتن در ویزیت تله‌مدیسین بعدی'
      : 'ادامه درمان حمایتی، اقدامات آرام‌بخش و یادداشت در چکاپ ماهانه';

    const newEntry: MedicationSideEffectLog = {
      id: `se-${Date.now()}`,
      medicationName: seMedication,
      sideEffectType: seType,
      severity: seSeverity,
      severityFa: severityLabels[seSeverity],
      dateFa: seDate,
      time: seTime,
      notes: seNotes || 'بدون یادداشت تکمیلی',
      doctorReviewed: false,
      alertRequiresAction: seSeverity === 'severe' || seSeverity === 'emergency',
      recommendedActionFa: recommendedAction
    };

    setSideEffects(prev => [newEntry, ...prev]);
    setIsLogSideEffectOpen(false);
    setSeNotes('');

    const successMessage = `عارضه «${seType}» برای داروی «${seMedication}» با موفقیت در پرونده ثبت شد و جهت بازبینی به کارتابل انکولوژیست ارسال گردید.`;
    setSideEffectSuccessMsg(successMessage);
    setTimeout(() => setSideEffectSuccessMsg(null), 6000);

    if (onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: seSeverity === 'severe' || seSeverity === 'emergency' ? 'هشدار ثبت عارضه جانبی مهم' : 'گزارش عارضه دارویی ثبت شد',
        message: `عارضه دارویی ${seType} برای داروی ${seMedication} در پرونده ثبت شد.`,
        timestamp: 'همین الان',
        read: false,
        priority: seSeverity === 'severe' || seSeverity === 'emergency' ? 'high' : 'normal'
      });
    }
  };

  const commonSideEffectsList = [
    'گرگرفتگی و تعریق شبانه (Hot Flashes)',
    'درد مفاصل و استخوان‌ها (Arthralgia)',
    'تهوع و احساس سنگینی معده (Nausea)',
    'خستگی و بی‌رمقی عمومی (Fatigue)',
    'ریزش مو یا نازک شدن تارهای مو',
    'سرگیجه و عدم تعادل خفیف',
    'بی‌خوابی و اختلال در ریتم خواب',
    'تغییرات خلقی و اضطراب',
    'ورم خفیف پاها یا دست‌ها (Edema)',
    'خشکی دهان یا پوست'
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* =========================================================================
          BANNER: MEDICATION TRACKER OVERVIEW & ADHERENCE PROGRESS
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-indigo-900 via-indigo-800 to-teal-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-bold text-teal-200">
              <Pill className="w-3.5 h-3.5 text-teal-300" />
              <span>سامانه هوشمند مدیریت داروها و یادآورهای روزانه</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              برنامه مصرف داروها، پایش پایبندی و ثبت عوارض
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              با علامت‌گذاری به موقع مصرف داروها، از تداخلات دارویی پیشگیری کرده و هرگونه علامت یا عارضه جانبی را مستقیماً جهت بازبینی انکولوژیست در پرونده بالینی ثبت نمایید.
            </p>
          </div>

          {/* Adherence Ring & Quick Action */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[160px]">
              <div className="text-[11px] text-indigo-200 font-semibold">پایبندی به مصرف امروز</div>
              <div className="text-3xl font-black text-white font-mono tabular-nums mt-1 flex items-center justify-center gap-1">
                <span>{adherencePercent}٪</span>
              </div>
              <div className="text-[10px] text-teal-300 font-medium mt-0.5">
                {takenReminders} از {totalReminders} دوز مصرف‌شده
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 h-2 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${adherencePercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsLogSideEffectOpen(true)}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>ثبت عارضه جانبی دارو</span>
              </button>

              <button
                onClick={() => setIsAddReminderOpen(true)}
                className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-300" />
                <span>افزودن یادآور داروی جدید</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Success Banner when side effect logged */}
      {sideEffectSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{sideEffectSuccessMsg}</span>
          </div>
          <button onClick={() => setSideEffectSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: DAILY MEDICATION REMINDER TIMETABLE
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">یادآورهای روزانه مصرف دارو</h3>
              <p className="text-[11px] text-slate-500">برای حفظ بیشترین اثربخشی، داروها را در ساعات مقرر مصرف نمایید.</p>
            </div>
          </div>

          {/* Time Slot Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSlotFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSlotFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              همه اوقات ({reminders.length})
            </button>
            <button
              onClick={() => setActiveSlotFilter('morning')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSlotFilter === 'morning' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              صبحگاه ({reminders.filter(r => r.timeSlot === 'morning').length})
            </button>
            <button
              onClick={() => setActiveSlotFilter('noon')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSlotFilter === 'noon' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ظهر ({reminders.filter(r => r.timeSlot === 'noon').length})
            </button>
            <button
              onClick={() => setActiveSlotFilter('evening')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSlotFilter === 'evening' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عصر ({reminders.filter(r => r.timeSlot === 'evening').length})
            </button>
            <button
              onClick={() => setActiveSlotFilter('night')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSlotFilter === 'night' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شبانه ({reminders.filter(r => r.timeSlot === 'night').length})
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredReminders.map((rem) => {
            const isTaken = rem.taken;
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isTaken
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{rem.medicationNameFa}</span>
                        <span className="text-[11px] font-mono font-medium text-slate-500">({rem.dosage})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{rem.genericName}</div>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      <span>{rem.scheduledTime}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                    <span className="font-bold text-slate-700">دستور مصرف: </span>
                    {rem.instructions}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{rem.streakDays} روز متوالی مصرف</span>
                    </span>

                    <span className={`font-mono ${rem.remainingPills <= 5 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                      موجودی: {rem.remainingPills} دوز باقیمانده
                      {rem.remainingPills <= 5 && ' (نیاز به تمدید)'}
                    </span>
                  </div>
                </div>

                {/* Mark as Taken Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isTaken ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مصرف شد در ساعت {rem.takenAt || 'امروز'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">در انتظار مصرف امروز</span>
                    )}
                  </span>

                  <button
                    onClick={() => handleToggleTaken(rem.id)}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isTaken
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isTaken ? 'ثبت شده (لغو)' : 'مصرف شد'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          SECTION 3: REPORTED SIDE EFFECTS LOG & CLINICAL TRIAGE
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">ثبت و گزارش عوارض جانبی داروها</h3>
              <p className="text-[11px] text-slate-500">ارزیابی عوارض دارویی مطابق استاندارد انکولوژی NCI-CTCAE و بازبینی پزشک معالج</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogSideEffectOpen(true)}
            className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>ثبت عارضه جانبی جدید</span>
          </button>
        </div>

        {/* Side Effects List */}
        <div className="space-y-3">
          {sideEffects.map((se) => {
            const isSevere = se.severity === 'severe' || se.severity === 'emergency';
            return (
              <div
                key={se.id}
                className={`p-4 rounded-2xl border transition-all text-xs ${
                  isSevere
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{se.sideEffectType}</span>
                    <span className="text-slate-500 font-medium">({se.medicationName})</span>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      se.severity === 'mild'
                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                        : se.severity === 'moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {se.severityFa}
                    </span>

                    {se.doctorReviewed ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>بررسی شده توسط انکولوژیست</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>در انتظار بررسی پزشک معالج</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {se.dateFa} - ساعت {se.time}
                  </span>
                </div>

                <div className="mt-2 text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-800">گزارش بیمار: </span>
                  {se.notes}
                </div>

                {se.doctorReviewNotes && (
                  <div className="mt-2 text-xs text-indigo-900 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200/80">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-0.5">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                      <span>توصیه انکولوژیست (دکتر سمیرا احمدی):</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-indigo-900">
                      {se.doctorReviewNotes}
                    </p>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">
                    <strong>اقدام پیشنهادی: </strong>
                    {se.recommendedActionFa}
                  </span>

                  {isSevere && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600">خط اورژانس: ۰۲۱-۹۱۰۰۸۸۴۴</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          MODAL: ADD NEW MEDICATION REMINDER
          ========================================================================= */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">افزودن یادآور داروی جدید</h3>
              </div>
              <button 
                onClick={() => setIsAddReminderOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">نام دارو (فارسی):</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثلاً قرص تاموکسیفن ۲۰ میلی‌گرم"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">دوز دارو:</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs"
                    placeholder="۱ قرص کامل"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">تعداد موجودی کل:</label>
                  <input
                    type="number"
                    value={newTotalPills}
                    onChange={(e) => setNewTotalPills(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">بازه زمانی:</label>
                  <select
                    value={newSlot}
                    onChange={(e: any) => setNewSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  >
                    <option value="morning">صبحگاهی</option>
                    <option value="noon">ظهر</option>
                    <option value="evening">عصر</option>
                    <option value="night">شبانه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ساعت دقیق یادآور:</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="۰۸:۰۰"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">دستور مصرف پزشک:</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs resize-none"
                  placeholder="همراه با آب کافی بعد از غذا..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddReminderOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>افزودن یادآور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REPORT SIDE EFFECT
          ========================================================================= */}
      {isLogSideEffectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">ثبت عارضه جانبی داروی مصرفی</h3>
              </div>
              <button 
                onClick={() => setIsLogSideEffectOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSideEffect} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">داروی مرتبط:</label>
                <input
                  type="text"
                  value={seMedication}
                  onChange={(e) => setSeMedication(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500"
                  placeholder="نام دارو (مثلاً تاموکسیفن)"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1.5">انتخاب سریع عارضه شایع:</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {commonSideEffectsList.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSeType(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        seType === item
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">عنوان دقیق عارضه:</label>
                <input
                  type="text"
                  value={seType}
                  onChange={(e) => setSeType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs"
                  required
                />
              </div>

              {/* Severity Scale */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">درجه شدت عارضه (CTCAE):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeSeverity('mild')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      seSeverity === 'mild' ? 'bg-teal-600 text-white border-teal-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">خفیف</div>
                    <div className="text-[10px] opacity-80">درجه ۱</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeSeverity('moderate')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      seSeverity === 'moderate' ? 'bg-amber-600 text-white border-amber-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">متوسط</div>
                    <div className="text-[10px] opacity-80">درجه ۲</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeSeverity('severe')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      seSeverity === 'severe' ? 'bg-rose-600 text-white border-rose-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">شدید</div>
                    <div className="text-[10px] opacity-80">درجه ۳</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeSeverity('emergency')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      seSeverity === 'emergency' ? 'bg-red-700 text-white border-red-800 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">بسیار حاد</div>
                    <div className="text-[10px] opacity-80">درجه ۴</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">توضیحات و مشاهدات تکمیلی:</label>
                <textarea
                  rows={2}
                  value={seNotes}
                  onChange={(e) => setSeNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs resize-none"
                  placeholder="از چه زمانی شروع شد، چه ساعاتی شدیدتر است..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogSideEffectOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ثبت و ارسال به پزشک معالج</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
