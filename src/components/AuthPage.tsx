import React from "react";
import {
  ArrowRight,
  CalendarDays,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Sun,
} from "lucide-react";
import type { UserRole } from "../types";
import { AuthForm, type AuthView } from "../features/auth/AuthForm";
import type { SessionUser } from "../shared/api/client";
interface Props {
  initialTab?: AuthView;
  onNavigateAuth?: (view: AuthView, token?: string) => void;
  onLoginSuccess: (
    role: UserRole,
    userName: string,
    payload?: SessionUser,
  ) => void;
  onNavigateHome: () => void;
}
export function AuthPage({
  initialTab,
  onLoginSuccess,
  onNavigateHome,
  onNavigateAuth,
}: Props) {
  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-100px)] bg-[#f4f8f7] px-4 py-6 sm:px-6 sm:py-10"
    >
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[.85fr_1.15fr]">
        <aside className="relative hidden flex-col overflow-hidden bg-teal-950 p-7 text-white sm:p-10 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full border-[60px] border-white/[.035]"
          />
          <button
            onClick={onNavigateHome}
            className="relative mb-9 flex w-fit items-center gap-2 rounded-lg py-2 text-xs font-semibold text-teal-100 hover:text-white"
          >
            <ArrowRight size={16} />
            بازگشت به صفحهٔ اصلی
          </button>
          <div className="relative">
            <div className="mb-7 flex items-center gap-3">
              <span className="rounded-2xl bg-white/10 p-3 text-amber-300">
                <Sun size={30} />
              </span>
              <div>
                <p className="text-2xl font-black tracking-tight">شمساز</p>
                <p className="mt-1 text-xs text-teal-200">همراه مسیر مراقبت</p>
              </div>
            </div>
            <p className="text-xs font-bold tracking-wide text-amber-300">
              یک حساب، مسیر مراقبت منظم
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.7] sm:text-4xl">
              قدم بعدی مراقبت،
              <br />
              از همین‌جا شروع می‌شود.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-8 text-teal-100/80">
              برای مدیریت نوبت‌ها و اطلاعات خود، حساب بسازید؛ یا به فضای کاری
              تیم درمان درخواست عضویت دهید.
            </p>
            <div className="mt-8 space-y-5">
              {[
                {
                  Icon: CalendarDays,
                  title: "نوبت‌ها و پیگیری‌ها",
                  text: "دسترسی به درخواست‌ها و برنامهٔ مراجعه",
                },
                {
                  Icon: ClipboardList,
                  title: "اطلاعات فردی و مراقبت",
                  text: "تکمیل و مدیریت اطلاعات حساب",
                },
                {
                  Icon: Stethoscope,
                  title: "فضای تیم درمان",
                  text: "عضویت حرفه‌ای پس از بررسی مرکز",
                },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-teal-200">
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-teal-200/70">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-10 flex items-center gap-2 border-t border-white/10 pt-5 text-xs leading-6 text-teal-100/70">
            <HeartPulse size={18} className="shrink-0" />
            شمساز برای پیگیری مراقبت است؛ در شرایط اضطراری به خدمات فوریت‌های
            پزشکی مراجعه کنید.
          </div>
        </aside>
        <section className="flex items-center p-5 sm:p-9 lg:p-12">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 lg:hidden">
              <Sun className="text-amber-500" size={26} />
              <div>
                <h1 className="text-xl font-black text-teal-800">حساب شمساز</h1>
                <p className="mt-1 text-xs text-slate-500">
                  ورود و عضویت در مسیر مراقبت
                </p>
              </div>
            </div>
            <AuthForm
              initialTab={initialTab}
              onViewChange={onNavigateAuth}
              onSuccess={(user) =>
                onLoginSuccess(user.role, user.displayName, user)
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
