/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Share2, 
  Clock, 
  FileText, 
  Pill, 
  Plus, 
  Send, 
  ShieldCheck, 
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ASSET_PATHS } from '../../../data/mockData';
import { TelemedicinePrescriptionItem } from '../../../types';

interface TelemedicineRoomProps {
  onEndCall: () => void;
}

export const TelemedicineRoom: React.FC<TelemedicineRoomProps> = ({ onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'rx' | 'soap' | 'records'>('rx');
  const [secondsElapsed, setSecondsElapsed] = useState(504); // ~ 08:24
  const [rxSuccessMsg, setRxSuccessMsg] = useState<string | null>(null);

  // e-Prescription state
  const [prescriptions, setPrescriptions] = useState<TelemedicinePrescriptionItem[]>([
    {
      id: 'p1',
      medicine: 'قرص لتروزول (Letrozole)',
      dosage: '۲.۵ میلی‌گرم',
      frequency: 'روزی یک عدد بعد از غذا',
      duration: '۳۰ روز',
      instructions: 'مصرف منظم بدون قطع دارو',
    },
    {
      id: 'p2',
      medicine: 'کپسول کلسیم + ویتامین دی (Cal-D)',
      dosage: '۵۰۰ میلی‌گرم',
      frequency: 'روزی یک عدد بعد از ناهار',
      duration: '۶۰ روز',
      instructions: 'همراه با یک لیوان آب فراوان',
    }
  ]);

  const [newMedicine, setNewMedicine] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // SOAP notes
  const [soapSubjective, setSoapSubjective] = useState('بیمار اظهار رضایت از شروع هورمون‌تراپی دارد؛ گزارش گرگرفتگی خفیف در شب‌ها، بدون تهوع یا سرگیجه شدید.');
  const [soapObjective, setSoapObjective] = useState('بررسی نتایج آزمایش خون و آنزیم‌های کبدی (AST/ALT) در محدوده نرمال. سونوگرافی پستان بافت ترمیم یافته را نشان می‌دهد.');
  const [soapAssessment, setSoapAssessment] = useState('تحمل مناسب لتروزول پس از جراحی حفظ پستان (BCS) در سرطان پستان استیج IIB، عدم شواهد عود بالینی.');
  const [soapPlan, setSoapPlan] = useState('ادامه لتروزول روزانه، آزمایش تراکم استخوان (BMD) در ۶ ماه آینده، پیگیری مجدد ۳ ماه دیگر.');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.trim()) return;

    const item: TelemedicinePrescriptionItem = {
      id: `p-${Date.now()}`,
      medicine: newMedicine,
      dosage: newDosage || 'استاندارد',
      frequency: newFrequency || 'روزانه',
      duration: newDuration || '۳۰ روز',
      instructions: 'طبق دستور پزشک معالج',
    };

    setPrescriptions([...prescriptions, item]);
    setNewMedicine('');
    setNewDosage('');
    setNewFrequency('');
    setNewDuration('');
  };

  const handleSendRx = () => {
    setRxSuccessMsg('نسخه الکترونیک به سامانه بیمه سلامت و پیامک بیمار ارسال شد.');
    setTimeout(() => setRxSuccessMsg(null), 5000);
  };

  return (
    <div className="py-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Room Bar */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 mb-4 flex items-center justify-between text-right">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-right">
              <h2 className="text-sm font-bold text-white">
                اتاق ویزیت و مشاوره آنلاین تصویری (تله‌مدیسین)
              </h2>
              <span className="text-[11px] text-slate-400">
                پزشک: دکتر سمیرا احمدی · بیمار: مریم احمدی (کد ملی: ۰۰۱۴۸۹۲۳۶۵)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold tabular-nums">
              {formatTimer(secondsElapsed)}
            </span>
          </div>
        </div>

        {/* Main Grid: Video Screen (Left) + Clinical Workspace Pad (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Video Stream Container (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 rounded-3xl border border-slate-800 p-4 relative overflow-hidden min-h-[460px] shadow-2xl">
            
            {/* Primary Doctor Screen Video */}
            <div className="relative w-full h-full flex-1 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {isVideoOn ? (
                <img
                  src={ASSET_PATHS.heroBanner}
                  alt="تصویر پزشک در حال ویزیت"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs">دوربین پزشک خاموش است</div>
              )}

              {/* Status Tag on Video */}
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>دکتر سمیرا احمدی (اتصال پایدار · HD)</span>
              </div>

              {/* Patient Small PiP (Picture-in-Picture) */}
              <div className="absolute bottom-4 left-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl bg-slate-800">
                <img
                  src={ASSET_PATHS.doctorFemale}
                  alt="تصویر بیمار"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 left-1 bg-black/60 rounded px-1.5 py-0.5 text-[9px] text-white text-center">
                  مریم احمدی (بیمار)
                </div>
              </div>
            </div>

            {/* Video Controls Dock */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl transition-all ${
                  isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'وصل صدا' : 'قطع صدا'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-2xl transition-all ${
                  !isVideoOn ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoOn ? 'خاموش کردن تصویر' : 'روشن کردن تصویر'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
                title="اشتراک‌گذاری تصویر یا پرونده"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={onEndCall}
                className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>پایان ویزیت آنلاین</span>
              </button>
            </div>
          </div>

          {/* Right Clinical Pad: e-Prescription & SOAP Notes (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-800 rounded-3xl border border-slate-700 p-5 text-right flex flex-col justify-between">
            
            <div>
              {/* Tab Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-2xl text-xs font-bold mb-4">
                <button
                  onClick={() => setActiveTab('rx')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'rx' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>نسخه الکترونیک</span>
                </button>
                <button
                  onClick={() => setActiveTab('soap')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'soap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>یادداشت SOAP</span>
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'records' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>مدارک بیمار</span>
                </button>
              </div>

              {rxSuccessMsg && (
                <div className="mb-3 p-2.5 rounded-xl bg-teal-900/60 border border-teal-500 text-teal-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{rxSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: e-Prescription Pad */}
              {activeTab === 'rx' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-300">
                    اقلام دارویی ثبت‌شده در نسخه فعلی:
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {prescriptions.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs">
                        <div className="flex items-center justify-between font-bold text-teal-300">
                          <span>{p.medicine}</span>
                          <span className="font-mono text-[11px] text-slate-400">{p.dosage}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                          <span>دستور: {p.frequency}</span>
                          <span className="font-mono">{p.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Drug Form */}
                  <form onSubmit={handleAddMedicine} className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                    <span className="font-bold text-slate-300 block mb-1">افزودن داروی جدید به نسخه:</span>
                    <input
                      type="text"
                      placeholder="نام دارو (مثلاً کپسول تاموکسیفن ۲۰mg)"
                      value={newMedicine}
                      onChange={(e) => setNewMedicine(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-hidden"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="دوز (مثلاً ۲۰ میلی‌گرم)"
                        value={newDosage}
                        onChange={(e) => setNewDosage(e.target.value)}
                        className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="دستور (مثلاً شبی یک عدد)"
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(e.target.value)}
                        className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن به نسخه</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Structured SOAP Note */}
              {activeTab === 'soap' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-indigo-300 mb-1">شرح حال و شکایات بیمار (Subjective):</label>
                    <textarea
                      rows={2}
                      value={soapSubjective}
                      onChange={(e) => setSoapSubjective(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-teal-300 mb-1">یافته‌های بالینی و آزمایش‌ها (Objective):</label>
                    <textarea
                      rows={2}
                      value={soapObjective}
                      onChange={(e) => setSoapObjective(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-300 mb-1">ارزیابی و برنامه درمان (Assessment & Plan):</label>
                    <textarea
                      rows={2}
                      value={soapPlan}
                      onChange={(e) => setSoapPlan(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Attached Records Preview */}
              {activeTab === 'records' && (
                <div className="space-y-3 text-xs">
                  <div className="text-slate-300 font-bold mb-2">مدارک بارگذاری شده توسط بیمار:</div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">سونوگرافی و ماموگرافی پستان</div>
                      <div className="text-[10px] text-slate-400 font-mono">فایل پی‌دی‌اف · ۱.۸ مگابایت · ۱۴۰۳/۰۸/۱۰</div>
                    </div>
                    <span className="text-[10px] bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded border border-teal-600">
                      بررسی شده
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">گزارش پاتولوژی بیوپسی سوزنی</div>
                      <div className="text-[10px] text-slate-400 font-mono">فایل پی‌دی‌اف · ۹۵۰ کیلوبایت · آزمایشگاه پاتوبیولوژی مهر</div>
                    </div>
                    <span className="text-[10px] bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded border border-teal-600">
                      تأیید شده
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Finalize Button */}
            <div className="pt-4 border-t border-slate-700 mt-4">
              <button
                onClick={handleSendRx}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ارسال نسخه و یادداشت بالینی به سامانه پرونده الکترونیک</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
