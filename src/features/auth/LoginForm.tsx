import React, { useState } from "react";
import { api, SessionResponse, SessionUser } from "../../shared/api/client";
import {
  AuthField,
  AuthError,
  PasswordInput,
  SubmitButton,
  controlClass,
  normalizeDigits,
} from "./AuthControls";
export function LoginForm({
  onSuccess,
  onRecover,
}: {
  onSuccess: (user: SessionUser) => void;
  onRecover: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setError("");
    setPending(true);
    try {
      const result = await api<SessionResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          identifier: normalizeDigits(String(values.identifier)).trim(),
          rememberMe: values.rememberMe === "on",
        }),
      });
      if (!result.user) throw new Error("نشست کاربری ایجاد نشد.");
      onSuccess(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} aria-busy={pending} className="space-y-5">
      <AuthField
        label="ایمیل یا شماره همراه"
        hint="با اطلاعاتی وارد شوید که هنگام ثبت‌نام وارد کرده‌اید."
      >
        <input
          className={controlClass}
          name="identifier"
          autoComplete="username"
          dir="ltr"
          style={{ direction: "ltr", textAlign: "left" }}
          placeholder="name@example.com یا 09123456789"
          required
          maxLength={254}
          disabled={pending}
        />
      </AuthField>
      <AuthField label="رمز عبور">
        <PasswordInput autoComplete="current-password" disabled={pending} />
      </AuthField>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            name="rememberMe"
            type="checkbox"
            disabled={pending}
            className="size-4 accent-teal-700"
          />
          مرا به خاطر بسپار
        </label>
        <button
          type="button"
          onClick={onRecover}
          className="font-semibold text-teal-700 hover:underline"
        >
          رمز عبور را فراموش کرده‌اید؟
        </button>
      </div>
      <AuthError message={error} />
      <SubmitButton pending={pending}>ورود به حساب شمساز</SubmitButton>
      <p className="text-center text-xs leading-6 text-slate-500">
        در دستگاه مشترک، گزینهٔ «مرا به خاطر بسپار» را انتخاب نکنید.
      </p>
    </form>
  );
}
