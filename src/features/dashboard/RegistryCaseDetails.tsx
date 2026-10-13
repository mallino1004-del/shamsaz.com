import React, { useState } from "react";
import { api, SessionUser } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Detail {
  pathologyReports: Record<string, unknown>[];
  treatments: Record<string, unknown>[];
}
export function RegistryCaseDetails({
  user,
  cases,
}: {
  user: SessionUser;
  cases: { id: string; cancerSite?: string; stage?: string }[];
}) {
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"pathology" | "treatments">("pathology");
  async function choose(id: string) {
    setSelected(id);
    setDetail(null);
    setError("");
    try {
      const result = await api<Detail>(`/registry/${id}/details`);
      setDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت جزئیات انجام نشد.");
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== ""),
    );
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(`/registry/${selected}/${tab}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      form.reset();
      setSuccess("اطلاعات تکمیلی پرونده ذخیره شد.");
      await choose(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-bold">جزئیات پاتولوژی و درمان پرونده</h2>
      <Feedback error={error} success={success} />
      <div className="mt-4">
        <Field label="پرونده رجیستری">
          <select
            value={selected}
            onChange={(event) => void choose(event.target.value)}
            className={inputClass}
          >
            <option value="">انتخاب پرونده</option>
            {cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.cancerSite || "سرطان"} · {item.stage || "نامشخص"} ·{" "}
                {item.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {selected && (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <section>
            <div className="mb-5 flex gap-2">
              <button
                onClick={() => setTab("pathology")}
                aria-pressed={tab === "pathology"}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
              >
                پاتولوژی
              </button>
              {user.role === "doctor" && (
                <button
                  onClick={() => setTab("treatments")}
                  aria-pressed={tab === "treatments"}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
                >
                  درمان
                </button>
              )}
            </div>
            <form key={tab} onSubmit={submit}>
              <fieldset disabled={pending} className="space-y-4">
                {tab === "pathology" ? (
                  <>
                    <Field label="نوع نمونه">
                      <input
                        name="specimenType"
                        required
                        minLength={2}
                        maxLength={200}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="تاریخ گزارش">
                      <input
                        name="reportedAt"
                        required
                        type="date"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="تاریخ نمونه‌گیری (اختیاری)">
                      <input
                        name="collectedAt"
                        type="date"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="کد مورفولوژی">
                      <input
                        name="morphologyCode"
                        maxLength={40}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="درجه بافت‌شناسی">
                      <input
                        name="grade"
                        maxLength={40}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="یافته‌های گزارش">
                      <textarea
                        name="findings"
                        required
                        minLength={3}
                        maxLength={5000}
                        rows={5}
                        className={inputClass}
                      />
                    </Field>
                    <details className="rounded-xl border border-slate-200 p-4">
                      <summary className="cursor-pointer font-bold text-teal-800">
                        مشخصات گزارش و نشانگرهای زیستی
                      </summary>
                      <p className="mt-3 text-xs leading-6 text-slate-500">
                        فقط مقادیر مستند در گزارش آزمایشگاه را وارد کنید؛ فیلد
                        خالی به معنای بررسی‌نشده است.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            name: "laboratory",
                            label: "آزمایشگاه / مرکز پاتولوژی",
                            max: 200,
                          },
                          {
                            name: "reportNumber",
                            label: "شماره گزارش",
                            max: 100,
                          },
                          {
                            name: "histology",
                            label: "نوع بافت‌شناسی",
                            max: 500,
                          },
                          {
                            name: "margins",
                            label: "وضعیت حاشیه‌ها",
                            max: 500,
                          },
                          {
                            name: "lymphNodes",
                            label: "گره‌های لنفاوی درگیر / بررسی‌شده",
                            max: 500,
                          },
                        ].map((field) => (
                          <Field key={field.name} label={field.label}>
                            <input
                              name={field.name}
                              maxLength={field.max}
                              className={inputClass}
                            />
                          </Field>
                        ))}
                        {[
                          { name: "er", label: "ER" },
                          { name: "pr", label: "PR" },
                          { name: "her2", label: "HER2" },
                          { name: "p53", label: "p53" },
                          { name: "mmr", label: "MMR / MSI" },
                          { name: "brca", label: "BRCA" },
                          { name: "hpv", label: "HPV" },
                        ].map((field) => (
                          <Field key={field.name} label={field.label}>
                            <input
                              name={field.name}
                              dir="ltr"
                              maxLength={100}
                              placeholder="نتیجه مستند گزارش"
                              className={inputClass}
                            />
                          </Field>
                        ))}
                        {[
                          { name: "erPercent", label: "ER (%)" },
                          { name: "prPercent", label: "PR (%)" },
                          { name: "ki67Percent", label: "Ki-67 (%)" },
                        ].map((field) => (
                          <Field key={field.name} label={field.label}>
                            <input
                              name={field.name}
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              className={inputClass}
                            />
                          </Field>
                        ))}
                      </div>
                    </details>
                  </>
                ) : (
                  <>
                    <Field label="روش درمان">
                      <select name="type" className={inputClass}>
                        <option value="surgery">جراحی</option>
                        <option value="chemotherapy">شیمی‌درمانی</option>
                        <option value="radiotherapy">پرتودرمانی</option>
                        <option value="hormonal">هورمون‌درمانی</option>
                        <option value="immunotherapy">ایمونوتراپی</option>
                        <option value="targeted">درمان هدفمند</option>
                        <option value="other">سایر</option>
                      </select>
                    </Field>
                    <Field label="رژیم و شرح درمان">
                      <textarea
                        required
                        minLength={3}
                        name="regimen"
                        maxLength={2000}
                        rows={3}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="تاریخ شروع">
                      <input
                        required
                        type="date"
                        name="startsAt"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="تاریخ پایان (اختیاری)">
                      <input type="date" name="endsAt" className={inputClass} />
                    </Field>
                    <Field label="وضعیت">
                      <select name="status" className={inputClass}>
                        <option value="planned">برنامه‌ریزی‌شده</option>
                        <option value="active">در حال انجام</option>
                        <option value="completed">تکمیل‌شده</option>
                        <option value="stopped">متوقف‌شده</option>
                      </select>
                    </Field>
                  </>
                )}
                <button className={buttonClass}>
                  {pending ? "در حال ذخیره…" : "ثبت در پرونده"}
                </button>
              </fieldset>
            </form>
          </section>
          <section>
            <h3 className="font-bold">گزارش‌های ثبت‌شده</h3>
            {detail ? (
              <>
                <ul className="mt-4 space-y-3">
                  {detail.pathologyReports.map((item, index) => (
                    <li
                      key={String(item.id || index)}
                      className="rounded-xl bg-slate-50 p-4 text-sm"
                    >
                      <p className="font-bold">
                        {String(
                          item.specimenType || item.specimen_type || "پاتولوژی",
                        )}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap leading-7">
                        {String(
                          typeof item.findings === "object" && item.findings
                            ? (item.findings as { text?: string }).text || ""
                            : item.findings || "",
                        )}
                      </p>
                      {typeof item.findings === "object" && item.findings && (
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          {Object.entries(
                            (
                              item.findings as {
                                biomarkers?: Record<string, unknown>;
                              }
                            ).biomarkers || {},
                          )
                            .filter(
                              ([, value]) => value !== null && value !== "",
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <dt className="font-semibold uppercase text-teal-800">
                                  {key.replace("Percent", " (%)")}
                                </dt>
                                <dd>{String(value)}</dd>
                              </div>
                            ))}
                        </dl>
                      )}
                    </li>
                  ))}
                </ul>
                <h3 className="mt-6 font-bold">برنامه‌های درمان</h3>
                <ul className="mt-4 space-y-3">
                  {detail.treatments.map((item, index) => (
                    <li
                      key={String(item.id || index)}
                      className="rounded-xl bg-slate-50 p-4 text-sm"
                    >
                      <p className="font-bold">
                        {String(item.type || "درمان")}
                      </p>
                      <p className="mt-2 leading-7">
                        {String(item.regimen || "")}
                      </p>
                      <p className="mt-2 text-teal-700">
                        {String(item.status || "")}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p role="status" className="mt-4 text-sm text-slate-500">
                در حال دریافت جزئیات…
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
