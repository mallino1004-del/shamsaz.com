/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Building2, 
  CreditCard, 
  FileText, 
  Upload, 
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Doctor, Appointment } from '../../../types';

interface BookingModalProps {
  doctor: Doctor | null;
  selectedSlot?: string;
  selectedDate?: string;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  selectedSlot = '۱۰:۰۰ - ۱۰:۳۰',
  selectedDate = '۱۴۰۳/۰۸/۲۲',
  onClose,
  onSuccess,
}) => {
  if (!doctor) return null;

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [patientName, setPatientName] = useState('مریم احمدی');
  const [nationalId, setNationalId] = useState('۰۰۱۴۸۹۲۳۶۵');
  const [phoneNumber, setPhoneNumber] = useState('۰۹۱۲۱۳۴۸۵۶۷');
  const [visitType, setVisitType] = useState<'in_person' | 'telemedicine'>('in_person');
  const [reason, setReason] = useState('چکاپ سالیانه سلامت زنان و بررسی آزمایش سونوگرافی');
  const [selectedInsurance, setSelectedInsurance] = useState('تأمین اجتماعی');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(['سونوگرافی_پستان_آبان۱۴۰۳.pdf']);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || nationalId.length < 10 || !phoneNumber.trim()) {
      setErrorMsg('لطفاً نام، کد ملی ۱۰ رقمی و شماره همراه را به درستی وارد نمایید.');
      return;
    }

    const trackingCode = `DM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.title,
      patientName,
      patientNationalId: nationalId,
      patientPhone: phoneNumber,
      date: selectedDate,
      timeSlot: selectedSlot,
      type: visitType,
      status: 'confirmed',
      fee: doctor.consultationFee,
      trackingCode,
      reason,
      attachmentsCount: uploadedFiles.length,
    };

    setCreatedAppointment(newAppointment);
    setStep('success');
    onSuccess(newAppointment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-right shadow-2xl border border-slate-200 relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            {/* Stepper Wizard Indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-teal-600">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>انتخاب پزشک</span>
              </div>
              <span className="text-slate-300">———</span>
              <div className="flex items-center gap-1.5 text-teal-600">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>انتخاب زمان</span>
              </div>
              <span className="text-slate-300">———</span>
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">۳</span>
                <span>اطلاعات بیمار</span>
              </div>
              <span className="text-slate-300">———</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">۴</span>
                <span>تأیید نهایی</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-900 mb-1">
              تأیید نهایی نوبت و ثبت مشخصات
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              لطفاً مشخصات فردی و درمانی بیمار را جهت صدور پرونده و ارسال پیامک یادآوری تکمیل کنید.
            </p>

            {/* Doctor & Appointment Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{doctor.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{doctor.specialty}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{doctor.hospital}</span>
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto text-right border-t sm:border-t-0 sm:border-r border-slate-200 pt-2 sm:pt-0 sm:pr-4 space-y-1">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-start gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedDate}</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 flex items-center justify-start gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>ساعت: {selectedSlot}</span>
                </div>
                <div className="text-xs font-black text-indigo-700 pt-1">
                  <span>هزینه ویزیت: </span>
                  <span className="font-mono tabular-nums">{doctor.consultationFee.toLocaleString('fa-IR')}</span>
                  <span className="text-[10px] font-normal mr-1">تومان</span>
                </div>
              </div>
            </div>

            {/* Patient Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی بیمار *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    کد ملی بیمار (۱۰ رقم) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره تلفن همراه (جهت پیامک نوبت) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نوع ویزیت
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value as 'in_person' | 'telemedicine')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                  >
                    <option value="in_person">ویزیت حضوری در مطب / کلینیک</option>
                    <option value="telemedicine">مشاوره آنلاین تصویری (تله‌مدیسین)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  پوشش بیمه‌ای طرف قرارداد
                </label>
                <div className="flex flex-wrap gap-2">
                  {doctor.insurances.map((ins) => (
                    <button
                      key={ins}
                      type="button"
                      onClick={() => setSelectedInsurance(ins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedInsurance === ins
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {ins}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  علت مراجعه یا شرح علائم بالینی
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              {/* Attachments Upload Mock */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  بارگذاری سوابق پزشکی / تصاویر سونوگرافی یا آزمایش (اختیاری)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-600 font-medium">
                    کلیک برای افزودن فایل یا رها کردن تصویر سونوگرافی / آزمایش
                  </span>
                  <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                    {uploadedFiles.map((file, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-teal-700 font-medium">
                        ✓ {file}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cancellation Policy Banner */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  <strong>قانون لغو نوبت:</strong> لغو نوبت تا ۳۶ ساعت قبل از موعد مقرر، بدون کسر هزینه و با بازگشت کامل وجه انجام می‌شود.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>تأیید و رزرو قطعی نوبت</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              نوبت شما با موفقیت ثبت شد!
            </h3>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              پیامک تاییدیه و لینک ورود به ویزیت برای شماره <strong>{phoneNumber}</strong> ارسال گردید.
            </p>

            {createdAppointment && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-right text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">کد رهگیری نوبت:</span>
                  <span className="font-mono font-black text-indigo-700">{createdAppointment.trackingCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">پزشک معالج:</span>
                  <span className="font-bold text-slate-800">{createdAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">تاریخ و ساعت:</span>
                  <span className="font-bold text-slate-800">{createdAppointment.date} — {createdAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">نام بیمار:</span>
                  <span className="font-bold text-slate-800">{createdAppointment.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع نوبت:</span>
                  <span className="font-bold text-teal-700">
                    {createdAppointment.type === 'telemedicine' ? 'مشاوره آنلاین تصویری' : 'ویزیت حضوری'}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                بستن و بازگشت
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
