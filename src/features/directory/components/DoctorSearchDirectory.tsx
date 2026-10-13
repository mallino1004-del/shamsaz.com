/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  ShieldCheck, 
  Filter, 
  Clock, 
  Check, 
  Video, 
  Award, 
  Building2,
  X
} from 'lucide-react';
import { Doctor } from '../../../types';

interface DoctorSearchDirectoryProps {
  doctors: Doctor[];
  initialSpecialty?: string;
  initialCity?: string;
  onBookAppointment: (doctor: Doctor, selectedSlot?: string, selectedDate?: string) => void;
}

export const DoctorSearchDirectory: React.FC<DoctorSearchDirectoryProps> = ({
  doctors,
  initialSpecialty = '',
  initialCity = '',
  onBookAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [visitTypeFilter, setVisitTypeFilter] = useState<'all' | 'in_person' | 'online'>('all');
  const [hasInsuranceOnly, setHasInsuranceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  // Selected doctor for detailed profile & calendar preview
  const [activeProfileDoctor, setActiveProfileDoctor] = useState<Doctor | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('۱۴۰۳/۰۸/۲۲');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('۱۰:۰۰');

  const specialtiesList = [
    'همه تخصص‌ها',
    'زنان و زایمان',
    'آنکولوژی',
    'جراحی زنان و زایمان',
    'رادیوتراپی',
    'رادیولوژی و تصویربرداری',
    'پاتولوژی',
    'پزشکی عمومی',
    'ژنتیک پزشکی',
    'طب داخلی',
    'گوارش و کبد',
  ];

  const citiesList = ['همه شهرها', 'تهران', 'اصفهان', 'مشهد', 'شیراز'];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch = searchTerm === '' || 
        doc.name.includes(searchTerm) || 
        doc.specialty.includes(searchTerm) || 
        doc.hospital.includes(searchTerm);

      const matchSpecialty = !selectedSpecialty || selectedSpecialty === 'همه تخصص‌ها' || doc.specialty === selectedSpecialty;
      const matchCity = !selectedCity || selectedCity === 'همه شهرها' || doc.city === selectedCity;
      const matchVisit = visitTypeFilter === 'all' ? true : visitTypeFilter === 'online' ? doc.onlineAvailable : true;
      const matchInsurance = hasInsuranceOnly ? doc.insurances.length > 0 : true;

      return matchSearch && matchSpecialty && matchCity && matchVisit && matchInsurance;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
      return 0;
    });
  }, [doctors, searchTerm, selectedSpecialty, selectedCity, visitTypeFilter, hasInsuranceOnly, sortBy]);

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-right">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              جستجو و نوبت‌دهی پزشکان
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              انتخاب پزشک متخصص، مشاهده تقویم کاری و رزرو نوبت حضوری یا آنلاین
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg w-fit">
            <span>{filteredDoctors.length} پزشک متخصص فعال یافت شد</span>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Doctor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Filters Sidebar (Right on RTL) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs text-right space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                    setSelectedCity('');
                    setVisitTypeFilter('all');
                    setHasInsuranceOnly(false);
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  پاکسازی فیلترها
                </button>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span>فیلترهای جستجو</span>
                </div>
              </div>

              {/* Text Search Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  جستجوی نام یا بیمارستان
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="مثلاً دکتر سمیرا احمدی..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  تخصص پزشک
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden cursor-pointer"
                >
                  {specialtiesList.map((spec) => (
                    <option key={spec} value={spec === 'همه تخصص‌ها' ? '' : spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  شهر
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden cursor-pointer"
                >
                  {citiesList.map((c) => (
                    <option key={c} value={c === 'همه شهرها' ? '' : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Type Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نوع ویزیت
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-medium">
                  <button
                    onClick={() => setVisitTypeFilter('all')}
                    className={`py-1.5 rounded-lg transition-all ${
                      visitTypeFilter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    همه
                  </button>
                  <button
                    onClick={() => setVisitTypeFilter('in_person')}
                    className={`py-1.5 rounded-lg transition-all ${
                      visitTypeFilter === 'in_person' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    حضوری
                  </button>
                  <button
                    onClick={() => setVisitTypeFilter('online')}
                    className={`py-1.5 rounded-lg transition-all ${
                      visitTypeFilter === 'online' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    آنلاین
                  </button>
                </div>
              </div>

              {/* Insurance Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasInsuranceOnly}
                    onChange={(e) => setHasInsuranceOnly(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span>پزشکان دارای قرارداد بیمه</span>
                </label>
              </div>

            </div>
          </div>

          {/* Main Results Listing (Left on RTL) */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Sort Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-right">
              <span className="text-xs text-slate-500">
                مرتب‌سازی بر اساس:
              </span>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    sortBy === 'rating' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  بالاترین امتیاز
                </button>
                <button
                  onClick={() => setSortBy('experience')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    sortBy === 'experience' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  بیشترین سابقه
                </button>
                <button
                  onClick={() => setSortBy('fee')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    sortBy === 'fee' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  مناسب‌ترین تعرفه
                </button>
              </div>
            </div>

            {/* Doctor Cards */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="text-sm font-semibold">پزشکی با معیارهای انتخابی شما یافت نشد.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                    setSelectedCity('');
                  }}
                  className="mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100"
                >
                  مشاهده همه پزشکان
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row items-stretch justify-between gap-5 text-right"
                >
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {doc.name}
                        </h3>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>نظام پزشکی: {doc.medicalCode}</span>
                        </span>
                        {doc.onlineAvailable && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>ویزیت آنلاین</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-indigo-600">
                        {doc.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.hospital}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono tabular-nums">{doc.experienceYears} سال سابقه</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-mono tabular-nums">{doc.rating}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({doc.reviewsCount} نظر)</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
                        {doc.bio}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Fee Box */}
                  <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-r border-slate-100 pt-4 md:pt-0 md:pr-5 shrink-0 min-w-44 text-right">
                    <div className="w-full text-right">
                      <span className="text-[11px] text-slate-400 block">تعرفه ویزیت:</span>
                      <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                        {doc.consultationFee.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-[11px] text-slate-500 mr-1">تومان</span>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full mt-4">
                      <button
                        onClick={() => setActiveProfileDoctor(doc)}
                        className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                      >
                        مشاهده تقویم و نوبت‌ها
                      </button>
                      <button
                        onClick={() => onBookAppointment(doc)}
                        className="w-full py-2 px-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>دریافت نوبت سریع</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>

        </div>

      </div>

      {/* Doctor Profile & Calendar Modal */}
      {activeProfileDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-right shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setActiveProfileDoctor(null)}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Doctor Header */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={activeProfileDoctor.avatar}
                  alt={activeProfileDoctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{activeProfileDoctor.name}</h3>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">{activeProfileDoctor.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{activeProfileDoctor.hospital}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-800 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{activeProfileDoctor.rating}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Qualifications & Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <h4 className="font-bold text-slate-800 mb-2">سوابق تحصیلی و مدارک:</h4>
                <ul className="space-y-1.5 text-slate-600 pr-3 list-disc">
                  {activeProfileDoctor.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <h4 className="font-bold text-slate-800 mb-2">خدمات و مهارت‌ها:</h4>
                <ul className="space-y-1.5 text-slate-600 pr-3 list-disc">
                  {activeProfileDoctor.services.map((srv, idx) => (
                    <li key={idx}>{srv}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Calendar Scheduler */}
            <div className="mt-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>انتخاب زمان نوبت (ماه جاری - آبان ۱۴۰۳):</span>
              </h4>

              {/* Day slots */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                {['شنبه ۲۰', 'یکشنبه ۲۱', 'دوشنبه ۲۲', 'سه‌شنبه ۲۳', 'چهارشنبه ۲۴', 'پنجشنبه ۲۵', 'شنبه ۲۷'].map((d, i) => (
                  <button
                    key={d}
                    onClick={() => setSelectedCalendarDate(`۱۴۰۳/۰۸/${20 + i}`)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all ${
                      selectedCalendarDate === `۱۴۰۳/۰۸/${20 + i}`
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white hover:bg-indigo-100/60 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{d}</span>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              <div className="text-xs font-bold text-slate-700 mb-2">ساعت‌های ویزیت خالی:</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {activeProfileDoctor.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedTimeSlot === slot
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white hover:bg-teal-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <span className="text-xs text-slate-400">نوبت انتخاب‌شده:</span>
                <div className="text-xs font-bold text-slate-800">
                  {selectedCalendarDate} — ساعت {selectedTimeSlot}
                </div>
              </div>
              <button
                onClick={() => {
                  onBookAppointment(activeProfileDoctor, selectedTimeSlot, selectedCalendarDate);
                  setActiveProfileDoctor(null);
                }}
                className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                تأیید و رزرو نهایی نوبت
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
