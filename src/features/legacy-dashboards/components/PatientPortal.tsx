/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Video, 
  ShieldCheck, 
  ShieldAlert,
  PhoneCall,
  Bell, 
  Building2, 
  X, 
  CheckCircle2,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
  Activity,
  HeartPulse,
  Scale,
  Pill,
  RefreshCw,
  Plus,
  AlertTriangle,
  Send,
  Download,
  Printer,
  Check,
  Stethoscope,
  Info,
  Truck,
  QrCode,
  Ribbon,
  User
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { Appointment, HealthMetricDataPoint, PatientPrescription, NotificationItem, ScreeningReport } from '../../../types';
import { MOCK_HEALTH_METRICS, MOCK_PRESCRIPTIONS } from '../../../data/mockData';
import { MedicalReportModal } from './MedicalReportModal';
import { EmergencyModal } from '../../screening/components/EmergencyModal';
import { TreatmentProgressWidget } from './TreatmentProgressWidget';
import { MedicationTrackerSection } from './MedicationTrackerSection';
import { RoleProfileManager } from '../../../components/RoleProfileManager';

interface PatientPortalProps {
  appointments: Appointment[];
  screeningReports?: ScreeningReport[];
  onOpenTelemedicine: () => void;
  onBookNew: () => void;
  onCancelAppointment: (id: string) => void;
  onTriggerNotification?: (notif: NotificationItem) => void;
  onBrowseMedicalCenters?: () => void;
  onStartNewScreening?: () => void;
  patientName?: string;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  appointments,
  screeningReports = [],
  patientName = 'مریم احمدی',
  onOpenTelemedicine,
  onBookNew,
  onCancelAppointment,
  onTriggerNotification,
  onBrowseMedicalCenters,
  onStartNewScreening,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'treatment_progress' | 'medication_tracker' | 'trends' | 'prescriptions' | 'appointments' | 'records' | 'profile'>('treatment_progress');
  
  // Health metrics data & active metric view
  const [healthMetrics, setHealthMetrics] = useState<HealthMetricDataPoint[]>(MOCK_HEALTH_METRICS);
  const [activeMetricType, setActiveMetricType] = useState<'tumor_markers' | 'blood_pressure' | 'weight_bmi'>('tumor_markers');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [isLogMetricOpen, setIsLogMetricOpen] = useState(false);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>(MOCK_PRESCRIPTIONS);
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [refillModalMed, setRefillModalMed] = useState<PatientPrescription | null>(null);
  const [refillDeliveryType, setRefillDeliveryType] = useState<'sms_code' | 'home_delivery'>('sms_code');
  const [refillNotes, setRefillNotes] = useState('');
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  // Log new metric form state
  const [newMetricDate, setNewMetricDate] = useState('۱۴۰۳/۰۹/۰۱');
  const [newWeight, setNewWeight] = useState('64.8');
  const [newSystolic, setNewSystolic] = useState('116');
  const [newDiastolic, setNewDiastolic] = useState('75');
  const [newPulse, setNewPulse] = useState('70');
  const [newCa153, setNewCa153] = useState('16.2');
  const [newCea, setNewCea] = useState('1.6');
  const [newMetricNotes, setNewMetricNotes] = useState('نتیجه چکاپ آزمایشگاهی ماهانه');

  // Modal states
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [fileUploadedMsg, setFileUploadedMsg] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const patientRecords = [
    { id: 'rec-1', title: 'سونوگرافی غربالگری پستان و اگزیلا', date: '۱۴۰۳/۰۸/۱۰', center: 'بیمارستان مهر تهران', doctor: 'دکتر مهران اکبری', status: 'تایید شده' },
    { id: 'rec-2', title: 'پاپ اسمیر و تست HPV High-Risk', date: '۱۴۰۳/۰۷/۱۵', center: 'کلینیک سلامت', doctor: 'دکتر سمیرا احمدی', status: 'طبیعی (Negative)' },
    { id: 'rec-3', title: 'نتیجه آزمایش خون کامل (CBC) و مارکرها', date: '۱۴۰۳/۰۶/۲۸', center: 'آزمایشگاه پاتوبیولوژی', doctor: 'دکتر علی رضایی', status: 'بررسی شده' },
  ];

