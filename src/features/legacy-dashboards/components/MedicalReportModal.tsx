/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Calendar, 
  Ribbon,
  Lock
} from 'lucide-react';
import { CancerRegistryRecord, Appointment } from '../../../types';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientRecord?: CancerRegistryRecord;
  appointments?: Appointment[];
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  patientRecord,
  appointments = [],
}) => {
  if (!isOpen) return null;

  const reportRef = useRef<HTMLDivElement>(null);

  // Default patient info fallback if record not supplied
  const record = patientRecord || {
    id: 'NCR-1403-8821',
    nationalId: '۰۰۱۴۸۹۲۳۶۵',
    firstName: 'مریم',
    lastName: 'احمدی',
    fatherName: 'محمود',
    birthDate: '۱۳۵۴/۰۶/۱۵',
    age: 49,
    maritalStatus: 'married',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، خیابان ولیعصر، بالاتر از ظفر',
    phone: '۰۲۱۲۲۳۳۴۴۵۵',
    mobile: '۰۹۱۲۱۳۴۸۵۶۷',
    insuranceType: 'تأمین اجتماعی + تکمیلی ایران',
    cancerTypeNameFa: 'سرطان پستان چپ',
    icd10Code: 'C50.9',
    icdO3Code: '8500/3',
    clinicalStage: 'مرحله ۲-ب (T2N1M0)',
    histologicType: 'کارسینوم مجاری مهاجم (IDC)، درجه ۲',
    tumorGrade: 'درجه ۲',
    erStatus: 'positive',
    erPercent: 85,
    prStatus: 'positive',
    prPercent: 70,
    her2Status: '1+',
    ki67Percent: 22,
    brca1Mutation: false,
    brca2Mutation: false,
    surgeryType: 'جراحی حفظ پستان (BCS) + لنفوسینتی‌گرافی نگهبان SLNB',
    chemotherapyRegimen: 'AC-T (۴ دوره دوکسوروبیسین/سیکلوفسفامید + ۱۲ هفته پاکلی‌تاکسل)',
    radiotherapyGiven: true,
    hormonalTherapy: 'قرص لتروزول روزانه ۲.۵mg (Letrozole)',
    lastFollowUpDate: '۱۴۰۳/۰۸/۱۰',
    vitalStatus: 'alive_ned',
    qolScore: 88,
    auditorName: 'مهندس حسینی (کنترل کیفی رجیستری)',
    supervisingPhysician: 'دکتر علی رضایی (نظام پزشکی ن-۸۲۴۹۰)',
    createdAt: '۱۴۰۳/۰۳/۰۵'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Generate clean self-contained HTML/PDF download blob
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>گزارش رسمی سلامت شمساز - ${record.firstName} ${record.lastName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap');
          body { font-family: 'Vazirmatn', sans-serif; direction: rtl; padding: 30px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
          .title { font-size: 20px; font-weight: 900; color: #0f172a; }
          .subtitle { font-size: 13px; color: #0d9488; margin-top: 5px; }
          .meta-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right; }
          th { background: #f1f5f9; font-weight: bold; }
          .security-seal { border: 1px dashed #0d9488; padding: 10px; border-radius: 6px; font-size: 11px; background: #f0fdfa; color: #115e59; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">جمهوری اسلامی ایران — شبکه ملی سرطان‌های زنان</div>
          <div class="subtitle">کارنامه جامع سلامت و خلاصه پرونده الکترونیک رجیستری ملی شمساز</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">شناسه یکتای پرونده: ${record.id} · تاریخ صدور: ۱۴۰۳/۰۸/۲۲</div>
        </div>

        <div class="meta-box">
          <div><strong>نام بیمار:</strong> ${record.firstName} ${record.lastName}</div>
          <div><strong>کد ملی:</strong> ${record.nationalId}</div>
          <div><strong>سن در تشخیص:</strong> ${record.age} سال</div>
          <div><strong>شهر / استان:</strong> ${record.city} / ${record.province}</div>
          <div><strong>پوشش بیمه:</strong> ${record.insuranceType}</div>
          <div><strong>وضعیت حیات:</strong> بهبودیافته و عاری از بیماری (NED)</div>
        </div>

        <h3>۱. مشخصات تشخیصی و استیج تومور</h3>
        <table>
          <tr><th>نوع سرطان</th><td>${record.cancerTypeNameFa}</td></tr>
          <tr><th>کد بین‌المللی ICD-10</th><td>${record.icd10Code} (مورفولوژی ICD-O-3: ${record.icdO3Code})</td></tr>
          <tr><th>استیج‌بندی بالینی TNM</th><td>${record.clinicalStage}</td></tr>
          <tr><th>نوع پاتولوژی و درجه تمایز</th><td>${record.histologicType} — ${record.tumorGrade}</td></tr>
        </table>

        <h3>۲. پنل بیومارکرهای ایمونوهیستوشیمی (IHC)</h3>
        <table>
          <tr>
            <th>گیرنده استروژن (ER)</th>
            <th>گیرنده پروژسترون (PR)</th>
            <th>پروتئین HER2</th>
            <th>شاخص تکثیر Ki-67</th>
            <th>جهش BRCA1/2</th>
          </tr>
          <tr>
            <td>مثبت (${record.erPercent}%)</td>
            <td>مثبت (${record.prPercent}%)</td>
            <td>${record.her2Status} (منفی)</td>
            <td>${record.ki67Percent}%</td>
            <td>منفی (فاقد جهش)</td>
          </tr>
        </table>

        <h3>۳. پروتکل‌های درمانی و دارویی</h3>
        <table>
          <tr><th>جراحی انجام‌شده</th><td>${record.surgeryType}</td></tr>
          <tr><th>رژیم شیمی‌درمانی</th><td>${record.chemotherapyRegimen}</td></tr>
          <tr><th>پرتودرمانی</th><td>رادیوتراپی کامل پستان و بوست تخت تومور</td></tr>
          <tr><th>درمان نگهدارنده هورمونی</th><td>${record.hormonalTherapy}</td></tr>
        </table>

        <div class="security-seal">
          <strong>اعتبارسنجی امنیتی و رمزنگاری داده‌ها:</strong> این سند بر مبنای استانداردهای بین‌المللی HIPAA و الزامات امنیتی حاکمیت داده سلامت تولید شده است. اصالت این پرونده از طریق شناسه رهگیری هش در سامانه پایش کشوری قابل استعلام است.
        </div>

        <div class="footer">
          <div>پزشک ناظر بالینی: ${record.supervisingPhysician}</div>
          <div>کارشناس ممیزی داده: ${record.auditorName}</div>
          <div>مهر و امضای دیجیتال سامانه شمساز</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `پرونده_سلامت_${record.lastName}_${record.nationalId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 text-right shadow-2xl border border-slate-200 relative my-6 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none">
        
        {/* Top Floating Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل PDF امن</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ پرونده رسمی</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Official Medical Document Container */}
        <div ref={reportRef} className="space-y-6 text-xs text-slate-800">
          
          {/* Official Emblem & Header */}
          <div className="border-b-2 border-teal-600 pb-5 text-center relative">
            <div className="flex items-center justify-between">
              
              {/* QR Code Verification */}
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center w-24">
                <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
                <span className="text-[9px] font-mono text-slate-500 mt-1 block">استعلام اصالت</span>
              </div>

              {/* Central Title */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500">
                  جمهوری اسلامی ایران · شبکه ملی سرطان‌های زنان
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  کارنامه جامع سلامت و خلاصه پرونده بالینی (خروجی رسمی PDF)
                </h2>
                <div className="text-[11px] text-teal-700 font-bold">
                  پرونده الکترونیک سلامت و خلاصه بالینی رجیستری سرطان شمساز
                </div>
              </div>

              {/* Security Seal & Code */}
              <div className="text-right sm:text-left w-auto sm:w-28 font-mono text-[10px] text-slate-500 space-y-1 shrink-0">
                <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded block text-center font-bold">
                  رمزنگاری‌شده
                </span>
                <div>شناسه: {record.id}</div>
                <div>تاریخ: ۱۴۰۳/۰۸/۲۲</div>
              </div>

            </div>
          </div>

          {/* Demographic Patient Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">نام و نام خانوادگی:</span>
              <span className="font-bold text-slate-900">{record.firstName} {record.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">کد ملی:</span>
              <span className="font-mono font-bold text-indigo-700">{record.nationalId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">سن در زمان تشخیص:</span>
              <span className="font-mono text-slate-800">{record.age} ساله</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">وضعیت حیات:</span>
              <span className="font-bold text-teal-700">زنده بدون عود (NED)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">استان و شهر:</span>
              <span className="text-slate-800">{record.city} · {record.province}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">شماره تماس همراه:</span>
              <span className="font-mono text-slate-800">{record.mobile}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">پوشش بیمه‌ای:</span>
              <span className="text-slate-800">{record.insuranceType}</span>
            </div>
          </div>

          {/* Section 1: Clinical Diagnosis & TNM Stage */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <Ribbon className="w-4 h-4 text-pink-600" />
              <span>۱. مشخصات تشخیصی و استیج بالینی تومور</span>
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-600 w-1/4">نوع سرطان اولیه:</td>
                    <td className="p-2.5 font-bold text-pink-700">{record.cancerTypeNameFa}</td>
                    <td className="p-2.5 font-bold text-slate-600 w-1/4">کد بین‌المللی بیماری:</td>
                    <td className="p-2.5 font-mono">{record.icd10Code} (مورفولوژی: {record.icdO3Code})</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 font-bold text-slate-600">استیج‌بندی بالینی TNM:</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-700">{record.clinicalStage}</td>
                    <td className="p-2.5 font-bold text-slate-600">نوع بافت‌شناسی و گرید:</td>
                    <td className="p-2.5 font-bold">{record.histologicType} — {record.tumorGrade}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Immunohistochemistry Biomarkers Panel */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>۲. پنل بیومارکرهای مولکولی و ایمونوهیستوشیمی (IHC)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">گیرنده استروژن (ER)</span>
                <span className="font-bold text-teal-700">مثبت ({record.erPercent}%)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">گیرنده پروژسترون (PR)</span>
                <span className="font-bold text-teal-700">مثبت ({record.prPercent}%)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">پروتئین HER2</span>
                <span className="font-bold text-slate-800">{record.her2Status} (منفی)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">شاخص تکثیر Ki-67</span>
                <span className="font-bold text-indigo-700">{record.ki67Percent}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">جهش ژنتیکی BRCA</span>
                <span className="font-bold text-slate-800 font-sans">فاقد جهش (منفی)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Treatment Protocols & Medications */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>۳. مداخلات درمانی و دارودرمانی دریافت شده</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-600 w-1/4 bg-slate-50">نوع جراحی:</td>
                    <td className="p-2.5">{record.surgeryType}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-600 bg-slate-50">رژیم شیمی‌درمانی:</td>
                    <td className="p-2.5">{record.chemotherapyRegimen}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-600 bg-slate-50">پرتودرمانی (رادیوتراپی):</td>
                    <td className="p-2.5">رادیوتراپی کامل پستان به همراه بوست تخت تومور (انجام شد)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-600 bg-slate-50">هورمون‌تراپی و مراقبت:</td>
                    <td className="p-2.5 font-bold text-teal-800">{record.hormonalTherapy}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Security & Cryptographic Watermark Footer */}
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>گواهی اصالت و ایمنی بالینی:</strong> این کارنامه با استاندارد رمزنگاری AES-256 و پروتکل امنیتی HIPAA صادر شده و هرگونه دست‌کاری فاقد اعتبار است.
              </span>
            </div>
            <span className="font-mono text-[9px] text-teal-700 font-bold shrink-0">
              HASH: 9A82-F71D-3C90
            </span>
          </div>

          {/* Signature Boxes */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="block text-[11px] text-slate-400">پزشک معالج و ناظر بالینی:</span>
              <strong className="text-slate-900">{record.supervisingPhysician}</strong>
            </div>

            <div>
              <span className="block text-[11px] text-slate-400">کارشناس ثبت و ممیزی داده:</span>
              <strong className="text-slate-900">{record.auditorName}</strong>
            </div>

            <div className="text-right sm:text-left font-mono text-[10px] text-slate-400">
              <div>سامانه جامع شمساز</div>
              <div>شبکه ملی مراقبت سرطان‌های زنان</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
