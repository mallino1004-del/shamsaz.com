import { useEffect, useState } from "react";
import { Search, MapPin, Stethoscope, RotateCcw } from "lucide-react";
import { PractitionerCard } from "./PractitionerCard";
import { normalizeSearch, usePractitioners } from "./practitioners";
export function DoctorDirectory({
  initialQuery = "",
  onBook,
}: {
  initialQuery?: string;
  onBook: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const { practitioners, categories, loading, error, reload } =
    usePractitioners();
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  const filtered = practitioners.filter(
    (doctor) =>
      (category === "all" || doctor.categoryId === category) &&
      normalizeSearch(
        `${doctor.displayName} ${doctor.specialty} ${doctor.address}`,
      ).includes(normalizeSearch(query)),
  );
  return (
    <main dir="rtl" className="min-h-[70vh] bg-slate-50 pb-12">
      <section className="px-4 pt-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold leading-relaxed text-slate-900">
            پزشکان و متخصصان تهران
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800">
            <MapPin size={14} />
            تهران
            {!loading && !error && (
              <span className="border-r border-teal-100 pr-2">
                {practitioners.length.toLocaleString("fa-IR")} پزشک
              </span>
            )}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6">
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={20} className="shrink-0 text-slate-400" />
            <input
              aria-label="جست‌وجوی نام، تخصص یا نشانی پزشک"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام پزشک، تخصص یا نشانی مطب…"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-semibold text-teal-700"
              >
                پاک کردن
              </button>
            )}
          </label>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="فیلتر تخصص">
            <button
              type="button"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${category === "all" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-teal-50"}`}
            >
              همهٔ تخصص‌ها
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${category === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-teal-50"}`}
              >
                {item.label}{" "}
                <span className="mr-1 opacity-70">
                  ({item.count.toLocaleString("fa-IR")})
                </span>
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800"
          >
            <p>{error}</p>
            <button
              onClick={() => void reload()}
              className="mt-4 flex items-center gap-2 font-bold"
            >
              <RotateCcw size={16} />
              تلاش دوباره
            </button>
          </div>
        ) : loading ? (
          <div
            role="status"
            aria-label="در حال دریافت پزشکان"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="size-20 rounded-xl bg-slate-100" />
                <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-4 h-4 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs text-slate-500">
              <p aria-live="polite">
                {filtered.length.toLocaleString("fa-IR")} پزشک مطابق جست‌وجوی
                شما
              </p>
            </div>
            {filtered.length ? (
              <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((doctor) => (
                  <PractitionerCard
                    key={doctor.id}
                    practitioner={doctor}
                    onBook={onBook}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Search className="mx-auto mb-4 text-slate-400" />
                <p className="font-bold text-slate-700">
                  پزشکی با این جست‌وجو پیدا نشد
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                  className="mt-4 text-sm font-semibold text-teal-700"
                >
                  نمایش همهٔ پزشکان
                </button>
              </div>
            )}
          </>
        )}
        <p className="mt-7 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-7 text-amber-900">
          اطلاعات عمومی ممکن است تغییر کند؛ پیش از مراجعه، نشانی و زمان حضور را
          با مطب تأیید کنید. معرفی در این فهرست به معنی عضویت پزشک در شمساز
          نیست.
        </p>
      </div>
    </main>
  );
}
