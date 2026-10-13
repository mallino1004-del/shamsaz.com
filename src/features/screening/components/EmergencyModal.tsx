/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert, 
  HeartHandshake, 
  Copy, 
  Check, 
  MapPin, 
  User, 
  Pill, 
  Activity, 
  Stethoscope, 
  Printer, 
  Building2, 
  FileText, 
  Sparkles,
  Share2,
  Clock,
  Ambulance,
  LifeBuoy
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientNationalId?: string;
  patientBloodType?: string;
  treatingDoctor?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  currentDiagnosis?: string;
  activeMedications?: string[];
  allergies?: string[];
  hospitalName?: string;
  hospitalEmergencyPhone?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  patientName = 'مریم احمدی',
  patientNationalId = '۰۰۱۴۸۹۲۳۶۵',
  patientBloodType = 'A مثبت (A+)',
  treatingDoctor = 'دکتر علی رضایی (فوق‌تخصص مدیکال آنکولوژی)',
  emergencyContactName = 'محمدرضا احمدی',
  emergencyContactRelation = 'همسر / همراه اول',
  emergencyContactPhone = '۰۹۱۲۳۴۵۶۷۸۹',
  currentDiagnosis = 'سرطان پستان چپ Stage IIB - تحت هورمون‌تراپی و مراقبت تسکینی',
  activeMedications = [
    'تاموکسیفن ۲۰ میلی‌گرم روزانه (Tamoxifen)',
    'لتروزول ۲.۵ میلی‌گرم (Letrozole)',
    'کلسیم + ویتامین D3 روزانه'
  ],
  allergies = ['پنی‌سیلین (واکنش کهیری حاد)', 'حساسیت به داروی حاوی ید'],
  hospitalName = 'مرکز انکولوژی جامع امید - بیمارستان مهر تهران',
  hospitalEmergencyPhone = '۰۲۱۸۸۹۹۰۰۱۱'
}) => {
  const [copied, setCopied] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const emergencyContacts = [
    {
      name: 'اورژانس فوریت‌های پزشکی کشور',
      number: '115',
      displayNumber: '۱۱۵',
      desc: 'آمبولانس فوری و راهنمایی اورژانس پیش‌بیمارستانی',
      badge: 'شبکه‌سراسری ۲۴/۷',
      color: 'bg-rose-600 text-white hover:bg-rose-700',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      name: 'خط فوری انکولوژی بیمارستان مرجع (بیمارستان مهر)',
      number: '02188990011',
      displayNumber: '۰۲۱-۸۸۹۹۰۰۱۱',
      desc: 'بخش تریاژ سرطان و پزشک مقیم انکولوژی',
      badge: 'مرکز معتمد بیمار',
      color: 'bg-indigo-600 text-white hover:bg-indigo-700',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      name: 'همراه اورژانسی بیمار (محمدرضا احمدی)',
      number: '09123456789',
      displayNumber: '۰۹۱۲-۳۴۵-۶۷۸۹',
      desc: 'تماس فوری با همراه و خانواده در دسترس',
      badge: 'همراه اول',
      color: 'bg-emerald-600 text-white hover:bg-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      name: 'اورژانس مسمومیت و تداخلات دارویی',
      number: '1490',
      displayNumber: '۱۴۹۰',
      desc: 'مرکز ملی اطالع‌رسانی داروها و سموم وزارت بهداشت',
      badge: 'مشاوره دارویی فوری',
      color: 'bg-amber-600 text-white hover:bg-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800'
    }
  ];

  const summaryText = `خلاصه کارت پزشکی اضطراری شمساز (Emergency Medical ID):
نام بیمار: ${patientName}
کد ملی: ${patientNationalId}
گروه خونی: ${patientBloodType}
تشخیص اصلی: ${currentDiagnosis}
پزشک معالج: ${treatingDoctor}
بیمارستان مرجع: ${hospitalName} (تلفن: ${hospitalEmergencyPhone})
حساسیت‌های دارویی: ${allergies.join('، ')}
داروهای مصرفی جاری: ${activeMedications.join(' | ')}
همراه اضطراری: ${emergencyContactName} (${emergencyContactRelation}) - تلفن: ${emergencyContactPhone}
موقعیت بیمار: تهران، خیابان ولیعصر، بالاتر از ظفر`;

  const copySummary = () => {
    navigator.clipboard?.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border-2 border-rose-300 animate-in fade-in zoom-in-95 text-right font-sans">
        
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">کارت اورژانس پزشکی یکپارچه (SOS)</h3>
                  <span className="text-[10px] font-bold bg-white text-rose-800 px-2 py-0.5 rounded-full">
                    گذرنامه اورژانس
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5">
                  خلاصه بالینی پیش‌تکمیل‌شده جهت ارائه فوری به نیروهای امداد ۱۱۵، پزشک کشیک و همراهان
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SOS Alert Bar & Instant Dispatch Action */}
        <div className="bg-rose-50 border-b border-rose-200/80 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            <span>در شرایط تنگی نفس حاد، خونریزی شدید، یا افت هوشیاری بلافاصله با <strong>۱۱۵</strong> تماس بگیرید.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendSOS}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              <span>{sosSent ? 'پیامک SOS ارسال شد ✓' : 'ارسال هشدار به همراه بیمار'}</span>
            </button>
            <button
              onClick={copySummary}
              className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'کپی شد' : 'کپی کل گزارش'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Quick-Dial Emergency Contacts Grid */}
          <div>
            <h4 className="text-xs font-black text-slate-800 mb-2.5 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>شماره‌های تماس اضطراری مستقیم (تماس فوری)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">{contact.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{contact.desc}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${contact.badgeColor}`}>
                      {contact.badge}
                    </span>
                  </div>

                  <a
                    href={`tel:${contact.number}`}
                    className={`py-2 px-3 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-xs ${contact.color}`}
                    title={`تماس مستقیم با ${contact.displayNumber}`}
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>{contact.displayNumber}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Filled Clinical Medical Summary Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h4 className="font-black text-slate-900 text-xs">اطلاعات پرونده بالینی جهت کادر تریاژ و امدادگران</h4>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
                شناسه: NCR-1403-8821
              </span>
            </div>

            {/* Core Patient Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">نام و نام خانوادگی:</span>
                <span className="font-bold text-slate-900 text-xs">{patientName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">کد ملی بیمار:</span>
                <span className="font-bold font-mono text-slate-900 text-xs">{patientNationalId}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-200 bg-rose-50/30">
                <span className="text-[10px] text-rose-500 font-bold block">گروه خونی:</span>
                <span className="font-black font-mono text-rose-700 text-xs">{patientBloodType}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">سن و جنسیت:</span>
                <span className="font-bold text-slate-900 text-xs">۴۹ سال / خانم</span>
              </div>
            </div>

            {/* Diagnosis & Treating Physician */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-indigo-500" />
                  <span>تشخیص بالینی قطعی:</span>
                </span>
                <p className="font-bold text-slate-900 text-xs leading-snug">{currentDiagnosis}</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-teal-600" />
                  <span>پزشک و بیمارستان معالج:</span>
                </span>
                <p className="font-bold text-slate-900 text-xs leading-snug">{treatingDoctor}</p>
                <p className="text-[10px] text-slate-500">{hospitalName}</p>
              </div>
            </div>

            {/* Critical Allergies (Red Flag box) */}
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[11px] font-black text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>حساسیت‌های دارویی و موارد منع مصرف:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((allergy, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-rose-800 border border-rose-300 px-2 py-0.5 rounded-lg">
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Active Medications List */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-indigo-600" />
                <span>داروهای مصرفی جاری (جهت اجتناب از تداخلات دارویی حاد):</span>
              </span>
              <ul className="space-y-1 text-[11px] text-slate-700 pr-2">
                {activeMedications.map((med, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{med}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Emergency Designated Contact */}
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">
                    همراه مسئول: {emergencyContactName} ({emergencyContactRelation})
                  </span>
                  <span className="text-[10px] text-emerald-800">
                    تهران، خیابان ولیعصر، بالاتر از ظفر (آدرس سکونت ثبت‌شده)
                  </span>
                </div>
              </div>

              <a
                href={`tel:${emergencyContactPhone}`}
                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold rounded-lg text-xs flex items-center gap-1"
              >
                <Phone className="w-3 h-3 fill-current" />
                <span>{emergencyContactPhone}</span>
              </a>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>آخرین به‌روزرسانی پرونده: ۲ ساعت پیش توسط سامانه رجیستری</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>چاپ فوری کارت</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              بستن
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
