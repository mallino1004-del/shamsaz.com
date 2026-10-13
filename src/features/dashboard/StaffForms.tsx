import React, { useEffect, useState } from "react";
import { api } from "../../shared/api/client";
import {
  buttonClass,
  Field,
  Feedback,
  inputClass,
} from "../../shared/ui/forms";
interface Staff {
  id: string;
  displayName: string;
  email: string;
  role: string;
}
export function StaffForms() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [role, setRole] = useState("registry_clerk");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function load() {
    try {
      const result = await api<{ staff: Staff[] }>("/organization/staff");
      setStaff(result.staff);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت کارکنان انجام نشد.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
    enrollment: boolean,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload: Record<string, unknown> = Object.fromEntries(
      new FormData(form),
    );
    if (enrollment) payload.consent = true;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await api(
        enrollment ? "/organization/enrollments" : "/organization/staff",
        { method: "POST", body: JSON.stringify(payload) },
      );
      form.reset();
      setSuccess(
        enrollment
          ? "بیمار به مرکز تخصیص داده شد."
          : "حساب همکار ایجاد شد. رمز اولیه را از مسیر امن به همکار تحویل دهید.",
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="space-y-5">
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">ایجاد حساب همکار مرکز</h2>
          <form onSubmit={(event) => void submit(event, false)}>
            <fieldset disabled={pending} className="space-y-4">
              <Field label="نام و نام خانوادگی">
                <input
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={120}
                  className={inputClass}
                />
              </Field>
              <Field label="ایمیل">
                <input
                  required
                  name="email"
                  type="email"
                  dir="ltr"
                  className={inputClass}
                />
              </Field>
              <Field label="نقش سازمانی">
                <select
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className={inputClass}
                >
                  <option value="registry_clerk">کارشناس رجیستری</option>
                  <option value="doctor">پزشک</option>
                </select>
              </Field>
              {role === "doctor" && (
                <>
                  <Field label="تخصص تأییدشده">
                    <input
                      name="specialty"
                      required
                      maxLength={200}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="شماره نظام پزشکی تأییدشده">
                    <input
                      name="licenseNumber"
                      required
                      maxLength={50}
                      className={inputClass}
                    />
                  </Field>
                </>
              )}
              <Field
                label="رمز اولیه"
                hint="حداقل ۱۲ کاراکتر؛ پس از ایجاد از مسیر امن تحویل دهید."
              >
                <input
                  name="password"
                  required
                  type="password"
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  dir="ltr"
                  className={inputClass}
                />
              </Field>
              <button className={buttonClass}>ایجاد حساب همکار</button>
            </fieldset>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">پذیرش بیمار در مرکز</h2>
          <form onSubmit={(event) => void submit(event, true)}>
            <fieldset disabled={pending} className="space-y-4">
              <Field
                label="ایمیل حساب بیمار"
                hint="بیمار ابتدا باید حساب شخصی خود را ثبت کرده باشد."
              >
                <input
                  name="email"
                  type="email"
                  required
                  dir="ltr"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-start gap-2 text-sm leading-7">
                <input type="checkbox" required className="mt-2" />
                رضایت بیمار برای تخصیص حساب به این مرکز دریافت شده است.
              </label>
              <button className={buttonClass}>تخصیص بیمار به مرکز</button>
            </fieldset>
          </form>
          <h3 className="mb-3 mt-8 font-bold">همکاران مرکز</h3>
          {staff.length ? (
            <ul className="divide-y divide-slate-100">
              {staff.map((member) => (
                <li key={member.id} className="py-3 text-sm">
                  <p className="font-semibold">{member.displayName}</p>
                  <p className="mt-1 text-slate-500">
                    {member.role === "doctor" ? "پزشک" : "کارشناس رجیستری"}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-1 break-all text-left text-slate-500"
                  >
                    {member.email}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">همکاری در دسترس نیست.</p>
          )}
        </section>
      </div>
    </section>
  );
}
