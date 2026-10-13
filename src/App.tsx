import React, { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import {
  api,
  type SessionResponse,
  type SessionUser,
} from "./shared/api/client";
import { LoadingPanel } from "./shared/ui/LoadingPanel";
import { PageBanner } from "./shared/ui/PageBanner";
import type { DashboardSection } from "./features/dashboard/DashboardWorkspace";

const LandingPage = lazy(() =>
  import("./features/landing/components/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const AuthPage = lazy(() =>
  import("./components/AuthPage").then((module) => ({
    default: module.AuthPage,
  })),
);
const RoleProfileManager = lazy(() =>
  import("./components/RoleProfileManager").then((module) => ({
    default: module.RoleProfileManager,
  })),
);
const DashboardWorkspace = lazy(() =>
  import("./features/dashboard/DashboardWorkspace").then((module) => ({
    default: module.DashboardWorkspace,
  })),
);
const ScreeningWorkspace = lazy(() =>
  import("./features/screening/ScreeningWorkspace").then((module) => ({
    default: module.ScreeningWorkspace,
  })),
);
const TumorBoardWorkspace = lazy(() =>
  import("./features/dashboard/TumorBoardWorkspace").then((module) => ({
    default: module.TumorBoardWorkspace,
  })),
);
const DoctorDirectory = lazy(() =>
  import("./features/directory/DoctorDirectory").then((module) => ({
    default: module.DoctorDirectory,
  })),
);
const MedicalCentersDirectory = lazy(() =>
  import("./features/directory/components/MedicalCentersDirectory").then(
    (module) => ({ default: module.MedicalCentersDirectory }),
  ),
);
const CancerEducationArticles = lazy(() =>
  import("./features/education/components/CancerEducationArticles").then(
    (module) => ({ default: module.CancerEducationArticles }),
  ),
);

const privateViews = new Set([
  "dashboard",
  "patient-portal",
  "doctor-portal",
  "national-dashboard",
  "registry",
  "profile",
  "screening",
  "tumor-board",
  "telemedicine",
  "appointments",
  "clinical",
  "organization",
]);
const allowedViews = new Set([
  "home",
  "doctors",
  "centers",
  "medical-centers",
  "hospitals",
  "pharmacies",
  "articles",
  "auth",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  ...privateViews,
]);
function initialView() {
  const view = window.location.hash.slice(1).split("?")[0];
  return allowedViews.has(view) ? view : "home";
}

export default function App() {
  const [activeView, setActiveView] = useState(initialView);
  const [routeHash, setRouteHash] = useState(window.location.hash);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [doctorQuery, setDoctorQuery] = useState("");

  async function refreshSession() {
    setInitializing(true);
    setSessionError("");
    try {
      const response = await api<SessionResponse>("/auth/me");
      setUser(response.user);
    } catch {
      setSessionError(
        "ارتباط با سامانه برقرار نشد. برای دریافت حساب دوباره تلاش کنید.",
      );
    } finally {
      setInitializing(false);
    }
  }
  useEffect(() => {
    void refreshSession();
  }, []);
  useEffect(() => {
    function expired() {
      setUser(null);
      setAuthOpen(false);
    }
    window.addEventListener("shamsaz:session-expired", expired);
    return () => window.removeEventListener("shamsaz:session-expired", expired);
  }, []);
  useEffect(() => {
    function changed() {
      setActiveView(initialView());
      setRouteHash(window.location.hash);
    }
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  function navigate(view: string) {
    if (view === "overview") view = "dashboard";
    if (view === "screenings") view = "screening";
    const next = allowedViews.has(view)
      ? view
      : [
            "breast-cancer",
            "cervical-cancer",
            "ovarian-cancer",
            "uterine-cancer",
            "patient-support",
          ].includes(view)
        ? "articles"
        : "dashboard";
    window.location.hash = next;
    setActiveView(next);
    setRouteHash(window.location.hash);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function navigateAuth(
    view: "login" | "register" | "forgot-password" | "reset-password",
    token?: string,
  ) {
    if (!token) {
      navigate(view);
      return;
    }
    window.location.hash = `${view}?token=${encodeURIComponent(token)}`;
    setActiveView(view);
    setRouteHash(window.location.hash);
    window.scrollTo({ top: 0 });
  }
  function loggedIn(
    _role: SessionUser["role"],
    _name: string,
    payload?: SessionUser,
  ) {
    if (!payload) {
      void refreshSession();
      return;
    }
    setUser(payload);
    setAuthOpen(false);
    let pendingBooking = false;
    try {
      pendingBooking = !!sessionStorage.getItem("shamsaz:pending-practitioner");
    } catch {
      /* Storage can be disabled by browser preferences. */
    }
    navigate(
      pendingBooking
        ? "doctors"
        : privateViews.has(activeView)
          ? activeView
          : "dashboard",
    );
  }
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      navigate("home");
    } catch (error) {
      setSessionError(
        error instanceof Error ? error.message : "خروج انجام نشد.",
      );
    }
  }
  const needsLogin = privateViews.has(activeView) && !user;
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3"
      >
        رفتن به محتوای اصلی
      </a>
      <Header
        activeView={activeView}
        setActiveView={navigate}
        currentUserRole={user?.role || "patient"}
        user={user}
        onLogout={() => void logout()}
        onOpenAuth={(tab) => {
          navigate(tab || "login");
        }}
      />
      {sessionError && (
        <div
          role="alert"
          className="mx-auto my-4 max-w-7xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {sessionError}
          <button
            onClick={() => void refreshSession()}
            className="mr-3 underline"
          >
            تلاش دوباره
          </button>
        </div>
      )}
      <div
        id="main-content"
        tabIndex={-1}
        className="min-h-[70vh] focus:outline-none"
      >
        {(!initializing || !privateViews.has(activeView)) && (
          <PageBanner
            view={needsLogin ? "login" : activeView}
            role={user?.role}
            onNavigate={navigate}
          />
        )}
        <Suspense fallback={<LoadingPanel />}>
          {initializing && privateViews.has(activeView) ? (
            <LoadingPanel />
          ) : needsLogin ? (
            <AuthPage
              onLoginSuccess={loggedIn}
              onNavigateHome={() => navigate("home")}
              onNavigateAuth={navigateAuth}
            />
          ) : (
            <>
              {activeView === "home" && (
                <>
                  <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs leading-6 text-amber-900">
                    نسخهٔ توسعهٔ شمساز · فهرست پزشکان تهران با منبع اطلاعات در
                    دسترس است. ثبت خدمات در فضای کار به دیتابیس متصل است.
                  </div>
                  <LandingPage
                    featuredDoctors={[]}
                    onNavigate={navigate}
                    onSearch={(query) => {
                      setDoctorQuery(query.doctorName);
                      navigate("doctors");
                    }}
                    onBookDoctor={() => navigate("dashboard")}
                  />
                </>
              )}
              {activeView === "doctors" && (
                <DoctorDirectory
                  initialQuery={doctorQuery}
                  onBook={() => navigate("dashboard")}
                />
              )}
              {[
                "centers",
                "medical-centers",
                "hospitals",
                "pharmacies",
              ].includes(activeView) && (
                <>
                  <div className="mx-auto max-w-7xl px-4 pt-6 text-sm text-amber-800">
                    این بانک نمونه است؛ اطلاعات مراکز و شماره‌های تماس هنوز
                    تأیید نشده‌اند.
                  </div>
                  <MedicalCentersDirectory
                    initialTab={
                      activeView === "pharmacies" ? "pharmacies" : "hospitals"
                    }
                    onTabChange={navigate}
                    onSelectHospitalForBooking={() => navigate("doctors")}
                  />
                </>
              )}
              {activeView === "articles" && (
                <CancerEducationArticles onNavigate={navigate} />
              )}
              {[
                "auth",
                "login",
                "register",
                "forgot-password",
                "reset-password",
              ].includes(activeView) && (
                <AuthPage
                  key={routeHash}
                  initialTab={
                    activeView === "auth"
                      ? "login"
                      : (activeView as
                          | "login"
                          | "register"
                          | "forgot-password"
                          | "reset-password")
                  }
                  onLoginSuccess={loggedIn}
                  onNavigateHome={() => navigate("home")}
                  onNavigateAuth={navigateAuth}
                />
              )}
              {user &&
                privateViews.has(activeView) &&
                ![
                  "profile",
                  "tumor-board",
                  "telemedicine",
                  "screening",
                ].includes(activeView) && (
                  <DashboardWorkspace
                    user={user}
                    onNavigate={navigate}
                    initialSection={
                      (
                        {
                          registry: "registry",
                          screening: "screenings",
                          appointments: "appointments",
                          clinical: "clinical",
                          organization: "organization",
                        } as Record<string, DashboardSection>
                      )[activeView] || "overview"
                    }
                  />
                )}
              {user && activeView === "tumor-board" && (
                <TumorBoardWorkspace user={user} />
              )}
              {user && activeView === "screening" && (
                <ScreeningWorkspace user={user} onNavigate={navigate} />
              )}
              {user && activeView === "telemedicine" && (
                <main className="mx-auto max-w-3xl space-y-5 px-4 py-12">
                  <h1 className="text-2xl font-bold">مشاورهٔ تصویری</h1>
                  <p className="leading-8 text-slate-600">
                    ثبت درخواست نوبت آنلاین در فضای کار فعال است. اتصال صوت و
                    تصویر هنوز راه‌اندازی نشده و این صفحه تماس برقرار نمی‌کند.
                  </p>
                  <button
                    onClick={() => navigate("dashboard")}
                    className="rounded-xl bg-teal-700 px-5 py-3 text-white"
                  >
                    مشاهدهٔ نوبت‌ها
                  </button>
                </main>
              )}
              {user && activeView === "profile" && (
                <RoleProfileManager
                  currentRole={user.role}
                  currentUserName={user.displayName}
                  onUpdateName={(name) =>
                    setUser((previous) =>
                      previous ? { ...previous, displayName: name } : null,
                    )
                  }
                  onNavigate={navigate}
                />
              )}
            </>
          )}
        </Suspense>
      </div>
      <Footer onNavigate={navigate} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={loggedIn}
        initialTab={authTab}
      />
    </div>
  );
}
