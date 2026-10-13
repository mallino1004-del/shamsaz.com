import React, { useState } from "react";
import { Sun, LogOut, User, Menu, X } from "lucide-react";
import { roleLabels, SessionUser } from "../shared/api/client";
import type { UserRole, NotificationItem } from "../types";
interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUserRole: UserRole;
  setCurrentUserRole?: (role: UserRole) => void;
  onOpenAuth: (tab?: "login" | "register") => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onSimulateNotification?: () => void;
  user?: SessionUser | null;
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}
export function Header({
  activeView,
  setActiveView,
  onOpenAuth,
  user,
  onLogout,
  isAuthenticated,
  userName,
  currentUserRole,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const signedIn = !!user || !!isAuthenticated;
  const links = [
    { id: "home", label: "خانه" },
    { id: "doctors", label: "پزشکان" },
    { id: "centers", label: "مراکز درمانی" },
    ...(signedIn
      ? [
          { id: "dashboard", label: "فضای کار" },
          { id: "profile", label: "پروفایل" },
        ]
      : []),
  ];
  function navigate(view: string) {
    setActiveView(view);
    setExpanded(false);
    document
      .querySelectorAll("header details[open]")
      .forEach((item) => item.removeAttribute("open"));
  }
  const navigation = links.map((link) =>
    link.id === "centers" ? (
      <details key={link.id} className="relative text-sm text-slate-700">
        <summary
          className={`cursor-pointer rounded-xl px-4 py-2 ${["centers", "medical-centers", "hospitals", "pharmacies"].includes(activeView) ? "bg-teal-50 font-bold text-teal-800" : "hover:bg-slate-50"}`}
        >
          مراکز درمانی
        </summary>
        <div className="right-0 z-50 mt-2 grid w-full gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg xl:absolute xl:w-64">
          <button
            type="button"
            onClick={() => navigate("hospitals")}
            aria-current={activeView === "hospitals" ? "page" : undefined}
            className="rounded-lg bg-sky-50 px-3 py-3 text-right text-sky-900 hover:bg-sky-100"
          >
            بیمارستان‌ها
            <span className="mt-1 block text-xs font-normal text-slate-500">
              مراکز بستری و خدمات درمانی
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("pharmacies")}
            aria-current={activeView === "pharmacies" ? "page" : undefined}
            className="rounded-lg bg-teal-50 px-3 py-3 text-right text-teal-900 hover:bg-teal-100"
          >
            داروخانه‌ها
            <span className="mt-1 block text-xs font-normal text-slate-500">
              جست‌وجو و اطلاعات داروخانه‌ها
            </span>
          </button>
        </div>
      </details>
    ) : (
      <button
        key={link.id}
        onClick={() => navigate(link.id)}
        aria-current={activeView === link.id ? "page" : undefined}
        className={`rounded-xl px-4 py-2 text-right text-sm ${activeView === link.id ? "bg-teal-50 font-bold text-teal-800" : "text-slate-600 hover:bg-slate-50"}`}
      >
        {link.label}
      </button>
    ),
  );
  const services = (
    <details className="relative rounded-xl text-sm text-slate-700">
      <summary className="cursor-pointer rounded-xl px-4 py-2">
        خدمات تخصصی
      </summary>
      <div className="right-0 z-50 mt-2 grid w-full gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg xl:absolute xl:w-72">
        <button
          onClick={() => navigate("registry")}
          className="rounded-lg px-3 py-2 text-right hover:bg-slate-50"
        >
          رجیستری سرطان · فضای کار مرکز
        </button>
        <button
          onClick={() => navigate("screening")}
          className="rounded-lg px-3 py-2 text-right hover:bg-slate-50"
        >
          ثبت علائم · پیگیری بیمار
        </button>
        <button
          onClick={() => navigate("articles")}
          className="rounded-lg px-3 py-2 text-right hover:bg-slate-50"
        >
          دانشنامه سلامت
        </button>
        <button
          onClick={() => navigate("tumor-board")}
          className="rounded-lg px-3 py-2 text-right hover:bg-slate-50"
        >
          توموربورد · جلسات و تصمیم‌ها
        </button>
        <p className="rounded-lg px-3 py-2 text-xs leading-6 text-slate-400">
          تماس تله‌مدیسین · در دست توسعه
        </p>
      </div>
    </details>
  );
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-3 py-4 sm:gap-3 sm:px-6">
        <button
          onClick={() => navigate("home")}
          className="flex shrink-0 items-center gap-2 text-xl font-black text-teal-800"
        >
          <Sun className="text-amber-500" />
          شمساز
        </button>
        <nav
          aria-label="ناوبری اصلی"
          className="hidden min-w-0 flex-1 gap-1 xl:flex"
        >
          {navigation}
          {services}
        </nav>
        <div className="mr-auto flex min-w-0 items-center gap-2">
          {signedIn ? (
            <>
              <div className="hidden min-w-0 max-w-48 text-sm sm:block">
                <span className="block truncate font-bold text-slate-800">
                  {user?.displayName || userName}
                </span>
                <span className="text-xs text-slate-500">
                  {roleLabels[user?.role || currentUserRole]}
                </span>
              </div>
              <button
                onClick={onLogout}
                aria-label="خروج از حساب"
                title="خروج از حساب"
                className="shrink-0 rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onOpenAuth("login");
                  setExpanded(false);
                }}
                className="shrink-0 rounded-xl px-2 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50 sm:px-3"
              >
                ورود
              </button>
              <button
                onClick={() => {
                  onOpenAuth("register");
                  setExpanded(false);
                }}
                className="shrink-0 rounded-xl bg-teal-700 px-2 py-2 text-sm font-bold text-white hover:bg-teal-800 sm:px-4"
              >
                ثبت‌نام
              </button>
            </>
          )}
          <button
            aria-label={expanded ? "بستن منو" : "باز کردن منو"}
            aria-expanded={expanded}
            aria-controls="mobile-navigation"
            onClick={() => setExpanded((value) => !value)}
            className="shrink-0 rounded-xl p-2 text-slate-700 xl:hidden"
          >
            {expanded ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {expanded && (
        <nav
          id="mobile-navigation"
          aria-label="ناوبری موبایل"
          className="mx-auto grid max-w-7xl gap-1 border-t border-slate-100 px-4 py-3 xl:hidden"
        >
          {signedIn && (
            <p className="truncate px-4 py-2 text-sm text-slate-500">
              {user?.displayName || userName} ·{" "}
              {roleLabels[user?.role || currentUserRole]}
            </p>
          )}
          {navigation}
          {services}
        </nav>
      )}
    </header>
  );
}
