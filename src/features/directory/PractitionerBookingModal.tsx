import { useEffect, useRef, useState } from "react";
import {
  X,
  CalendarDays,
  CheckCircle2,
  Clock,
  UserRound,
  Phone,
  Info,
  LoaderCircle,
} from "lucide-react";
import {
  api,
  type SessionResponse,
  type SessionUser,
} from "../../shared/api/client";
import {
  AuthField,
  AuthError,
  controlClass,
  normalizeDigits,
  SubmitButton,
} from "../auth/AuthControls";
import type { Practitioner } from "./practitioners";
export const pendingPractitionerKey = "shamsaz:pending-practitioner";
export interface VisitRequest {
  id: string;
  reference: string;
  status: string;
  practitionerId: string;
  practitionerName: string;
  preferredDate: string;
  preferredTime: string;
  visitType: string;
  patientName: string;
  phone: string;
  reason: string;
  createdAt: string;
}
function dateInTehran(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}
export function PractitionerBookingModal({
  practitioner: doctor,
  onClose,
}: {
  practitioner: Practitioner;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState<VisitRequest | null>(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [visitType, setVisitType] = useState("in_person");
  const [reason, setReason] = useState("");
  const [consent, setConsent] = useState(false);
  const today = dateInTehran(new Date());
  const lastDate = dateInTehran(new Date(Date.now() + 90 * 86400000));
  useEffect(() => {
    dialog.current?.showModal();
    void loadSession();
    return () => dialog.current?.close();
  }, []);
  async function loadSession() {
    setLoading(true);
    setError("");
    try {
      const session = await api<SessionResponse>("/auth/me");
      setUser(session.user);
      if (session.user) {
        setPatientName(session.user.displayName);
        if (session.user.role === "patient") {
          const result = await api<{
            profile: { displayName: string; phone: string };
          }>("/profile");
          setPatientName(result.profile.displayName);
          setPhone(result.profile.phone || "");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت اطلاعات حساب انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }
  function navigateAuth(view: string) {
    sessionStorage.setItem(pendingPractitionerKey, doctor.id);
    window.location.hash = view;
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError(
        "برای ثبت درخواست، با استفاده از اطلاعات تماس جهت پیگیری موافقت کنید.",
      );
      return;
    }
    if (!/^09\d{9}$/.test(normalizeDigits(phone))) {
      setError("شماره همراه باید ۱۱ رقم و با ۰۹ باشد.");
      return;
    }
    setPending(true);
    try {
      const result = await api<{ visitRequest: VisitRequest }>(
        `/practitioners/${encodeURIComponent(doctor.id)}/visit-requests`,
        {
          method: "POST",
          body: JSON.stringify({
            patientName: patientName.trim(),
            phone: normalizeDigits(phone),
            preferredDate,
            preferredTime,
            visitType,
            reason: reason.trim(),
            consent: true,
          }),
        },
      );
      setReceipt(result.visitRequest);
      sessionStorage.removeItem(pendingPractitionerKey);
      window.dispatchEvent(new Event("shamsaz:visit-request-created"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت درخواست انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        if (pending) e.preventDefault();
        else onClose();
      }}
      dir="rtl"
      aria-labelledby={`booking-title-${doctor.id}`}
      className="m-auto max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2 text-teal-800">
          <CalendarDays size={21} />
          <h2 id={`booking-title-${doctor.id}`} className="text-lg font-bold">
            رزرو ویزیت
          </h2>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          aria-label="بستن فرم رزرو"
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-5 p-5 sm:p-7">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
          <h3 className="font-bold text-slate-900">{doctor.displayName}</h3>
          <p className="mt-1 text-xs leading-6 text-teal-800">
            {doctor.specialty}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {doctor.city} · {doctor.address}
          </p>
        </div>
        {receipt ? (
          <div role="status" className="space-y-4">
            <CheckCircle2 size={42} className="mx-auto text-teal-700" />
            <h3 className="text-center text-xl font-bold text-slate-900">
              درخواست ویزیت ثبت شد
            </h3>
            <p className="rounded-xl bg-amber-50 p-4 text-xs leading-7 text-amber-900">
              {doctor.accountId
                ? "درخواست به داشبورد همین پزشک ارسال شد. زمان پیشنهادی پس از بررسی پزشک تأیید خواهد شد؛ وضعیت را در درخواست‌های خود پیگیری کنید."
                : "این درخواست در انتظار هماهنگی با مطب یا مرکز است و نوبت قطعی محسوب نمی‌شود. برای قطعی‌کردن زمان مراجعه با مطب یا مرکز تماس بگیرید."}
            </p>
            <dl className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">کد پیگیری</dt>
                <dd className="font-mono font-bold text-teal-800" dir="ltr">
                  {receipt.reference}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">زمان پیشنهادی</dt>
                <dd>
                  {new Date(
                    `${receipt.preferredDate}T12:00:00+03:30`,
                  ).toLocaleDateString("fa-IR", {
                    timeZone: "Asia/Tehran",
                  })}{" "}
                  · {receipt.preferredTime}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">وضعیت</dt>
                <dd className="font-semibold text-amber-700">
                  {doctor.accountId
                    ? "در انتظار بررسی پزشک"
                    : "در انتظار هماهنگی"}
                </dd>
              </div>
            </dl>
            {doctor.phone && (
              <a
                href={`tel:${doctor.phone.replace(/[^+0-9]/g, "")}`}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-bold text-white"
              >
                <Phone size={16} />
                تماس با مطب یا مرکز
              </a>
            )}
            <button
              onClick={() => {
                onClose();
                window.location.hash = "appointments";
              }}
              className="w-full rounded-xl border border-teal-200 p-3 text-sm font-semibold text-teal-800"
            >
              مشاهدهٔ درخواست‌های من
            </button>
          </div>
        ) : loading ? (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"
          >
            <LoaderCircle className="animate-spin" size={18} />
            در حال بررسی حساب…
          </p>
        ) : !user ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-slate-600">
              برای ثبت درخواست و دریافت کد پیگیری، وارد حساب بیمار شوید یا
              ثبت‌نام کنید. پزشک انتخاب‌شده برای ادامهٔ رزرو حفظ می‌شود.
            </p>
            <AuthError message={error} />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigateAuth("login")}
                className="rounded-xl bg-teal-700 p-3 text-sm font-bold text-white"
              >
                ورود به حساب
              </button>
              <button
                onClick={() => navigateAuth("register")}
                className="rounded-xl border border-teal-200 p-3 text-sm font-bold text-teal-800"
              >
                ثبت‌نام بیمار
              </button>
            </div>
          </div>
        ) : user.role !== "patient" ? (
          <p
            role="status"
            className="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"
          >
            درخواست ویزیت از حساب بیمار ثبت می‌شود. شما با حساب حرفه‌ای وارد
            شده‌اید.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-7 text-amber-900">
              <Info size={17} className="mt-1 shrink-0" />
              {doctor.accountId
                ? "درخواست به داشبورد پزشک ارسال می‌شود؛ زمان و نوع مراجعه پس از بررسی پزشک تأیید خواهد شد."
                : "روز و ساعت دلخواه خود را پیشنهاد کنید. برای قطعی‌شدن زمان و نوع مراجعه، هماهنگی با مطب یا مرکز لازم است."}
            </div>
            <AuthField label="نام و نام خانوادگی بیمار">
              <div className="relative">
                <input
                  name="patientName"
                  required
                  minLength={2}
                  maxLength={120}
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className={`${controlClass} pl-10`}
                  disabled={pending}
                  autoComplete="name"
                />
                <UserRound
                  className="absolute left-3 top-4 text-slate-400"
                  size={17}
                />
              </div>
            </AuthField>
            <AuthField label="شماره همراه برای پیگیری">
              <input
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
                className={controlClass}
                disabled={pending}
                autoComplete="tel"
                placeholder="09123456789"
              />
            </AuthField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="تاریخ پیشنهادی (میلادی)"
                hint={
                  preferredDate
                    ? `معادل شمسی: ${new Date(`${preferredDate}T12:00:00+03:30`).toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })}`
                    : "از امروز تا ۹۰ روز آینده"
                }
              >
                <input
                  name="preferredDate"
                  type="date"
                  required
                  min={today}
                  max={lastDate}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className={controlClass}
                  disabled={pending}
                />
              </AuthField>
              <AuthField label="ساعت پیشنهادی (تهران)">
                <input
                  name="preferredTime"
                  type="time"
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className={controlClass}
                  disabled={pending}
                />
              </AuthField>
            </div>
            <AuthField label="نوع ویزیت درخواستی">
              <select
                name="visitType"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className={controlClass}
                disabled={pending}
              >
                <option value="in_person">حضوری</option>
                <option value="online">آنلاین، در صورت ارائه توسط مرکز</option>
              </select>
            </AuthField>
            <AuthField
              label="دلیل مراجعه"
              hint="در صورت تمایل، توضیح کوتاهی برای هماهنگی ویزیت بنویسید."
            >
              <textarea
                name="reason"
                required
                minLength={3}
                maxLength={1000}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${controlClass} h-auto py-3`}
                disabled={pending}
              />
            </AuthField>
            <label className="flex items-start gap-2 text-xs leading-7 text-slate-600">
              <input
                type="checkbox"
                name="consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={pending}
                className="mt-2 size-4 shrink-0 accent-teal-700"
              />
              با ثبت نام و اطلاعات تماس برای پیگیری این درخواست موافقم و می‌دانم
              زمان پیشنهادی نیاز به تأیید مرکز دارد.
            </label>
            <AuthError message={error} />
            <SubmitButton pending={pending}>
              ثبت درخواست رزرو ویزیت
            </SubmitButton>
          </form>
        )}
      </div>
    </dialog>
  );
}
