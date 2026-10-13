import React, { useEffect, useState } from "react";
import type { UserRole } from "../../types";
import { api, roleLabels } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Profile {
  displayName: string;
  phone: string;
  birthDate?: string;
  nationalId?: string;
  address?: string;
  emergencyContact?: string;
  specialty?: string;
  licenseNumber?: string;
  biography?: string;
  allergies?: string;
  medicalHistory?: string;
  bloodType?: string;
  currentMedications?: string;
  familyHistory?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}
export function ProfileForm({
  role,
  onUpdateName,
}: {
  role: UserRole;
  onUpdateName?: (name: string) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  function load() {
    setError("");
    api<{ profile: Profile }>("/profile")
      .then((result) => setProfile(result.profile))
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ profile: Profile }>("/profile", {
        method: "PUT",
        body: JSON.stringify(fields),
      });
      setProfile(result.profile);
      onUpdateName?.(result.profile.displayName);
      setSuccess("اطلاعات در پرونده حساب شما ذخیره شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  if (!profile)
    return (
      <div className="space-y-4">
        <Feedback error={error} />
        {error ? (
          <button onClick={load} className={buttonClass}>
            تلاش دوباره
          </button>
        ) : (
          <p role="status">در حال دریافت پروفایل…</p>
        )}
      </div>
    );
  return (
    <form onSubmit={save} dir="rtl" className="space-y-8" aria-busy={pending}>
      <header>
        <p className="text-sm font-bold text-teal-700">{roleLabels[role]}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          اطلاعات حساب و تماس
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          اطلاعات شناسایی و تماس برای هماهنگی مراقبت استفاده می‌شود. اطلاعات
          تشخیص و درمان در پرونده بالینی ثبت می‌شود.
        </p>
      </header>
      <fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 font-bold text-slate-800">مشخصات فردی</legend>
        <Field label="نام و نام خانوادگی">
          <input
            name="displayName"
            defaultValue={profile.displayName}
            className={inputClass}
            required
            minLength={2}
            maxLength={120}
          />
        </Field>
        <Field label="شماره همراه">
          <input
            name="phone"
            type="tel"
            dir="ltr"
            defaultValue={profile.phone ?? ""}
            maxLength={20}
            className={inputClass}
          />
        </Field>
        <Field label="کد ملی" hint="۱۰ رقم؛ خالی گذاشتن مجاز است.">
          <input
            name="nationalId"
            defaultValue={profile.nationalId ?? ""}
            pattern="[0-9]{10}"
            maxLength={10}
            dir="ltr"
            className={inputClass}
          />
        </Field>
        <Field
          label="تاریخ تولد"
          hint="تاریخ در پایگاه داده به صورت میلادی استاندارد ذخیره می‌شود."
        >
          <input
            name="birthDate"
            type="date"
            defaultValue={profile.birthDate?.slice(0, 10) ?? ""}
            max={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>
      </fieldset>
      <fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 font-bold text-slate-800">
          اطلاعات تکمیلی
        </legend>
        <Field label="نشانی">
          <textarea
            name="address"
            defaultValue={profile.address ?? ""}
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </Field>
        {role !== "patient" && (
          <Field
            label="تماس اضطراری"
            hint="نام، نسبت و شماره تماس فرد مورد اعتماد"
          >
            <textarea
              name="emergencyContact"
              defaultValue={profile.emergencyContact ?? ""}
              rows={3}
              maxLength={500}
              className={inputClass}
            />
          </Field>
        )}
        {role !== "patient" && (
          <Field label="معرفی حرفه‌ای">
            <textarea
              name="biography"
              defaultValue={profile.biography ?? ""}
              rows={3}
              maxLength={2000}
              className={inputClass}
            />
          </Field>
        )}
      </fieldset>
      {role === "patient" && (
        <>
          <fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
            <legend className="mb-4 font-bold text-slate-800">
              اطلاعات سلامت اعلام‌شده توسط بیمار
            </legend>
            <Field
              label="گروه خونی"
              hint="بر اساس نتیجه آزمایش؛ در صورت نداشتن مستند، نامشخص را انتخاب کنید."
            >
              <select
                name="bloodType"
                defaultValue={profile.bloodType || "unknown"}
                className={inputClass}
              >
                <option value="unknown">نامشخص</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field
              label="داروها و مکمل‌های فعلی"
              hint="نام، مقدار و تناوب مصرف هر مورد را بنویسید."
            >
              <textarea
                name="currentMedications"
                defaultValue={profile.currentMedications || ""}
                rows={4}
                maxLength={2000}
                className={inputClass}
              />
            </Field>
            <Field
              label="سابقه خانوادگی"
              hint="بیماری، نسبت فرد و سن تقریبی تشخیص را ذکر کنید."
            >
              <textarea
                name="familyHistory"
                defaultValue={profile.familyHistory || ""}
                rows={4}
                maxLength={2000}
                className={inputClass}
              />
            </Field>
            <Field
              label="حساسیت‌ها"
              hint="هر مورد را با ویرگول یا در یک خط جداگانه بنویسید؛ این اطلاعات نیازمند بررسی تیم درمان است."
            >
              <textarea
                name="allergies"
                defaultValue={profile.allergies ?? ""}
                rows={4}
                maxLength={2000}
                className={inputClass}
              />
            </Field>
            <Field
              label="سابقه پزشکی"
              hint="بیماری‌های زمینه‌ای و سابقه‌های مهم را ذکر کنید."
            >
              <textarea
                name="medicalHistory"
                defaultValue={profile.medicalHistory ?? ""}
                rows={4}
                maxLength={5000}
                className={inputClass}
              />
            </Field>
          </fieldset>
          <fieldset disabled={pending} className="grid gap-5 md:grid-cols-3">
            <legend className="mb-4 font-bold text-slate-800">
              فرد مورد اعتماد برای تماس اضطراری
            </legend>
            <Field label="نام و نام خانوادگی">
              <input
                name="emergencyContactName"
                defaultValue={profile.emergencyContactName ?? ""}
                maxLength={120}
                className={inputClass}
              />
            </Field>
            <Field label="نسبت با بیمار">
              <input
                name="emergencyContactRelation"
                defaultValue={profile.emergencyContactRelation ?? ""}
                maxLength={100}
                className={inputClass}
              />
            </Field>
            <Field
              label="شماره تماس"
              hint="۱۰ تا ۱۵ رقم؛ ثبت این شماره اختیاری است."
            >
              <input
                type="tel"
                dir="ltr"
                name="emergencyContactPhone"
                defaultValue={profile.emergencyContactPhone ?? ""}
                pattern="[0-9]{10,15}"
                maxLength={15}
                className={inputClass}
              />
            </Field>
          </fieldset>
        </>
      )}
      {role === "doctor" && (
        <section className="rounded-xl bg-slate-50 p-5">
          <h3 className="font-bold">اطلاعات حرفه‌ای ثبت‌شده</h3>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-slate-500">تخصص</dt>
              <dd>{profile.specialty || "ثبت نشده"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">شماره نظام پزشکی</dt>
              <dd>{profile.licenseNumber || "ثبت نشده"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            اصلاح این اطلاعات از طریق مدیر مرکز انجام می‌شود.
          </p>
        </section>
      )}
      <Feedback error={error} success={success} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}
