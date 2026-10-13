import React, { useState } from "react";
import { api } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Props {
  patients: { id: string; displayName: string }[];
  onSaved: () => void;
}
export function ClinicalForms({ patients, onSaved }: Props) {
  const [tab, setTab] = useState<"encounter" | "prescription">("encounter");
  const [medicationRows, setMedicationRows] = useState<number[]>([1]);
  const nextRow = React.useRef(2);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    let payload: Record<string, unknown> = values;
    if (tab === "prescription") {
      payload = {
        patientId: values.patientId,
        notes: values.notes,
        items: medicationRows.map((id) => ({
          medicationName: values[`medicationName_${id}`],
          dose: values[`dose_${id}`],
          route: values[`route_${id}`],
          frequency: values[`frequency_${id}`],
          durationDays: Number(values[`durationDays_${id}`]),
          instructions: values[`instructions_${id}`],
        })),
      };
    }
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(tab === "encounter" ? "/encounters" : "/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      form.reset();
      setMedicationRows([nextRow.current++]);
      setSuccess(
        tab === "encounter"
          ? "یادداشت بالینی به عنوان پیش‌نویس ذخیره شد."
          : "نسخه به عنوان پیش‌نویس ذخیره شد؛ ارسال بیرونی انجام نشده است.",
      );
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">مستندسازی بالینی</h2>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["encounter", "prescription"] as const).map((value) => (
          <button
            key={value}
            disabled={pending}
            onClick={() => {
              setTab(value);
              setError("");
              setSuccess("");
            }}
            aria-pressed={tab === value}
            className={`rounded-lg px-4 py-2 text-sm ${tab === value ? "bg-teal-50 font-bold text-teal-800" : "bg-slate-100"}`}
          >
            {value === "encounter" ? "ویزیت و یادداشت SOAP" : "پیش‌نویس نسخه"}
          </button>
        ))}
      </div>
      <form key={tab} onSubmit={submit} className="space-y-5">
        <fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
          <Field label="بیمار">
            <select
              name="patientId"
              defaultValue=""
              required
              className={inputClass}
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
          {tab === "encounter" ? (
            <>
              <Field label="شکایت اصلی">
                <input
                  name="chiefComplaint"
                  required
                  maxLength={1000}
                  className={inputClass}
                />
              </Field>
              {[
                { name: "subjective", label: "S · شرح حال و علائم بیمار" },
                { name: "objective", label: "O · یافته‌های معاینه و بررسی‌ها" },
                { name: "assessment", label: "A · ارزیابی پزشک" },
                { name: "plan", label: "P · برنامه مراقبت و پیگیری" },
              ].map((field) => (
                <Field key={field.name} label={field.label}>
                  <textarea
                    name={field.name}
                    required
                    rows={4}
                    maxLength={5000}
                    className={inputClass}
                  />
                </Field>
              ))}
            </>
          ) : (
            <>
              <div className="md:col-span-2 space-y-4">
                {medicationRows.map((row, index) => (
                  <fieldset
                    key={row}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <legend className="px-2 font-bold">
                      قلم دارویی {index + 1}
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="نام دارو">
                        <input
                          required
                          name={`medicationName_${row}`}
                          maxLength={200}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="مقدار مصرف"
                        hint="مقدار و واحد را مشخص کنید."
                      >
                        <input
                          required
                          name={`dose_${row}`}
                          maxLength={100}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="راه مصرف">
                        <select name={`route_${row}`} className={inputClass}>
                          <option value="oral">خوراکی</option>
                          <option value="intravenous">وریدی</option>
                          <option value="intramuscular">عضلانی</option>
                          <option value="topical">موضعی</option>
                          <option value="other">سایر</option>
                        </select>
                      </Field>
                      <Field label="تناوب مصرف">
                        <input
                          required
                          name={`frequency_${row}`}
                          maxLength={100}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="مدت (روز)">
                        <input
                          required
                          name={`durationDays_${row}`}
                          type="number"
                          min={1}
                          max={365}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="دستور مصرف">
                        <textarea
                          name={`instructions_${row}`}
                          maxLength={1000}
                          rows={3}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      disabled={medicationRows.length === 1}
                      onClick={() =>
                        setMedicationRows((rows) =>
                          rows.filter((id) => id !== row),
                        )
                      }
                      className="mt-3 rounded-lg px-3 py-2 text-sm text-red-700 disabled:opacity-40"
                    >
                      حذف این قلم
                    </button>
                  </fieldset>
                ))}
                <button
                  type="button"
                  disabled={medicationRows.length >= 20}
                  onClick={() =>
                    setMedicationRows((rows) => [...rows, nextRow.current++])
                  }
                  className="rounded-xl border border-teal-300 px-4 py-3 text-sm font-bold text-teal-800"
                >
                  افزودن قلم دارویی ({medicationRows.length}/۲۰)
                </button>
              </div>
              <Field label="یادداشت نسخه">
                <textarea
                  name="notes"
                  maxLength={2000}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </fieldset>
        <p className="text-xs leading-6 text-slate-500">
          محتوای بالینی با مسئولیت پزشک ثبت می‌شود. پیش‌نویس به معنای تأیید یا
          ارسال نسخه به بیمه و داروخانه نیست.
        </p>
        <Feedback error={error} success={success} />
        {!patients.length && (
          <p role="status" className="text-sm text-slate-500">
            بیماری در محدوده دسترسی شما ثبت نشده است. برای پذیرش بیمار با مدیر
            مرکز هماهنگ کنید.
          </p>
        )}
        <button disabled={pending || !patients.length} className={buttonClass}>
          {pending ? "در حال ذخیره…" : "ذخیره پیش‌نویس"}
        </button>
      </form>
    </section>
  );
}
