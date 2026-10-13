import React, { useState } from "react";
import { Eye, EyeOff, LoaderCircle, AlertCircle } from "lucide-react";
export const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
export const controlClass = "min-w-0 " +
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50 disabled:text-slate-400";
export function AuthField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {error ? (
        <span role="alert" className="block text-xs text-rose-700">
          {error}
        </span>
      ) : (
        hint && (
          <span className="block text-xs leading-5 text-slate-500">{hint}</span>
        )
      )}
    </label>
  );
}
export function PasswordInput({
  name = "password",
  value,
  onChange,
  autoComplete = "new-password",
  disabled = false,
  required = true,
}: {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        className={`${controlClass} pl-12`}
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        type={visible ? "text" : "password"}
        dir="ltr"
        style={{ direction: "ltr", textAlign: "left" }}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        maxLength={128}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
        aria-pressed={visible}
        className="absolute inset-y-0 left-0 flex w-12 items-center justify-center rounded-xl text-slate-400 hover:text-teal-700"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
export function AuthError({ message }: { message: string }) {
  return message ? (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800"
    >
      <AlertCircle size={18} className="mt-1 shrink-0" />
      {message}
    </div>
  ) : null;
}
export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-60"
    >
      {pending && <LoaderCircle size={18} className="animate-spin" />}
      {pending ? "در حال بررسی…" : children}
    </button>
  );
}
export function PasswordStrength({ value }: { value: string }) {
  const score =
    Number(value.length >= 12) +
    Number(/[a-zA-Z]/.test(value) && /\d/.test(value)) +
    Number(/[^a-zA-Z0-9]/.test(value));
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${score >= n ? (score === 3 ? "bg-teal-500" : "bg-amber-400") : "bg-slate-100"}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        حداقل ۱۲ کاراکتر؛ ترکیب حروف، عدد و نشانه‌ها پیشنهاد می‌شود.
      </p>
    </div>
  );
}
