import { ArrowLeft, MapPin } from "lucide-react";
import { PractitionerCard } from "../../directory/PractitionerCard";
import { usePractitioners } from "../../directory/practitioners";
export function PublicFeaturedPractitioners({
  onViewAll,
}: {
  onViewAll: () => void;
}) {
  const { practitioners, loading, error, reload } = usePractitioners();
  const selected = [
    ...new Set(practitioners.map((doctor) => doctor.categoryId)),
  ]
    .flatMap((category) =>
      practitioners
        .filter((doctor) => doctor.categoryId === category)
        .slice(0, 2),
    )
    .slice(0, 6);
  return (
    <section
      dir="rtl"
      className="mx-auto max-w-7xl border-b border-[#ECE7DF] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-teal-700">
            <MapPin size={14} />
            تهران
          </p>
          <h2 className="text-xl font-black text-slate-900">
            پزشکان سرطان زنان
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            جراحی پستان، سرطان‌های زنان و انکولوژی؛ همراه با اطلاعات تماس و منبع
            معرفی
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="flex min-h-10 items-center gap-2 rounded-xl bg-teal-50 px-4 text-xs font-bold text-teal-800 hover:bg-teal-100"
        >
          مشاهدهٔ همهٔ پزشکان
          <ArrowLeft size={15} />
        </button>
      </div>
      {loading ? (
        <div
          role="status"
          aria-label="در حال دریافت پزشکان"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
        >
          {error}
          <button
            onClick={() => void reload()}
            className="mr-3 font-semibold text-teal-700"
          >
            تلاش دوباره
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((doctor) => (
            <PractitionerCard key={doctor.id} practitioner={doctor} compact />
          ))}
        </div>
      )}
      <p className="mt-4 text-[11px] leading-6 text-slate-500">
        درخواست رزرو برای هر پزشک قابل ثبت است؛ زمان مراجعه پس از هماهنگی با مطب
        یا مرکز قطعی می‌شود.
      </p>
    </section>
  );
}
