import React, { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { api } from "../../shared/api/client";
import {
  AuthField,
  AuthError,
  PasswordInput,
  PasswordStrength,
  SubmitButton,
  controlClass,
} from "./AuthControls";
export function RecoveryForm({
  onLogin,
  onReset,
}: {
  onLogin: () => void;
  onReset: (token: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    message: string;
    deliveryMode?: string;
    developmentResetUrl?: string;
  } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setPending(true);
    setError("");
    try {
      setResult(
        await api("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "درخواست انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return result ? (
    <div className="space-y-4">
      <div
        role="status"
        className="rounded-2xl bg-teal-50 p-5 text-sm leading-7 text-teal-900"
      >
        <Mail className="mb-3" />
        {result.message}
      </div>
      {result.deliveryMode === "development" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-7 text-amber-900">
          محیط توسعهٔ محلی: ارسال ایمیل فعال نیست.
          {result.developmentResetUrl && (
            <>
              <p>برای آزمایش بازیابی از لینک محلی زیر استفاده کنید.</p>
              <a
                href={result.developmentResetUrl}
                onClick={(e) => {
                  e.preventDefault();
                  const raw = result.developmentResetUrl!;
                  const url = new URL(raw, window.location.origin);
                  const token =
                    url.searchParams.get("resetToken") ||
                    new URLSearchParams(url.hash.split("?")[1]).get("token");
                  if (token) onReset(token);
                }}
                className="mt-2 inline-block font-bold underline"
              >
                باز کردن فرم تغییر رمز (آزمایش محلی)
              </a>
            </>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onLogin}
        className="text-sm font-semibold text-teal-700"
      >
        بازگشت به ورود
      </button>
    </div>
  ) : (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm leading-7 text-slate-500">
        ایمیل ثبت‌شده در حساب را وارد کنید. روش دریافت لینک بازیابی پس از بررسی
        درخواست نمایش داده می‌شود.
      </p>
      <AuthField label="ایمیل حساب">
        <input
          className={controlClass}
          name="email"
          type="email"
          dir="ltr"
          style={{ direction: "ltr", textAlign: "left" }}
          autoComplete="email"
          required
          disabled={pending}
          placeholder="name@example.com"
          maxLength={254}
        />
      </AuthField>
      <AuthError message={error} />
      <SubmitButton pending={pending}>درخواست بازیابی رمز عبور</SubmitButton>
      <button
        type="button"
        onClick={onLogin}
        className="block w-full text-center text-sm font-semibold text-teal-700"
      >
        بازگشت به ورود
      </button>
    </form>
  );
}
export function ResetPasswordForm({
  token,
  onLogin,
}: {
  token: string;
  onLogin: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 12) {
      setError("رمز عبور باید حداقل ۱۲ کاراکتر باشد.");
      return;
    }
    if (password !== confirmation) {
      setError("تکرار رمز عبور مطابقت ندارد.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          passwordConfirmation: confirmation,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز تغییر نکرد.");
    } finally {
      setPending(false);
    }
  }
  if (success)
    return (
      <div
        role="status"
        className="space-y-4 rounded-2xl bg-teal-50 p-5 text-center"
      >
        <CheckCircle2 className="mx-auto text-teal-700" size={40} />
        <h3 className="font-bold text-teal-900">رمز عبور تغییر کرد</h3>
        <p className="text-sm text-slate-600">با رمز جدید وارد حساب شوید.</p>
        <button onClick={onLogin} className="font-semibold text-teal-700">
          ورود به حساب
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm leading-7 text-slate-500">
        رمزی جدید و متفاوت از رمزهای دیگر خود انتخاب کنید.
      </p>
      {!token && (
        <AuthError message="لینک بازیابی معتبر در دسترس نیست. ابتدا درخواست بازیابی رمز را ثبت کنید." />
      )}
      <AuthField label="رمز عبور جدید">
        <PasswordInput
          value={password}
          onChange={setPassword}
          disabled={pending}
        />
        <PasswordStrength value={password} />
      </AuthField>
      <AuthField label="تکرار رمز عبور جدید">
        <PasswordInput
          name="passwordConfirmation"
          value={confirmation}
          onChange={setConfirmation}
          disabled={pending}
        />
      </AuthField>
      <AuthError message={error} />
      {token && <SubmitButton pending={pending}>ذخیرهٔ رمز جدید</SubmitButton>}
      <button
        type="button"
        onClick={onLogin}
        className="block w-full text-center text-sm font-semibold text-teal-700"
      >
        بازگشت به ورود
      </button>
    </form>
  );
}
