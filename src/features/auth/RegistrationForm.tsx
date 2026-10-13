import React, { useEffect, useState } from "react";
import {
  UserRound,
  Stethoscope,
  ClipboardList,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { api, SessionUser } from "../../shared/api/client";
import { BirthDateField } from "./BirthDateField";
import {
  AuthField,
  AuthError,
  PasswordInput,
  PasswordStrength,
  SubmitButton,
  controlClass,
  normalizeDigits,
} from "./AuthControls";
type Values = Record<string, string>;
const roles = [
  {
    id: "patient",
    label: "بیمار / مراجعه‌کننده",
    description: "نوبت‌ها و مسیر مراقبت شخصی",
    Icon: UserRound,
  },
  {
    id: "doctor",
    label: "پزشک",
    description: "درخواست عضویت در تیم درمان",
    Icon: Stethoscope,
  },
  {
    id: "registry_clerk",
    label: "کارشناس رجیستری",
    description: "درخواست دسترسی کارشناسی",
    Icon: ClipboardList,
  },
];
export function RegistrationForm({
  onSuccess,
  onLogin,
}: {
  onSuccess: (user: SessionUser) => void;
  onLogin: () => void;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    requestedRole: "patient",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalId: "",
    birthDate: "",
    password: "",
    passwordConfirmation: "",
    organizationId: "",
    professionalId: "",
    specialty: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [consent, setConsent] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Values>({});
  const [application, setApplication] = useState(false);
  const [organizations, setOrganizations] = useState<
    Array<{ id: string; name: string; city: string }>
  >([]);
  const [organizationsError, setOrganizationsError] = useState("");
  useEffect(() => {
    if (values.requestedRole !== "patient")
      api<{ organizations: Array<{ id: string; name: string; city: string }> }>(
        "/auth/organizations",
      )
        .then((r) => {
          setOrganizations(r.organizations);
          setOrganizationsError("");
        })
        .catch((e) => setOrganizationsError(e.message));
  }, [values.requestedRole]);
  function update(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }
  function field(
    name: string,
    label: string,
    options: {
      type?: string;
      hint?: string;
      placeholder?: string;
      optional?: boolean;
      autoComplete?: string;
    } = {},
  ) {
    return (
      <AuthField label={label} hint={options.hint} error={errors[name]}>
        {name === "birthDate" ? (
          <BirthDateField
            value={values.birthDate}
            onChange={(value) => update("birthDate", value)}
            disabled={pending}
          />
        ) : (
          <input
            className={`${controlClass} ${errors[name] ? "border-rose-400" : ""}`}
            name={name}
            type={options.type || "text"}
            value={values[name]}
            onChange={(e) => update(name, e.target.value)}
            autoComplete={options.autoComplete}
            placeholder={options.placeholder}
            max={
              name === "birthDate"
                ? new Date().toISOString().slice(0, 10)
                : undefined
            }
            maxLength={
              name === "nationalId"
                ? 10
                : name === "firstName"
                  ? 60
                  : name === "lastName"
                    ? 80
                    : name === "phone"
                      ? 30
                      : 120
            }
            dir={
              [
                "phone",
                "nationalId",
                "email",
                "emergencyContactPhone",
              ].includes(name)
                ? "ltr"
                : undefined
            }
            style={
              [
                "phone",
                "nationalId",
                "email",
                "emergencyContactPhone",
              ].includes(name)
                ? { direction: "ltr", textAlign: "left" }
                : undefined
            }
            disabled={pending}
            aria-invalid={!!errors[name]}
          />
        )}
      </AuthField>
    );
  }
  function validate() {
    const next: Values = {};
    if (step === 1) {
      if (`${values.firstName.trim()} ${values.lastName.trim()}`.length > 100)
        next.lastName = "نام کامل باید حداکثر ۱۰۰ نویسه باشد.";
      for (const name of [
        "firstName",
        "lastName",
        "phone",
        "nationalId",
        "birthDate",
      ])
        if (!values[name].trim()) next[name] = "تکمیل این بخش الزامی است.";
      if (values.phone && !/^09\d{9}$/.test(normalizeDigits(values.phone)))
        next.phone = "شماره همراه ۱۱ رقمی با ۰۹ وارد کنید.";
      if (
        values.nationalId &&
        !/^\d{10}$/.test(normalizeDigits(values.nationalId))
      )
        next.nationalId = "کد ملی باید ۱۰ رقم باشد.";
      if (values.birthDate && new Date(values.birthDate) > new Date())
        next.birthDate = "تاریخ تولد نمی‌تواند در آینده باشد.";
      if (
        values.emergencyContactPhone &&
        !/^09\d{9}$/.test(normalizeDigits(values.emergencyContactPhone))
      )
        next.emergencyContactPhone =
          "شماره همراه تماس اضطراری باید ۱۱ رقم و با ۰۹ باشد.";
      if (values.requestedRole !== "patient") {
        if (!values.organizationId)
          next.organizationId = "مرکز درمانی را انتخاب کنید.";
        if (!values.professionalId.trim())
          next.professionalId = "شناسهٔ حرفه‌ای را وارد کنید.";
        if (values.requestedRole === "doctor" && !values.specialty.trim())
          next.specialty = "تخصص خود را وارد کنید.";
      }
    }
    if (step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
        next.email = "یک ایمیل معتبر وارد کنید.";
      if (values.password.length < 12)
        next.password = "رمز عبور باید حداقل ۱۲ کاراکتر باشد.";
      if (values.password !== values.passwordConfirmation)
        next.passwordConfirmation = "تکرار رمز عبور مطابقت ندارد.";
      if (!consent) next.consent = "برای ثبت‌نام، موافقت شما لازم است.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (step < 2) {
      setStep(step + 1);
      setError("");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await api<{
        user: SessionUser | null;
        message?: string;
        application?: { status: string };
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          registrationVersion: 2,
          displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
          email: values.email.trim(),
          phone: normalizeDigits(values.phone),
          nationalId: normalizeDigits(values.nationalId),
          emergencyContactPhone: normalizeDigits(values.emergencyContactPhone),
          consent: true,
        }),
      });
      if (result.user) onSuccess(result.user);
      else if (result.application) setApplication(true);
      else throw new Error(result.message || "ثبت‌نام تکمیل نشد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت‌نام انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  if (application)
    return (
      <div className="space-y-5 rounded-2xl bg-teal-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-12 text-teal-700" />
        <h3 className="text-xl font-bold text-slate-900">
          درخواست عضویت ثبت شد
        </h3>
        <p className="text-sm leading-7 text-slate-600">
          درخواست شما در انتظار بررسی مدیر مرکز انتخاب‌شده است. دسترسی حرفه‌ای
          پس از تأیید هویت و عضویت فعال می‌شود.
        </p>
        <button onClick={onLogin} className="font-bold text-teal-700">
          بازگشت به ورود
        </button>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      noValidate
      aria-busy={pending}
      className="space-y-6"
    >
      <ol className="flex gap-2" aria-label="مراحل ثبت‌نام">
        {["نوع حساب", "اطلاعات فردی", "امنیت حساب"].map((label, index) => (
          <li
            key={label}
            className={`flex flex-1 items-center gap-2 border-b-2 pb-3 text-xs font-semibold ${step >= index ? "border-teal-600 text-teal-700" : "border-slate-100 text-slate-400"}`}
            aria-current={step === index ? "step" : undefined}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${step >= index ? "bg-teal-50" : "bg-slate-50"}`}
            >
              {step > index ? <Check size={14} /> : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm leading-7 text-slate-500">
            حساب مناسب خود را انتخاب کنید. دسترسی تیم درمان نیازمند تأیید مرکز
            است.
          </p>
          {roles.map(({ id, label, description, Icon }) => (
            <label
              key={id}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${values.requestedRole === id ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600" : "border-slate-200 hover:border-teal-300"}`}
            >
              <input
                type="radio"
                name="requestedRole"
                value={id}
                checked={values.requestedRole === id}
                onChange={() => update("requestedRole", id)}
                className="accent-teal-700"
              />
              <span className="rounded-xl bg-white p-2.5 text-teal-700">
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  {label}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("firstName", "نام", { autoComplete: "given-name" })}
            {field("lastName", "نام خانوادگی", { autoComplete: "family-name" })}
            {field("nationalId", "کد ملی", { placeholder: "۱۰ رقم" })}
              {field("birthDate", "تاریخ تولد (شمسی)", { type: "date" })}
          </div>
          {field("phone", "شماره همراه", {
            type: "tel",
            autoComplete: "tel",
            placeholder: "09123456789",
            hint: "شماره همراه به‌عنوان شناسهٔ ورود نیز قابل استفاده است.",
          })}
          {values.requestedRole !== "patient" ? (
            <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <p className="text-xs leading-6 text-amber-800">
                این اطلاعات برای بررسی درخواست عضویت است و به‌تنهایی دسترسی
                حرفه‌ای ایجاد نمی‌کند.
              </p>
              <AuthField label="مرکز درمانی" error={errors.organizationId}>
                <select
                  className={controlClass}
                  value={values.organizationId}
                  onChange={(e) => update("organizationId", e.target.value)}
                >
                  <option value="">انتخاب مرکز درمانی</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} — {o.city}
                    </option>
                  ))}
                </select>
              </AuthField>
              {organizationsError && <AuthError message={organizationsError} />}
              {field(
                "professionalId",
                values.requestedRole === "doctor"
                  ? "شماره نظام پزشکی"
                  : "شناسهٔ پرسنلی",
              )}
              {values.requestedRole === "doctor" && field("specialty", "تخصص")}
            </div>
          ) : (
            <details className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                اطلاعات تماس اضطراری (اختیاری)
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {field("emergencyContactName", "نام فرد مورد اعتماد")}
                {field("emergencyContactPhone", "شماره تماس اضطراری", {
                  type: "tel",
                })}
              </div>
            </details>
          )}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">
            حساب {roles.find((r) => r.id === values.requestedRole)?.label} برای{" "}
            <strong>
              {values.firstName} {values.lastName}
            </strong>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mr-3 font-semibold text-teal-700"
            >
              ویرایش اطلاعات
            </button>
          </div>
          {field("email", "ایمیل", {
            type: "email",
            autoComplete: "email",
            placeholder: "name@example.com",
            hint: "برای بازیابی حساب، از ایمیل در دسترس خود استفاده کنید.",
          })}
          <AuthField label="رمز عبور" error={errors.password}>
            <PasswordInput
              value={values.password}
              onChange={(v) => update("password", v)}
              disabled={pending}
            />
            <PasswordStrength value={values.password} />
          </AuthField>
          <AuthField label="تکرار رمز عبور" error={errors.passwordConfirmation}>
            <PasswordInput
              name="passwordConfirmation"
              value={values.passwordConfirmation}
              onChange={(v) => update("passwordConfirmation", v)}
              disabled={pending}
            />
          </AuthField>
          <label className="flex items-start gap-2 text-xs leading-7 text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-2 size-4 shrink-0 accent-teal-700"
            />
            با ایجاد حساب و نگهداری اطلاعات ثبت‌نام برای مدیریت حساب و
            درخواست‌های مراقبت موافقم.
          </label>
          {errors.consent && (
            <p role="alert" className="text-xs text-rose-700">
              {errors.consent}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPrivacy(!showPrivacy)}
            className="text-xs font-semibold text-teal-700"
          >
            {showPrivacy ? "بستن توضیحات" : "دربارهٔ اطلاعات ثبت‌نام"}
          </button>
          {showPrivacy && (
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-7 text-slate-600">
              اطلاعات هویتی و تماس برای ساخت حساب و ارتباط با شما ثبت می‌شود.
              برای حساب حرفه‌ای، اطلاعات مرکز و شناسهٔ شغلی در اختیار مدیر مربوط
              برای بررسی درخواست قرار می‌گیرد. در رمز عبور از اطلاعات شخصی
              استفاده نکنید.
            </p>
          )}
        </div>
      )}
      <AuthError message={error} />
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setStep(step - 1);
              setError("");
            }}
            className="flex min-h-12 items-center gap-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
          >
            <ArrowRight size={16} />
            قبلی
          </button>
        )}
        <div className="flex-1">
          <SubmitButton pending={pending}>
            {step < 2 ? (
              <span className="flex items-center gap-2">
                ادامه <ArrowLeft size={16} />
              </span>
            ) : values.requestedRole === "patient" ? (
              "ساخت حساب شمساز"
            ) : (
              "ارسال درخواست عضویت"
            )}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
