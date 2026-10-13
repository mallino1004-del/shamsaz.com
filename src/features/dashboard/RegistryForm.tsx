import React, { useState } from "react";
import { buttonClass, Field, inputClass } from "../../shared/ui/forms";
interface Props {
  patients: {
    id: string;
    displayName: string;
    birthDate?: string;
    nationalId?: string;
    phone?: string;
  }[];
  pending: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}
export function RegistryForm({ patients, pending, onSubmit }: Props) {
  const [patientId, setPatientId] = useState("");
  const patient = patients.find((item) => item.id === patientId);
  return (
    <>
      <h2 className="mb-4 text-xl font-bold">ثبت مورد رجیستری</h2>
      <form onSubmit={onSubmit} onReset={() => setPatientId("")} className="space-y-4">
        <fieldset disabled={pending} className="space-y-4">
          <Field label="بیمار مرکز">
            <select
              disabled={!patients.length}
              required
              name="patientId"
              onChange={(event) => setPatientId(event.target.value)}
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                انتخاب بیمار
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.displayName}
                </option>
              ))}
            </select>
          </Field>
          {patient && (
            <section
              aria-label="مشخصات بیمار انتخاب‌شده"
              className="rounded-xl bg-teal-50 p-4"
            >
              <h3 className="font-bold text-teal-900">
                مشخصات بیمار از پرونده مرکز
              </h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  ["نام بیمار", patient.displayName],
                  ["کد ملی", patient.nationalId],
                  [
                    "تاریخ تولد",
                    patient.birthDate
                      ? new Date(patient.birthDate).toLocaleDateString("fa-IR")
                      : "",
                  ],
                  ["تماس", patient.phone],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="mt-1 font-semibold">
                      {value || "ثبت نشده"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          <h3 className="border-b border-slate-200 pb-3 font-bold text-slate-800">
            تشخیص و مرحله بیماری
          </h3>
          <Field label="محل سرطان">
            <select name="cancerSite" className={inputClass}>
              <option value="breast">پستان</option>
              <option value="cervix">دهانه رحم</option>
              <option value="ovary">تخمدان</option>
              <option value="endometrium">آندومتر</option>
            </select>
          </Field>
          <Field label="مرحله بالینی">
            <select name="stage" required className={inputClass}>
              <option value="unknown">نامشخص</option>
              {["0", "I", "II", "III", "IV"].map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </Field>
          <Field label="تاریخ تشخیص">
            <input
              required
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              name="diagnosisDate"
              className={inputClass}
            />
          </Field>
          <details className="rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-semibold text-slate-700">
              کدگذاری و مرحله‌بندی تخصصی (اختیاری)
            </summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="نظام مرحله‌بندی">
                <select
                  name="stagingSystem"
                  defaultValue="unknown"
                  className={inputClass}
                >
                  <option value="unknown">نامشخص</option>
                  {["FIGO", "AJCC", "UICC", "other"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="نسخه نظام مرحله‌بندی">
                <input
                  name="stagingVersion"
                  maxLength={50}
                  className={inputClass}
                />
              </Field>
              <Field label="کد ICD-10">
                <input
                  name="icd10Code"
                  dir="ltr"
                  maxLength={20}
                  className={inputClass}
                />
              </Field>
              <Field label="کد ICD-O-3">
                <input
                  name="icdo3Code"
                  dir="ltr"
                  maxLength={30}
                  className={inputClass}
                />
              </Field>
              {[
                { name: "tnmT", label: "TNM · T" },
                { name: "tnmN", label: "TNM · N" },
                { name: "tnmM", label: "TNM · M" },
                { name: "grade", label: "درجه بافت‌شناسی" },
              ].map((field) => (
                <Field key={field.name} label={field.label}>
                  <input
                    name={field.name}
                    maxLength={20}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </details>
          <Field
            label="مستندات و توضیحات"
            hint="نام نظام مرحله‌بندی، نسخه و مبنای پاتولوژی را در مستندات ذکر کنید."
          >
            <textarea
              name="notes"
              maxLength={2000}
              rows={4}
              className={inputClass}
            />
          </Field>
          <label className="flex items-start gap-2 text-sm leading-6">
            <input required type="checkbox" className="mt-1" />
            رضایت بیمار و مبنای ثبت اطلاعات بررسی شده است.
          </label>
          {!patients.length && (
            <p className="text-sm text-slate-500">
              برای ثبت پرونده، ابتدا بیمار باید توسط مدیر مرکز پذیرش شود.
            </p>
          )}
          <button disabled={!patients.length} className={buttonClass}>
            {pending ? "در حال ثبت…" : "ثبت پرونده"}
          </button>
        </fieldset>
      </form>
    </>
  );
}