  // Filtered prescriptions list
  const filteredPrescriptions = prescriptions.filter((p) => {
    if (prescriptionFilter === 'active') return p.status === 'active' || p.status === 'expiring_soon' || p.status === 'refill_requested';
    if (prescriptionFilter === 'completed') return p.status === 'completed';
    return true;
  });

  // Handle logging a new metric reading
  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const newPoint: HealthMetricDataPoint = {
      id: `hm-${Date.now()}`,
      dateFa: newMetricDate,
      timestamp: Date.now(),
      weight: parseFloat(newWeight) || undefined,
      bmi: parseFloat(newWeight) ? parseFloat((parseFloat(newWeight) / 2.65).toFixed(1)) : undefined,
      systolic: parseInt(newSystolic, 10) || undefined,
      diastolic: parseInt(newDiastolic, 10) || undefined,
      pulse: parseInt(newPulse, 10) || undefined,
      ca153: parseFloat(newCa153) || undefined,
      cea: parseFloat(newCea) || undefined,
      notes: newMetricNotes,
    };

    setHealthMetrics(prev => [...prev, newPoint]);
    setIsLogMetricOpen(false);

    // Trigger feedback notification
    if (onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'شاخص سلامت جدید ثبت شد',
        message: `سنجش جدید برای تاریخ ${newMetricDate} با موفقیت در نمودار پرونده اعمال گردید.`,
        timestamp: 'همین الان',
        read: false,
        priority: 'normal',
      });
    }
  };

  // Handle submitting refill request
  const handleConfirmRefill = () => {
    if (!refillModalMed) return;

    setPrescriptions(prev => prev.map(p => {
      if (p.id === refillModalMed.id) {
        return {
          ...p,
          status: 'refill_requested',
          refillCount: p.refillCount + 1,
        };
      }
      return p;
    }));

    const medName = refillModalMed.medicationNameFa;
    const docName = refillModalMed.prescribingDoctor;
    setRefillModalMed(null);
    setRefillSuccessMsg(`درخواست تمدید برای «${medName}» با موفقیت برای ${docName} ارسال شد و کد پیگیری صادر گردید.`);
    setTimeout(() => setRefillSuccessMsg(null), 5000);

    // Notify user
    if (onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'درخواست تمدید نسخه ثبت گردید',
        message: `درخواست تمدید برای داروی ${medName} به کارتابل ${docName} ارسال شد و پس از تایید نهایی پیامک خواهد شد.`,
        timestamp: 'همین الان',
        read: false,
        priority: 'high',
        actionTarget: 'patient-portal',
        actionLabel: 'مشاهده وضعیت نسخه',
      });
    }
  };

  // Custom Recharts Tooltip in Persian
  const CustomRechartsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700/80 text-right text-xs space-y-1.5 backdrop-blur-md" dir="rtl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1 gap-4">
            <span className="font-bold text-teal-300">تاریخ: {label}</span>
            <span className="text-[10px] text-slate-400 font-mono">سنجش دوره‌ای</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold font-mono text-white tabular-nums">
                {entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const latestMetric = healthMetrics[healthMetrics.length - 1] || {};
  const earliestMetric = healthMetrics[0] || {};
  const ca153Reduction = earliestMetric.ca153 && latestMetric.ca153 
    ? Math.round(((earliestMetric.ca153 - latestMetric.ca153) / earliestMetric.ca153) * 100) 
    : 0;

  return (
    <div className="py-8 bg-slate-50 min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-l from-indigo-800 via-indigo-700 to-teal-700 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-teal-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>میز جامع سلامت فردی و پرونده بالینی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              سلام مریم جان، روزتون بخیر!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
              پرونده شما در پلتفرم سلامت شمساز فعال است؛ بیومارکرها، نمودار روند بهبودی و تمدید داروهای شما به صورت هوشمند مدیریت می‌شود.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            {/* One-Touch Emergency SOS Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer border border-white/20 animate-pulse hover:animate-none scale-100 hover:scale-105 active:scale-95"
              title="اورژانس تک‌لمسی - کارت پزشکی و تماس فوری"
              aria-label="اورژانس تک‌لمسی"
            >
              <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
              </div>
              <span>اورژانس فوری (SOS)</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="تولید خلاصه پرونده رسمی PDF"
            >
              <FileText className="w-4 h-4 text-teal-300" />
              <span>خلاصه پرونده الکترونیک (PDF)</span>
            </button>
            <button
              onClick={onBookNew}
              className="py-2.5 px-4.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              رزرو نوبت جدید
            </button>
            <button
              onClick={onOpenTelemedicine}
              className="py-2.5 px-4.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>ورود به ویزیت آنلاین</span>
            </button>

            {onStartNewScreening && (
              <button
                onClick={onStartNewScreening}
                className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Ribbon className="w-4 h-4 text-pink-200" />
                <span>غربالگری هوشمند علائم</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Success Notification banner if refill placed */}
        {refillSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{refillSuccessMsg}</span>
            </div>
            <button onClick={() => setRefillSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Card 1: Appointments */}
          <div 
            onClick={() => setActiveTab('appointments')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'appointments' ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10' : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">نوبت‌های پیش رو:</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2 font-mono tabular-nums">
              {appointments.length} نوبت فعال
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">یک ویزیت حضوری، دو مشاوره آنلاین</span>
          </div>

          {/* Card 2: Treatment Progress & Tumor Markers */}
          <div 
            onClick={() => setActiveTab('treatment_progress')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'treatment_progress' ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">تحلیل پیشرفت درمانی (RECIST):</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2 font-mono tabular-nums flex items-baseline gap-2">
              <span>۱۰۰٪ بهبودی (CR)</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <TrendingDown className="w-3 h-3" />
                <span>{ca153Reduction}٪-</span>
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">پاسخ بالینی کامل و عاری از بیماری (NED)</span>
          </div>

          {/* Card 3: Medication Tracker */}
          <div 
            onClick={() => setActiveTab('medication_tracker')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'medication_tracker' ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10' : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">مدیریت داروها و یادآورها:</span>
              <Pill className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2 font-mono tabular-nums flex items-baseline gap-2">
              <span>۴ یادآور فعال</span>
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">۵۰٪ مصرف امروز</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">پایش پایبندی و ثبت عوارض جانبی</span>
          </div>

          {/* Card 4: Upcoming Checkup */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">چکاپ بعدی سونوگرافی:</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700 mt-2 font-mono tabular-nums">
              ۲۰ روز دیگر
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">موعد سونوگرافی کنترل پستان و کبد</span>
          </div>

        </div>

        {/* Main Content Card with Modern Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          
          {/* Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              
              {/* Tab 1: Treatment Progress Analysis */}
              <button
                onClick={() => setActiveTab('treatment_progress')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'treatment_progress' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>تحلیل پیشرفت درمانی و بهبودی</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold">پایش ۶ دوره</span>
              </button>

              {/* Tab 2: Medication Tracker & Side Effects */}
              <button
                onClick={() => setActiveTab('medication_tracker')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'medication_tracker' 
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>مدیریت و یادآور داروها</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'medication_tracker' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  یادآور + عوارض
                </span>
              </button>

              {/* Tab 3: Health Trends Chart */}
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'trends' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>روند بیومارکرها و شاخص‌ها</span>
              </button>

              {/* Tab 4: Prescriptions & Refill */}
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'prescriptions' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>نسخه‌ها و تمدید آنلاین دارو</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'prescriptions' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  {prescriptions.filter(p => p.status === 'expiring_soon').length > 0 ? 'تمدید فوری' : prescriptions.length}
                </span>
              </button>

              {/* Tab 5: Appointments */}
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'appointments' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>نوبت‌های پیش رو ({appointments.length})</span>
              </button>

              {/* Tab 6: Records */}
              <button
                onClick={() => setActiveTab('records')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'records' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>پرونده‌ها و آزمایش‌ها ({patientRecords.length})</span>
              </button>

              {/* Tab 7: Patient Profile */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'profile' ? 'bg-rose-500 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 text-rose-300" />
                <span>پروفایل و اطلاعات پرونده بیمار</span>
              </button>

            </div>

            {/* Quick Actions in Header */}
            {activeTab === 'trends' && (
              <button
                onClick={() => setIsLogMetricOpen(true)}
                className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>ثبت سنجش جدید</span>
              </button>
            )}

            {activeTab === 'prescriptions' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setPrescriptionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    prescriptionFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  همه ({prescriptions.length})
                </button>
                <button
                  onClick={() => setPrescriptionFilter('active')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    prescriptionFilter === 'active' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  فعال و جاری ({prescriptions.filter(p => p.status !== 'completed').length})
                </button>
                <button
                  onClick={() => setPrescriptionFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    prescriptionFilter === 'completed' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  تکمیل‌شده گذشته ({prescriptions.filter(p => p.status === 'completed').length})
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: TREATMENT PROGRESS ANALYSIS WIDGET WITH RECHARTS */}
          {activeTab === 'treatment_progress' && (
            <TreatmentProgressWidget
              onTriggerNotification={onTriggerNotification}
              onOpenTelemedicine={onOpenTelemedicine}
            />
          )}

          {/* TAB 2: MEDICATION TRACKER & SIDE EFFECTS */}
          {activeTab === 'medication_tracker' && (
            <MedicationTrackerSection
              prescriptions={prescriptions}
              onTriggerNotification={onTriggerNotification}
              onRequestRefill={(med) => setRefillModalMed(med)}
              onOpenTelemedicine={onOpenTelemedicine}
            />
          )}

          {/* TAB 3: HEALTH TREND CHART USING RECHARTS */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              
              {/* Metric Type Selector Sub-bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">انتخاب شاخص سلامت:</span>
                  
                  <button
                    onClick={() => setActiveMetricType('tumor_markers')}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMetricType === 'tumor_markers'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>تومور مارکرها (CA 15-3 & CEA)</span>
                  </button>

                  <button
                    onClick={() => setActiveMetricType('blood_pressure')}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMetricType === 'blood_pressure'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>فشار خون و ضربان قلب</span>
                  </button>

                  <button
                    onClick={() => setActiveMetricType('weight_bmi')}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMetricType === 'weight_bmi'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>وزن بدن و BMI</span>
                  </button>
                </div>

                {/* Chart Style Switcher (Area vs Line) */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold self-end sm:self-auto">
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      chartType === 'area' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    نمودار پهنه‌ای (Area)
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      chartType === 'line' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    نمودار خطی (Line)
                  </button>
                </div>
              </div>

              {/* Chart Analysis Banner */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-teal-900 leading-relaxed">
                    {activeMetricType === 'tumor_markers' && (
                      <>
                        <span className="font-bold">تحلیل بالینی تومور مارکرها: </span>
                        مقدار مارکر اختصاصی پستان <span className="font-mono font-bold text-teal-800">CA 15-3</span> از ۴۲.۵ به ۱۷.۴ U/mL کاهش یافته است (۵۹٪- کاهش مطلوب). خط‌چین قرمز نشان‌دهنده آستانه سلامت (زیر ۳۰ U/mL) است که بیمار کاملاً در منطقه ایمن قرار دارد.
                      </>
                    )}
                    {activeMetricType === 'blood_pressure' && (
                      <>
                        <span className="font-bold">تحلیل بالینی همودینامیک: </span>
                        فشار سیستولیک و دیاستولیک بیمار از سطح مرزی (۱۳۵/۸۸) با اصلاح رژیم و داروی حمایتی به ۱۱۸/۷۶ mmHg به تعادل پایدار رسیده است.
                      </>
                    )}
                    {activeMetricType === 'weight_bmi' && (
                      <>
                        <span className="font-bold">تحلیل متابولیک و وزن: </span>
                        کاهش تدریجی و سالم ۳.۵ کیلوگرم وزن همراه با کاهش نمایه توده بدنی (BMI) به ۲۴.۴، ریسک عودهای وابسته به استروژن را به حداقل رسانده است.
                      </>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                  تأییدیه انکولوژیست
                </span>
              </div>

              {/* RECHARTS VISUAL CONTAINER */}
              <div className="h-80 w-full bg-slate-50/40 p-4 rounded-3xl border border-slate-200/80" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={healthMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCa153" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorCea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="dateFa" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomRechartsTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                      {/* Render based on metric type */}
                      {activeMetricType === 'tumor_markers' && (
                        <>
                          <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'آستانه نرمال CA 15-3 (30 U/mL)', fill: '#ef4444', fontSize: 10 }} />
                          <ReferenceLine y={3.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'آستانه نرمال CEA (3.0 ng/mL)', fill: '#d97706', fontSize: 10 }} />
                          <Area type="monotone" dataKey="ca153" name="مارکر CA 15-3 (U/mL)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCa153)" unit=" U/mL" dot={{ r: 4, fill: '#0d9488' }} activeDot={{ r: 6 }} />
                          <Area type="monotone" dataKey="cea" name="مارکر CEA (ng/mL)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCea)" unit=" ng/mL" dot={{ r: 3, fill: '#6366f1' }} />
                        </>
                      )}

                      {activeMetricType === 'blood_pressure' && (
                        <>
                          <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'سیستولیک هدف (۱۲۰)', fill: '#10b981', fontSize: 10 }} />
                          <ReferenceLine y={80} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'دیاستولیک هدف (۸۰)', fill: '#06b6d4', fontSize: 10 }} />
                          <Area type="monotone" dataKey="systolic" name="فشار سیستولیک (mmHg)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSys)" unit=" mmHg" dot={{ r: 4, fill: '#4f46e5' }} />
                          <Area type="monotone" dataKey="diastolic" name="فشار دیاستولیک (mmHg)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDia)" unit=" mmHg" dot={{ r: 3, fill: '#06b6d4' }} />
                          <Area type="monotone" dataKey="pulse" name="ضربان قلب (bpm)" stroke="#ec4899" strokeWidth={1.5} fill="none" unit=" bpm" dot={{ r: 2 }} />
                        </>
                      )}

                      {activeMetricType === 'weight_bmi' && (
                        <>
                          <Area type="monotone" dataKey="weight" name="وزن بدن (کیلوگرم)" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" unit=" kg" dot={{ r: 4, fill: '#d97706' }} />
                          <Area type="monotone" dataKey="bmi" name="نمایه توده بدنی (BMI)" stroke="#8b5cf6" strokeWidth={2} fill="none" unit=" kg/m²" dot={{ r: 3, fill: '#8b5cf6' }} />
                        </>
                      )}
                    </AreaChart>
                  ) : (
                    <LineChart data={healthMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="dateFa" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomRechartsTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                      {activeMetricType === 'tumor_markers' && (
                        <>
                          <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'حد مجاز CA 15-3', fill: '#ef4444', fontSize: 10 }} />
                          <Line type="monotone" dataKey="ca153" name="مارکر CA 15-3 (U/mL)" stroke="#0d9488" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                          <Line type="monotone" dataKey="cea" name="مارکر CEA (ng/mL)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                        </>
                      )}

                      {activeMetricType === 'blood_pressure' && (
                        <>
                          <Line type="monotone" dataKey="systolic" name="فشار سیستولیک" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} />
                          <Line type="monotone" dataKey="diastolic" name="فشار دیاستولیک" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="pulse" name="ضربان قلب" stroke="#ec4899" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                        </>
                      )}

                      {activeMetricType === 'weight_bmi' && (
                        <>
                          <Line type="monotone" dataKey="weight" name="وزن بدن (kg)" stroke="#d97706" strokeWidth={3} dot={{ r: 5 }} />
                          <Line type="monotone" dataKey="bmi" name="BMI" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                        </>
                      )}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Data Points History Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>جدول ثبت مقادیر آزمایشگاهی دوره‌ای</span>
                  <span className="text-[11px] text-slate-500 font-normal">تعداد نمونه‌ها: {healthMetrics.length} تاریخ</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50/60 text-slate-500 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-bold">تاریخ آزمایش</th>
                        <th className="py-2.5 px-4 font-bold">CA 15-3 (U/mL)</th>
                        <th className="py-2.5 px-4 font-bold">CEA (ng/mL)</th>
                        <th className="py-2.5 px-4 font-bold">فشار خون (mmHg)</th>
                        <th className="py-2.5 px-4 font-bold">وزن (kg)</th>
                        <th className="py-2.5 px-4 font-bold">یادداشت بالینی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {healthMetrics.slice().reverse().map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold font-mono text-slate-800">{m.dateFa}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-teal-700">
                            {m.ca153 ? `${m.ca153} U/mL` : '—'}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-indigo-700">
                            {m.cea ? `${m.cea} ng/mL` : '—'}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">
                            {m.systolic && m.diastolic ? `${m.systolic}/${m.diastolic}` : '—'}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-amber-700">
                            {m.weight ? `${m.weight} kg` : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                            {m.notes || 'سنجش روتین'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEDICATIONS & PRESCRIPTIONS SECTION WITH ORDER REFILL */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              
              {/* Informative Header Banner */}
              <div className="bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>سامانه مدیریت نسخه‌های دارویی و تمدید آنلاین (Order Refill)</span>
                  </h3>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    نسخه‌های فعال جاری خود را بررسی کرده و در صورت نزدیک شدن به اتمام دارو، با یک کلیک درخواست تمدید نسخه الکترونیک یا ارسال درب منزل ثبت کنید.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onBrowseMedicalCenters && (
                    <button
                      onClick={onBrowseMedicalCenters}
                      className="text-[11px] bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>بانک ۲۱۰ داروخانه و ۵۰ بیمارستان تهران</span>
                    </button>
                  )}
                  <span className="text-[11px] bg-white text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>متصل به سازمان غذا و دارو</span>
                  </span>
                </div>
              </div>

              {/* Medication Cards List */}
              <div className="space-y-3.5">
                {filteredPrescriptions.map((med) => {
                  const isExpiringSoon = med.status === 'expiring_soon';
                  const isCompleted = med.status === 'completed';
                  const isRefillRequested = med.status === 'refill_requested';
                  const remainingRefills = med.maxRefills - med.refillCount;

                  return (
                    <div
                      key={med.id}
                      className={`p-5 rounded-2xl border transition-all text-right ${
                        isExpiringSoon
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50/70 border-slate-200 text-slate-600 opacity-90'
                          : isRefillRequested
                          ? 'bg-indigo-50/50 border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Medication Info */}
                        <div className="space-y-2 flex-1">
                          
                          {/* Title & Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-slate-900">
                              {med.medicationNameFa}
                            </span>
                            <span className="text-xs text-slate-500 font-mono font-medium">
                              ({med.genericName})
                            </span>
                            
                            {/* Category Badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              med.category === 'oncology'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : med.category === 'supplements'
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {med.category === 'oncology' && 'درمان هورمونی / انکولوژی'}
                              {med.category === 'supplements' && 'مکمل محافظت استخوان'}
                              {med.category === 'supportive' && 'داروی حمایتی'}
                            </span>

                            {/* Status Badge */}
                            {isExpiringSoon && (
                              <span className="text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>{med.remainingDays} روز تا اتمام دارو</span>
                              </span>
                            )}

                            {isRefillRequested && (
                              <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                                <span>درخواست تمدید در کارتابل پزشک</span>
                              </span>
                            )}

                            {isCompleted && (
                              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                دوره تکمیل شده
                              </span>
                            )}
                          </div>

                          {/* Dosage & Doctor & Route info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <span className="text-slate-400">دستور مصرف:</span>
                              <span className="font-bold text-slate-900">{med.frequency}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-slate-400">پزشک تجویزکننده:</span>
                              <span className="font-semibold text-slate-900">{med.prescribingDoctor}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700">
                              <span className="text-slate-400">کد رهگیری نسخه بیمه:</span>
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50/70 px-1.5 py-0.2 rounded border border-indigo-100">
                                {med.insuranceTrackingCode}
                              </span>
                            </div>
                          </div>

                          {/* Clinical Patient Instructions */}
                          <p className="text-[11px] text-slate-600 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                            <span className="font-bold text-slate-800">توصیه پزشک: </span>
                            {med.instructions}
                          </p>

                          {/* Validity date & refill counter */}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                            <span>تاریخ نسخه: <strong className="font-mono text-slate-700">{med.prescriptionDate}</strong></span>
                            <span>·</span>
                            <span>اعتبار تا: <strong className="font-mono text-slate-700">{med.expirationDate}</strong></span>
                            <span>·</span>
                            <span>تعداد کل دارو: <strong className="text-slate-700">{med.totalQuantity}</strong></span>
                            {!isCompleted && (
                              <>
                                <span>·</span>
                                <span className="text-teal-700 font-bold">
                                  امکان تمدید: {remainingRefills} بار دیگر
                                </span>
                              </>
                            )}
                          </div>

                        </div>

                        {/* Order Refill Action Area */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                          
                          {/* ORDER REFILL BUTTON */}
                          {!isCompleted && med.refillAllowed && remainingRefills > 0 ? (
                            <button
                              onClick={() => setRefillModalMed(med)}
                              disabled={isRefillRequested}
                              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                                isExpiringSoon
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-500/30'
                                  : isRefillRequested
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 cursor-not-allowed opacity-80'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRefillRequested ? 'animate-spin' : ''}`} />
                              <span>{isRefillRequested ? 'درخواست ثبت شده' : 'درخواست تمدید نسخه (Order Refill)'}</span>
                            </button>
                          ) : isCompleted ? (
                            <span className="text-xs text-slate-400 py-2 px-3 bg-slate-100 rounded-xl text-center">
                              نیازمند ویزیت و معاینه مجدد
                            </span>
                          ) : null}

                          <button
                            onClick={() => {
                              alert(`کد نسخه الکترونیک: ${med.insuranceTrackingCode}\nبیمار: مریم احمدی\nپزشک: ${med.prescribingDoctor}\nدارو: ${med.medicationNameFa}\nتاریخ: ${med.prescriptionDate}`);
                            }}
                            className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-500" />
                            <span>مشاهده فیش نسخه بیمه‌ای</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: UPCOMING APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">نوبت‌های برنامه‌ریزی‌شده:</h3>
                <button
                  onClick={onBookNew}
                  className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  رزرو نوبت پزشک دیگر
                </button>
              </div>

              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{apt.doctorName}</span>
                      <span className="text-xs text-indigo-600 font-medium">({apt.doctorSpecialty})</span>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                        {apt.type === 'telemedicine' ? 'ویزیت آنلاین تصویری' : 'ویزیت حضوری'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{apt.date}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>ساعت: {apt.timeSlot}</span>
                      </span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        کد پیگیری: {apt.trackingCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 pt-1">
                      علت مراجعه: {apt.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.type === 'telemedicine' && (
                      <button
                        onClick={onOpenTelemedicine}
                        className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>ورود به اتاق ویزیت</span>
                      </button>
                    )}
                    <button
                      onClick={() => setCancelModalId(apt.id)}
                      className="py-2 px-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      لغو نوبت
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: UPLOADED RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="border border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-6 text-center">
                <Upload className="w-7 h-7 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">بارگذاری نتیجه آزمایش، سونوگرافی یا گزارش تصویربرداری جدید</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  فایل‌های مجاز: PDF, JPG, PNG, DICOM تا سقف ۲۵ مگابایت
                </p>
                <button
                  onClick={() => {
                    setFileUploadedMsg(true);
                    setTimeout(() => setFileUploadedMsg(false), 3000);
                  }}
                  className="mt-3 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  انتخاب فایل و ثبت در پرونده
                </button>
                {fileUploadedMsg && (
                  <p className="text-xs font-bold text-teal-600 mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>فایل با موفقیت رمزنگاری و در پرونده ذخیره گردید.</span>
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                {patientRecords.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-white transition-colors">
                    <div>
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.date} · مرکز: {r.center} · پزشک ناظر: {r.doctor}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 text-[10px]">
                        {r.status}
                      </span>
                      <button
                        onClick={() => alert(`دانلود سند: ${r.title}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600"
                        title="دانلود سند"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Smart Symptom Screening Reports Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ribbon className="w-4 h-4 text-pink-600" />
                    <h4 className="text-xs font-black text-slate-900">
                      کارنامه‌ها و گزارش‌های غربالگری هوشمند علائم (ثبت‌شده برای پزشک معالج)
                    </h4>
                  </div>
                  {onStartNewScreening && (
                    <button
                      onClick={onStartNewScreening}
                      className="text-xs font-bold text-pink-600 hover:text-pink-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>غربالگری جدید علائم</span>
                    </button>
                  )}
                </div>

                {screeningReports.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    تاکنون گزارش غربالگری برای این پرونده ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {screeningReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              report.triageLevel === 'urgent_red'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : report.triageLevel === 'moderate_yellow'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {report.triageLevel === 'urgent_red'
                                ? 'تریاژ قرمز (ارجاع فوری)'
                                : report.triageLevel === 'moderate_yellow'
                                ? 'تریاژ زرد (پیگیری اولویت‌دار)'
                                : 'تریاژ سبز (پایش دوره‌ای)'}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{report.suspectedOrganFa}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                            <span>کد سند: {report.id}</span>
                            <span>·</span>
                            <span>{report.createdAt}</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-2 text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900">علائم مثبت ثبت‌شده: </span>
                            <span>{report.primarySymptoms.join(' · ')}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                            <div className="font-bold text-indigo-900">اقدامات تشخیصی پیشنهادی برای پزشک معالج:</div>
                            <div className="text-slate-600">{report.recommendedDiagnostics.join(' | ')}</div>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            <strong>دستور ارجاع بالینی:</strong> {report.referralUrgency} — <strong>پزشک ناظر پیشنهادی:</strong> {report.assignedDoctorName || 'متخصص انکولوژی'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Patient Profile Form & Credentials */}
          {activeTab === 'profile' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <RoleProfileManager
                currentRole="patient"
                currentUserName="مریم احمدی"
                isEmbedded={true}
              />
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: ORDER REFILL MODAL */}
      {refillModalMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">ثبت درخواست تمدید نسخه (Order Refill)</h3>
                  <span className="text-[11px] text-slate-500 font-mono">کد نسخه: {refillModalMed.insuranceTrackingCode}</span>
                </div>
              </div>
              <button 
                onClick={() => setRefillModalMed(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Medication Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">{refillModalMed.medicationNameFa}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100">
                  {refillModalMed.category === 'oncology' ? 'داروی تخصصی انکولوژی' : 'داروی حمایتی'}
                </span>
              </div>
              <div className="text-slate-600 text-[11px]">
                ژنریک: <strong className="font-mono">{refillModalMed.genericName}</strong> | دوز: {refillModalMed.dosage}
              </div>
              <div className="text-slate-600 text-[11px]">
                پزشک معالج: <strong>{refillModalMed.prescribingDoctor}</strong> ({refillModalMed.doctorSpecialty})
              </div>
            </div>

            {/* Delivery Method Choice */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">شیوه دریافت و تحویل دارو:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefillDeliveryType('sms_code')}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    refillDeliveryType === 'sms_code'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    <span>کد الکترونیک پیامکی</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block font-normal leading-relaxed">
                    ارسال کد تایید به موبایل جهت دریافت از هر داروخانه کشور
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRefillDeliveryType('home_delivery')}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    refillDeliveryType === 'home_delivery'
                      ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" />
                    <span>پیک دارویی درب منزل</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block font-normal leading-relaxed">
                    تحویل مستقیم در بسته‌بندی محرمانه توسط داروخانه مرجع
                  </span>
                </button>
              </div>
            </div>

            {/* Patient Notes for Physician */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">یادداشت برای پزشک معالج (در صورت بروز عارضه یا توضیحات):</label>
              <textarea
                value={refillNotes}
                onChange={(e) => setRefillNotes(e.target.value)}
                placeholder="مثال: آزمایش‌های جدید پیوست شد، عارضه خاصی ندارم و دارو به خوبی تحمل می‌شود..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-indigo-500"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                فرصت تمدید: {refillModalMed.maxRefills - refillModalMed.refillCount} نوبت مجاز
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRefillModalMed(null)}
                  className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  onClick={handleConfirmRefill}
                  className="py-2 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white cursor-pointer shadow-md"
                >
                  تأیید و ارسال درخواست تمدید
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: LOG NEW HEALTH METRIC READING */}
      {isLogMetricOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveMetric}
            className="bg-white rounded-3xl max-w-md w-full p-6 text-right shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>ثبت سنجش سلامت دوره‌ای جدید</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsLogMetricOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">تاریخ آزمایش / سنجش:</label>
                <input
                  type="text"
                  value={newMetricDate}
                  onChange={(e) => setNewMetricDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-teal-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تومور مارکر CA 15-3 (U/mL):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCa153}
                    onChange={(e) => setNewCa153(e.target.value)}
                    placeholder="17.4"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-teal-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مارکر CEA (ng/mL):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCea}
                    onChange={(e) => setNewCea(e.target.value)}
                    placeholder="1.8"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سیستولیک:</label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دیاستولیک:</label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">وزن (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="65"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات و یادداشت مرکز آزمایشگاهی:</label>
                <input
                  type="text"
                  value={newMetricNotes}
                  onChange={(e) => setNewMetricNotes(e.target.value)}
                  placeholder="مثال: آزمایش پاتوبیولوژی مهر"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogMetricOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md"
              >
                افزودن به نمودار پرونده
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CANCELLATION CONFIRMATION */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-right shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">آیا از لغو این نوبت اطمینان دارید؟</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              با توجه به قوانین سامانه، لغو نوبت تا ۳۶ ساعت قبل از موعد مشمول استرداد کامل وجه می‌باشد.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCancelModalId(null)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  onCancelAppointment(cancelModalId);
                  setCancelModalId(null);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                تأیید لغو نوبت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MEDICAL SUMMARY REPORT PDF MODAL */}
      <MedicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        appointments={appointments}
      />

      {/* MODAL 5: ONE-TOUCH EMERGENCY MEDICAL SUMMARY & CONTACTS MODAL */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

    </div>
  );
};
