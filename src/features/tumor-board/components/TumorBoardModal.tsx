/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ZoomIn,
  ShieldCheck
} from 'lucide-react';
import { TumorBoardCase } from '../../../types';
import { ASSET_PATHS } from '../../../data/mockData';

interface TumorBoardModalProps {
  boardCase: TumorBoardCase;
  onUpdateCase: (updatedCase: TumorBoardCase) => void;
}

export const TumorBoardModal: React.FC<TumorBoardModalProps> = ({
  boardCase,
  onUpdateCase,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'imaging' | 'opinions' | 'consensus'>('summary');
  const [newOpinion, setNewOpinion] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('آنکولوژی بالینی');
  const [newDoctorName, setNewDoctorName] = useState('دکتر علی رضایی');
  const [consensusText, setConsensusText] = useState(boardCase.consensusPlan || '');
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleAddOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpinion.trim()) return;

    const updatedOpinions = [
      ...boardCase.specialtyOpinions,
      {
        id: `op-${Date.now()}`,
        specialty: newSpecialty,
        doctorName: newDoctorName,
        avatar: ASSET_PATHS.doctorMale,
        recommendation: newOpinion,
        approvedAt: 'همین الان'
      }
    ];

    const updatedCase: TumorBoardCase = {
      ...boardCase,
      specialtyOpinions: updatedOpinions,
    };

    onUpdateCase(updatedCase);
    setNewOpinion('');
    setSuccessNote('نظر تخصصی شما در پرونده هیات تومور ثبت گردید.');
    setTimeout(() => setSuccessNote(null), 4000);
  };

  const handleSaveConsensus = () => {
    const updatedCase: TumorBoardCase = {
      ...boardCase,
      consensusPlan: consensusText,
      status: 'consensus_reached'
    };
    onUpdateCase(updatedCase);
    setSuccessNote('جمع‌بندی نهایی هیات تومور تصویب و در پرونده بالینی قفل شد.');
    setTimeout(() => setSuccessNote(null), 5000);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-l from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl text-right">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/30">
                <Users className="w-4 h-4 text-blue-300" />
                <span>جلسه چندتخصصی بررسی پرونده‌های پیچیده سرطان (MDT)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                هیات مجازی تومور و کمیسیون چندتخصصی (MDT)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                بررسی هم‌زمان پرونده، تصاویر ماموگرافی و اسلایدهای بافت‌شناسی توسط تیم آنکولوژی، جراحی، رادیولوژی و پاتولوژی
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs shrink-0 space-y-1">
              <div className="text-slate-300">شناسه جلسه MDT:</div>
              <div className="font-mono font-bold text-sm text-teal-300">{boardCase.id}</div>
              <div className="text-slate-300 pt-1">زمان جلسه: {boardCase.meetingDate}</div>
            </div>
          </div>
        </div>

        {successNote && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>{successNote}</span>
            </div>
            <button onClick={() => setSuccessNote(null)}>×</button>
          </div>
        )}

        {/* Patient Case Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 mb-6 shadow-xs text-right">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">نام بیمار:</span>
              <span className="font-bold text-slate-900">{boardCase.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">سن و کد پرونده:</span>
              <span className="font-mono font-bold text-slate-800">{boardCase.age} ساله · {boardCase.patientCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block">تشخیص اولیه:</span>
              <span className="font-bold text-pink-700">سرطان پستان چپ (IDC)</span>
            </div>
            <div>
              <span className="text-slate-400 block">استیج بالینی TNM:</span>
              <span className="font-mono font-bold text-indigo-700">{boardCase.stage}</span>
            </div>
            <div>
              <span className="text-slate-400 block">وضعیت بررسی:</span>
              <span className="inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                {boardCase.status === 'consensus_reached' ? 'اجماع نهایی تصویب شد' : 'در حال بررسی تخصصی'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">تعداد نظرات ثبت‌شده:</span>
              <span className="font-mono font-bold text-slate-800">{boardCase.specialtyOpinions.length} تخصص</span>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-right">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-4 rounded-xl transition-all ${
                activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              خلاصه بالینی و پاتولوژی
            </button>
            <button
              onClick={() => setActiveTab('imaging')}
              className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'imaging' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>تصاویر ماموگرافی و اسلایدهای بافتی</span>
            </button>
            <button
              onClick={() => setActiveTab('opinions')}
              className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'opinions' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>نظرات اعضای هیات ({boardCase.specialtyOpinions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('consensus')}
              className={`py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'consensus' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>جمع‌بندی تیمی و پروتکل درمانی مصوب</span>
            </button>
          </div>

          {/* TAB 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">شرح حال بالینی و یافته‌های تشخیصی اولیه:</h3>
                <p className="text-slate-700 leading-relaxed">{boardCase.summary}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2">گزارش آزمایشگاه پاتولوژی و مارکرهای IHC:</h3>
                <p className="font-mono text-indigo-800 leading-relaxed">{boardCase.pathologyFindings}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">سوال اصلی مطرح‌شده برای هیات تومور:</h3>
                <p className="text-slate-700 leading-relaxed">
                  آیا بیمار با توجه به سن ۵۴ سال، گیرنده‌های هورمونی مثبت (ER/PR+)، منفی بودن HER2 و درگیری یک لنف‌نود اگزیلاری کاندیدای شیمی‌درمانی نئوادجوانت AC-T قبل از جراحی جهت حفظ پستان (BCS) است یا جراحی مستقیم اندیکاسیون دارد؟
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Medical Imaging Viewport */}
          {activeTab === 'imaging' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  تصویر ماموگرافی توموسنتز دوطرفه و لام هیستوپاتولوژی با رنگ‌آمیزی H&E
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
                    نمایشگر تصاویر پزشکی دایکوم (DICOM 4K)
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 aspect-16/10 flex items-center justify-center">
                <img
                  src={boardCase.imagingPreviewUrl}
                  alt="ماموگرافی و اسلاید پاتولوژی تومور پستان"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating annotation on scan */}
                <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-white text-xs max-w-sm">
                  <div className="font-bold text-teal-300 mb-1">گزارش ایستگاه تشخیصی:</div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    توده ۲.۱cm اسپیکوله در موقعیت ساعت ۲ پستان چپ. غده لنفاوی اگزیلاری لول ۱ با کورتکس ضخیم (BI-RADS 5).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Specialist Opinions & Add Form */}
          {activeTab === 'opinions' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {boardCase.specialtyOpinions.map((op) => (
                  <div
                    key={op.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 text-xs"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={op.avatar || ASSET_PATHS.doctorMale} alt={op.doctorName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{op.doctorName}</span>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {op.specialty}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{op.approvedAt}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{op.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add opinion form */}
              <form onSubmit={handleAddOpinion} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900">ثبت نظر تخصصی جدید در هیات تومور:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">تخصص پزشک:</label>
                    <select
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="آنکولوژی بالینی">آنکولوژی بالینی</option>
                      <option value="جراحی سرطان پستان">جراحی سرطان پستان</option>
                      <option value="رادیولوژی مداخله‌ای">رادیولوژی مداخله‌ای</option>
                      <option value="پاتولوژی آناتومیکال">پاتولوژی آناتومیکال</option>
                      <option value="رادیوتراپی انکولوژی">رادیوتراپی انکولوژی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">نام پزشک معالج:</label>
                    <input
                      type="text"
                      value={newDoctorName}
                      onChange={(e) => setNewDoctorName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">پیشنهاد درمانی یا یادداشت تخصصی:</label>
                  <textarea
                    rows={3}
                    placeholder="شرح نظر بالینی و توصیه‌های تشخیصی/درمانی..."
                    value={newOpinion}
                    onChange={(e) => setNewOpinion(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت نظر در جلسه</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Consensus Decision */}
          {activeTab === 'consensus' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span>پروتکل درمانی مصوب و جمع‌بندی اجماع تیم درمان:</span>
                </div>
                <p className="text-[11px] text-teal-800">
                  این متن پس از تایید توسط تمامی اعضای پنل، به عنوان سند رسمی تصمیم‌گیری بالینی در پرونده بیمار ذخیره می‌شود.
                </p>
              </div>

              <textarea
                rows={5}
                value={consensusText}
                onChange={(e) => setConsensusText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-hidden font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="text-slate-500">
                  پزشک مسئول اجرای برنامه: <strong>{boardCase.assignedActionDoctor || 'دکتر علی رضایی'}</strong>
                </div>
                <button
                  onClick={handleSaveConsensus}
                  className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  تصویب و قفل جمع‌بندی هیات تومور
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
