import React from "react";
import { buttonClass, Field, inputClass } from "../../shared/ui/forms";
interface Props {
  tab: "appointments" | "screenings" | "registry";
  setTab: (tab: "appointments" | "screenings" | "registry") => void;
  pending: boolean;
  onNavigate?: (view: string) => void;
  doctors: {
    id: string;
    displayName?: string;
    name?: string;
    specialty?: string;
  }[];
  slots: { id: string; startsAt: string; endsAt: string }[];
  slotLoading: boolean;
  loadSlots: (id: string) => Promise<void>;
  submit: (
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
  ) => Promise<void>;
}
const date = (value: string) =>
  new Date(value).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
export function PatientForms({
  tab,
  setTab,
  pending,
  doctors,
  slots,
  slotLoading,
  loadSlots,
  submit,
  onNavigate,
}: Props) {
  return (
    <>
      <h2 className="mb-4 text-xl font-bold">درخواست خدمات</h2>
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setTab("appointments")}
          aria-pressed={tab === "appointments"}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
        >
          نوبت ویزیت
        </button>
        <button
          onClick={() => setTab("screenings")}
          aria-pressed={tab === "screenings"}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
        >
          ثبت علائم
        </button>
      </div>
      {tab === "appointments" ? (
        <form
          onSubmit={(e) => void submit(e, "/appointments")}
          className="space-y-4"
        >
          <fieldset disabled={pending} className="space-y-4">
            <Field label="پزشک">
              <select
                name="doctorId"
                required
                className={inputClass}
                defaultValue=""
                onChange={(event) => void loadSlots(event.target.value)}
              >
                <option value="" disabled>
                  انتخاب پزشک
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.displayName || doctor.name}{" "}
                    {doctor.specialty ? `· ${doctor.specialty}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="زمان پیشنهادی"
              hint="زمان محلی ایران؛ تأیید نهایی توسط مرکز انجام می‌شود."
            >
              <select
                required
                name="scheduledAt"
                disabled={slotLoading || !slots.length}
                className={inputClass}
                defaultValue=""
              >
                <option value="" disabled>
                  {slotLoading
                    ? "دریافت زمان‌ها…"
                    : slots.length
                      ? "انتخاب زمان آزاد"
                      : "ابتدا پزشک دارای زمان آزاد را انتخاب کنید"}
                </option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.startsAt}>
                    {date(slot.startsAt)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="نوع ویزیت">
              <select name="type" className={inputClass}>
                <option value="in_person">حضوری</option>
                <option value="online">آنلاین</option>
              </select>
            </Field>
            <Field label="علت مراجعه">
              <textarea
                required
                name="reason"
                rows={3}
                maxLength={1000}
                className={inputClass}
              />
            </Field>
            <button
              disabled={slotLoading || !slots.length}
              className={buttonClass}
            >
              ثبت درخواست نوبت
            </button>
          </fieldset>
        </form>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold">ارزیابی مرحله‌ای سلامت زنان</h3>
          <p className="text-sm leading-8 text-slate-600">
            سوابق سلامت، علائم هشدار و آزمایش‌های قبلی را در بخش غربالگری ثبت
            کنید و گزارش شخصی و برنامه پیگیری خود را ببینید.
          </p>
          <button
            className={buttonClass}
            onClick={() => onNavigate?.("screening")}
          >
            شروع غربالگری و مشاهده گزارش‌ها
          </button>
        </div>
      )}
    </>
  );
}
