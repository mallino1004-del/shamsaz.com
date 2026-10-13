/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Activity, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Save, 
  Download, 
  Eye, 
  Ribbon,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { CancerRegistryRecord, CancerType } from '../../../types';
import { RoleProfileManager } from '../../../components/RoleProfileManager';

interface CancerRegistryFormProps {
  existingRecords: CancerRegistryRecord[];
  onSaveRecord: (record: CancerRegistryRecord) => void;
}

export const CancerRegistryForm: React.FC<CancerRegistryFormProps> = ({
  existingRecords,
  onSaveRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');
  const [viewMode, setViewMode] = useState<'create' | 'list' | 'profile'>('create');
  const [searchNationalId, setSearchNationalId] = useState('');
  const [selectedPreviewRecord, setSelectedPreviewRecord] = useState<CancerRegistryRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  // Step 1: Demographics
  const [nationalId, setNationalId] = useState('۰۰۷۲۱۴۵۶۹۸');
  const [firstName, setFirstName] = useState('رویا');
  const [lastName, setLastName] = useState('کمالی');
  const [fatherName, setFatherName] = useState('محمود');
  const [birthDate, setBirthDate] = useState('۱۳۴۹/۰۵/۱۲');
  const [age, setAge] = useState<number>(54);
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'widowed' | 'divorced'>('married');
  const [gravida, setGravida] = useState<number>(2);
  const [para, setPara] = useState<number>(2);
  const [abortus, setAbortus] = useState<number>(0);
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('تهران، خیابان شریعتی، بالاتر از پل رومی، پلاک ۴');
  const [phone, setPhone] = useState('۰۲۱۲۲۳۳۴۴۵۵');
  const [mobile, setMobile] = useState('۰۹۱۲۵۶۷۸۹۰۱');
  const [insuranceType, setInsuranceType] = useState('تأمین اجتماعی + تکمیلی ایران');
  const [familyHistoryCancer, setFamilyHistoryCancer] = useState(true);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState('سابقه سرطان پستان در خواهر در سن ۵۰ سالگی');

  // Step 2: Clinical
  const [cancerType, setCancerType] = useState<CancerType>('breast');
  const [onsetDate, setOnsetDate] = useState('۱۴۰۳/۰۲/۱۵');
  const [diagnosisDate, setDiagnosisDate] = useState('۱۴۰۳/۰۳/۰۲');
  const [icd10Code, setIcd10Code] = useState('C50.9');
  const [icdO3Code, setIcdO3Code] = useState('8500/3');
  const [diagnosisMethod, setDiagnosisMethod] = useState('ماموگرافی تشخیصی و بیوپسی Core Needle');
  const [ecogPerformance, setEcogPerformance] = useState<number>(1);
  const [tnmT, setTnmT] = useState('T2');
  const [tnmN, setTnmN] = useState('N1');
  const [tnmM, setTnmM] = useState('M0');
  const [clinicalStage, setClinicalStage] = useState('Stage IIB');

  // Step 3: Pathology & Biomarkers & Treatment
  const [histologicType, setHistologicType] = useState('کارسینوم مجاری مهاجم پستان (IDC)، درجه ۲');
  const [tumorGrade, setTumorGrade] = useState<'Grade 1' | 'Grade 2' | 'Grade 3'>('Grade 2');
  const [erStatus, setErStatus] = useState<'positive' | 'negative' | 'unknown'>('positive');
  const [erPercent, setErPercent] = useState<number>(85);
  const [prStatus, setPrStatus] = useState<'positive' | 'negative' | 'unknown'>('positive');
  const [prPercent, setPrPercent] = useState<number>(70);
  const [her2Status, setHer2Status] = useState<'0' | '1+' | '2+' | '3+'>('1+');
  const [ki67Percent, setKi67Percent] = useState<number>(22);
  const [brca1Mutation, setBrca1Mutation] = useState(false);
  const [brca2Mutation, setBrca2Mutation] = useState(false);
  const [surgeryType, setSurgeryType] = useState('جراحی حفظ پستان (BCS) و لنفوسینتی‌گرافی نگهبان SLNB');
  const [chemotherapyRegimen, setChemotherapyRegimen] = useState('AC-T (Doxorubicin + Cyclophosphamide سپس Paclitaxel)');
  const [radiotherapyGiven, setRadiotherapyGiven] = useState(true);
  const [hormonalTherapy, setHormonalTherapy] = useState('Letrozole روزانه ۲.۵ میلی‌گرم به مدت ۵ سال');

  // Step 4: Follow-up & Outcomes
  const [lastFollowUpDate, setLastFollowUpDate] = useState('۱۴۰۳/۰۸/۱۰');
  const [vitalStatus, setVitalStatus] = useState<'alive_ned' | 'alive_recurrence' | 'alive_metastasis' | 'deceased_disease' | 'deceased_other'>('alive_ned');
  const [qolScore, setQolScore] = useState<number>(82);
  const [auditorName, setAuditorName] = useState('مهندس حسینی (کارشناس ارشد داده)');
  const [supervisingPhysician, setSupervisingPhysician] = useState('دکتر علی رضایی');

  // Handle Cancer Type Change and automatic ICD-10 suggestions
  const handleCancerTypeChange = (type: CancerType) => {
    setCancerType(type);
    if (type === 'breast') {
      setIcd10Code('C50.9');
      setIcdO3Code('8500/3');
      setHistologicType('کارسینوم مجاری مهاجم پستان (IDC)');
    } else if (type === 'cervix') {
      setIcd10Code('C53.9');
      setIcdO3Code('8070/3');
      setHistologicType('کارسینوم سلول سنگفرشی دهانه رحم (SCC)');
    } else if (type === 'ovary') {
      setIcd10Code('C56');
      setIcdO3Code('8441/3');
      setHistologicType('کارسینوم سروز درجه بالا (HGSC)');
    } else if (type === 'endometrium') {
      setIcd10Code('C54.1');
      setIcdO3Code('8380/3');
      setHistologicType('آدنوکارسینوم اندومتریوئید رحم');
    }
  };

  const handleSave = () => {
    const cancerLabels: Record<CancerType, string> = {
      breast: 'سرطان پستان',
      cervix: 'سرطان دهانه رحم',
      ovary: 'سرطان تخمدان',
      endometrium: 'سرطان اندومتر',
    };

    const newRecord: CancerRegistryRecord = {
      id: `NCR-1403-${Math.floor(8000 + Math.random() * 1999)}`,
      nationalId,
      firstName,
      lastName,
      fatherName,
      birthDate,
      age: Number(age),
      maritalStatus,
      gravida: Number(gravida),
      para: Number(para),
      abortus: Number(abortus),
      province,
      city,
      address,
      phone,
      mobile,
      insuranceType,
      familyHistoryCancer,
      familyHistoryDetails,
      cancerType,
      cancerTypeNameFa: cancerLabels[cancerType],
      onsetDate,
      diagnosisDate,
      icd10Code,
      icdO3Code,
      diagnosisMethod,
      ecogPerformance: Number(ecogPerformance),
      tnmT,
      tnmN,
      tnmM,
      clinicalStage,
      histologicType,
      tumorGrade,
      erStatus,
      erPercent: Number(erPercent),
      prStatus,
      prPercent: Number(prPercent),
      her2Status,
      ki67Percent: Number(ki67Percent),
      brca1Mutation,
      brca2Mutation,
      surgeryType,
      chemotherapyRegimen,
      radiotherapyGiven,
      hormonalTherapy,
      lastFollowUpDate,
      vitalStatus,
      qolScore: Number(qolScore),
      auditorName,
      supervisingPhysician,
      isVerified: true,
      createdAt: '۱۴۰۳/۰۸/۲۲',
    };

    onSaveRecord(newRecord);
    setNotification(`پرونده با کد شناسه ملی رجیستری ${newRecord.id} با موفقیت ثبت و اعتبارسنجی شد.`);
    setTimeout(() => setNotification(null), 6000);
    setViewMode('list');
  };

  const filteredRecords = existingRecords.filter(r => 
    !searchNationalId || r.nationalId.includes(searchNationalId) || r.lastName.includes(searchNationalId)
  );

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-l from-rose-900 via-pink-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden text-right">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 text-xs font-semibold mb-3 border border-pink-400/30">
                <Ribbon className="w-4 h-4 text-pink-300" />
                <span>شبکه ملی سرطان‌های زنان — پلتفرم جامع رجیستری بالینی</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                رجیستری ملی سرطان‌های زنان (پستان، دهانه رحم، تخمدان، اندومتر)
              </h1>
              <p className="text-xs sm:text-sm text-pink-100/90 mt-2 max-w-2xl font-normal leading-relaxed">
                سامانه استاندارد ورود داده‌های بالینی، پاتولوژی، استیج‌بندی TNM، بیومارکرهای IHC و پیگیری بقای بیماران بر مبنای استانداردهای بین‌المللی ICD-10 و ICD-O-3
              </p>
            </div>

            {/* Top View Mode Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode('create')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'create'
                    ? 'bg-white text-rose-900 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                ثبت پرونده بالینی جدید
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-rose-900 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                آرشیو پرونده‌های ثبت‌شده ({existingRecords.length})
              </button>
              <button
                onClick={() => setViewMode('profile')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'profile'
                    ? 'bg-white text-indigo-900 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                کارنامه و پروفایل کارشناس رجیستری
              </button>
            </div>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-teal-600 hover:text-teal-800">×</button>
          </div>
        )}

        {viewMode === 'profile' ? (
          <div className="animate-in fade-in duration-200">
            <RoleProfileManager
              currentRole="registry_clerk"
              currentUserName="مهندس فاطمه حسینی"
              isEmbedded={true}
            />
          </div>
        ) : viewMode === 'create' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-right">
            
            {/* Multi-Step Tabs Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('step1')}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'step1'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>۱. اطلاعات پایه بیمار</span>
              </button>

              <button
                onClick={() => setActiveTab('step2')}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'step2'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>۲. اطلاعات بالینی و TNM</span>
              </button>

              <button
                onClick={() => setActiveTab('step3')}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'step3'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>۳. درمان و پاتولوژی</span>
              </button>

              <button
                onClick={() => setActiveTab('step4')}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'step4'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>۴. پیگیری و پیامدها</span>
              </button>
            </div>

            {/* TAB 1: Base Demographic Info */}
            {activeTab === 'step1' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    اطلاعات هویتی و مشخصات فردی بیمار
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ثبت دقیق شناسه ملی و داده‌های دموگرافیک جهت ردیابی کوهورت ملی سلامت
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کد ملی بیمار (۱۰ رقم) *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام بیمار *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام خانوادگی *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام پدر</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاریخ تولد (شمسی)</label>
                    <input
                      type="text"
                      placeholder="۱۳۴۹/۰۵/۱۲"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سن در زمان تشخیص (سال)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وضعیت تأهل</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    >
                      <option value="married">متأهل</option>
                      <option value="single">مجرد</option>
                      <option value="widowed">همسر فوت‌شده</option>
                      <option value="divorced">مطلقه</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">بارداری (G)</label>
                      <input
                        type="number"
                        value={gravida}
                        onChange={(e) => setGravida(Number(e.target.value))}
                        className="w-full px-2 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">زایمان (P)</label>
                      <input
                        type="number"
                        value={para}
                        onChange={(e) => setPara(Number(e.target.value))}
                        className="w-full px-2 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">سقط (Ab)</label>
                      <input
                        type="number"
                        value={abortus}
                        onChange={(e) => setAbortus(Number(e.target.value))}
                        className="w-full px-2 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شماره تلفن همراه *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">استان محل سکونت</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شهر محل سکونت</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع پوشش بیمه</label>
                    <input
                      type="text"
                      value={insuranceType}
                      onChange={(e) => setInsuranceType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Family History */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="famHistory"
                      checked={familyHistoryCancer}
                      onChange={(e) => setFamilyHistoryCancer(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <label htmlFor="famHistory" className="font-bold text-slate-800 cursor-pointer">
                      سابقه خانوادگی ابتلا به سرطان‌های زنان در بستگان درجه ۱ یا ۲
                    </label>
                  </div>
                  {familyHistoryCancer && (
                    <input
                      type="text"
                      placeholder="شرح بستگان مبتلا، نوع سرطان و سن ابتلا (مثلاً خواهر - سرطان پستان در سن ۵۰ سالگی)"
                      value={familyHistoryDetails}
                      onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                      className="w-full px-3 py-2 mt-2 bg-white border border-slate-200 rounded-xl outline-hidden"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setActiveTab('step2')}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>مرحله بعد: اطلاعات بالینی و TNM</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Clinical & TNM Staging */}
            {activeTab === 'step2' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    اطلاعات بالینی، کدهای تشخیصی و استیج‌بندی تومور (TNM)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تعیین ارگان اولیه درگیر و استیج بین‌المللی بر مبنای آخرین ویرایش AJCC
                  </p>
                </div>

                {/* 4 Cancer Types Selection Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    نوع سرطان اولیه درگیر (۴ سرطان هدف فاز اول شبکه ملی):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'breast', label: 'سرطان پستان', sub: 'کد تشخیص بین‌المللی C50.9', color: 'border-pink-500 text-pink-700 bg-pink-50/50' },
                      { id: 'cervix', label: 'سرطان دهانه رحم', sub: 'کد تشخیص بین‌المللی C53.9', color: 'border-teal-500 text-teal-700 bg-teal-50/50' },
                      { id: 'ovary', label: 'سرطان تخمدان', sub: 'کد تشخیص بین‌المللی C56', color: 'border-purple-500 text-purple-700 bg-purple-50/50' },
                      { id: 'endometrium', label: 'سرطان اندومتر', sub: 'کد تشخیص بین‌المللی C54.1', color: 'border-amber-500 text-amber-700 bg-amber-50/50' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleCancerTypeChange(item.id as CancerType)}
                        className={`p-3.5 rounded-2xl border-2 text-right transition-all ${
                          cancerType === item.id
                            ? `${item.color} shadow-sm font-bold`
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کد بیماری (ICD-10)</label>
                    <input
                      type="text"
                      value={icd10Code}
                      onChange={(e) => setIcd10Code(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کد مورفولوژی (ICD-O-3)</label>
                    <input
                      type="text"
                      value={icdO3Code}
                      onChange={(e) => setIcdO3Code(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">روش تشخیصی قطعی</label>
                    <input
                      type="text"
                      value={diagnosisMethod}
                      onChange={(e) => setDiagnosisMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاریخ شروع اولین علامت</label>
                    <input
                      type="text"
                      value={onsetDate}
                      onChange={(e) => setOnsetDate(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاریخ تشخیص قطعی پاتولوژی</label>
                    <input
                      type="text"
                      value={diagnosisDate}
                      onChange={(e) => setDiagnosisDate(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وضعیت عملکردی بیمار (ECOG)</label>
                    <select
                      value={ecogPerformance}
                      onChange={(e) => setEcogPerformance(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value={0}>ECOG 0 - کاملاً فعال بدون محدودیت</option>
                      <option value={1}>ECOG 1 - محدودیت در فعالیت سنگین فیزیکی</option>
                      <option value={2}>ECOG 2 - قادر به خود‌مراقبتی، ناتوان از کار</option>
                      <option value={3}>ECOG 3 - خود‌مراقبتی محدود، بیش از ۵۰٪ وقت در تخت</option>
                      <option value={4}>ECOG 4 - ناتوانی کامل، وابسته به تخت</option>
                    </select>
                  </div>
                </div>

                {/* TNM Matrix Staging Box */}
                <div className="bg-gradient-to-r from-indigo-50/70 to-slate-50 p-4 rounded-2xl border border-indigo-100 text-xs">
                  <div className="font-bold text-indigo-900 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>استیج‌بندی بالینی تومور بر اساس TNM (نسخه هشتم AJCC):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اندازه تومور (T)</label>
                      <select
                        value={tnmT}
                        onChange={(e) => setTnmT(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      >
                        <option value="Tis">Tis (کارسینوم درجا)</option>
                        <option value="T1">T1 (کوچکتر از ۲cm)</option>
                        <option value="T2">T2 (بین ۲ تا ۵cm)</option>
                        <option value="T3">T3 (بزرگتر از ۵cm)</option>
                        <option value="T4">T4 (تهاجم به جدار یا پوست)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">غدد لنفاوی ناحیه‌ای (N)</label>
                      <select
                        value={tnmN}
                        onChange={(e) => setTnmN(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      >
                        <option value="N0">N0 (فاقد درگیری لنفاوی)</option>
                        <option value="N1">N1 (درگیری ۱ تا ۳ لنف‌نود)</option>
                        <option value="N2">N2 (درگیری ۴ تا ۹ لنف‌نود)</option>
                        <option value="N3">N3 (درگیری ۱۰ یا بیشتر)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">متاستاز دوردست (M)</label>
                      <select
                        value={tnmM}
                        onChange={(e) => setTnmM(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      >
                        <option value="M0">M0 (فاقد متاستاز دوردست)</option>
                        <option value="M1">M1 (دارای متاستاز دوردست)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">مرحله کلی بالینی (Stage)</label>
                      <select
                        value={clinicalStage}
                        onChange={(e) => setClinicalStage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-indigo-300 text-indigo-900 rounded-xl font-bold font-mono"
                      >
                        <option value="Stage 0">مرحله ۰ (درجا - Carcinoma in Situ)</option>
                        <option value="Stage I">مرحله ۱ (محدود و موضعی)</option>
                        <option value="Stage IIA">مرحله ۲-الف</option>
                        <option value="Stage IIB">مرحله ۲-ب</option>
                        <option value="Stage IIIA">مرحله ۳-الف</option>
                        <option value="Stage IIIB">مرحله ۳-ب</option>
                        <option value="Stage IIIC">مرحله ۳-ج</option>
                        <option value="Stage IV">مرحله ۴ (پیشرفته / متاستاتیک)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveTab('step1')}
                    className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبل</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('step3')}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>مرحله بعد: درمان و پاتولوژی</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Pathology & Treatment */}
            {activeTab === 'step3' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    نتایج پاتولوژی، بیومارکرهای ایمونوهیستوشیمی (IHC) و درمان
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ثبت وضعیت ER, PR, HER2, Ki-67 و رژیم‌های درمانی اختصاصی
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="lg:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">نوع بافت‌شناسی (Histology Type)</label>
                    <input
                      type="text"
                      value={histologicType}
                      onChange={(e) => setHistologicType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">درجه تمایز تومور (Tumor Grade)</label>
                    <select
                      value={tumorGrade}
                      onChange={(e) => setTumorGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Grade 1">درجه ۱ (خوب تمایزیافته - کم‌خطر)</option>
                      <option value="Grade 2">درجه ۲ (تمایز متوسط)</option>
                      <option value="Grade 3">درجه ۳ (تمایز ضعیف - پرخطر)</option>
                    </select>
                  </div>
                </div>

                {/* Biomarkers IHC Panel Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>پنل بیومارکرهای مولکولی و ایمونوهیستوشیمی (IHC):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* ER */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">گیرنده استروژن (ER)</label>
                      <select
                        value={erStatus}
                        onChange={(e) => setErStatus(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2"
                      >
                        <option value="positive">مثبت (Positive)</option>
                        <option value="negative">منفی (Negative)</option>
                        <option value="unknown">نامشخص</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">درصد بیان:</span>
                        <input
                          type="number"
                          placeholder="85%"
                          value={erPercent}
                          onChange={(e) => setErPercent(Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-center font-mono border rounded-md"
                        />
                      </div>
                    </div>

                    {/* PR */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">گیرنده پروژسترون (PR)</label>
                      <select
                        value={prStatus}
                        onChange={(e) => setPrStatus(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2"
                      >
                        <option value="positive">مثبت (Positive)</option>
                        <option value="negative">منفی (Negative)</option>
                        <option value="unknown">نامشخص</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">درصد بیان:</span>
                        <input
                          type="number"
                          placeholder="70%"
                          value={prPercent}
                          onChange={(e) => setPrPercent(Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-center font-mono border rounded-md"
                        />
                      </div>
                    </div>

                    {/* HER2 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">پروتئین HER2</label>
                      <select
                        value={her2Status}
                        onChange={(e) => setHer2Status(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg mb-2 font-mono"
                      >
                        <option value="0">0 (منفی قطعی)</option>
                        <option value="1+">1+ (منفی)</option>
                        <option value="2+">2+ (بینابینی - نیاز به FISH)</option>
                        <option value="3+">3+ (مثبت قطعی)</option>
                      </select>
                      <span className="text-[10px] text-slate-400">
                        {her2Status === '3+' ? 'کاندید تراستوزوماب' : 'منفی یا نرمال'}
                      </span>
                    </div>

                    {/* Ki-67 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">شاخص تکثیر Ki-67 (%)</label>
                      <input
                        type="number"
                        placeholder="22%"
                        value={ki67Percent}
                        onChange={(e) => setKi67Percent(Number(e.target.value))}
                        className="w-full px-2 py-1.5 font-mono bg-slate-50 border border-slate-200 rounded-lg mb-2 text-center"
                      />
                      <span className="text-[10px] text-slate-400">
                        {ki67Percent && ki67Percent > 20 ? 'تکثیر سلولی بالا' : 'تکثیر متوسط / پایین'}
                      </span>
                    </div>
                  </div>

                  {/* BRCA */}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brca1Mutation}
                        onChange={(e) => setBrca1Mutation(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>جهش ژن BRCA1 تایید شده</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brca2Mutation}
                        onChange={(e) => setBrca2Mutation(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>جهش ژن BRCA2 تایید شده</span>
                    </label>
                  </div>
                </div>

                {/* Treatment details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع جراحی انجام‌شده</label>
                    <input
                      type="text"
                      value={surgeryType}
                      onChange={(e) => setSurgeryType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رژیم شیمی‌درمانی (Chemotherapy)</label>
                    <input
                      type="text"
                      value={chemotherapyRegimen}
                      onChange={(e) => setChemotherapyRegimen(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">هورمون‌تراپی و تارگت‌تراپی</label>
                    <input
                      type="text"
                      value={hormonalTherapy}
                      onChange={(e) => setHormonalTherapy(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={radiotherapyGiven}
                        onChange={(e) => setRadiotherapyGiven(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>رادیوتراپی (پرتودرمانی) دریافت کرده است</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveTab('step2')}
                    className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبل</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('step4')}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>مرحله بعد: پیگیری و ثبت نهایی</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Follow-up & Verification */}
            {activeTab === 'step4' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    پیگیری‌های دوره‌ای، پیامدهای بالینی و ممیزی داده
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    وضعیت حیات، تحلیل عود و تایید نهایی کارشناس کنترل کیفی داده
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاریخ آخرین ویزیت پیگیری</label>
                    <input
                      type="text"
                      value={lastFollowUpDate}
                      onChange={(e) => setLastFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وضعیت بیمار (Vital Status) *</label>
                    <select
                      value={vitalStatus}
                      onChange={(e) => setVitalStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="alive_ned">زنده - بدون شواهد بیماری (NED)</option>
                      <option value="alive_recurrence">زنده - دارای عود موضعی تومور</option>
                      <option value="alive_metastasis">زنده - دارای متاستاز دوردست</option>
                      <option value="deceased_disease">فوت ناشی از پیشرفت بیماری</option>
                      <option value="deceased_other">فوت ناشی از سایر علل غیرمرتبط</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شاخص کیفیت زندگی (QLQ-C30 از ۱۰۰)</label>
                    <input
                      type="number"
                      value={qolScore}
                      onChange={(e) => setQolScore(Number(e.target.value))}
                      className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام کارشناس ثبت و کنترل کیفیت</label>
                    <input
                      type="text"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">پزشک ناظر بالینی پرونده</label>
                    <input
                      type="text"
                      value={supervisingPhysician}
                      onChange={(e) => setSupervisingPhysician(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Audit & Compliance Disclaimer */}
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">ممیزی امنیتی و حاکمیت داده ملی سلامت:</span>
                    <span className="text-[11px] text-emerald-800">
                      داده‌های این پرونده در حالت سکون با الگوریتم AES-256 رمزنگاری شده و طبق الزامات محرمانگی بالینی به پایگاه رجیستری ملی منتقل می‌گردند.
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('step3')}
                    className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبل</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="py-3 px-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-teal-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>تأیید و ذخیره رسمی در رجیستری ملی</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Archive / List of Registered Records */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-right">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  فهرست پرونده‌های ثبت‌شده در رجیستری ملی
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  جستجو بر اساس کد ملی یا نام خانوادگی، مشاهده لاگ تغییرات و خروجی ساختاریافته
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجوی کد ملی یا نام بیمار..."
                  value={searchNationalId}
                  onChange={(e) => setSearchNationalId(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">شناسه رجیستری</th>
                    <th className="p-3">نام و کد ملی</th>
                    <th className="p-3">نوع سرطان</th>
                    <th className="p-3">مرحله (TNM)</th>
                    <th className="p-3">بیومارکرها (IHC)</th>
                    <th className="p-3">وضعیت بقا</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-700">{rec.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{rec.firstName} {rec.lastName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{rec.nationalId} ({rec.age} ساله)</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{rec.cancerTypeNameFa}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{rec.clinicalStage} ({rec.tnmT}{rec.tnmN}{rec.tnmM})</td>
                      <td className="p-3 text-[11px] text-slate-600 font-mono">
                        ER: {rec.erStatus === 'positive' ? `+ (${rec.erPercent}%)` : '-'} · HER2: {rec.her2Status}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {rec.vitalStatus === 'alive_ned' ? 'زنده (NED)' : 'تحت درمان'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedPreviewRecord(rec)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده کامل</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Record Preview Modal */}
      {selectedPreviewRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-right shadow-2xl border border-slate-200 relative my-6">
            <button
              onClick={() => setSelectedPreviewRecord(null)}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              ×
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                {selectedPreviewRecord.id}
              </span>
              <h3 className="text-base font-black text-slate-900">
                خلاصه بالینی پرونده: {selectedPreviewRecord.firstName} {selectedPreviewRecord.lastName}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border mb-4">
              <div><span className="text-slate-500">کد ملی:</span> <span className="font-mono font-bold">{selectedPreviewRecord.nationalId}</span></div>
              <div><span className="text-slate-500">سن:</span> <span className="font-mono">{selectedPreviewRecord.age} سال</span></div>
              <div><span className="text-slate-500">شهر:</span> <span>{selectedPreviewRecord.city}</span></div>
              <div><span className="text-slate-500">نوع سرطان:</span> <span className="font-bold text-pink-700">{selectedPreviewRecord.cancerTypeNameFa}</span></div>
              <div><span className="text-slate-500">کد ICD-10:</span> <span className="font-mono">{selectedPreviewRecord.icd10Code}</span></div>
              <div><span className="text-slate-500">استیج TNM:</span> <span className="font-mono font-bold text-indigo-700">{selectedPreviewRecord.clinicalStage}</span></div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 mb-4">
              <div className="p-3 bg-white rounded-xl border">
                <strong>پاتولوژی و بیومارکرها:</strong> {selectedPreviewRecord.histologicType} — گرید {selectedPreviewRecord.tumorGrade} — ER: {selectedPreviewRecord.erStatus} ({selectedPreviewRecord.erPercent}%) — PR: {selectedPreviewRecord.prStatus} — HER2: {selectedPreviewRecord.her2Status} — Ki67: {selectedPreviewRecord.ki67Percent}%
              </div>
              <div className="p-3 bg-white rounded-xl border">
                <strong>پروتکل درمانی:</strong> {selectedPreviewRecord.surgeryType} — شیمی‌درمانی: {selectedPreviewRecord.chemotherapyRegimen} — هورمون‌تراپی: {selectedPreviewRecord.hormonalTherapy}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedPreviewRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
