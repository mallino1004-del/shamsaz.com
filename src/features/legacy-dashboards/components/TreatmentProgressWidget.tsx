/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  AlertCircle, 
  HelpCircle, 
  HeartPulse, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Printer, 
  Eye, 
  Check, 
  Stethoscope,
  Award,
  Layers,
  FlaskConical,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { TreatmentProgressDataPoint, NotificationItem } from '../../../types';
import { MOCK_TREATMENT_PROGRESS } from '../../../data/mockData';

interface TreatmentProgressWidgetProps {
  onTriggerNotification?: (notif: NotificationItem) => void;
  onOpenTelemedicine?: () => void;
}

export const TreatmentProgressWidget: React.FC<TreatmentProgressWidgetProps> = ({
  onTriggerNotification,
  onOpenTelemedicine
}) => {
  const [dataPoints, setDataPoints] = useState<TreatmentProgressDataPoint[]>(MOCK_TREATMENT_PROGRESS);
  const [activeMetricTab, setActiveMetricTab] = useState<'recist_response' | 'tumor_markers' | 'hematology_cbc' | 'liver_safety'>('recist_response');
  const [chartVisualMode, setChartVisualMode] = useState<'area' | 'line'>('area');
  const [selectedMilestone, setSelectedMilestone] = useState<TreatmentProgressDataPoint | null>(null);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  // New Lab Record Modal State
  const [newDateFa, setNewDateFa] = useState('۱۴۰۳/۰۹/۱۰');
  const [newCycleName, setNewCycleName] = useState('چکاپ ۳ ماهه هورمون‌تراپی');
  const [newTumorSize, setNewTumorSize] = useState('0');
  const [newCa153, setNewCa153] = useState('15.8');
  const [newCea, setNewCea] = useState('1.4');
  const [newHgb, setNewHgb] = useState('13.1');
  const [newWbc, setNewWbc] = useState('6.4');
  const [newPlatelets, setNewPlatelets] = useState('240');
  const [newQol, setNewQol] = useState('95');
  const [newNotes, setNewNotes] = useState('نتیجه چکاپ دوره‌ای و بیومارکرهای سلامت');

  const latestPoint = dataPoints[dataPoints.length - 1];
  const baselinePoint = dataPoints[0];

  const overallTumorReduction = baselinePoint?.tumorSizeMm && baselinePoint.tumorSizeMm > 0
    ? Math.round(((baselinePoint.tumorSizeMm - (latestPoint?.tumorSizeMm || 0)) / baselinePoint.tumorSizeMm) * 100)
    : 100;

  const ca153Reduction = baselinePoint?.ca153 && latestPoint?.ca153
    ? Math.round(((baselinePoint.ca153 - latestPoint.ca153) / baselinePoint.ca153) * 100)
    : 0;

  // Custom Persian Tooltip for Treatment Progress Recharts
  const CustomTreatmentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const match = dataPoints.find(d => d.cycleName === label || d.dateFa === label);
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-right text-xs space-y-2 backdrop-blur-md max-w-xs" dir="rtl">
          <div className="border-b border-slate-700/80 pb-1.5 flex items-center justify-between gap-3">
            <span className="font-bold text-teal-300">{label}</span>
            {match && <span className="text-[10px] text-slate-400 font-mono">{match.dateFa}</span>}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
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
          {match?.milestoneEvent && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20 mt-1">
              <strong>رویداد بالینی: </strong>
              {match.milestoneEvent}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleAddLabRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: TreatmentProgressDataPoint = {
      id: `tp-${Date.now()}`,
      dateFa: newDateFa,
      cycleName: newCycleName,
      phaseType: 'maintenance',
      phaseTypeFa: 'پایش دوره‌ای درمان',
      tumorSizeMm: parseFloat(newTumorSize) || 0,
      tumorReductionPercent: 100,
      recistStatus: 'CR',
      recistStatusFa: 'پاسخ کامل بالینی (CR)',
      ca153: parseFloat(newCa153) || undefined,
      cea: parseFloat(newCea) || undefined,
      hemoglobin: parseFloat(newHgb) || undefined,
      wbc: parseFloat(newWbc) || undefined,
      platelets: parseFloat(newPlatelets) || undefined,
      qualityOfLifeScore: parseInt(newQol, 10) || 95,
      ecogScore: 0,
      milestoneEvent: 'ثبت آزمایش دوره‌ای جدید توسط بیمار و انکولوژیست',
      clinicalNotes: newNotes
    };

    setDataPoints(prev => [...prev, newRecord]);
    setIsAddRecordModalOpen(false);

    if (onTriggerNotification) {
      onTriggerNotification({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'نتایج آزمایش دوره‌ای جدید ثبت شد',
        message: `سنجش ${newCycleName} با موفقیت در نمودار پاسخ به درمان بیمار مریم احمدی درج گردید.`,
        timestamp: 'همین الان',
        read: false,
        priority: 'normal',
      });
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* =========================================================================
          SECTION 1: HIGH-LEVEL CLINICAL RESPONSE HERO BANNER
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-emerald-900 via-teal-900 to-indigo-950 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>پاسخ بالینی کامل و عاری از بیماری (CR / NED)</span>
              </span>
              <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-slate-300">
                RECIST Criteria v1.1
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              تحلیل جامع روند پاسخ به درمان و آزمایش‌های دوره‌ای
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              پایش ۶ دوره درمانی شامل شیمی‌درمانی نئوادجوانت، جراحی پستان، رادیوتراپی و فاز نگهدارنده هورمونی. کلیه تومور مارکرها و آزمایش‌های هماتولوژی در محدوده کاملاً ایمن و تثبیت‌شده قرار دارند.
            </p>
          </div>

          {/* Quick Metrics Badges Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="text-[11px] text-slate-300 font-medium">کاهش اندازه تومور</div>
              <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-0.5">
                {overallTumorReduction}٪-
              </div>
              <div className="text-[10px] text-emerald-200">از ۳۴mm به صفر (NED)</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center">
              <div className="text-[11px] text-slate-300 font-medium">افت مارکر CA 15-3</div>
              <div className="text-2xl font-black text-teal-300 font-mono tabular-nums mt-0.5">
                {latestPoint?.ca153 || 16.2}
              </div>
              <div className="text-[10px] text-teal-200">نرمال &lt; ۳۰ U/mL ({ca153Reduction}٪- افت)</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-300 font-medium">شاخص کیفیت زندگی</div>
              <div className="text-2xl font-black text-amber-300 font-mono tabular-nums mt-0.5">
                {latestPoint?.qualityOfLifeScore || 94}٪
              </div>
              <div className="text-[10px] text-amber-200">وضعیت عملکردی: کاملاً فعال (ECOG 0)</div>
            </div>
          </div>
        </div>

        {/* Milestone Steps Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
            <span>گاه‌شمار دوره‌های بالینی و نقاط عطف درمان:</span>
            <span className="text-[11px] text-teal-300 font-normal">کلیک بر روی هر دوره جهت مشاهده جزئیات</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {dataPoints.map((pt, idx) => {
              const isSelected = selectedMilestone?.id === pt.id;
              const isLatest = idx === dataPoints.length - 1;

              return (
                <button
                  key={pt.id}
                  onClick={() => setSelectedMilestone(isSelected ? null : pt)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white shadow-lg ring-2 ring-teal-400'
                      : isLatest
                      ? 'bg-emerald-600/30 border-emerald-400/40 text-white hover:bg-emerald-600/40'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                    <span>گام ۰{idx + 1}</span>
                    <span>{pt.dateFa}</span>
                  </div>
                  <div className={`text-xs font-bold mt-1 truncate ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                    {pt.cycleName.split('(')[0]}
                  </div>
                  <div className={`text-[10px] mt-0.5 font-mono ${
                    pt.recistStatus === 'CR' ? 'text-emerald-300 font-bold' : 'text-amber-300'
                  }`}>
                    {pt.recistStatusFa}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Details Popup Strip */}
          {selectedMilestone && (
            <div className="mt-3 p-4 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-indigo-900">{selectedMilestone.cycleName}</span>
                  <span className="text-[11px] font-mono text-slate-500">({selectedMilestone.dateFa})</span>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                    {selectedMilestone.phaseTypeFa}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  <strong>رویداد بالینی: </strong>
                  {selectedMilestone.milestoneEvent || 'ثبت منظم آزمایش‌ها و ارزیابی در کمیسیون'}
                </p>
                {selectedMilestone.clinicalNotes && (
                  <p className="text-slate-500 text-[11px]">
                    <strong>یادداشت پزشک: </strong>
                    {selectedMilestone.clinicalNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                {selectedMilestone.tumorSizeMm !== undefined && (
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500">اندازه تومور</div>
                    <div className="font-bold text-slate-900">{selectedMilestone.tumorSizeMm} mm</div>
                  </div>
                )}
                {selectedMilestone.ca153 && (
                  <div className="bg-teal-50 p-2 rounded-lg border border-teal-200 text-center text-teal-800">
                    <div className="text-[10px] text-teal-600">CA 15-3</div>
                    <div className="font-bold">{selectedMilestone.ca153} U/mL</div>
                  </div>
                )}
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: INTERACTIVE METRIC TABS & RECHARTS ENGINE
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Tab 1: RECIST Response & Tumor Size */}
            <button
              onClick={() => setActiveMetricTab('recist_response')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMetricTab === 'recist_response'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>پاسخ تومور و اندازه ضایعه (معیار بالینی RECIST)</span>
            </button>

            {/* Tab 2: Tumor Markers */}
            <button
              onClick={() => setActiveMetricTab('tumor_markers')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMetricTab === 'tumor_markers'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>مارکرهای سرطانی (CA 15-3 & CEA)</span>
            </button>

            {/* Tab 3: Hematology CBC */}
            <button
              onClick={() => setActiveMetricTab('hematology_cbc')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMetricTab === 'hematology_cbc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>شمارش گلبول‌های خون (آزمایش CBC)</span>
            </button>

            {/* Tab 4: Liver & General Safety */}
            <button
              onClick={() => setActiveMetricTab('liver_safety')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMetricTab === 'liver_safety'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>آنزیم‌های کبد و کیفیت زندگی</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Visual Chart Mode (Area vs Line) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setChartVisualMode('area')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  chartVisualMode === 'area' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                پهنه پر (Area)
              </button>
              <button
                onClick={() => setChartVisualMode('line')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  chartVisualMode === 'line' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                خطی دقیق (Line)
              </button>
            </div>

            {/* Add Record Button */}
            <button
              onClick={() => setIsAddRecordModalOpen(true)}
              className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-700" />
              <span>ثبت نتیجه آزمایش دوره‌ای</span>
            </button>
          </div>
        </div>

        {/* Clinical Explanatory Insight Banner for Current Metric */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5 text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              {activeMetricTab === 'recist_response' && (
                <>
                  <span className="font-bold text-slate-900">تحلیل پاسخ تومور براساس RECIST: </span>
                  قطر ماکزیمم تومور اولیه پستان از ۳۴ میلی‌متر با رژیم نئوادجوانت به ۱۴ میلی‌متر (۵۹٪ پاسخ) کاهش یافته و پس از جراحی حفظ پستان و پرتودرمانی به پاسخ بالینی کامل (CR / 0 mm) رسیده است.
                </>
              )}
              {activeMetricTab === 'tumor_markers' && (
                <>
                  <span className="font-bold text-slate-900">تحلیل اختصاصی بیومارکرهای پستان (CA 15-3 و CEA): </span>
                  مارکر CA 15-3 از سطح اولیه ۴۲.۵ U/mL (بالاتر از نرمال) به تدریج کاهش یافته و اکنون در سطح پایدار ۱۶.۲ U/mL (کاملاً پایین‌تر از آستانه خطر ۳۰) تثبیت شده است. مارکر CEA نیز از ۳.۸ به ۱.۵ ng/mL نزول کرده است.
                </>
              )}
              {activeMetricTab === 'hematology_cbc' && (
                <>
                  <span className="font-bold text-slate-900">پایش ایمنی و سلول‌های خونی (CBC): </span>
                  افت دوره‌ای هموگلوبین (تا ۱۱.۲) و لکوپنی خفیف در فاز شیمی‌درمانی به خوبی مدیریت شده و اکنون هموگلوبین به ۱۲.۹ g/dL و پلاکت‌ها به ۲۳۶ هزار رسیده که نشان‌دهنده احیای کامل مغز استخوان است.
                </>
              )}
              {activeMetricTab === 'liver_safety' && (
                <>
                  <span className="font-bold text-slate-900">پایش آنزیم‌های کبد (AST/ALT) و کیفیت زندگی: </span>
                  عملکرد کبدی در سراسر دوره مصرف تاموکسیفن و درمان‌های قبلی کاملاً در محدوده فیزیولوژیک زیر ۳۵ IU/L باقی مانده است. شاخص کیفیت زندگی بیمار از ۶۸٪ به ۹۴٪ ارتقا یافته است.
                </>
              )}
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
            مورد تأیید انکولوژیست
          </span>
        </div>

        {/* RECHARTS CANVAS CONTAINER */}
        <div className="h-80 w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-200/80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartVisualMode === 'area' ? (
              <AreaChart data={dataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTumorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTumorReduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCa153Prog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCeaProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHgb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorQol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dateFa" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTreatmentTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                {/* Tab 1: RECIST */}
                {activeMetricTab === 'recist_response' && (
                  <>
                    <ReferenceLine y={0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'پاسخ کامل (NED)', fill: '#10b981', fontSize: 10 }} />
                    <Area type="monotone" dataKey="tumorSizeMm" name="قطر تومور پستان (میلی‌متر)" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTumorSize)" unit=" mm" dot={{ r: 4, fill: '#ef4444' }} />
                    <Area type="monotone" dataKey="tumorReductionPercent" name="درصد پسرفت تومور (٪)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTumorReduction)" unit=" ٪" dot={{ r: 3, fill: '#10b981' }} />
                  </>
                )}

                {/* Tab 2: Tumor Markers */}
                {activeMetricTab === 'tumor_markers' && (
                  <>
                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'آستانه نرمال CA 15-3 (30 U/mL)', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={3.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'آستانه نرمال CEA (3.0 ng/mL)', fill: '#d97706', fontSize: 10 }} />
                    <Area type="monotone" dataKey="ca153" name="مارکر CA 15-3 (U/mL)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCa153Prog)" unit=" U/mL" dot={{ r: 4, fill: '#0d9488' }} />
                    <Area type="monotone" dataKey="cea" name="مارکر CEA (ng/mL)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCeaProg)" unit=" ng/mL" dot={{ r: 3, fill: '#6366f1' }} />
                  </>
                )}

                {/* Tab 3: Hematology */}
                {activeMetricTab === 'hematology_cbc' && (
                  <>
                    <ReferenceLine y={12} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'حداقل هموگلوبین نرمال (۱۲)', fill: '#10b981', fontSize: 10 }} />
                    <Area type="monotone" dataKey="hemoglobin" name="هموگلوبین (g/dL)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHgb)" unit=" g/dL" dot={{ r: 4, fill: '#f43f5e' }} />
                    <Area type="monotone" dataKey="wbc" name="گلبول سفید WBC (x10³/µL)" stroke="#6366f1" strokeWidth={2} fill="none" unit=" k/µL" dot={{ r: 3, fill: '#6366f1' }} />
                  </>
                )}

                {/* Tab 4: Liver & QoL */}
                {activeMetricTab === 'liver_safety' && (
                  <>
                    <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'حداکثر آنزیم مجاز کبد (۳۵)', fill: '#ef4444', fontSize: 10 }} />
                    <Area type="monotone" dataKey="qualityOfLifeScore" name="امتیاز کیفیت زندگی (از ۱۰۰)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQol)" unit=" ٪" dot={{ r: 4, fill: '#f59e0b' }} />
                    <Area type="monotone" dataKey="ast" name="آنزیم کبدی AST (IU/L)" stroke="#06b6d4" strokeWidth={2} fill="none" unit=" IU/L" dot={{ r: 3, fill: '#06b6d4' }} />
                    <Area type="monotone" dataKey="alt" name="آنزیم کبدی ALT (IU/L)" stroke="#8b5cf6" strokeWidth={2} fill="none" unit=" IU/L" dot={{ r: 3, fill: '#8b5cf6' }} />
                  </>
                )}
              </AreaChart>
            ) : (
              <LineChart data={dataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dateFa" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTreatmentTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                {activeMetricTab === 'recist_response' && (
                  <>
                    <Line type="monotone" dataKey="tumorSizeMm" name="قطر تومور پستان (mm)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tumorReductionPercent" name="درصد کاهش تومور (٪)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </>
                )}

                {activeMetricTab === 'tumor_markers' && (
                  <>
                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="ca153" name="مارکر CA 15-3 (U/mL)" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="cea" name="مارکر CEA (ng/mL)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                )}

                {activeMetricTab === 'hematology_cbc' && (
                  <>
                    <Line type="monotone" dataKey="hemoglobin" name="هموگلوبین (g/dL)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="wbc" name="گلبول‌های سفید WBC (k/µL)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="platelets" name="پلاکت خون (x10³/µL)" stroke="#10b981" strokeWidth={1.5} dot={{ r: 2 }} />
                  </>
                )}

                {activeMetricTab === 'liver_safety' && (
                  <>
                    <Line type="monotone" dataKey="qualityOfLifeScore" name="کیفیت زندگی (٪)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ast" name="آنزیم کبدی AST (IU/L)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="alt" name="آنزیم کبدی ALT (IU/L)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Periodic Lab Results History Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>جدول ارزیابی‌های بالینی و آزمایشگاهی دوره‌ای:</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {dataPoints.length} نوبت آزمایش ثبت‌شده
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">تاریخ</th>
                  <th className="py-2.5 px-3">دوره درمان</th>
                  <th className="py-2.5 px-3">وضعیت RECIST</th>
                  <th className="py-2.5 px-3">اندازه تومور</th>
                  <th className="py-2.5 px-3">CA 15-3</th>
                  <th className="py-2.5 px-3">هموگلوبین</th>
                  <th className="py-2.5 px-3">WBC</th>
                  <th className="py-2.5 px-3">پلاکت</th>
                  <th className="py-2.5 px-3">رویداد بالینی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataPoints.slice().reverse().map((dp) => (
                  <tr key={dp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{dp.dateFa}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{dp.cycleName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dp.recistStatus === 'CR' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {dp.recistStatusFa}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {dp.tumorSizeMm !== undefined ? `${dp.tumorSizeMm} mm` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-700">
                      {dp.ca153 ? `${dp.ca153} U/mL` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-700">
                      {dp.hemoglobin ? `${dp.hemoglobin} g/dL` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700">
                      {dp.wbc ? `${dp.wbc} k/µL` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {dp.platelets ? `${dp.platelets} k/µL` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                      {dp.milestoneEvent || 'چکاپ روتین'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MODAL: ADD NEW PERIODIC LAB RECORD
          ========================================================================= */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">ثبت نتایج آزمایش دوره‌ای جدید</h3>
              </div>
              <button 
                onClick={() => setIsAddRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLabRecord} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">تاریخ انجام آزمایش:</label>
                  <input
                    type="text"
                    value={newDateFa}
                    onChange={(e) => setNewDateFa(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                    placeholder="۱۴۰۳/۰۹/۱۰"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">عنوان دوره / آزمایشگاه:</label>
                  <input
                    type="text"
                    value={newCycleName}
                    onChange={(e) => setNewCycleName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
                    placeholder="چکاپ دوره‌ای ۳ ماهه"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">سایز توده (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTumorSize}
                    onChange={(e) => setNewTumorSize(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">مارکر CA 15-3:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCa153}
                    onChange={(e) => setNewCa153(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="15.8"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">مارکر CEA:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCea}
                    onChange={(e) => setNewCea(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="1.4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">هموگلوبین (g/dL):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHgb}
                    onChange={(e) => setNewHgb(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="13.1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">WBC (k/µL):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWbc}
                    onChange={(e) => setNewWbc(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="6.4"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">پلاکت (k/µL):</label>
                  <input
                    type="number"
                    value={newPlatelets}
                    onChange={(e) => setNewPlatelets(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs"
                    placeholder="240"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-600 font-medium mb-1">توضیحات و یادداشت بالینی:</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs resize-none"
                  placeholder="یادداشت بیمار یا نتیجه آزمایشگاه..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ثبت در پرونده بیمار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
