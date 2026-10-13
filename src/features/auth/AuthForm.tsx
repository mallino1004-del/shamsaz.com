import React, { useEffect, useState } from "react";
import { LockKeyhole, UserPlus, KeyRound } from "lucide-react";
import type { SessionUser } from "../../shared/api/client";
import { LoginForm } from "./LoginForm";
import { RegistrationForm } from "./RegistrationForm";
import { RecoveryForm, ResetPasswordForm } from "./RecoveryForm";
export type AuthView =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password";
export function AuthForm({
  initialTab = "login",
  onSuccess,
  onViewChange,
}: {
  initialTab?: AuthView;
  onSuccess: (user: SessionUser) => void;
  onViewChange?: (view: AuthView, token?: string) => void;
}) {
  const [tab, setTab] = useState<AuthView>(initialTab);
  const [resetToken, setResetToken] = useState(
    () =>
      new URLSearchParams(window.location.search).get("resetToken") ||
      new URLSearchParams(window.location.hash.split("?")[1]).get("token") ||
      "",
  );
  useEffect(() => {
    setTab(initialTab);
    setResetToken(
      new URLSearchParams(window.location.search).get("resetToken") ||
        new URLSearchParams(window.location.hash.split("?")[1]).get("token") ||
        "",
    );
  }, [initialTab]);
  const recover = tab === "forgot-password" || tab === "reset-password";
  function changeView(view: AuthView, token?: string) {
    setTab(view);
    if (token) setResetToken(token);
    onViewChange?.(view, token);
  }
  const Icon =
    tab === "login" ? LockKeyhole : tab === "register" ? UserPlus : KeyRound;
  return (
    <div dir="rtl" className="space-y-6">
      {!recover && (
        <div
          className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"
          aria-label="انتخاب فرم حساب"
        >
          {(["login", "register"] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => changeView(item)}
              aria-pressed={tab === item}
              className={`rounded-lg py-3 text-sm font-bold transition ${tab === item ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {item === "login" ? "ورود به حساب" : "ثبت‌نام جدید"}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
          <Icon size={22} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {tab === "login"
              ? "به شمساز خوش آمدید"
              : tab === "register"
                ? "حساب خود را بسازید"
                : tab === "forgot-password"
                  ? "بازیابی رمز عبور"
                  : "انتخاب رمز عبور جدید"}
          </h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            {tab === "login"
              ? "برای ادامهٔ مسیر مراقبت، وارد حساب شوید."
              : tab === "register"
                ? "ثبت‌نام در سه مرحله؛ اطلاعات شما قابل ویرایش است."
                : "دسترسی دوباره به حساب شمساز"}
          </p>
        </div>
      </div>
      {tab === "login" ? (
        <LoginForm
          onSuccess={onSuccess}
          onRecover={() => changeView("forgot-password")}
        />
      ) : tab === "register" ? (
        <RegistrationForm
          onSuccess={onSuccess}
          onLogin={() => changeView("login")}
        />
      ) : tab === "forgot-password" ? (
        <RecoveryForm
          onLogin={() => changeView("login")}
          onReset={(token) => {
            changeView("reset-password", token);
          }}
        />
      ) : (
        <ResetPasswordForm
          token={resetToken}
          onLogin={() => changeView("login")}
        />
      )}{" "}
      {!recover && (
        <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
          {tab === "login" ? "هنوز حساب ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}{" "}
          <button
            type="button"
            onClick={() => changeView(tab === "login" ? "register" : "login")}
            className="mr-1 font-bold text-teal-700"
          >
            {tab === "login" ? "ثبت‌نام در شمساز" : "ورود به حساب"}
          </button>
        </p>
      )}
    </div>
  );
}
