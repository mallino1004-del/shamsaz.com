import { useState } from "react";
import {
  MapPin,
  Phone,
  ExternalLink,
  UserRound,
  CalendarDays,
} from "lucide-react";
import type { Practitioner } from "./practitioners";
import {
  PractitionerBookingModal,
  pendingPractitionerKey,
} from "./PractitionerBookingModal";
export function PractitionerCard({
  practitioner: doctor,
  onBook,
  compact = false,
}: {
  practitioner: Practitioner;
  onBook?: () => void;
  compact?: boolean;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(
    () => sessionStorage.getItem(pendingPractitionerKey) === doctor.id,
  );
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 text-teal-600">
          {doctor.photoUrl && !photoFailed ? (
            <img
              src={doctor.photoUrl}
              alt={doctor.displayName}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <UserRound size={32} />
          )}
        </div>
        <div className="min-w-0 pt-1">
          <p className="mb-2 inline-block rounded-md bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800">
            {doctor.categoryLabel}
          </p>
          <h3 className="text-base font-bold leading-7 text-slate-900">
            {doctor.displayName}
          </h3>
          {doctor.accountId && (
            <span className="mt-1 inline-block rounded-md bg-teal-100 px-2 py-1 text-[10px] font-semibold text-teal-800">
              عضو سامانه
            </span>
          )}
          <p className="mt-1 text-xs leading-6 text-slate-600">
            {doctor.specialty}
          </p>
        </div>
      </div>
      <div className="mt-5 flex-1 space-y-3 text-xs leading-6 text-slate-600">
        <p className="flex items-start gap-2">
          <MapPin size={16} className="mt-1 shrink-0 text-teal-600" />
          <span>
            {doctor.city}
            {doctor.address ? ` · ${doctor.address}` : ""}
          </span>
        </p>
        {!compact && doctor.phone && (
          <a
            href={`tel:${doctor.phone.replace(/[^+0-9]/g, "")}`}
            className="flex items-center gap-2 font-medium hover:text-teal-700"
          >
            <Phone size={16} className="shrink-0 text-teal-600" />
            <span dir="ltr">{doctor.phone}</span>
          </a>
        )}
      </div>
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          <CalendarDays size={17} />
          رزرو ویزیت
        </button>
        {doctor.phone ? (
          <a
            href={`tel:${doctor.phone.replace(/[^+0-9]/g, "")}`}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-200 px-3 text-xs font-bold text-teal-800 hover:bg-teal-50"
          >
            <Phone size={16} />
            تماس با مطب یا مرکز
          </a>
        ) : (
          <p className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
            اطلاعات نوبت در صفحهٔ معرفی پزشک
          </p>
        )}
        {doctor.sourceUrl && (
          <a
            href={doctor.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
          >
            صفحهٔ معرفی و منبع اطلاعات
            <ExternalLink size={13} />
          </a>
        )}
        {doctor.sourceCheckedAt && (
          <p className="text-center text-[10px] text-slate-400">
            {doctor.sourceUrl ? "بررسی منبع:" : "به‌روزرسانی پروفایل:"}{" "}
            {new Date(doctor.sourceCheckedAt).toLocaleDateString("fa-IR", {
              timeZone: "Asia/Tehran",
            })}
          </p>
        )}
      </div>
      {bookingOpen && (
        <PractitionerBookingModal
          practitioner={doctor}
          onClose={() => {
            setBookingOpen(false);
            sessionStorage.removeItem(pendingPractitionerKey);
          }}
        />
      )}
    </article>
  );
}
