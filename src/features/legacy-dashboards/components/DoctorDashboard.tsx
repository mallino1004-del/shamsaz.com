/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Video, 
  FileText, 
  Send, 
  CheckCircle2, 
  Plus, 
  Building2,
  Stethoscope,
  Ribbon,
  Activity
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';
import { ScreeningReport } from '../../../types';
import { RoleProfileManager } from '../../../components/RoleProfileManager';
import { User } from 'lucide-react';

interface DoctorDashboardProps {
  onStartTelemedicine: () => void;
  onOpenTumorBoard: () => void;
  screeningReports?: ScreeningReport[];
  doctorName?: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  onStartTelemedicine,
  onOpenTumorBoard,
  screeningReports = [],
  doctorName = 'دکتر سمیرا احمدی',
}) => {
  const [mainTab, setMainTab] = useState<'queue' | 'profile'>('queue');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<'today' | 'action_needed'>('today');
  const [referralSentMsg, setReferralSentMsg] = useState(false);
  const [referralPatient, setReferralPatient] = useState('مریم احمدی');
  const [referralTarget, setReferralTarget] = useState('هیات مجازی تومور (MDT) پستان');
  const [referralReason, setReferralReason] = useState('ارزیابی بیوپسی مشکوک پستان و نیاز به بررسی چندتخصصی نئوادجوانت');

  const todayPatients = [
    { id: 'p1', time: '۱۰:۰۰', name: 'مریم احمدی', reason: 'بررسی نتیجه سونوگرافی و بیوپسی', type: 'online', status: 'در انتظار' },
    { id: 'p2', time: '۱۰:۳۰', name: 'سارا قربانی', reason: 'ویزیت دوره‌ای بارداری پرخطر', type: 'in_person', status: 'انجام‌شده' },
    { id: 'p3', time: '۱۱:۰۰', name: 'ناهید صادقی', reason: 'پاپ اسمیر و بررسی کولپوسکوپی', type: 'in_person', status: 'در انتظار' },
    { id: 'p4', time: '۱۱:۳۰', name: 'مونا رحیمی', reason: 'مشاوره نازایی و نتایج هورمونی', type: 'online', status: 'در انتظار' },
    { id: 'p5', time: '۱۲:۰۰', name: 'فرناز ایمانی', reason: 'چکاپ سالیانه سلامت زنان', type: 'in_person', status: 'در انتظار' },
  ];

  const handleSendReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSentMsg(true);
    setTimeout(() => setReferralSentMsg(false), 4000);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl text-right flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-400 shrink-0">
              <img src={ASSET_PATHS.doctorFemale} alt="دکتر سمیرا احمدی" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-300">میز کاربری پزشک متخصص</span>
              <h1 className="text-xl sm:text-2xl font-black">
                دکتر سمیرا احمدی
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                فوق تخصص زنان و زایمان · نظام پزشکی: ن-۹۴۲۱۶ · بیمارستان مهر تهران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onStartTelemedicine}
              className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>شروع ویزیت آنلاین بعدی</span>
            </button>
            <button
              onClick={onOpenTumorBoard}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>جلسه هیات تومور (MDT)</span>
            </button>
          </div>
        </div>

        {/* Doctor Dashboard Navigation Tab Bar */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 mb-6 text-xs font-bold shadow-xs">
          <button
            onClick={() => setMainTab('queue')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'queue'
                ? 'bg-sky-500 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>میز کاربری، نوبت‌ها و تریاژ بیماران</span>
          </button>
          <button
            onClick={() => setMainTab('profile')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'profile'
                ? 'bg-sky-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>پروفایل حرفه‌ای، مطب و پروانه نظام پزشکی</span>
          </button>
        </div>

        {actionNotice && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PROFILE TAB */}
        {mainTab === 'profile' && (
          <div className="animate-in fade-in duration-200">
            <RoleProfileManager
              currentRole="doctor"
              currentUserName={doctorName}
              isEmbedded={true}
            />
          </div>
        )}

        {/* QUEUE & CLINICAL TAB */}
        {mainTab === 'queue' && (
          <>
            {/* 3 Metric Cards matching Screen 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
                <span className="text-xs font-semibold text-slate-400">نوبت‌های امروز:</span>
                <div className="text-2xl font-black text-indigo-700 mt-1 font-mono tabular-nums">۸ بیمار</div>
                <span className="text-[11px] text-slate-500 mt-1 block">۵ ویزیت حضوری، ۳ مشاوره آنلاین</span>
              </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <span className="text-xs font-semibold text-slate-400">بیماران کل ثبت‌شده:</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono tabular-nums">۲۲۴ پرونده</div>
            <span className="text-[11px] text-teal-600 mt-1 block">دارای سوابق الکترونیک فعال</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <span className="text-xs font-semibold text-slate-400">نیازمند پیگیری و اقدام فوری:</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono tabular-nums">۳ پرونده</div>
            <span className="text-[11px] text-rose-700 mt-1 block">پاتولوژی جدید نیازمند بررسی</span>
          </div>
        </div>

        {/* Main Grid: Today's Queue (8 Cols) + Fast Referral Form (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Today's Queue (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs text-slate-400">تاریخ: امروز (آبان ۱۴۰۳)</span>
              <h3 className="text-sm font-bold text-slate-900">
                لیست بیماران و نوبت‌های امروز
              </h3>
            </div>

            <div className="space-y-3">
              {todayPatients.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold flex items-center justify-center shrink-0">
                      {p.time}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.type === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {p.type === 'online' ? 'آنلاین' : 'حضوری'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.reason}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.type === 'online' ? (
                      <button
                        onClick={onStartTelemedicine}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>شروع ویزیت</span>
                      </button>
                    ) : (
                      <button className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs cursor-pointer">
                        مشاهده پرونده
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form: Quick Referral to Specialist or MDT (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>فرم ثبت ارجاع بالینی بیمار</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ارجاع بیمار به همکار فوق تخصص یا درخواست تشکیل جلسه هیات مجازی تومور
            </p>

            {referralSentMsg && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>ارجاع بالینی با موفقیت در سامانه ثبت گردید.</span>
              </div>
            )}

            <form onSubmit={handleSendReferral} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">بیمار مورد نظر:</label>
                <input
                  type="text"
                  value={referralPatient}
                  onChange={(e) => setReferralPatient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مرجع ارجاع:</label>
                <select
                  value={referralTarget}
                  onChange={(e) => setReferralTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                >
                  <option value="هیات مجازی تومور (MDT) پستان">هیات مجازی تومور (MDT) پستان</option>
                  <option value="دکتر علی رضایی (آنکولوژی بالینی)">دکتر علی رضایی (آنکولوژی بالینی)</option>
                  <option value="دکتر مهران اکبری (رادیولوژی مداخله‌ای)">دکتر مهران اکبری (رادیولوژی مداخله‌ای)</option>
                  <option value="دکتر نگین قاسمی (پاتولوژی مرجع)">دکتر نگین قاسمی (پاتولوژی مرجع)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">علت ارجاع و خلاصه یافته‌ها:</label>
                <textarea
                  rows={3}
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ارسال ارجاع به مقصد</span>
              </button>
            </form>
          </div>

        </div>

        {/* Incoming Screening Triage Reports for Doctor Review */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold">
                <Ribbon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  کارنامه‌ها و گزارش‌های غربالگری هوشمند علائم ارجاع‌شده (Patient Screening Triage)
                </h3>
                <span className="text-[11px] text-slate-400">
                  گزارش‌های ثبت‌شده توسط بیماران از طریق پرسشنامه هوشمند با پروتکل‌های تشخیصی NCCN
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
              {screeningReports.length} گزارش در کارتابل
            </span>
          </div>

          {screeningReports.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              گزارش غربالگری جدیدی در کارتابل موجود نیست.
            </div>
          ) : (
            <div className="space-y-3">
              {screeningReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        report.triageLevel === 'urgent_red'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : report.triageLevel === 'moderate_yellow'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {report.triageLevel === 'urgent_red' ? 'تریاژ سرخ (ارجاع فوری)' : report.triageLevel === 'moderate_yellow' ? 'تریاژ زرد (بررسی اولویت‌دار)' : 'تریاژ سبز'}
                      </span>
                      <span className="font-black text-slate-900">
                        بیمار: {report.patientName} ({report.patientAge} سال)
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">| کد ملی: {report.patientNationalId}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>شناسه سند: {report.id}</span>
                      <span>{report.createdAt}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">ارگان تحت پایش:</span>
                      <span className="font-bold text-slate-900">{report.suspectedOrganFa}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">علائم اصلی گزارش‌شده:</span>
                      <span className="text-slate-700 leading-relaxed font-medium">
                        {report.primarySymptoms.join(' · ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">اقدامات پاراکلینیک پیشنهادی برای دستور پزشک:</span>
                      <span className="text-indigo-900 font-medium leading-relaxed">
                        {report.recommendedDiagnostics.slice(0, 2).join(' | ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      <strong>دستور پیگیری:</strong> {report.referralUrgency}
                    </span>
                    <button
                      onClick={() => {
                        setActionNotice(`دستور انجام اقدامات تشخیصی برای پرونده ${report.id} با موفقیت ثبت شد.`);
                        setTimeout(() => setActionNotice(null), 4000);
                      }}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                    >
                      ثبت دستور اقدامات تشخیصی
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

      </div>
    </div>
  );
};
