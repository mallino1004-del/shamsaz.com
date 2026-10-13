/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  Award,
  FileCheck
} from 'lucide-react';
import { MOCK_NATIONAL_METRICS } from '../../../data/mockData';
import { RoleProfileManager } from '../../../components/RoleProfileManager';

export const NationalDashboard: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [supervisorTab, setSupervisorTab] = useState<'overview' | 'profile'>('overview');
  const metrics = MOCK_NATIONAL_METRICS;

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const recentAudits = [
    { id: 'REC-901', hospital: 'بیمارستان مهر تهران', cancer: 'سرطان پستان', stage: 'مرحله ۲-ب', date: '۱۴۰۳/۰۸/۲۲ - ۱۰:۳۰', auditor: 'مهندس حسینی', status: 'تأیید نهایی' },
    { id: 'REC-902', hospital: 'کلینیک سلامت اصفهان', cancer: 'سرطان دهانه رحم', stage: 'مرحله ۱-ب', date: '۱۴۰۳/۰۸/۲۲ - ۰۹:۱۵', auditor: 'مهندس رضایی', status: 'تأیید نهایی' },
    { id: 'REC-903', hospital: 'بیمارستان رضوی مشهد', cancer: 'سرطان تخمدان', stage: 'مرحله ۳-ج', date: '۱۴۰۳/۰۸/۲۱ - ۱۶:۴۰', auditor: 'مهندس اکبری', status: 'تأیید اولیه' },
    { id: 'REC-904', hospital: 'مرکز امید شیراز', cancer: 'سرطان اندومتر', stage: 'مرحله ۱-الف', date: '۱۴۰۳/۰۸/۲۱ - ۱۱:۱۰', auditor: 'مهندس تهرانی', status: 'تأیید نهایی' },
    { id: 'REC-905', hospital: 'بیمارستان قائم تبریز', cancer: 'سرطان پستان', stage: 'مرحله ۳-الف', date: '۱۴۰۳/۰۸/۲۰ - ۱۴:۲۰', auditor: 'مهندس حسینی', status: 'نیازمند بازبینی' },
  ];

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-right">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              داشبورد مدیریتی و نظارت ملی سلامت
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              شاخص‌های کلان اپیدمیولوژیک، توزیع جغرافیایی و کنترل کیفیت داده‌های شبکه سرطان‌های زنان
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>خروجی استاندارد اکسل / CSV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Switcher */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 mb-6 text-xs font-bold shadow-xs">
          <button
            onClick={() => setSupervisorTab('overview')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              supervisorTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>شاخص‌های کلان، توزیع جغرافیایی و ممیزی‌های بالینی</span>
          </button>
          <button
            onClick={() => setSupervisorTab('profile')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              supervisorTab === 'profile'
                ? 'bg-emerald-700 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>پروفایل حاکمیتی، اختیارات نظارتی و آستانه‌های هشدار</span>
          </button>
        </div>

        {supervisorTab === 'profile' && (
          <div className="animate-in fade-in duration-200">
            <RoleProfileManager
              currentRole="national_supervisor"
              currentUserName="دکتر احسان رفیعی"
              isEmbedded={true}
            />
          </div>
        )}

        {supervisorTab === 'overview' && (
          <>

        {downloadSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>خروجی جامع شاخص‌های ملی سلامت با موفقیت آماده و بارگیری شد.</span>
            </div>
            <button onClick={() => setDownloadSuccess(false)}>×</button>
          </div>
        )}

        {/* 4 Main KPI Cards matching Screen 11 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-bold">کل پرونده‌ها</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {metrics.totalRegisteredPatients.toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+۸.۴٪ رشد نسبت به فصل قبل</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              <span className="text-[11px] font-bold">مراکز درمانی فعال</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {metrics.partnerHospitalsCount.toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              در ۲۴ استان کشور
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Clock className="w-5 h-5 text-pink-600" />
              <span className="text-[11px] font-bold">ثبت ماه جاری</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {metrics.newRegistrationsThisMonth.toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-teal-600 font-semibold mt-1">
              کامل‌بودن داده‌ها: ۹۸.۴٪
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-right shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span className="text-[11px] font-bold">نیازمند پیگیری دوره‌ای</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {metrics.activeFollowUpsCount.toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              موعد نوبت در ۳۰ روز آینده
            </div>
          </div>

        </div>

        {/* Middle Section: Donut Distribution Chart & Monthly Trend Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Donut Chart: Distribution of 4 Cancers (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              توزیع فراوانی ۴ سرطان اصلی زنان
            </h3>
            <p className="text-[11px] text-slate-500 mb-6">
              سهم نسبی پستان، دهانه رحم، تخمدان و اندومتر در رجیستری
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Visual SVG Donut */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Circle segments calculated: 53%, 21%, 16%, 10% */}
                  {/* Breast 53% -> strokeDasharray: 53 47 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#ec4899" strokeWidth="16" strokeDasharray="53 47" strokeDashoffset="0" />
                  {/* Cervix 21% -> strokeDasharray: 21 79 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="21 79" strokeDashoffset="-53" />
                  {/* Ovary 16% -> strokeDasharray: 16 84 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="16 84" strokeDashoffset="-74" />
                  {/* Endometrium 10% -> strokeDasharray: 10 90 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="10 90" strokeDashoffset="-90" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400">کل موارد</span>
                  <span className="text-sm font-black font-mono">۱۲,۸۷۳</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2.5 text-xs w-full">
                {metrics.cancerDistribution.map((item) => (
                  <div key={item.type} className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-800">{item.label}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      {item.percentage}٪
                      <span className="text-[10px] text-slate-400 font-normal mr-1">({item.count.toLocaleString('fa-IR')})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart: Monthly Registration Trend (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              روند ثبت بیماران در ماه‌های سال جاری
            </h3>
            <p className="text-[11px] text-slate-500 mb-6">
              تعداد پرونده‌های جدید ثبت و اعتبارسنجی شده در هر ماه
            </p>

            <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
              {metrics.monthlyTrend.map((m) => {
                const heightPct = Math.round((m.count / 400) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.count}
                    </span>
                    <div
                      className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:to-teal-400 transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-medium text-slate-600 truncate mt-1">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>نرخ رشد متوسط ماهانه: +۳.۵٪</span>
              <span>مجموع پرونده‌های سال جاری: ۲,۱۴۵ مورد</span>
            </div>
          </div>

        </div>

        {/* Recent Audit Activities Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">۵ رکورد آخر اضافه شده</span>
            <h3 className="text-sm font-bold text-slate-900">
              آخرین فعالیت‌ها و لاگ‌های ثبت بالینی
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">شناسه رکورد</th>
                  <th className="p-3">مرکز درمانی / بیمارستان</th>
                  <th className="p-3">نوع سرطان</th>
                  <th className="p-3">استیج TNM</th>
                  <th className="p-3">زمان ثبت</th>
                  <th className="p-3">کارشناس ممیزی</th>
                  <th className="p-3">وضعیت کنترل کیفیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAudits.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">{item.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.hospital}</td>
                    <td className="p-3 text-slate-800">{item.cancer}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{item.stage}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{item.date}</td>
                    <td className="p-3 text-slate-600">{item.auditor}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'تأیید نهایی' 
                          ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
};
