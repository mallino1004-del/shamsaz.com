/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Pill,
  Search,
  MapPin,
  Phone,
  PhoneCall,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Filter,
  Check,
  Star,
  ExternalLink,
  Copy,
  Truck,
  FileText,
  Activity,
  Award,
  Layers,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";
import { Hospital, Pharmacy } from "../../../types";
import { TEHRAN_HOSPITALS_50 } from "../../../data/hospitalsData";
import { TEHRAN_PHARMACIES_210 } from "../../../data/pharmaciesData";

interface MedicalCentersDirectoryProps {
  initialTab?: "hospitals" | "pharmacies";
  onTabChange?: (tab: "hospitals" | "pharmacies") => void;
  onSelectHospitalForBooking?: (hospitalName: string) => void;
}

export const MedicalCentersDirectory: React.FC<
  MedicalCentersDirectoryProps
> = ({ initialTab = "hospitals", onTabChange, onSelectHospitalForBooking }) => {
  const [activeTab, setActiveTab] = useState<"hospitals" | "pharmacies">(
    initialTab,
  );
  useEffect(() => setActiveTab(initialTab), [initialTab]);
  function changeGroup(tab: "hospitals" | "pharmacies") {
    setActiveTab(tab);
    onTabChange?.(tab);
  }
  function handleGroupKey(
    event: React.KeyboardEvent,
    current: "hospitals" | "pharmacies",
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "hospitals"
        : event.key === "End"
          ? "pharmacies"
          : current === "hospitals"
            ? "pharmacies"
            : "hospitals";
    changeGroup(next);
    document.getElementById(`${next}-tab`)?.focus();
  }

  // Hospital Filter States
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState<string>("all");
  const [hospitalDistrictFilter, setHospitalDistrictFilter] =
    useState<string>("all");
  const [hospitalOnlyEmergency, setHospitalOnlyEmergency] = useState(false);
  const [hospitalOnlyCancer, setHospitalOnlyCancer] = useState(false);
  const [hospitalSort, setHospitalSort] = useState<"rating" | "beds" | "name">(
    "rating",
  );

  // Pharmacy Filter States
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [pharmacyTypeFilter, setPharmacyTypeFilter] = useState<string>("all");
  const [pharmacyDistrictFilter, setPharmacyDistrictFilter] =
    useState<string>("all");
  const [pharmacyOnly24h, setPharmacyOnly24h] = useState(false);
  const [pharmacyOnlySpecialty, setPharmacyOnlySpecialty] = useState(false);
  const [pharmacyOnlyDelivery, setPharmacyOnlyDelivery] = useState(false);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Hospital types list
  const hospitalTypes = [
    { value: "all", label: "همه نوع مراکز" },
    { value: "دولتی دانشگاهی", label: "دولتی دانشگاهی" },
    { value: "خصوصی", label: "خصوصی" },
    { value: "تأمین اجتماعی", label: "تأمین اجتماعی" },
    { value: "نیروهای مسلح", label: "نیروهای مسلح" },
    { value: "خیریه", label: "خیریه" },
  ];

  // Tehran municipal districts list
  const tehranDistricts = [
    { value: "all", label: "همه مناطق تهران" },
    { value: "1", label: "منطقه ۱ (تجریش، شمیران، نیاوران)" },
    { value: "2", label: "منطقه ۲ (شهرک غرب، سعادت‌آباد، گیشا)" },
    { value: "3", label: "منطقه ۳ (ونک، میرداماد، جردن، قلهک)" },
    { value: "4", label: "منطقه ۴ (تهرانپارس، رسالت)" },
    { value: "5", label: "منطقه ۵ (صادقیه، پونک، اکباتان)" },
    { value: "6", label: "منطقه ۶ (بلوار کشاورز، یوسف‌آباد)" },
    { value: "7", label: "منطقه ۷ (مطهری، سهروردی، بهشتی)" },
    { value: "8", label: "منطقه ۸ (نارمک، هفت‌حوض)" },
    { value: "9", label: "منطقه ۹ (آزادی، مهرآباد)" },
    { value: "10", label: "منطقه ۱۰ (نواب، سلسبیل، آذربایجان)" },
    { value: "11", label: "منطقه ۱۱ (منیریه، حسن‌آباد، کارگر)" },
    { value: "12", label: "منطقه ۱۲ (بازار، بهارستان، مولوی)" },
    { value: "13", label: "منطقه ۱۳ (پیروزی، تهران‌نو)" },
    { value: "14", label: "منطقه ۱۴ (کوکاکولا، نبرد، محلاتی)" },
    { value: "15", label: "منطقه ۱۵ (افسریه، خاوران)" },
    { value: "16", label: "منطقه ۱۶ (نازی‌آباد، شوش)" },
    { value: "17", label: "منطقه ۱۷ (فلاح، ابوذر)" },
    { value: "18", label: "منطقه ۱۸ (یافت‌آباد، شهرک ولیعصر)" },
    { value: "19", label: "منطقه ۱۹ (خانی‌آباد، عبدل‌آباد)" },
    { value: "20", label: "منطقه ۲۰ (شهر ری، دولت‌آباد)" },
    { value: "21", label: "منطقه ۲۱ (تهرانسر، وردآورد)" },
    { value: "22", label: "منطقه ۲۲ (دریاچه چیتگر، المپیک)" },
  ];

  // Pharmacy types list
  const pharmacyTypes = [
    { value: "all", label: "همه داروخانه‌ها" },
    { value: "هلال احمر و مرجع دولتی", label: "هلال احمر و مراکز مرجع دولتی" },
    {
      value: "تخصصی تک‌نسخه‌ای و شیمی‌درمانی",
      label: "تخصصی تک‌نسخه‌ای و شیمی‌درمانی",
    },
    { value: "شبانه‌روزی ۲۴ ساعته", label: "داروخانه‌های شبانه‌روزی ۲۴ ساعته" },
    { value: "داروخانه عمومی", label: "داروخانه‌های روزانه و عمومی" },
    { value: "زنجیره‌ای مدرن", label: "زنجیره‌ای مدرن" },
  ];

  // Filtered Hospitals
  const filteredHospitals = useMemo(() => {
    return TEHRAN_HOSPITALS_50.filter((h) => {
      const matchSearch =
        hospitalSearch === "" ||
        h.name.includes(hospitalSearch) ||
        h.address.includes(hospitalSearch) ||
        h.districtName.includes(hospitalSearch) ||
        h.specialtyType.includes(hospitalSearch) ||
        h.featuredDepartments.some((dept) => dept.includes(hospitalSearch));

      const matchType =
        hospitalTypeFilter === "all" || h.type === hospitalTypeFilter;
      const matchDistrict =
        hospitalDistrictFilter === "all" ||
        h.district.toString() === hospitalDistrictFilter;
      const matchEmergency = !hospitalOnlyEmergency || h.hasEmergency;
      const matchCancer = !hospitalOnlyCancer || h.hasCancerCenter;

      return (
        matchSearch &&
        matchType &&
        matchDistrict &&
        matchEmergency &&
        matchCancer
      );
    }).sort((a, b) => {
      if (hospitalSort === "rating") return b.rating - a.rating;
      if (hospitalSort === "beds") return b.bedsCount - a.bedsCount;
      if (hospitalSort === "name") return a.name.localeCompare(b.name, "fa");
      return 0;
    });
  }, [
    hospitalSearch,
    hospitalTypeFilter,
    hospitalDistrictFilter,
    hospitalOnlyEmergency,
    hospitalOnlyCancer,
    hospitalSort,
  ]);

  // Filtered Pharmacies
  const filteredPharmacies = useMemo(() => {
    return TEHRAN_PHARMACIES_210.filter((p) => {
      const matchSearch =
        pharmacySearch === "" ||
        p.name.includes(pharmacySearch) ||
        p.pharmacistName.includes(pharmacySearch) ||
        p.address.includes(pharmacySearch) ||
        p.districtName.includes(pharmacySearch);

      const matchType =
        pharmacyTypeFilter === "all" || p.type === pharmacyTypeFilter;
      const matchDistrict =
        pharmacyDistrictFilter === "all" ||
        p.district.toString() === pharmacyDistrictFilter;
      const match24h = !pharmacyOnly24h || p.is24h;
      const matchSpecialty = !pharmacyOnlySpecialty || p.isSpecialtyMeds;
      const matchDelivery = !pharmacyOnlyDelivery || p.deliveryAvailable;

      return (
        matchSearch &&
        matchType &&
        matchDistrict &&
        match24h &&
        matchSpecialty &&
        matchDelivery
      );
    });
  }, [
    pharmacySearch,
    pharmacyTypeFilter,
    pharmacyDistrictFilter,
    pharmacyOnly24h,
    pharmacyOnlySpecialty,
    pharmacyOnlyDelivery,
  ]);

  return (
    <div className="py-8 bg-slate-50 min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            راهنمای مراکز درمانی تهران
          </h1>
          <p className="mt-2 text-xs leading-7 text-slate-500">
            گروه مورد نظر را انتخاب کنید؛ هر گروه فهرست، جست‌وجو و فیلترهای
            مستقل دارد.
          </p>
        </header>
        <div
          role="tablist"
          aria-label="گروه‌های مراکز درمانی"
          className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <button
            type="button"
            role="tab"
            id="hospitals-tab"
            tabIndex={activeTab === "hospitals" ? 0 : -1}
            onKeyDown={(event) => handleGroupKey(event, "hospitals")}
            aria-label="بیمارستان‌ها"
            aria-selected={activeTab === "hospitals"}
            aria-controls="hospitals-panel"
            onClick={() => changeGroup("hospitals")}
            className={
              "flex min-w-0 items-center gap-4 rounded-2xl border p-5 text-right transition-colors " +
              (activeTab === "hospitals"
                ? "border-sky-300 bg-sky-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-sky-200")
            }
          >
            <span className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Building2 size={25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-slate-900">
                بیمارستان‌ها
              </span>
              <span className="mt-1 block text-xs leading-6 text-slate-500">
                جست‌وجوی بیمارستان بر اساس نوع مرکز، منطقه و خدمات
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-sky-800">
              {TEHRAN_HOSPITALS_50.length.toLocaleString("fa-IR")}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            id="pharmacies-tab"
            tabIndex={activeTab === "pharmacies" ? 0 : -1}
            onKeyDown={(event) => handleGroupKey(event, "pharmacies")}
            aria-label="داروخانه‌ها"
            aria-selected={activeTab === "pharmacies"}
            aria-controls="pharmacies-panel"
            onClick={() => changeGroup("pharmacies")}
            className={
              "flex min-w-0 items-center gap-4 rounded-2xl border p-5 text-right transition-colors " +
              (activeTab === "pharmacies"
                ? "border-teal-300 bg-teal-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-teal-200")
            }
          >
            <span className="rounded-2xl bg-teal-100 p-3 text-teal-700">
              <Pill size={25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-slate-900">
                داروخانه‌ها
              </span>
              <span className="mt-1 block text-xs leading-6 text-slate-500">
                جست‌وجوی داروخانه بر اساس منطقه و نوع خدمات
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-teal-800">
              {TEHRAN_PHARMACIES_210.length.toLocaleString("fa-IR")}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 50 HOSPITALS DIRECTORY                                              */}
        {/* ========================================================================= */}
        {activeTab === "hospitals" && (
          <div
            id="hospitals-panel"
            role="tabpanel"
            aria-labelledby="hospitals-tab"
            className="space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900">
              بیمارستان‌های تهران{" "}
              <span className="mr-2 text-xs font-normal text-slate-500">
                {filteredHospitals.length.toLocaleString("fa-IR")} نتیجه
              </span>
            </h2>

            {/* Hospitals Filter Console */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    placeholder="جستجوی نام بیمارستان، تخصص، خیابان یا بخش بالینی..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {hospitalSearch && (
                    <button
                      onClick={() => setHospitalSearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Type Filter */}
                <div className="md:col-span-3">
                  <select
                    value={hospitalTypeFilter}
                    onChange={(e) => setHospitalTypeFilter(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {hospitalTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div className="md:col-span-4">
                  <select
                    value={hospitalDistrictFilter}
                    onChange={(e) => setHospitalDistrictFilter(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {tehranDistricts.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Filter Badges & Sort Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      setHospitalOnlyEmergency(!hospitalOnlyEmergency)
                    }
                    className={`py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      hospitalOnlyEmergency
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>فقط اورژانس شبانه‌روزی ۲۴ ساعته</span>
                  </button>

                  <button
                    onClick={() => setHospitalOnlyCancer(!hospitalOnlyCancer)}
                    className={`py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      hospitalOnlyCancer
                        ? "bg-pink-50 border-pink-300 text-pink-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-pink-600" />
                    <span>دارای بخش سرطان و انکولوژی</span>
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">مرتب‌سازی:</span>
                  <select
                    value={hospitalSort}
                    onChange={(e: any) => setHospitalSort(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                  >
                    <option value="rating">بالاترین امتیاز رضایت</option>
                    <option value="beds">بیشترین تعداد تخت مصوب</option>
                    <option value="name">ترتیب حروف الفبا</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hospitals Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-300"
                >
                  <div className="space-y-3">
                    {/* Header Row: Type and Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          hospital.type === "خصوصی"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : hospital.type === "دولتی دانشگاهی"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : hospital.type === "تأمین اجتماعی"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {hospital.type}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{hospital.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({hospital.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Hospital Name */}
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                        {hospital.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        مرکز درمانی شماره {hospital.id.replace("hosp-", "")} •{" "}
                        {hospital.type}
                      </p>
                    </div>

                    {/* Specialty & District Tag */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-semibold">
                        {hospital.specialtyType}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-mono">
                        منطقه {hospital.district}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[11px]">
                        {hospital.bedsCount} تخت
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {hospital.description}
                    </p>

                    {/* Featured Departments */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        بخش‌های شاخص:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hospital.featuredDepartments
                          .slice(0, 4)
                          .map((dept, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200/60 px-1.5 py-0.5 rounded-md"
                            >
                              {dept}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Address with MapPin */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">
                        {hospital.address}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Phones Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`tel:${hospital.phone.replace(/[^0-9]/g, "")}`}
                          className="text-slate-700 hover:text-indigo-600 font-bold font-sans"
                        >
                          {hospital.phone}
                        </a>
                      </div>

                      {hospital.hasEmergency && (
                        <a
                          href={`tel:${hospital.emergencyPhone.replace(/[^0-9]/g, "")}`}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>اورژانس: {hospital.emergencyPhone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          handleCopy(
                            hospital.id,
                            `${hospital.name} - ${hospital.phone} - ${hospital.address}`,
                          )
                        }
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                        title="کپی مشخصات کامل"
                      >
                        {copiedId === hospital.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedId === hospital.id ? "کپی شد" : "کپی"}
                        </span>
                      </button>

                      {hospital.website && (
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1 mr-auto"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>سایت رسمی</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredHospitals.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">
                  بیمارستانی با این مشخصات یافت نشد
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  لطفاً فیلترهای منطقه یا عبارت جستجو را تغییر دهید.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 210 PHARMACIES DIRECTORY                                            */}
        {/* ========================================================================= */}
        {activeTab === "pharmacies" && (
          <div
            id="pharmacies-panel"
            role="tabpanel"
            aria-labelledby="pharmacies-tab"
            className="space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900">
              داروخانه‌های تهران{" "}
              <span className="mr-2 text-xs font-normal text-slate-500">
                {filteredPharmacies.length.toLocaleString("fa-IR")} نتیجه
              </span>
            </h2>

            {/* Pharmacies Filter Console */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    placeholder="جستجوی نام داروخانه، دکتر داروساز، خیابان، محله یا منطقه..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {pharmacySearch && (
                    <button
                      onClick={() => setPharmacySearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Type Filter */}
                <div className="md:col-span-3">
                  <select
                    value={pharmacyTypeFilter}
                    onChange={(e) => setPharmacyTypeFilter(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {pharmacyTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div className="md:col-span-4">
                  <select
                    value={pharmacyDistrictFilter}
                    onChange={(e) => setPharmacyDistrictFilter(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {tehranDistricts.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle Badges Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPharmacyOnly24h(!pharmacyOnly24h)}
                    className={`py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      pharmacyOnly24h
                        ? "bg-teal-50 border-teal-300 text-teal-800 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>فقط شبانه‌روزی ۲۴ ساعته</span>
                  </button>

                  <button
                    onClick={() =>
                      setPharmacyOnlySpecialty(!pharmacyOnlySpecialty)
                    }
                    className={`py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      pharmacyOnlySpecialty
                        ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5 text-indigo-600" />
                    <span>داروهای خاص و شیمی‌درمانی</span>
                  </button>

                  <button
                    onClick={() =>
                      setPharmacyOnlyDelivery(!pharmacyOnlyDelivery)
                    }
                    className={`py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      pharmacyOnlyDelivery
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>دارای پیک ارسال دارویی</span>
                  </button>
                </div>

                <div className="text-slate-500 text-xs font-mono">
                  نمایش <strong>{filteredPharmacies.length}</strong> از{" "}
                  <strong>{TEHRAN_PHARMACIES_210.length}</strong> داروخانه
                </div>
              </div>
            </div>

            {/* Pharmacies Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-teal-300"
                >
                  <div className="space-y-2.5">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {pharmacy.is24h ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                            <span>شبانه‌روزی ۲۴ ساعته</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            روزانه
                          </span>
                        )}

                        {pharmacy.isSpecialtyMeds && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            داروی خاص
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{pharmacy.rating}</span>
                      </div>
                    </div>

                    {/* Pharmacy Name */}
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition-colors">
                        {pharmacy.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>مسئول فنی:</span>
                        <strong className="text-slate-700">
                          {pharmacy.pharmacistName}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({pharmacy.medicalCode})
                        </span>
                      </p>
                    </div>

                    {/* Neighborhood and District tag */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                        {pharmacy.districtName}
                      </span>
                      {pharmacy.onlinePrescriptionAccepted && (
                        <span className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>پذیرش نسخه الکترونیک</span>
                        </span>
                      )}
                    </div>

                    {/* Address with MapPin */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2 leading-relaxed">
                        {pharmacy.address}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Phone Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${pharmacy.phone.replace(/[^0-9]/g, "")}`}
                      className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold flex items-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-sans">{pharmacy.phone}</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      {pharmacy.deliveryAvailable && (
                        <span
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-medium flex items-center gap-1"
                          title="امکان ارسال با پیک"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>پیک</span>
                        </span>
                      )}

                      <button
                        onClick={() =>
                          handleCopy(
                            pharmacy.id,
                            `${pharmacy.name} - تلفن: ${pharmacy.phone} - آدرس: ${pharmacy.address}`,
                          )
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                        title="کپی آدرس و شماره"
                      >
                        {copiedId === pharmacy.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPharmacies.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">
                  داروخانه‌ای با این مشخصات یافت نشد
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  لطفاً فیلترهای منطقه یا عبارت جستجو را تغییر دهید.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
